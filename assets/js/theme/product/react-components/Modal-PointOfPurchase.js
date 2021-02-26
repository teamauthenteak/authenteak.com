import React, { useContext, useEffect, useState, useMemo } from 'react';
import AppContext from './context/AppContext';
import { useSpring, animated } from 'react-spring';
import { useMeasure } from 'react-use';

import utils from '@bigcommerce/stencil-utils';
import GraphQL from '../../graphql/GraphQL';
import { formatPrice } from './Utils';

import Swatch from './Swatch';
import QuantityButton from './QuantityButton';
import AddToCartBtn from './AddToCartBtn';
import Select from './Select';


export default function PointOfPurchaseModal(props){
    const appHook = useContext(AppContext);
    const graphQL = new GraphQL();

    const [ bind, { height } ] = useMeasure();
    const [ modalData, setModalData ] = useState({});
    const [ productData, setProductData ] = useState([]);

    const [ mainProductSwatches, setMainProductSwatches ] = useState([]);
    const [ selectedOpt, setSelectedOpt ] = useState({});
    const [ totalQty, setTotalQty ] = useState(1);
    const [ selected, setSelected ] = useState({});

    const [ atcDisabled, setAtcDisabled ] = useState(false);
    const [ total, setTotal ] = useState(0);
    const [ status, setStatus ] = useState(null);

    const modalVerticalCenter = useSpring({ 
        marginTop: (-height / 2)
    });



    useEffect(() => {
        let modal = appHook.product.custom_fields.find( ele => ele.name.includes("modal=") );

        if( modal && Object.keys(modalData).length === 0 ){
            let obj = {};

            modal.name.split(",").forEach(element => {
                let item = element.split("=");
    
                switch( item[0] ){
                    case "modal":
                        obj[item[0]] = item[1];
                        break;
    
                    case "desc":
                        obj[item[0]] = item[1];
                        break;
    
                    default: return;
                }
            });

            setModalData(obj);
        }


        if( productData.length === 0 ){
            let data = graphQL.getProductInfo(modal.value),
                options = graphQL.getProductOptions(modal.value);

            // get products
            graphQL.get(data).then(response => {
                if(response){
                    let fetchedProducts = response.site.products.edges;

                    // get options
                    graphQL.get(options).then((optResponse) => {
                        if( optResponse ){
                            optResponse.site.products.edges.forEach(element => {
                                let matchedProd = fetchedProducts.find(item => item.node.entityId === element.node.entityId);                                
                                matchedProd.options = element.node.productOptions.edges;
                            });

                            setProductData(fetchedProducts);
                        }
                    });
                }
            });
        }    

        appHook.customizeThis.forEach(element => {
            let key = Object.keys(appHook).find(item => item.toLowerCase().includes(element.toLowerCase()));
            setMainProductSwatches( mainProductSwatches => [...mainProductSwatches, {...appHook[key], name: key } ]);
        });

        document.getElementsByTagName("body")[0].classList.add("modal__freezeBody");

    }, []);



    // update of qty
    const updateQty = (value) => { 
        setTotalQty(value);
    }


    
    const addToCart = () => {
        let cart = {
                action: "add",
                "qty[]": totalQty,
                product_id: selected.node.entityId,
                [`attribute[${selectedOpt.attribute}]`]: selectedOpt.attributeValue
            };

        setStatus(102);
        setAtcDisabled(true);

        let formData = new FormData();

        for (const key in cart) {
            formData.append(`${key}`, cart[key]);
        }

        utils.api.cart.itemAdd(formData, (err, response) => {
            if( response ){
                setStatus(202);

                setTimeout(() => {
                    setStatus(307);
                    window.location.href = "/cart.php";
                }, 1000);
            }

            if( err ){
                console.log(err)
                setStatus(400);
                setAtcDisabled(false);
            }
        });
    }



    // on swatch change
    const changeSwatch = (swatchObj) => {
        let key = Object.keys(swatchObj)[0];

        setSelectedOpt({
            attribute: key,
            attributeValue: swatchObj[key].entityId,
            image: swatchObj[key].imageUrl,
            label: swatchObj[key].label.split("--")[0]
        });   
    }


    // on select box change
    const selectSelect = (data) => {
        let key = Object.keys(data)[0];

        setSelectedOpt({
            attribute: data[key].attribute,
            attributeValue: data[key].attributeValue,
            label: data[key].label
        });
    }



    // on swatch change update price
    const  updatePrice = () => {
        let params = { 
                action: "add", 
                "qty[]": totalQty,
                [`attribute[${selectedOpt.attribute}]`]: selectedOpt.attributeValue
            };

        setAtcDisabled(true);

        let query = "";

        for (const key in params) {
            query += `&${key}=${params[key]}`;
        }

        utils.api.productAttributes.optionChange(selected.node.entityId, encodeURI(query), (err, response) => {
            let updated = response.data;

            setAtcDisabled(false);

            setTotal({
                without_tax: formatPrice(updated.price.without_tax.value * totalQty),
                rrp_without_tax: null
            });
        });
    }



    useMemo(() => {
        if( Object.keys(selectedOpt).length ){
            updatePrice();
        }
    }, [selectedOpt, totalQty]);




    useMemo(() => {
        if( Object.keys(selectedOpt).length && selectedOpt.image !== undefined ){

            // make our brittle label "ID" just like in Swatch.js to find our match...  :/
            let prevSelect = selectedOpt.label.split("--")[0];

            prevSelect = prevSelect.toLowerCase().split("(+")[0];
            prevSelect = prevSelect.split(" ").join("");

            // run through all the options values to find a brittle match...  :/
            let selectedOptions = selected.options[0].node.values.edges;

            for (let i = 0; i < selectedOptions.length; i++) {
                let labelId = selectedOptions[i].node.label.split("--")[0];

                labelId = labelId.toLowerCase().split("(+")[0];                
                labelId = labelId.split(" ").join("");

                if( labelId.includes(prevSelect) ){
                    setSelectedOpt({
                        attribute: selected.options[0].node.entityId,
                        attributeValue: selectedOptions[i].node.entityId,
                        image: selectedOptions[i].node.imageUrl,
                        label: selectedOptions[i].node.label
                    });  

                    break;
                }
            }
                

        }else if( Object.keys(selected).length ){
            let price = formatPrice(selected.node.prices.price.value);
            setTotal({ without_tax: price });
        }

    }, [selected]);




    return( <>
                <animated.div className="modal modal__wrapper" ref={bind} style={modalVerticalCenter}>
                    <div className="modal__cntr">
                        <div className="modal__header">
                            <div className="modal__headingCntr">
                                <h4 className="modal__heading">All Done! {modalData.modal}</h4>
                                <p className="modal__headingDesc">{modalData.desc}</p>
                            </div>
                            <a href="/cart.php" className="modal__headingBtn">
                                <span>No Thanks</span>
                                <svg className="icon icon-close"><use xlinkHref="#icon-close" /></svg>
                            </a>
                        </div>

                        <form className="modal__content">                 
                            <div className="product__row product__row--podCntr">
                                <div className="product__podBtnCntr">
                            { productData.length !== 0 ?
                                productData.map((item) => {
                                    return  <button type="button" 
                                                name={item.node.name} 
                                                className={`product__pod--btn ${Object.keys(selected).length !== 0 && selected.node.entityId === item.node.entityId ? "product__pod--btn-active" : "" }`} 
                                                key={item.node.entityId} 
                                                onClick={() => setSelected(item)}
                                            >

                                            <div className="product__figure">
                                                <img className="product__figImg" src={item.node.defaultImage.url} alt={item.node.name} />
                                            </div>
                                            <h5 className="product__name product__name--pod">{item.node.name}</h5>
                                            <div className="product__price product__price--pod">{ formatPrice( TEAK.Utils.graphQL.determinePrice( item.node.prices)) }</div>
                                            
                                            {item.hasOwnProperty("options") && item.options[0].node.displayStyle === "Swatch" ?
                                            <ul className={`product__podSwatches product__podSwatches--center`}>
                                        {item.options[0].node.values.edges.map((optItem, index) => {
                                            if( index < 4 ){ 
                                                return <Swatch id={optItem.node.entityId} img={optItem.node.imageUrl} type="pod" key={optItem.node.entityId} />          
                                            }
                                        })}
                                                <li className="product__podSwatchItem product__podSwatchItem--text">
                                                    <svg className="icon icon-plus"><use xlinkHref="#icon-plus" /></svg> &nbsp;
                                                    <i>{item.options[0].node.values.edges.length} Fabric Options</i>
                                                </li>
                                            </ul>
                                            :null}

                                        </button>
                                })
                            :
                                <ul className="preloader preloader--full preloader--tall preloader--background">
                                    <li className="preloader__block preloader__block--1-4"></li>
                                    <li className="preloader__block preloader__block--1-4"></li>
                                    <li className="preloader__block preloader__block--1-4"></li>
                                    <li className="preloader__block preloader__block--1-4"></li>
                                </ul>
                            }
                                </div>
                            </div>

                            <div className={`product__row product__row--border product__row--podCntr ${Object.keys(selected).length === 0 ? "hide" : "show"}`}>
                                <div className="product__col-1-1 pad-top-bottom">
                                    
                    {Object.keys(selected).length !== 0 ?
                        selected.options.map((item) => {
                            let isSwatch= item.node.displayStyle === "Swatch";

                            return  <React.Fragment key={item.node.entityId}>
                                        <div className={`product__col product__col-1-${isSwatch ? "3" : "2"}--lg product__col-1-1`}>
                                            <h5 className="product__name">{item.node.displayName}</h5>

                                            <div className="product__col product__col-6-10--lg product__col-5-10 no-pad">
                                                {Object.keys(selectedOpt).length !== 0 && isSwatch ?
                                                <figure className="product__figure">
                                                    <img className="product__figImg round" src={selectedOpt.image} alt={`Pillow Swatch ${selectedOpt.label}`} />
                                                    {
                                                        mainProductSwatches.map((item) => {
                                                            if( item.hasOwnProperty("swatch") ){
                                                                return <span className="product__figure--auxSwatch" key={item.attribute.toString()}>
                                                                            <img className="product__figImg round" src={item.swatch.image} alt={item.name} />
                                                                            <span className="product__figImgName">{item.name.split("Select")[1]}</span>
                                                                        </span>
                                                            }
                                                        })
                                                    }
                                                </figure>
                                                :null}
                                            </div>
                                        </div>


                                        {isSwatch ?
                                        <div className="product__col product__col-2-3--lg product__col-1-1">
                                            <div className="product__scrollCntr">
                                                <ul className="product__podSwatches">
                                            {item.node.values.edges.map((optItem) => {
                                            return  <li key={optItem.node.entityId.toString()} className="product__podSwatchItem product__podSwatchItem--row swatch-wrap">
                                                        <Swatch 
                                                            id={optItem.node.entityId}
                                                            img={optItem.node.imageUrl}
                                                            label={optItem.node.label}
                                                            option={optItem}
                                                            isChecked={selectedOpt.attributeValue === optItem.node.entityId}
                                                            type="select" 
                                                            for={item.node.displayName} 
                                                            selected={(data) => changeSwatch({ [item.node.entityId]: data.node })}
                                                            toolTipData={null}
                                                        />
                                                    </li>
                                            })}
                                                </ul>  
                                            </div>
                                        </div>
                                    :null}


                                    {item.node.displayStyle === "DropdownList" ? 
                                        <div className="product__col product__col-1-2--lg product__col-1-1">
                                            <Select 
                                                displayName={item.node.displayName} 
                                                id={item.node.entityId} 
                                                values={item.node.values.edges}
                                                setOption={selectSelect}
                                                type="local"
                                                toolTipData={null}
                                            /> 
                                        </div>
                                    :null}

                                    </React.Fragment>
                        })
                    :null}
                                </div>
                            </div>

                            <div className={`product__row product__row--border product__row--podCntr ${Object.keys(selected).length === 0 ? "hide" : "flex"}`}>
                                <div className="product__col product__col-6-10--lg product__col-1-1 pad-top flex">
                                    <div className="product__col--priceCntr">
                                        <div className="product__col-2-10 no-pad">
                                            {atcDisabled && status === null ? 
                                                <div className="product__price">
                                                     <svg className="icon icon-spinner"><use xlinkHref="#icon-spinner" /></svg>
                                                </div>
                                            :
                                                <div className="product__price">
                                                    {total.without_tax ? total.without_tax : "$0"}
                                                </div>
                                            }
                                        </div>
                                        <div className="product__col-8-10--md product__col-1-1 no-pad">
                                            <p className="product__priceDesc">
                                                <strong className="product__priceDesc--name">{Object.keys(selected).length ? selected.node.name : ""}</strong>
                                                <span className="product__priceDesc--swatch">{Object.keys(selectedOpt).length ? selectedOpt.label : ""}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="product__col product__col-4-10--lg product__col-1-1 flex pad-top">
                                    <div className="product__col--priceCntr">
                                        <QuantityButton value={1} qty={updateQty} />
                                        <AddToCartBtn isDisabled={atcDisabled} addToCart={addToCart} status={status} />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </animated.div>
                <div className="modal__overlay"></div>
            </>
        );
}