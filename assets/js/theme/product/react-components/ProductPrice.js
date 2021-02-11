import React from 'react';

export default function ProductPrice(props){
    return(
        <div className={`product__price ${props.class}`}>
            { props.isUpdating ?
                <div className="product__priceLine">
                    <svg className="icon icon-spinner"><use xlinkHref="#icon-spinner" /></svg>
                </div>
            :
                <div className="product__priceLine">
                    <span className="product__priceValue">
                        {props.productPrice.without_tax}
                    </span>
                    {props.productPrice.rrp_without_tax !== null && props.productPrice.rrp_without_tax !== "$0" ? <span className="product__priceRrp">{props.productPrice.rrp_without_tax}</span> : null}
                </div>
            }
        </div>
    );
}

