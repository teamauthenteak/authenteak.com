import React, { useState } from 'react';

export default function QuantityButton(props){
    const [ count, setCount ] = useState(0);

    const setQty = (value) => {
        setCount(value);

        const { qty } = props;
        qty(value);
    }

    return  <label className="product__qtyCntr">
                <strong className="product__qtyText">Quantity</strong>
                <input type="number" className="product-quantity form-input" required name="qty[]" value={count} min="1" max="999" pattern="[0-9]+" />
                
                <div className="product-quantity-toggle-wrapper">
                    <button type="button" className="product-quantity-toggle product-quantity-decrement" onClick={() => setQty(count - 1)} >
                        <svg className="icon icon-minus"><use xlinkHref="#icon-minus" /></svg>
                    </button>
                    <button type="button" className="product-quantity-toggle product-quantity-increment" onClick={() => setQty(count + 1)}>
                        <svg className="icon icon-plus"><use xlinkHref="#icon-plus" /></svg>
                    </button>
                </div>
            </label>
}