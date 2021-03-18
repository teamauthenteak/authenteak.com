import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import { usePrevious } from 'react-use';
import Async from 'async';

import utils from '@bigcommerce/stencil-utils';
import { formatPrice } from './Utils';
import AppContext from './context/AppContext';
import AddToCartBtn from './AddToCartBtn';

export default function StickyCart(props){
    const appHook = useContext(AppContext);

    const [ status, setStatus ] = useState(null);
    const [ isFixed, setFixed ] = useState(true);
    const [ total, setTotal ] = useState(0);
    const [ totalQty, setTotalQty ] = useState(0);
    const [ headline, setHeadline ] = useState({});
    
    const cartItems = Object.keys(props.cart);
    const hasCartItems = cartItems.length > 0;

    let stickyBounds = null;
    let stickyCart = null;
    const [ offsetBounds, setOffsetBounds ] = useState(null);
    const prevBounds = usePrevious(offsetBounds);

    const handleScroll = () => {
        if( !stickyBounds ){
            stickyBounds = stickyCart.offsetTop + stickyCart.offsetHeight;
        }

        let canFix = window.pageYOffset < stickyBounds + (window.pageYOffset > prevBounds ? 0 : stickyCart.offsetHeight) ;

        setFixed(canFix);
        setOffsetBounds(window.pageYOffset);
    };


    useMemo(() => {
        let subTotal = 0, totalItems = 0;

        cartItems.forEach((ele) => {
            subTotal = subTotal + props.cart[ele].total;
            totalItems = totalItems + props.cart[ele]["qty[]"];
        });

        setTotal(subTotal);
        setTotalQty(totalItems);

    }, [props]);



    useEffect(() => {
        
        if( appHook.product.custom_fields !== undefined ){
            let headlineData = appHook.product.custom_fields.find(element => element.name === "sticky_cart_headline");
            setHeadline(headlineData)
        }

        // scroll events
        if( props.type === "sticky" ){
            stickyCart = document.querySelector(".stickyCart");
            window.addEventListener('scroll', handleScroll, true);
        }

        return function cleanUp(){
            if( props.type === "sticky" ){
                window.removeEventListener('scroll', handleScroll, true);
            }
        }
        
    }, []);



    const addToCart = () => {
        const { cartStatus } = props;

        let cartObj = {...props.cart}, item = 0, cartItems = Object.values(cartObj);

        setStatus(102);

        // clean up the cart
        for (const key in cartObj) {
            delete cartObj[key].total;
        }

        Async.whilst(
            () => { return item < cartItems.length;  },
            (callback) => {
                let formData = new FormData();

                for (const key in cartItems[item]) {
                    formData.append(`${key}`, cartItems[item][key]);
                }

                utils.api.cart.itemAdd(formData, (err, response) => {
                    if( response ){
                        callback(null, item);
                    }

                    if( err ){
                        // console.log(err)
                        setStatus(400)
                        cartStatus(404)
                    }
                });

                item++;

            }, (err) => {
                setTimeout(() => {
                    cartStatus(202);
                    setStatus(202);

                    setTotal(0);
                    setTotalQty(0);
                }, 2000);
            }
        );
    };


    const fixedSlide = useSpring({
        top: isFixed ? -120 : 0
    });


    const hasItems = useSpring({
        config: { duration: 100, mass: 5, tension: 500, friction: 80 },
        height: hasCartItems ? 42 : 0, 
        opacity: hasCartItems ? 1 : 0
    });


    // remove items from cart
    const removeItem = useCallback((item) => {
        appHook.removeFromCart(item);
    });


    return(
        <>
            {props.type === "sticky" ? 
                <div className={`stickyCart ${hasCartItems ? "stickyCart--contains" : "" }`}>
                    <animated.div style={fixedSlide} className={`stickyCart__row ${hasCartItems ? "stickyCart__row--contains" : "" } ${isFixed ? "stickyCart__row--static" : ""}`}>
                        
                        <header className={`stickyCart__cntr`}>

                            <div className="stickyCart__headerCntr">
                            {/* {!isFixed && 
                                <figure className="stickyCart__figure">
                                    <LazyImg src={replaceSize(appHook.product.main_image.data, 90)} placeholder={replaceSize(appHook.product.main_image.data, 10)} alt={appHook.product.title} className="stickyCart__figImg" />
                                </figure>
                                } */}

                                <div className="stickyCart__titleCntr">
                                    <h2 className="stickyCart__title">
                                        {headline.value !== undefined ? headline.value : ""}
                                    </h2>
                                    <p className="stickyCart__desc">{appHook.product.title}</p>
                                </div>
                            </div>


                            <div className="stickyCart__priceCntr">
                                <div className="stickyCart__price">
                                    <small className="stickyCart__priceSub">Order Subtotal</small>
                                    <span className="stickyCart__priceTotal">{total ? formatPrice(total) : "$0.00" }</span>
                                </div>

                                <AddToCartBtn isDisabled={total === 0 || !appHook.cartShouldBeRefreshed } addToCart={addToCart} status={status} />
                            </div>
                            <button type="button" className="stickyCart__close">
                                <svg className="icon icon-close"><use xlinkHref="#icon-close" /></svg>
                            </button>
                        </header>

                        <animated.ul className="stickyCart__itemList" style={hasItems}>
                            <li className="stickyCart__item stickyCart__item--total">{totalQty} {totalQty === 1 ? "Item" : "Total Items" }:</li>
                            {
                                cartItems.map((item) => {
                                    return <li className="stickyCart__item" key={props.cart[item].product_id}>
                                                <button className="stickyCart__itemButton" type="button" onClick={() => removeItem(item)}>
                                                    <span className="stickyCart__itemQty">{props.cart[item]["qty[]"]}</span>
                                                    <img className="stickyCart__itemImg" src={props.cart[item].img}/>
                                                </button>
                                            </li>
                                })
                            }

                            {
                                <>
                                <li className="stickyCart__item stickyCart__item--label">Selected Options:</li>
                                
                                {appHook.customizeThis.map((item) => {
                                    if( appHook[item].swatch === undefined ){ return }

                                    return <li className="stickyCart__item" key={appHook[item].attribute}>
                                                <img className="stickyCart__itemImg stickyCart__itemImg--rounded" src={appHook[item].swatch.image} alt={item +": "+ appHook[item].swatch.label} />
                                            </li>
                                })}

                                </>
                            }
                        </animated.ul>
                    </animated.div>
                </div>

            :

                <aside class="modalCart is-open">
                    <div class="modalCart__inner">
                        <div class="modalCart__top-bar">
                            <h2 class="modalCart__title">Added</h2>
                            <button class="modalCart__close">
                                <span class="modalCart__closeText">Continue</span> 
                                <svg className="icon icon-close"><use xlinkHref="#icon-close" /></svg>
                            </button>
                        </div>

                        <div class="modalCart__cntr">
                            <div class="modalCart__contents"></div>
                            <div class="modalCart__summary">
                                <div class="modalCart__subtotal">
                                    <span class="modalCart__subtotal-label">Order Subtotal</span>
                                    <span class="modalCart__subtotal-value">{total ? formatPrice(total) : "$0.00" }</span>
                                </div>

                                <div class="modalCart__count">
                                    {totalQty} {totalQty === 1 ? "Item" : "Total Items" }                       
                                </div>

                                <AddToCartBtn isDisabled={total === 0} addToCart={addToCart} status={status} />
                            </div>
                        </div>
                    </div>

                    <div class="modalCart__underlay"></div>
                </aside>
            }
        </>
    )
}