import React, { useState, useMemo } from 'react';

export default function QuantityButton(props){
    const [ count, setCount ] = useState(null);

    const setQty = (value) => {
        value = value.hasOwnProperty("currentTarget") ? value.currentTarget.value : value;

        setCount(value);

        const { qty } = props;
        qty(value);
    }

    
    useMemo(() => {
        setCount(props.value);

    }, [props.value]);


    return  <label className="product__qtyCntr">
                <div className="product-quantity-toggle-wrapper">
                    <button type="button" className="product-quantity-toggle product-quantity-decrement no-margin" onClick={() => setQty(count - 1)} >
                        <svg className="icon icon-minus"><use xlinkHref="#icon-minus" /></svg>
                    </button>

                    <input type="number" className="product-quantity form-input" onChange={(e) => setQty(e)} required name="qty[]" value={count} min="1" max="999" pattern="[0-9]+" />

                    <button type="button" className="product-quantity-toggle product-quantity-increment no-margin" onClick={() => setQty(count + 1)}>
                        <svg className="icon icon-plus"><use xlinkHref="#icon-plus" /></svg>
                    </button>
                </div>
            </label>
}