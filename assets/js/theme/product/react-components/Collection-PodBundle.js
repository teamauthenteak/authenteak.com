import React, { useContext, useEffect, useMemo, useState } from 'react';
import { usePrevious } from 'react-use';
import AppContext from './context/AppContext';
import utils from '@bigcommerce/stencil-utils';
import GraphQL from '../../graphql/GraphQL';

import Swatch from '../react-components/Swatch';
import ProductPrice from '../react-components/ProductPrice';
import QuantityButton from '../react-components/QuantityButton';
import AddButton from '../react-components/Collection-PodAddBtn';
import { areSelectionsValid, formatPrice } from './Utils';


export default function CollectionPodBundle(){
    const appHook = useContext(AppContext);
    const graphQL = new GraphQL();

    const [ productPrice, setProductPrice ] = useState({});
    const [ basePrice, setBasePrice ] = useState({});
    const [ productBundle, setProductBundle ] = useState([]);

    const [ qty, setQty ] = useState(1);
    const prevQty = usePrevious(qty);

    // if options have changed thus a price change and the product prices need to update
    const [ shouldUpdate, update ] = useState(false);
    const [ isUpdating, setUpdating ] = useState(false);

    const [ options, setOptions ] = useState([]);

    const [ swatchMeta, setSwatchMeta ] = useState({});
    const [ swatches, setSwatch ] = useState({});
    const [ invalidSwatch, setInvalidSwatch ] = useState([]);
    
    const [ dropdown, setDropdown ] = useState({});
    const [ invalidDropdown, setInvalidDropdown ] = useState([]);


    // adds products to the collections pre-cart
    const addToCart = () => {

        // run a validation on options
        let isValid = areSelectionsValid({
                options: options,
                swatches: swatches,
                dropdown: dropdown,
                invalidSwatch: invalidSwatch,
                invalidDropdown: invalidDropdown,
                setInvalidSwatch: (swatchItem) => {
                    setInvalidSwatch(swatchItem);
                },
                setInvalidDropdown: (dropdownItem) => {
                    setInvalidDropdown(dropdownItem);
                }
            });

        if( !isValid ){ return; }


        Object.values(productBundle).forEach(item => {
            let match = appHook.bundlePreCart[item.entityId];

            if( match ){
                appHook.addToCart({
                    ...match.cart,
                    img: match.img,
                    product_id: match.product_id,
                    total: match.priceWithOptions * match.qty
                });
            }
        });

        if( shouldUpdate ){
            update(false);
        }

        appHook.cartShouldRefresh();
    }
    


    const selectSwatch = (data) => {
        setSwatch((swatches) => {
            let newSwatch = { ...swatches };

            newSwatch[data.display_name] = {
                attribute: data.attribute,
                attributeValue: data.attributeValue,
                swatch: {
                    label: data.swatch.label,
                    image: data.swatch.image
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
            let options = graphQL.getProductOptions(appHook.product_id);

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
                }
            });
        }

        // set the price for this product bundle
        if( Object.keys(productPrice).length === 0 ){
            
            let price = {
                without_tax: formatPrice( appHook.product.price.without_tax.value ),
                rrp_without_tax: formatPrice( appHook.product.price.rrp_without_tax.value ),
                value: appHook.product.price.rrp_without_tax.value
            };
    
            setProductPrice(price)
        }

    }, [appHook.product]);



    // calculates the total bundle price including fabric options
    const getBundlePrice = () => {
        let bundle = [];
        let total = 0;

        Object.keys(appHook.suggestedLayout.product_n_values).forEach((key) => {
            let match = appHook.collection.find(ele => ele.entityId === parseInt(key));

            match.qty = appHook.suggestedLayout.product_n_values[key];
            total =+ total + (match.priceWithOptions * match.qty);

            bundle.push(match);
        });
       
        return {
            total: total,
            bundle: bundle
        }
    }



    // build the initial price of the suggested layout
    useMemo(() => {
        let suggested = getBundlePrice();

        setProductBundle(suggested.bundle);

        setBasePrice({
            without_tax: formatPrice(suggested.total),
            value: suggested.total
        });

        setProductPrice({
            without_tax: formatPrice(suggested.total),
            value: suggested.total
        });

    }, [appHook.suggestedLayout]);




    useMemo(() => {

        // get selected swatch meta data
        Object.values(swatches).forEach((element) => {
            let swatchData = TEAK.Utils.parseOptionLabel(element.swatch.label);

            if( swatchData.grade !== undefined ){
                setSwatchMeta(swatchData)
            }
        });

    }, [swatches]);




    // when a product in the pre config list is updated via qty or options update the price
    useMemo(() => {
        let total = 0, preCart = [];

        Object.keys(appHook.suggestedLayout.product_n_values).forEach((key) => {
            let match = appHook.bundlePreCart[key];

            if( match ){
                match.qty = appHook.suggestedLayout.product_n_values[key];
                preCart.push(match);
            }
        });

        // includes all of the option upgrades
        if( preCart.length ){
            preCart.forEach(ele => total =+ total + (ele.priceWithOptions * ele.qty) );
            total = total * qty;

            setProductPrice({
                without_tax: formatPrice(total),
                value: total
            });


        // if just changing qty
        }else if(productPrice.without_tax){
            let chosenSuggested = getBundlePrice();

            setProductPrice({
                without_tax: formatPrice(chosenSuggested.total * qty),
                value: chosenSuggested.total * qty
            });
        }


        // if we have items in cart and updated the price notify that we need to update
        if( Object.keys(appHook.cart).length && !shouldUpdate ){
            appHook.cartShouldRefresh();
            update(true);
        }

    }, [qty, appHook.bundlePreCart, appHook.suggestedLayout]);






    return(
        <>
            <div className="product__row product__row--border product__row--left pad">
                <strong className="product__title product__title--upperBadge">Step 2</strong>
                <h2 className="product__title product__title--tight">Customize Your Selection</h2>
            </div>
            
            <div className="product__collectionSelection">
                <div className="product__col-4-10--xl product__col-1-1">
                    <figure className="product__collectionsFigure">
                        <img 
                            className="product__figImg product__figImg--border" 
                            src={appHook.suggestedLayout.sketch ? appHook.suggestedLayout.sketch.value : "https://dummyimage.com/600x360/fff/777.jpg"} 
                        />
                    </figure>
                </div>

                <div className="product__collectionSelectedControls">
                    <div className="product__col-1-2--md product__col-1-1 pad-right-left">
                        <h2 className="product__header---2 product__header--top">{appHook.product.brand.name} {appHook.suggestedLayout.name}</h2>

                        <p><strong>Includes {(appHook.suggestedLayout.totalPieces * qty)} pieces:</strong></p>
                        <ul className="product__highlights">
                            {productBundle.map(item => <li key={item.entityId}>{(item.qty * qty)}x {item.name.split(appHook.product.brand.name)[1]} - {item.entityId}</li>)}
                        </ul>
                        <p>Approx. Size: {appHook.suggestedLayout.dim} &mdash; <em>{appHook.suggestedLayout.text}</em></p>

                        <div className="product__priceCntr product__priceCntr--full">
                            <ProductPrice isUpdating={isUpdating} productPrice={productPrice} class="product__price--left" />
                            
                            <small className="product__priceLineItem">
                            (Base: {formatPrice(basePrice.value * qty)} {swatchMeta.grade ? `plus Grade ${swatchMeta.grade} Fabric` : ""}

                                <strong className="hide"> &nbsp;
                                {((productPrice.value ? productPrice.value : 0) - (basePrice.value * qty)) < 0 ? 
                                    formatPrice(0) 
                                        : 
                                    formatPrice((productPrice.value ? productPrice.value : 0) - (basePrice.value * qty)) 
                                }
                                </strong>)
                            </small>
                        </div>
                    </div>

                    <div className="product__col-1-2--md product__col-1-1 no-pad">
                        <div className="product__swatchCol">
                            <ul className="product__swatchList" id="customize">
                                {appHook.product.options.map((item) => {
                                    if(item.partial === "swatch") {
                                        return <Swatch 
                                                key={item.id} 
                                                toggle={(data) => appHook.openDrawer(data) } 
                                                displayName={item.display_name} 
                                                id={item.id} 
                                                values={item.values} 
                                                type="global"
                                                isInvalid={invalidSwatch}
                                                globalCallback={selectSwatch}
                                            />
                                    }
                                })}
                            </ul>
                        </div>

                        <div className="product__collectionCartControls">
                            <QuantityButton qty={(value) => setQty(value)} value={qty} class="no-margin" />
                            <AddButton disabled={isUpdating} addToCart={(item) => addToCart(item)} id={0} update={shouldUpdate} />
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}