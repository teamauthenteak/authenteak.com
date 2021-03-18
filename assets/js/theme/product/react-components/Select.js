import React, { useContext, useState, useEffect } from 'react';
import AppContext from './context/AppContext';
import ToolTips from './ToolTips';

export default function Select(props){
    const appHook = useContext(AppContext);
    const [ selectedOption, setSelected ] = useState();

    const selectChange = (e) => {
        let selected = e.currentTarget.options[e.currentTarget.options.selectedIndex];

        if( props.type === "global" ){
            let optionData = {
                displayName: props.displayName,
                optionData: {
                    attribute: parseInt(props.id),
                    attributeValue: parseInt(e.currentTarget.value),
                    label: selected.label
                }
            };

            appHook.setOption(optionData);

            const { callBack } = props;
            callBack(optionData)

        }else{
            let { setOption } = props;

            setOption({
                [props.displayName]: {
                    attribute: parseInt(props.id),
                    attributeValue: parseInt(e.currentTarget.value),
                    label: selected.label
                }
            });

            setSelected(selected.label);
        }
    };


    useEffect(() => {
        // trying to create some sort of normalcy to mitigate the brittleness of searching label strings for an object match
        if(appHook.hasOwnProperty(props.displayName) && appHook[props.displayName].attributeValue && props.type === "remote"){
            let hookId = appHook[props.displayName].label.toLowerCase().split(" ").join("").slice(0, 18);

            props.values.forEach((element) => {
                let labelId = element.node.label.toLowerCase().split(" ").join("").slice(0, 18);

                if( labelId.includes(hookId) ){
                    console.log(element.node)
                }
            });
        }

    }, [appHook[props.displayName]]);


    return(
        <>
        {appHook.hasOwnProperty(props.displayName) && props.type === "global" &&
            <li className="product__swatchItem product__swatchItem--marginBottom product__swatchItem--select">
                <label className={`selectBox__label ${props.isInvalid && props.isInvalid.includes(props.id) ? "selectBox__label--error" : ""}`} htmlFor={`attribute-${props.id}`}>
                    <div className="selectBox__text selectBox__text--right">
                        <p className="selectBox__optionText">
                            <span className="selectBox__name selectBox__name--labelLeft">{props.displayName}</span>
                            <span className={`selectBox__value ${appHook[props.displayName].attributeValue ? "selectBox__value--chosen" : "" }`}>
                                { appHook[props.displayName].attributeValue ? appHook[props.displayName].label.split("--")[0] : "Select one"}
                            </span>
                        </p>
                    </div>
                    <select onChange={(e) => selectChange(e)} required={true} className="selectBox__select" name={`attribute[${props.id}]`} id={`attribute-${props.id}`} aria-required="true">
                        <option value="">Choose...</option>
                            {props.values.map((item, index) => {
                                return  <option value={`${item.id}`} label={item.label.split("--")[0]} key={item.id}>
                                            {item.label.split("--")[0]}
                                        </option>
                            })}
                    </select>
                </label>
            </li>
        }



        {appHook.hasOwnProperty(props.displayName) && props.type === "remote" &&
            <li className="product__swatchItem product__swatchItem--marginBottom product__swatchItem--select">
                    <a href="#customize" className={`selectBox__text--globalControl ${props.isInvalid && props.isInvalid.includes(props.id) ? "selectBox__text--error" : ""}`}>
                        <span className="selectBox__optionText">
                            <span className={`selectBox__value selectBox__value--normal ${appHook[props.displayName].attributeValue ? "selectBox__value--chosen" : "" }`}>
                                { appHook[props.displayName].attributeValue ? appHook[props.displayName].label.split("--")[0] : props.displayName }
                            </span>
                        </span>
                        <svg className="product__swatchLabelIcon product__swatchLabelIcon--angle"><use xlinkHref="#icon-long-arrow-right" /></svg>
                    </a>                   
            </li>
        }



        {props.type === "local" &&
            <li className="product__swatchItem product__swatchItem--marginBottom product__swatchItem--select">
                {props.toolTipData !== null ? <ToolTips type={props.toolTipData.data.type} tip={props.toolTipData.data.tip} /> : null}
                <label className={`selectBox__label ${props.isInvalid && props.isInvalid.includes(props.id) ? "selectBox__label--error" : ""}`} htmlFor={`attribute-${props.id}`}>
                    <div className="selectBox__text selectBox__text--right">
                        <p className="selectBox__optionText">
                            <span className="selectBox__name selectBox__name--labelLeft">{props.displayName}</span>
                            <span className={`selectBox__value ${selectedOption ? "selectBox__value--chosen" : "" }`}>
                                {selectedOption ? selectedOption : "Select one"}
                            </span>
                        </p>
                    </div>
                    <select onChange={(e) => selectChange(e)} required={true} className="selectBox__select" name={`attribute[${props.id}]`} id={`attribute-${props.id}`} aria-required="true">
                        <option value="">Choose...</option>
                        {props.values.map((item, index) => {
                            if( item.hasOwnProperty("node") ){
                                return  <option value={`${item.node.entityId}`} label={item.node.label.split("--")[0]} key={item.node.entityId}>
                                            {item.node.label.split("--")[0]}
                                        </option>
                            }
                        })}
                    </select>
                </label>
            </li>
        }
        </>
    );
}