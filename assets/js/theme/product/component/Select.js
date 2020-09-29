import React from 'react';

export default function Select(props){
    // console.log(props)
    return(
        <li className="product__swatchItem product__swatchItem--marginBottom product__swatchItem--select selectBox form-field">
            <label className="selectBox__label form-label" htmlFor={`attribute-${props.id}`}>
                <div className="selectBox__text selectBox__text--right">
                    <p className="selectBox__optionText">
                        <span className="selectBox__name selectBox__name--labelLeft">{props.displayName}</span>
                        <span className="selectBox__value">Select one</span>
                    </p>
                </div>
                <select className="selectBox__select form-input" name={`attribute[${props.id}]`} id={`attribute-${props.id}`} aria-required="true">
                    {props.values.map((item, index) => {
                        return <option value={`${item.id}`} key={index}>{item.label}</option>
                    })}
                </select>
            </label>
        </li>
    );
}