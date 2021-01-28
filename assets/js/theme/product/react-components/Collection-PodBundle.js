import React, { useContext, useEffect, useMemo, useState } from 'react';
import { usePrevious } from 'react-use';
import AppContext from './context/AppContext';
import utils from '@bigcommerce/stencil-utils';
import GraphQL from '../../graphql/GraphQL';
import { firebaseService } from './services/Firebase';

import Swatch from '../react-components/Swatch';
import ProductPrice from '../react-components/ProductPrice';
import QuantityButton from '../react-components/QuantityButton';
import AddButton from '../react-components/Collection-PodAddBtn';
import LazyImg from '../react-components/LazyImg';
import ReviewStars from '../react-components/ReviewStars';

import { areSelectionsValid } from './Utils';


export default function CollectionPodBundle(){
    const appHook = useContext(AppContext);

    const [ productPrice, setProductPrice ] = useState({});
    const [ qty, setQty ] = useState(1);
    const prevQty = usePrevious(qty);

    const [ shouldUpdate, update ] = useState(false);
    const [ isUpdating, setUpdating ] = useState(false);

    const [ swatches, setSwatch ] = useState({});
    const [ invalidSwatch, setInvalidSwatch ] = useState([]);

    const [ toolTips, setToolTips ] = useState({})
    
    const [ dropdown, setDropdown ] = useState({});
    const [ invalidDropdown, setInvalidDropdown ] = useState([]);


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


    // adds products to the collections pre-cart
    const addToCart = () => {

        // run a validation on options
        let isValid = areSelectionsValid({
            options: options,
            swatches: swatches,
            dropdown: dropdown,
            invalidSwatch: (swatchItem) => {
                setInvalidSwatch(swatchItem);
            },
            invalidDropdown: (dropdownItem) => {
                setInvalidDropdown(dropdownItem);
            }
        });

        if( !isValid ){ return; }  

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

        // fetch the data for all options
        if( options.length === 0 ){
            let options = graphQL.getProductOptions(appHook.product.entityId);

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
            let retailPrice = appHook.product.prices.retailPrice !== null ? appHook.product.prices.retailPrice.value : 0;
            
            let price = {
                without_tax: formatPrice( TEAK.Utils.graphQL.determinePrice( appHook.product.prices) ),
                rrp_without_tax: formatPrice( retailPrice )
            };
    
            setProductPrice(price);
        }

    }, [appHook.product]);




    return(
        <>
            <div className="product__row product__row--left pad-left">
                <strong className="product__title product__title--upperBadge">Step 3</strong>
                <h2 className="product__title product__title--tight">Customize Your Selection</h2>
            </div>
            
            <div className="product__collectionSelection">
                <div className="product__col-1-2">
                    <figure className="product__collectionsFigure">
                        <img className="product__figImg" src="https://dummyimage.com/720x360/fff/777.jpg" />
                    </figure>
                </div>

                <div className="product__collectionSelectedControls">
                    <div className="product__col-1-2 pad-right">
                        <h2 className="product__header---2 product__header--top">{appHook.suggestedLayout.name}</h2>

                        <p><strong>Includes {appHook.suggestedLayout.totalPieces} pieces</strong> &mdash; blah name of piece</p>
                        <p>Overall Size = {appHook.suggestedLayout.dim} &mdash; <em>{appHook.suggestedLayout.text}</em></p>

                        <ProductPrice isUpdating={isUpdating} productPrice={productPrice} />
                    </div>

                    <div className="product__col-1-2 no-pad">
                        <div className="product__swatchCol">
                            <ul className="product__swatchList" id="customize">
                                {appHook.product.options.map((item) => {
                                    if(item.partial === "swatch") {
                                        return <Swatch 
                                                key={item.id} 
                                                toggle={(data) => appHook.toggleDrawer(data) } 
                                                displayName={item.display_name} 
                                                id={item.id} 
                                                values={item.values} 
                                                type="global"
                                            />
                                    }
                                })}
                            </ul>
                        </div>

                        <div className="product__collectionCartControls">
                            <QuantityButton qty={setQty} value={qty} class="no-margin" />
                            <AddButton disabled={true} addToCart={(item) => appHook.addToCart(item)} id={0} />
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}