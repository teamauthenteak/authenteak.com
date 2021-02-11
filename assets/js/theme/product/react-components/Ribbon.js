import React from 'react';

export default function Ribbon(props){
    return(
        <div className="ribbon-wrapper">
            <div className="ribbon" aria-details={`${props.suggested.short_name} ${props.suggested.product_n_values[props.id]}x`}>
                Selected
            </div>
        </div>
    )
}