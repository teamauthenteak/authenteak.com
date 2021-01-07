import React, { useContext, useEffect, useMemo, useState } from 'react';
import AppContext from './context/AppContext';
import LazyImg from './LazyImg';
import ToolTips from './ToolTips';

export default function Swatch(props){
    const appHook = useContext(AppContext);

    const [ remoteSwatch,  setRemoteSwatch ] = useState({});

    const optionExists = appHook.hasOwnProperty(props.displayName);
    const hasSwatch = optionExists && appHook[props.displayName].swatch !== undefined;
    const hasAttributes = optionExists && appHook[props.displayName].attributeValue !== undefined;


    const toggleDrawer = (data) => {
        const { toggle } = props;

        // parse and extract data from each option
        data.values.forEach((element, index) => {

            // have to normalize if this swatch comes from graphql and not page context
            if( element.node ){
                let labelObj = TEAK.Utils.parseOptionLabel(element.node.label);

                data.values[index] = {
                    ...labelObj,
                    label: element.node.label,
                    id: element.node.entityId,
                    pattern: element.node.imageUrl,
                    selected: false,
                    image: {
                        data: element.node.imageUrl,
                        alt: element.node.label
                    }
                }

            }else{
                let labelObj = TEAK.Utils.parseOptionLabel(element.label);
                element = Object.assign(element, labelObj);   
            }
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

                // loop through all of the labels creating a brittle id for matching... :(
                for (let i = 0; i < props.values.length; i++) {
                    let labelId = props.values[i].node.label.split("--")[0];

                    labelId = labelId.toLowerCase().split("(+")[0];
                    labelId = labelId.split(" ").join("");

                    if( labelId.includes(hookId) ){
                        let swatchData = TEAK.Utils.parseOptionLabel(props.values[i].node.label);
                        
                        setRemoteSwatch({
                            display_name: props.displayName,
                            id: props.id,
                            swatch: {
                                label: swatchData.raw.split("--")[0],
                                image: appHook[props.displayName].swatch.image,
                                id: props.values[i].node.entityId,
                                price: swatchData.hasOwnProperty("priceAdjust") ? swatchData.priceAdjust : null
                            }
                        });

                        break;
                    }
                }
            }
        }

    }, [appHook[props.displayName]]);



    // tell our parent about this swatch match
    useMemo(() => {
        if( Object.keys(remoteSwatch).length ){
            let { setOption } = props;
            setOption(remoteSwatch);
        }

    }, [remoteSwatch]);


    const globalSwatchObj = hasSwatch ? TEAK.Utils.parseOptionLabel(appHook[props.displayName].swatch.label) : {};


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
                                <span className="product__swatchDisplayName product__swatchDisplayName--flex">{props.displayName}</span>
                                <span className="product__swatchOptionIconCntr">
                                    &mdash; &nbsp; <svg className="product__swatchOptionIcon" viewBox="0 0 20 20"><use xlinkHref="#icon-swatch"/></svg> {props.values.length} options
                                </span>
                            </span>
                            <span className={`product__swatchValue ${ hasSwatch ? "show" : ""}`}>
                                { hasSwatch ? 
                                    `${globalSwatchObj.grade ? `Grade ${globalSwatchObj.grade} ` : ""}${globalSwatchObj.brandName ? `${globalSwatchObj.brandName} ` : ""}${globalSwatchObj.color} ${globalSwatchObj.ship ? globalSwatchObj.ship : ""}` 
                                :null}
                            </span>
                        </p>
                    </div>
                    <svg className="product__swatchLabelIcon product__swatchLabelIcon--right"><use xlinkHref="#icon-long-arrow-right" /></svg>
                </label>
            </li>
        :null}



        {optionExists && props.type === "remote" ?
            <li className={`product__swatchItem ${props.isInvalid && props.isInvalid.includes(props.id) ? "product__swatchItem--error" : ""}`}>
                {props.toolTipData !== null ? <ToolTips type={props.toolTipData.data.type} tip={props.toolTipData.data.tip} /> : null}
                <a href="#customize" className={`product__swatch`} required={true}>
                    <figure className="product__swatchLabel">
                        <img className="product__swatchImg" src={ Object.keys(remoteSwatch).length ? remoteSwatch.swatch.image : `https://dummyimage.com/256x256/cccccc/555555.png&text=${props.displayName}` } />
                    </figure>
                </a>
                <span className="product__swatchText product__swatchText--label">
                    { Object.keys(remoteSwatch).length ? remoteSwatch.swatch.price : "" }
                </span>
            </li>
        :null}



        {props.type === "local" ?
            <li className="product__swatchItem product__swatchItem--marginBottom form-field">
                {props.toolTipData !== null ? <ToolTips  type={props.toolTipData.data.type} tip={props.toolTipData.data.tip} /> : null}
                <label className={`product__swatchLabel ${props.isInvalid && props.isInvalid.includes(props.id) ? "product__swatchLabel--error" : ""}`} htmlFor={`${props.id}`} onClick={() => toggleDrawer({id: props.id , displayName: props.displayName, values: props.values })}>
                    <div className="product__swatch product__swatch--labelRight">
                        <input className="product__swatchRadio form-input" required={true} id={`${props.id}`} type="radio" name={`attribute[{${props.id}}]`} />
                        <div className="product__swatchColor">
                            <img className="product__swatchImg" src={ props.selectedSwatch.hasOwnProperty(props.displayName) ? props.selectedSwatch[props.displayName].swatch.image : `https://dummyimage.com/256x256/cccccc/555555.png&text=${props.displayName}` } />
                        </div>
                    </div>
                    <div className="product__swatchText">
                        <p className="product__swatchOptionText">
                            <span className="product__swatchName">
                                <span className="product__swatchDisplayName product__swatchDisplayName--flex">{props.displayName}</span>
                                <span className="product__swatchOptionIconCntr">
                                    &mdash; &nbsp; <svg className="product__swatchOptionIcon" viewBox="0 0 20 20"><use xlinkHref="#icon-swatch"/></svg> {props.values.length} options
                                </span>
                            </span>
                            <span className={`product__swatchValue ${props.selectedSwatch.hasOwnProperty(props.displayName) ? "show" : ""}`}>
                                { props.selectedSwatch.hasOwnProperty(props.displayName) ? props.selectedSwatch[props.displayName].swatch.label.split("--")[0] : "" }
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
                    checked={props.isChecked} 
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
                    <OptionLabels label={props.label} drawerType={props.drawerType} />
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
            <span className={`drawer__swatchLabel drawer__swatchLabel--price ${props.drawerType === "global" ? "hide" : ""}`}>{item.priceAdjust ? `(${item.priceAdjust})` : ""}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--ship">{item.ship ? `${item.ship}` : ""}</span>
        </>
    );
}
