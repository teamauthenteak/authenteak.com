import React, { useContext, useEffect } from 'react';
import AppContext from '../collection/AppContext';
import LazyImg from './LazyImg';

export default function Swatch(props){
    const appHook = useContext(AppContext);

    const optionExists = appHook.hasOwnProperty(props.displayName);
    const hasSwatch = optionExists && appHook[props.displayName].swatch !== undefined;
    const hasAttributes = optionExists && appHook[props.displayName].attributeValue !== undefined;

    const toggleDrawer = (data) => {
        const { toggle } = props;

        // parse and extract data from each option
        data.values.forEach((element) => {
            let labelObj = TEAK.Utils.parseOptionLabel(element.label);
            element = Object.assign(element, labelObj);            
        });

        toggle(data);
    };


    const changeSwatch = (data) => {
        const { selected } = props;
        selected(data)
    }   


    useEffect(() => {
        if(optionExists && hasAttributes && props.type === "remote" ){

            if( hasSwatch ){
                // have to create some sort of "ID" from the globally set swatch context to do our matching..  :/
                let hookId = appHook[props.displayName].swatch.label.split("--")[0];
            
                hookId = hookId.toLowerCase().split("(+")[0];
                hookId = hookId.split(" ").join("");

                // loop through all of the labels creating an brittle id for matching... :(
                for (let i = 0; i < props.values.length; i++) {
                    let labelId = props.values[i].node.label.split("--")[0];

                    labelId = labelId.toLowerCase().split("(+")[0];
                    labelId = labelId.split(" ").join("");

                    if( labelId.includes(hookId) ){
                            let { setOption } = props;

                            setOption({
                                display_name: props.displayName,
                                id: props.id,
                                value: {
                                    label: props.values[i].node.label,
                                    id: props.values[i].node.entityId
                                }
                            });

                        break;
                    }
                }
            }
        }

    }, [appHook[props.displayName]]);




    return(
        <>
        {optionExists && props.type === "global" ?
            <li className="product__swatchItem product__swatchItem--marginBottom form-field">
                <label className={`product__swatchLabel ${props.isInvalid && props.isInvalid.includes(props.id) ? "product__swatchLabel--error" : ""}`} htmlFor={`${props.id}`} onClick={() => toggleDrawer({id: props.id , displayName: props.displayName, values: props.values })}>
                    <div className="product__swatch product__swatch--labelRight">
                        <input className="product__swatchRadio form-input" required={true} id={`${props.id}`} type="radio" name={`attribute[{${props.id}}]`} />
                        <div className="product__swatchColor">
                            <img className="product__swatchImg" src={ hasSwatch ? appHook[props.displayName].swatch.image : `https://dummyimage.com/256x256/cccccc/555555.png&text=${props.displayName}` } />
                        </div>
                    </div>
                    <div className="product__swatchText">
                        <p className="product__swatchOptionText">
                            <span className="product__swatchName">
                                {props.displayName}
                                <span className="product__swatchOptionIconCntr">
                                    &mdash; &nbsp; <svg className="product__swatchOptionIcon" viewBox="0 0 20 20"><use xlinkHref="#icon-swatch"/></svg> {props.values.length} options
                                </span>
                            </span>
                            <span className={`product__swatchValue ${ hasSwatch ? "show" : ""}`}>
                                { hasSwatch ? appHook[props.displayName].swatch.label.split("--")[0] : "" }
                            </span>
                        </p>
                    </div>
                    <svg className="product__swatchLabelIcon product__swatchLabelIcon--right"><use xlinkHref="#icon-long-arrow-right" /></svg>
                </label>
            </li>
        :null}


        {optionExists && props.type === "remote" ?
            <li className={`product__swatchItem ${props.isInvalid && props.isInvalid.includes(props.id) ? "product__swatchItem--error" : ""}`}>
                <a href="#customize" className={`product__swatch`} required={true}>
                    <figure className="product__swatchLabel">
                        <img className="product__swatchImg" src={ hasSwatch ? appHook[props.displayName].swatch.image : `https://dummyimage.com/256x256/cccccc/555555.png&text=${props.displayName}` } />
                    </figure>
                </a>
            </li>
        :null}


        {props.type === "local" ?
            <li className="product__swatchItem product__swatchItem--marginBottom form-field">
                <label className={`product__swatchLabel ${props.isInvalid && props.isInvalid.includes(props.id) ? "product__swatchLabel--error" : ""}`} htmlFor={`${props.id}`} onClick={() => toggleDrawer({id: props.id , displayName: props.displayName, values: props.values })}>
                    <div className="product__swatch product__swatch--labelRight">
                        <input className="product__swatchRadio form-input" required={true} id={`${props.id}`} type="radio" name={`attribute[{${props.id}}]`} />
                        <div className="product__swatchColor">
                            <img className="product__swatchImg" src={ hasSwatch ? appHook[props.displayName].swatch.image : `https://dummyimage.com/256x256/cccccc/555555.png&text=${props.displayName}` } />
                        </div>
                    </div>
                    <div className="product__swatchText">
                        <p className="product__swatchOptionText">
                            <span className="product__swatchName">
                                {props.displayName}
                                <span className="product__swatchOptionIconCntr">
                                    &mdash; &nbsp; <svg className="product__swatchOptionIcon" viewBox="0 0 20 20"><use xlinkHref="#icon-swatch"/></svg> {props.values.length} options
                                </span>
                            </span>
                            <span className={`product__swatchValue ${hasSwatch ? "show" : ""}`}>
                                { hasSwatch ? appHook[props.displayName].swatch.label.split("--")[0] : "" }
                            </span>
                        </p>
                    </div>
                    <svg className="product__swatchLabelIcon product__swatchLabelIcon--right"><use xlinkHref="#icon-long-arrow-right" /></svg>
                </label>
            </li>
        :null}



        {props.type === "select" ?
            <label className="swatch-wrap" htmlFor={`attribute-${props.id}`}>
                <input 
                    className="form-input swatch-radio" 
                    checked={appHook[props.for].attributeValue === props.id} 
                    onChange={() => changeSwatch(props.option)} 
                    id={`attribute-${props.id}`} 
                    type="radio" 
                    name={`attribute[${props.id}]`} 
                    value={`${props.id}`} 
                    required 
                    aria-required="true" 
                />
                <span className="swatch">
                    <span className="swatch-color swatch-pattern" style={{backgroundImage: `url("${props.img}")` }}>
                        <LazyImg className="swatch-pattern-image" src={props.img} />
                    </span>
                </span>
                <span className="drawer__swatchLabelCntr">
                    <OptionLabels label={props.label} />
                </span>
            </label>
        :null}




        {props.type === "pod" ?
            <li className="product__podSwatchItem swatch-wrap" htmlFor={`attribute-${props.id}`}>
                <span className="swatch-color swatch-pattern" style={{backgroundImage: `url("${props.img}")` }}></span>
            </li>
        :null}


        </>
    );
}


function OptionLabels(props){
    const item = TEAK.Utils.parseOptionLabel(props.label);

    return(
        <>
            <span className="drawer__swatchLabel drawer__swatchLabel--grade">{item.grade ? `Grade ${item.grade}` : ""}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--brand">{item.brandName ? `${item.brandName}` : ""}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--color">{item.color}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--price">{item.priceAdjust ? `(${item.priceAdjust})` : ""}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--ship">{item.ship ? `${item.ship}` : ""}</span>
        </>
    );
}
