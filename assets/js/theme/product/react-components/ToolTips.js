import React, { useEffect, useState } from 'react';

export default function ToolTips(props){
    const [ showNextBusinessDay, toggleNextBusinessDay ] = useState(false);
    const [ showGeneral, toggleGeneral ] = useState(false);

    const [ tipData, setTipData ] = useState({});

    useEffect(() => {
        setTipData(props.data);

    }, []);


    return(
        <>
            {props.type === "general" ? 
                <>
                    <div className="toolTip">
                        <button 
                            type="button" 
                            title="About the ${productOption.displayName} option" 
                            className="toolTip__iconCntr toolTip__iconCntr--dark"
                            onClick={() => toggleGeneral(true)}
                        >
                            <svg className="toolTip__icon toolTip__icon--white"><use xlinkHref="#icon-info"/></svg>
                        </button>  
                    </div>
                    <div className={`toolTip__cntr toolTip__cntr--${showGeneral ? "show" : "hide" }`}>
                        <button type="button" className="toolTip__closeBtn" onClick={() => toggleGeneral(false)}>
                            <svg className="toolTip__closeIcon"><use xlinkHref="#icon-close"/></svg>
                        </button>
                        <div dangerouslySetInnerHTML={{ __html: '<p>Hi</p>' }}></div>
                    </div>
                </>
            :null}



            {props.type === "tabs" ? 
                <div className="toolTip__tabsCntr">

                    <div className="toolTip__tab">
                        <input type="radio" className="toolTip__tabControl" id="toolTipTab_${key}" />
                        <label for="toolTipTab_${key}" className="toolTip__tabLabel"></label>
                        <div className="toolTip__tabContent" id="${tabArr[key].id}"></div>
                    </div>

                </div>
            :null}



            {props.type === "nextBusinessDay" ? 
                <>
                    <button type="button" className="shipping-range--tipLink" onClick={() => toggleNextBusinessDay(true)}>
                        <span className="toolTip__iconCntr toolTip__iconCntr--dark">
                            <svg className="toolTip__icon toolTip__icon--white"><use xlinkHref="#icon-info"/></svg>
                        </span>
                    </button>
                    <span className={`toolTip__cntr toolTip__cntr--${showNextBusinessDay ? "show" : "hide" }`}>
                        <button type="button" className="toolTip__closeBtn" onClick={() => toggleNextBusinessDay(false)}>
                            <svg className="toolTip__closeIcon"><use xlinkHref="#icon-close"/></svg>
                        </button>
                        <h2 className="toolTip__heading--2">Next Business Day Processing</h2>
                        <p className="toolTip__text">Transit time is determined by shipping method and destination. Orders placed by 12pm ET may be shipped same day. Orders placed after 2pm ET will be processed the next business day.</p>
                    </span>
                </>
            :null}



            {props.type === "freeWhiteGlove" ? <p className="free-shipping-text">Free Standard Shipping</p> :null}
        </>
    )
}