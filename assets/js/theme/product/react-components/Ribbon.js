import React from 'react';

export default function Ribbon(props){
    return(
        <div className="ribbon-wrapper">
            <div className="ribbon">{props.suggested.short_name} {props.suggested.product_n_values[props.id]}x</div>
        </div>
    )
}