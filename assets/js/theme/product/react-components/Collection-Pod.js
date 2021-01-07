import React, { useState, useEffect, useContext, useMemo } from 'react';

import utils from '@bigcommerce/stencil-utils';
import { generateID, formatPrice } from './Utils';
import { usePrevious } from 'react-use';
import GraphQL from '../../graphql/GraphQL';
import AppContext from './context/AppContext';
import { firebaseService } from './services/Firebase';

import Swatch from './Swatch';
import Select from './Select';
import QuantityButton from './QuantityButton';
import LazyImg from './LazyImg';
import AddButton from './Collection-PodAddBtn';
import ReviewStars from './ReviewStars';
import Ribbon from './Ribbon';
import ToolTips from './ToolTips';


function CollectionPod(props){
    const appHook = useContext(AppContext);
    const graphQL = new GraphQL();

    const [ productPrice, setProductPrice ] = useState({});
    const [ qty, setQty ] = useState(1);
    const prevQty = usePrevious(qty);

    const [ options, setOptions ] = useState([]);
    const [ hasGlobalOptions, setGlobalOptFlag ] = useState(false);

    const [ swatches, setSwatch ] = useState({});
    const [ invalidSwatch, setInvalidSwatch ] = useState([]);

    const [ toolTips, setToolTips ] = useState({})
    
    const [ dropdown, setDropdown ] = useState({});
    const [ invalidDropdown, setInvalidDropdown ] = useState([]);

    const [ shouldUpdate, update ] = useState(false);
    const [ isUpdating, setUpdating ] = useState(false);
    const [ isSuggested, setSuggested ] = useState(false)

    const toggleDrawer = (args) => {
        appHook.toggleDrawer("open");

        appHook.setDrawer({
            drawerOptions: args.values,
            drawerControl: {
                displayName: args.displayName,
                id: args.id,
                type: "local",
                product_id: props.product.entityId
            }
        });
    };


    // makes sure all required options are selected before adding to cart
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
            params[`attribute[${swatches[key].attribute}]`] = swatches[key].attributeValue;
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
                params[`attribute[${swatches[key].attribute}]`] = swatches[key].attributeValue;
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
            prevQty !== undefined && prevQty !== qty 
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
                attributeValue: data.swatch.id,
                swatch: {
                    label: data.swatch.label,
                    image: data.swatch.image,
                    price: data.swatch.price
                }
            };

            return newSwatch;
        });
    };



    const selectSelect = (data) => {
        setDropdown({ ...dropdown, ...data });
    };


    // default: sets protective cover to state
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
        if( props.product.hasTips ){
            props.firebase.getBrandOptionTips(props.product.brand.name).then((response) => {
                setToolTips(response)
            });
        }


        // fetch the data for all options
        if( options.length === 0 ){
            let options = graphQL.getProductOptions(props.product.entityId);

            graphQL.get(options).then(response => {
                if( response ){
                    // set the options
                    let responseData = response.site.products.edges[0].node.productOptions.edges;
                    setOptions(responseData);
    
                    // determine if it has a protective cover and set auto
                    let protectiveCover = responseData.find(ele => ele.node.displayName.toLowerCase().includes("protective cover") );
                    if( protectiveCover ){ 
                        setProtectiveCover(protectiveCover); 
                    }

                    // determine if this fits our global swatch control
                    for (let i = 0; i < responseData.length; i++) {        
                        if( responseData[i].node.displayStyle === "Swatch" && appHook.hasOwnProperty(responseData[i].node.displayName) ){
                            setGlobalOptFlag(true);
                            break;
                        }
                    }  
                }
            });
        }


        // set the initial price for this pod
        if( Object.keys(productPrice).length === 0 ){
            let retailPrice = props.product.prices.retailPrice !== null ? props.product.prices.retailPrice.value : 0;
            
            let price = {
                without_tax: formatPrice( TEAK.Utils.graphQL.determinePrice( props.product.prices) ),
                rrp_without_tax: formatPrice( retailPrice )
            };
    
            setProductPrice(price);
        }

    }, [props.product]);



    // updates state when a person chooses to use the "Suggested..." (e.g. Layout) module
    useMemo(() => {

        if( Object.keys(props.suggested).length ){
            for (const key in props.suggested.product_n_values) {
                if ( parseInt(key) === props.product.entityId ) {
                    setQty(props.suggested.product_n_values[key]);
                    setSuggested(true);
                }
            }

        }else{

            // if suggested is deselected
            setQty(1);
            setSuggested(false);
        }
        
    }, [props.suggested]);



    // when a drawer selection is updated update our state
    useMemo(() => {
        if( props.localDrawerOptions !== undefined ){
            let key = Object.keys(props.localDrawerOptions);

            if( props.localDrawerOptions[key].optionData.attributeValue !== null ){
                let optData = props.localDrawerOptions[key].optionData;

                selectSwatch({
                    display_name: props.localDrawerOptions[key].displayName,
                    id: optData.attribute,
                    swatch: {
                        id: optData.attributeValue,
                        label: optData.swatch.label,
                        image: optData.swatch.image
                    }                    
                });
            }
        }

    }, [props.localDrawerOptions]);

    

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
                                            {text.includes("ships next business day") ? <span className="shipping-range--tip"> <ToolTips type="nextBusinessDay" /> </span> : null}
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


                            {productPrice.without_tax > 2998 ? 
                                <ToolTips type="freeWhiteGlove" /> 
                            :null}


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
                                            {productPrice.rrp_without_tax !== null && productPrice.rrp_without_tax !== "$0" ? <span className="product__priceRrp">{productPrice.rrp_without_tax}</span> : null}
                                        </div>
                                    }
                                </div>

                                 
                                <div className={`product__swatchCol ${ 
                                    ( !hasGlobalOptions && options.length === 0 ) || 
                                    ( !hasGlobalOptions && options.length === 1 && options[0].node.displayName.toLowerCase().includes("protective cover") ) 
                                        ? "product__swatchCol--border" : ""
                                    }`}>

                                    <ul className="product__swatchList">
                                        {hasGlobalOptions ?
                                        <li className="product__swatchItem product__swatchItem--list">
                                            <span>{Object.keys(swatches).length > 0 ? "Selected Options" : "Select Options Above"}</span>

                                            <ul className="product__swatchItemList">
                                            {options.map((item) => {
                                                if( item.node.displayStyle === "Swatch" && appHook.hasOwnProperty(item.node.displayName) ){
                                                    return  <Swatch 
                                                                key={item.node.entityId.toString()} 
                                                                displayName={item.node.displayName} 
                                                                id={item.node.entityId} 
                                                                values={item.node.values.edges}
                                                                setOption={selectSwatch}
                                                                type="remote"
                                                                isInvalid={invalidSwatch}
                                                                toolTipData={toolTips[item.node.displayName] !== undefined ? toolTips[item.node.displayName] : null}
                                                            />;
                                                }
                                            })}
                                            </ul>
                                            <svg className="product__swatchLabelIcon product__swatchLabelIcon--45deg"><use xlinkHref="#icon-long-arrow-right" /></svg>
                                        </li>
                                        :null}

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
                                                            selectedSwatch={swatches}
                                                            toolTipData={toolTips[item.node.displayName] !== undefined ? toolTips[item.node.displayName] : null}
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
                                                            toolTipData={toolTips[item.node.displayName] !== undefined ? toolTips[item.node.displayName] : null}
                                                        />;
                                            }

                                            if( item.node.displayName === "not_an_option" ){
                                                return <input className="hide" id={item.node.entityId} type="checkbox" value="no" checked={true} />
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

export default firebaseService(CollectionPod);