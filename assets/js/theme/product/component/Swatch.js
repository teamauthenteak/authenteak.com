import React from 'react';


export default function Swatch(props){
    return(
        <li className="product__swatchItem product__swatchItem--marginBottom form-field">
            <label className="product__swatchLabel" rel={`${props.id}`}>
                <div className="product__swatch product__swatch--labelRight">
                    <input className="product__swatchRadio form-input" id={`${props.id}`} type="radio" name={`attribute[{${props.id}}]`} />
                    <div className="product__swatchColor">
                        <img className="product__swatchImg" src="https://dummyimage.com/256x256/cccccc/777777.png&text=select" />
                    </div>
                </div>
                <div className="product__swatchText">
                    <p className="product__swatchOptionText">
                        <span className="product__swatchName">
                            {props.displayName}
                            <span className="product__swatchOptionIconCntr">
                                &mdash; &nbsp;
                                <svg className="product__swatchOptionIcon" viewBox="0 0 20 20"><use xlinkHref="#icon-swatch"/></svg> {props.values.length} options
                            </span>
                        </span>
                        <span className="product__swatchValue"></span>
                    </p>
                </div>
                <svg className="product__swatchLabelIcon product__swatchLabelIcon--right"><use xlinkHref="#icon-long-arrow-right" /></svg>
            </label>

        </li>
    );
}