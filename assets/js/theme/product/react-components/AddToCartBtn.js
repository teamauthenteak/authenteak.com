import React from 'react';

export default function AddToCartBtn(props){

    const addToCart = () => {
        const { addToCart } = props;
        addToCart();
    }

    return(
        <button type="button" disabled={props.isDisabled || props.status === 102 } className="stickyCart__atcBtn" onClick={addToCart}>
            {
                {
                    102: <>
                            <svg className="icon icon-spinner"><use xlinkHref="#icon-spinner" /></svg>
                            <span className="stickyCart__atcBtnText">Adding Items</span>
                         </>,

                    202: <>
                            <svg className="icon icon-check2"><use xlinkHref="#icon-check2" /></svg>
                            <span className="stickyCart__atcBtnText">Items Added</span>
                         </>,

                    307: <>
                            <span className="stickyCart__atcBtnText">View Cart</span>
                            <svg className="icon icon-arrow-right"><use xlinkHref="#icon-arrow-right" /></svg>
                         </>,

                    400: <>
                            <svg className="icon icon-info_outline"><use xlinkHref="#icon-info_outline" /></svg>
                            <span className="stickyCart__atcBtnText">Try Again</span>
                         </>,

                    null: <>
                            <svg className="icon icon-cart"><use xlinkHref="#icon-cart" /></svg>
                            <span className="stickyCart__atcBtnText">Add To Cart</span>
                          </>

                }[props.status]
            }
        </button>
    )
}