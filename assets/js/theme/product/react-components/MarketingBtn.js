import React from 'react';

export default function MarketingBtn(props){
  
    return(
        <button type="button" className="product__requestBtn product__requestBtn--collections" onClick={props.onclick}>
            <svg className="product__swatchRequestIcon--collections"><use xlinkHref={props.icon} /></svg>
            <p className="product__swatchRequestText--collections">
                <span className="product__requestBtn-titleText" dangerouslySetInnerHTML={{__html: props.title}} />
                <small className="product__requestBtn-smallText" dangerouslySetInnerHTML={{__html: props.text}} />
            </p>
        </button>
    )
}