import React from 'react';

export default function AddToCartBtn(props){

    const addToCart = () => {
        const { addToCart } = props;
        addToCart();
    }

    return(
        <button type="button" disabled={props.isDisabled || props.status === 102 } className="stickyCart__atcBtn" onClick={addToCart}>
            
            {props.status === 102 ?
                <>
                    <svg className="icon icon-spinner"><use xlinkHref="#icon-spinner" /></svg>
                    Adding Items
                </>
            : null }

            {props.status === 202 ?
                <>
                    <svg className="icon icon-check2"><use xlinkHref="#icon-check2" /></svg>
                    Items Added
                </>
            : null }

            {props.status === 400 ?
                <>
                    <svg className="icon icon-info_outline"><use xlinkHref="#icon-info_outline" /></svg>
                    Try Again
                </>
            : null }

            {props.status === null ?
                <>
                    <svg className="icon icon-cart"><use xlinkHref="#icon-cart" /></svg>
                    Add To Cart
                </>
            : null }
           
        </button>
    )
}