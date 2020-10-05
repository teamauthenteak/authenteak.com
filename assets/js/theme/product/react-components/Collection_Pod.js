import React, { useState, useEffect, useContext } from 'react';
import GraphQL from '../../graphql/GraphQL';
import Swatch from './Swatch';
import Select from './Select';
import QuantityButton from './QuantityButton';
import AppContext from '../collection/AppContext';


export default function CollectionPod(props){
    const appHook = useContext(AppContext);

    const [ qty, setQty ] = useState(0);
    const [ options, setOptions ] = useState([]);

    const graphQL = new GraphQL();

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


    const selectSwatch = () => {}

    const selectSelect = () => {}


    useEffect(() => {
        let options = graphQL.getProductOptions(props.product.entityId);

        graphQL.get(options).then(response => {
            setOptions(response.site.products.edges[0].node.productOptions.edges);
        });

    }, []);

    
    return(
        <>
        {props.product ? 
        
            <section className="product__row product__row--border product__row--section">
                <form className="form add-to-cart-form" name={`product_${props.product.entityId}`}>
                
                    <div className="product__pod product__pod--horz">
                        <figure className="product__figure product__col-2-10--lg product__col-1-1">
                            <a href={props.product.path} title={`See all details about ${props.product.name}`} className="product__figLink">
                                <img className="product__img product__img--thumb" src={props.product.defaultImage.url} alt={props.product.name} />
                            </a>
                        </figure>

                        <div className="product__col-8-10--lg product__col-1-1 pad-left flex">
                            <div className="product__col-6-10--lg product__col-1-1 product__col--metaDesc">
                                <header className="product__nameHeader">
                                    <h1 className="product__name product__name--sm">
                                        <a href={props.product.path} title={`See all details about ${props.product.name}`}>
                                            {props.product.name}
                                        </a>
                                    </h1>
                                </header>

                                <p className="product__itemNum">Item #: {props.product.sku} &nbsp;&nbsp;&nbsp; Internet #: {props.product.entityId}
                                    <a className="product__ratingWrapper hide" href={`${props.product.path}#reviews`} title={`Reviews of ${props.product.name}`}>
                                        <span className="yotpo-stars-rating" style={{"--rating": 0}} aria-label="Rating of 0 out of 5."></span>
                                        (<span className="yotpo-reviews-num">0</span>)
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
                                return <li key={index}>{item.node.value}</li>;
                            }
                        })}
                                </ul>


                        {props.product.customFields.edges.map((item, index) => {

                            if(item.node.name === "Lead-Time"){
                                let text = item.node.value.toLowerCase();
                                let leadTimeTwoIndex = props.product.customFields.edges.findIndex(element => element.node.name === "Lead-Time 2");

                                return <p className="product__shippingInfo" key={index}>
                                            {text.includes("ships next business day") ? <span id="nextBussinessDay" className="shipping-range--tip">{TEAK.Modules.leadTime.setTip("nextBussinessDay", true)}</span> : null}
                                            {item.node.value}
                                            {leadTimeTwoIndex !== -1 ? ` ${props.product.customFields.edges[leadTimeTwoIndex].node.value}` : null}
                                        </p>
                            }

                            if(item.node.name === "Promo Text"){ 
                                return <p className="product__promoText" key={index}>{item.node.value}</p>
                            }

                            if(item.node.name === "Free Shipping Icon" && item.node.value === "Yes"){
                                return <div id="freeShipping" key={index}><p className="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></div>
                            }

                        })}

                                <p>
                                    <a href={props.product.path} title={`Learn more about ${props.product.name}`}>
                                        View more details &rsaquo;
                                    </a>
                                </p>                            
                            </div>
                        
                            <div className="product__col-4-10--lg product__col-1-1 product__col--controls">
                                <div className="product__price">
                                    <div className="product__priceLine">
                                        <span className="product__priceValue">
                                            {TEAK.Utils.formatPrice( TEAK.Utils.graphQL.determinePrice(props.product.prices) )}
                                        </span>
                                        {props.product.prices.retailPrice !== null ? 
                                            <span className="product__priceRrp">${TEAK.Utils.formatPrice( props.product.prices.retailPrice.value )}</span>
                                        : null}
                                    </div>              
                                </div>

                                <div className="product__swatchCol">
                                    <ul className="product__swatchList">
                                        <li className="product__swatchItem product__swatchItem--list">
                                            Selected Options
                                            <ul className="product__swatchItemList">
                                            {options.map((item, index) => {
                                                if( item.node.displayStyle === "Swatch" && appHook.hasOwnProperty(item.node.displayName) ){
                                                    return  <Swatch 
                                                                key={index} 
                                                                toggle={toggleDrawer} 
                                                                displayName={item.node.displayName} 
                                                                id={item.node.entityId} 
                                                                values={item.node.values.edges}
                                                                type="remote"
                                                            />;
                                                }
                                            })}
                                            </ul>
                                            <svg className="product__swatchLabelIcon product__swatchLabelIcon--45deg"><use xlinkHref="#icon-long-arrow-right" /></svg>
                                        </li>

                                        {options.map((item, index) => {
                                            if( item.node.displayStyle === "DropdownList" && appHook.hasOwnProperty(item.node.displayName) ){
                                                return  <Select 
                                                            key={index} 
                                                            displayName={item.node.displayName} 
                                                            id={item.node.entityId} 
                                                            values={item.node.values.edges}
                                                            type="remote"
                                                        />;
                                                        
                                            }
                                        })}


                                        {options.map((item, index) => {
                                            if(item.node.displayStyle === "Swatch" && !appHook.hasOwnProperty(item.node.displayName) ){
                                                return  <Swatch 
                                                            key={index} 
                                                            toggle={toggleDrawer} 
                                                            displayName={item.node.displayName} 
                                                            id={item.node.entityId} 
                                                            values={item.node.values.edges}
                                                            setOption={selectSwatch}
                                                            type="local"
                                                        />;
                                            }

                                            if( item.node.displayStyle === "DropdownList" && !appHook.hasOwnProperty(item.node.displayName) ){
                                                return <Select 
                                                            key={index} 
                                                            displayName={item.node.displayName} 
                                                            id={item.node.entityId} 
                                                            values={item.node.values.edges}
                                                            setOption={selectSelect}
                                                            type="local"
                                                        />;
                                            }
                                        })}
                                    </ul>
                                </div>

                                <div className="product__col--priceCntr">
                                    <div className="form-field no-margin">
                                        <QuantityButton qty={setQty} />
                                    </div>

                                    <button type="button" className="product__atcCollectionBtn">
                                        <span className="product__atcCollectionBtnText">Add to Cart</span>
                                        <svg className="icon icon-spinner hide"><use xlinkHref="#icon-spinner" /></svg>
                                    </button>
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