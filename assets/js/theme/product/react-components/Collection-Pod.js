import React, { useState, useEffect, useContext, useMemo } from 'react';

import utils from '@bigcommerce/stencil-utils';
import { generateID, formatPrice } from './Utils';
import GraphQL from '../../graphql/GraphQL';

import Swatch from './Swatch';
import Select from './Select';
import QuantityButton from './QuantityButton';
import AppContext from '../collection/AppContext';
import LazyImg from './LazyImg';
import AddButton from './Collection-PodAddBtn';
import ReviewStars from './ReviewStars';
import Ribbon from './Ribbon';


export default function CollectionPod(props){
    const appHook = useContext(AppContext);
    const graphQL = new GraphQL();

    const [ productPrice, setProductPrice ] = useState({});
    const [ qty, setQty ] = useState(1);
    const [ options, setOptions ] = useState([]);

    const [ swatches, setSwatch ] = useState({});
    const [ invalidSwatch, setInvalidSwatch ] = useState([]);

    const [ dropdown, setDropdown ] = useState({});
    const [ invalidDropdown, setInvalidDropdown ] = useState([]);

    const [ shouldUpdate, update ] = useState(false);
    const [ isUpdating, setUpdating ] = useState(false);
    const [ isSuggested, setSuggested ] = useState(false)

    const toggleDrawer = (args) => {
        appHook.toggleDrawer("open")

        appHook.setDrawer({
            drawerOptions: args.values,
            drawerControl: {
                displayName: args.displayName,
                id: args.id
            }
        });
    };


    const areSelectionsValid = () => {
        let arr = [];

        options.forEach(element => {
            switch(element.node.displayStyle){
                case "Swatch":
                    let isSwatchValid = Object.keys(swatches).length !== 0 && swatches.hasOwnProperty(element.node.displayName);
                    
                    if( !isSwatchValid ){ 
                        if( !invalidSwatch.includes(element.node.entityId) ){
                            setInvalidSwatch(invalidSwatch => [...invalidSwatch, element.node.entityId]);
                        }

                    }else{
                        setInvalidSwatch(invalidSwatch => {
                            return invalidSwatch.filter(item => item !== element.node.entityId);;
                        });
                    }
                    
                    arr.push(isSwatchValid);
                    break;


                case "DropdownList":
                    let isDropdownValid = Object.keys(dropdown).length !== 0 && dropdown.hasOwnProperty(element.node.displayName);

                    // exclude "protective cover" validation
                    if( element.node.displayName.toLowerCase().includes("protective cover") ){
                        arr.push(true);
                        break;
                    }

                    if( !isDropdownValid ){ 
                        if( !invalidDropdown.includes(element.node.entityId) ){
                            setInvalidDropdown(invalidDropdown => [...invalidDropdown, element.node.entityId]) 
                        }

                    }else{
                        setInvalidDropdown(invalidDropdown => {
                            return invalidDropdown.filter(item => item !== element.node.entityId);
                        });
                    }

                    arr.push(isDropdownValid);
                    break;

                default: 
                    arr.push(true);
                    break;
            }
        });
    
        return arr;
    };




    // adds products to the collections pre-cart
    const addToCart = () => {
        // run a validation on options
        let isValid = areSelectionsValid();

        if( isValid.includes(false) ){ return; }

        let params = {
                action: "add",
                "qty[]": qty,
                img: props.product.defaultImage.url
            };

        for (const key in swatches) {
            params[`attribute[${swatches[key].attribute}]`] = swatches[key].attributeValue.id;
         }

         for (const key in dropdown) {
            params[`attribute[${dropdown[key].attribute}]`] = dropdown[key].attributeValue;
        }

        appHook.addToCart({
            ...params,
            product_id: props.product.entityId,
            total: Number(productPrice.without_tax.replace(/[^0-9.-]+/g,""))
        });

        update(false);
    }



    /*  
        On option change send to BC string - utils.api.productAttributes.optionChange
        "action=add&product_id=2864&attribute[82102]=2519353&attribute[82103]=2519358&attribute[82104]=2519487&qty[]=1"

        action: add
        attribute[82102]: 2519353
        attribute[82103]: 2519358
        attribute[82104]: 2519487
        product_id: 2864
        qty[]: 1

        utils.api.productAttributes.optionChange() = optionChange(productId, params, template = null, callback)
    */

    useMemo(() => {
        let params = {
                action: "add",
                "qty[]": qty
            };


        let hasSwatches = Object.keys(swatches).length > 0;
        let hasDropdown = Object.keys(dropdown).length > 0;
        let hasProtectiveCover = Object.keys(dropdown).findIndex(item => item.toLowerCase().includes("protective cover"));


        if( hasSwatches ){
            for (const key in swatches) {
                params[`attribute[${swatches[key].attribute}]`] = swatches[key].attributeValue.id;
            }
        }
        

        if( hasDropdown ){
            for (const key in dropdown) {
                params[`attribute[${dropdown[key].attribute}]`] = dropdown[key].attributeValue;
            }
        }

          
        if( 
            hasSwatches || 
            ( hasProtectiveCover !== -1 && Object.keys(dropdown).length > 1 ) || 
            ( hasProtectiveCover === -1 && hasDropdown ) ||
            qty > 1 
        ){
            setUpdating(true);

            let query = "";

            for (const key in params) {
                query += `&${key}=${params[key]}`;
            }

            utils.api.productAttributes.optionChange(props.product.entityId, encodeURI(query), (err, response) => {
                let updated = response.data;

                setProductPrice({
                    without_tax: formatPrice(updated.price.without_tax.value * qty),
                    rrp_without_tax: null
                });

                if( appHook.cart.hasOwnProperty(props.product.entityId.toString()) ){
                    update(true);
                }

                setUpdating(false);
            });
        }

    }, [swatches, dropdown, qty]);




    const selectSwatch = (data) => {
        setSwatch((swatches) => {
            let newSwatch = { ...swatches };
            
            newSwatch[data.display_name] = {
                attribute: data.id,
                attributeValue: data.value
            };

            return newSwatch;
        });
    };



    const selectSelect = (data) => {
        setDropdown({ ...dropdown, ...data });
    };


    function setProtectiveCover(element){
        let noThanks = element.node.values.edges.find(ele => ele.node.label.includes("No Thanks"));

        selectSelect({
            [element.node.displayName]: {
                attribute: element.node.entityId,
                attributeValue: noThanks.node.entityId,
                label: noThanks.node.label
            }
        });
    }



    useEffect(() => {
        if( options.length === 0 ){
            let options = graphQL.getProductOptions(props.product.entityId);

            graphQL.get(options).then(response => {
                if( response ){
                    let responseData = response.site.products.edges[0].node.productOptions.edges;

                    setOptions(responseData);
    
                    let protectiveCover = responseData.find(ele => ele.node.displayName.toLowerCase().includes("protective cover") );

                    if( protectiveCover ){ 
                        setProtectiveCover(protectiveCover); 
                    }
                }
            });
        }

        if( Object.keys(productPrice).length === 0 ){
            let price = {
                without_tax: formatPrice( TEAK.Utils.graphQL.determinePrice( props.product.prices) ),
                rrp_without_tax: formatPrice( props.product.prices.retailPrice.value )
            };
    
            setProductPrice(price);
        }

    }, [props.product]);



    useMemo(() => {
        for (const key in props.suggested.product_n_values) {
            if ( parseInt(key) === props.product.entityId ) {
                setQty(props.suggested.product_n_values[key]);
                setSuggested(true);
            }
        }
        
    }, [props.suggested]);

    
    return(
        <>
        {props.product ? 
        
            <section className="product__row product__row--border product__row--section">
                {isSuggested ? <Ribbon suggested={props.suggested} id={props.product.entityId} /> : null}

                <form className="form add-to-cart-form" name={`product_${props.product.entityId}`}>
                    <div className="product__pod--1-1 product__pod--horz">
                        <figure className="product__figure product__figure--pod">
                            <a href={props.product.path} title={`See all details about ${props.product.name}`} className="product__figLink">
                                <LazyImg className="product__img product__img--thumb" src={props.product.defaultImage.url} alt={props.product.name} />
                            </a>
                        </figure>

                        <div className="product__pod--detailCntr">
                            <div className="product__pod--metaDesc">
                                <header className="product__nameHeader">
                                    <h1 className="product__name product__name--sm">
                                        <a href={props.product.path} title={`See all details about ${props.product.name}`}>
                                            {props.product.name}
                                        </a>
                                    </h1>
                                </header>

                                <p className="product__itemNum">Item #: {props.product.sku} &nbsp;&nbsp;&nbsp; Internet #: {props.product.entityId}
                                    <a className="product__ratingWrapper" href={`${props.product.path}#reviews`} title={`Reviews of ${props.product.name}`}>
                                        <ReviewStars id={props.product.entityId} />
                                    </a>
                                </p>

                                <ul className="product__highlights">
                        {props.product.customFields.edges.map((item, index) => {
                            if( item.node.name === "Highlight 1" || 
                                item.node.name === "Highlight 2" || 
                                item.node.name === "Highlight 3" || 
                                item.node.name === "Featured Highlight" || 
                                item.node.name === "Specs Highlight"
                            ){
                                return <li key={generateID()}>{item.node.value}</li>;
                            }
                        })}
                                </ul>


                        {props.product.customFields.edges.map((item) => {

                            if(item.node.name === "Lead-Time"){
                                let text = item.node.value.toLowerCase();
                                let leadTimeTwoIndex = props.product.customFields.edges.findIndex(element => element.node.name === "Lead-Time 2");

                                return  <p className="product__shippingInfo" key={generateID()}>
                                            {text.includes("ships next business day") ? <span className="shipping-range--tip">{TEAK.Modules.leadTime.setTip("nextBussinessDay", true)}</span> : null}
                                            {item.node.value}
                                            {leadTimeTwoIndex !== -1 ? ` ${props.product.customFields.edges[leadTimeTwoIndex].node.value}` : null}
                                        </p>
                            }

                            if(item.node.name === "Promo Text"){ 
                                return <p className="product__promoText" key={generateID()}>{item.node.value}</p>
                            }

                            if(item.node.name === "Free Shipping Icon" && item.node.value === "Yes"){
                                return <div id="freeShipping" key={generateID()}><p className="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></div>
                            }

                        })}
                                <p>
                                    <a href={props.product.path} title={`Learn more about ${props.product.name}`}>
                                        View more details &rsaquo;
                                    </a>
                                </p>                            
                            </div>
                        
                            <div className="product__pod--controls">
                                <div className="product__price">
                                    { isUpdating ?
                                        <div className="product__priceLine">
                                            <svg className="icon icon-spinner"><use xlinkHref="#icon-spinner" /></svg>
                                        </div>
                                    :
                                        <div className="product__priceLine">
                                            <span className="product__priceValue">
                                                {productPrice.without_tax}
                                            </span>
                                            {productPrice.rrp_without_tax !== null ? <span className="product__priceRrp">${productPrice.rrp_without_tax}</span> : null}
                                        </div>
                                    }
                                </div>

                                <div className="product__swatchCol">
                                    <ul className="product__swatchList">
                                        <li className="product__swatchItem product__swatchItem--list">
                                            {Object.keys(swatches).length > 0 ? "Selected Options" : "Select Options Above"}

                                            <ul className="product__swatchItemList">
                                            {options.map((item) => {
                                                if( item.node.displayStyle === "Swatch" && appHook.hasOwnProperty(item.node.displayName) ){
                                                    return  <Swatch 
                                                                key={item.node.entityId.toString()} 
                                                                toggle={toggleDrawer} 
                                                                displayName={item.node.displayName} 
                                                                id={item.node.entityId} 
                                                                values={item.node.values.edges}
                                                                setOption={selectSwatch}
                                                                type="remote"
                                                                isInvalid={invalidSwatch}
                                                            />;
                                                }
                                            })}
                                            </ul>
                                            <svg className="product__swatchLabelIcon product__swatchLabelIcon--45deg"><use xlinkHref="#icon-long-arrow-right" /></svg>
                                        </li>

                                        {options.map((item) => {
                                            if(item.node.displayStyle === "Swatch" && !appHook.hasOwnProperty(item.node.displayName) ){
                                                return  <Swatch 
                                                            key={item.node.entityId.toString()} 
                                                            toggle={toggleDrawer} 
                                                            displayName={item.node.displayName} 
                                                            id={item.node.entityId} 
                                                            values={item.node.values.edges}
                                                            setOption={selectSwatch}
                                                            type="local"
                                                            isInvalid={invalidSwatch}
                                                        />;
                                            }

                                            if( item.node.displayStyle === "DropdownList" && !item.node.displayName.toLowerCase().includes("protective cover") ){
                                                return <Select 
                                                            key={item.node.entityId.toString()} 
                                                            displayName={item.node.displayName} 
                                                            id={item.node.entityId} 
                                                            values={item.node.values.edges}
                                                            setOption={selectSelect}
                                                            type="local"
                                                            isInvalid={invalidDropdown}
                                                        />;
                                            }
                                        })}
                                    </ul>
                                </div>

                                <div className="product__col--priceCntr">
                                    <div className="form-field no-margin">
                                        <QuantityButton qty={setQty} value={qty} />
                                    </div>

                                    <AddButton disabled={isUpdating} addToCart={addToCart} id={props.product.entityId.toString()} update={shouldUpdate} />
                                </div>
                            </div>
                        </div>
                    </div>

                </form>
            </section>

        :null}
        </>
    );
}