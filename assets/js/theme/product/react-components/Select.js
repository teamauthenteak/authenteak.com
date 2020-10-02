import React, { useContext, useEffect } from 'react';
import AppContext from '../collection/AppContext';

export default function Select(props){
    const appHook = useContext(AppContext);

    const selectChange = (e) => {
        let selected = e.currentTarget.options[e.currentTarget.options.selectedIndex];

        if( props.type === "global" ){
            appHook.setOption({
                displayName: props.displayName,
                optionData: {
                    attribute: parseInt(props.id),
                    attributeValue: parseInt(e.currentTarget.value),
                    label: selected.label
                }
            });

        }else{
            let { setOption } = props;

            setOption({
                attribute: parseInt(props.id),
                attributeValue: parseInt(e.currentTarget.value),
                label: selected.label
            });
        }
    };


    return(
        <>
        {appHook.hasOwnProperty(props.displayName) ?
            <li className="product__swatchItem product__swatchItem--marginBottom product__swatchItem--select">
                <label className="selectBox__label" htmlFor={`attribute-${props.id}`}>
                    <div className="selectBox__text selectBox__text--right">
                        <p className="selectBox__optionText">
                            <span className="selectBox__name selectBox__name--labelLeft">{props.displayName}</span>
                            <span className={`selectBox__value ${appHook[props.displayName].attributeValue ? "selectBox__value--choosen" : "" }`}>
                                { appHook[props.displayName].attributeValue ? appHook[props.displayName].label : "Select one"}
                            </span>
                        </p>
                    </div>
                    <select onChange={(e) => selectChange(e)} className="selectBox__select" name={`attribute[${props.id}]`} id={`attribute-${props.id}`} aria-required="true">
                        {props.values.map((item, index) => {
                            return <option value={`${item.id}`} label={item.label} key={index}>{item.label}</option>
                        })}
                    </select>
                </label>
            </li>
        :null}
        </>
    );
}