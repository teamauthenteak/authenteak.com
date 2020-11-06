import React, { useMemo, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { useMeasure } from 'react-use';

export default function ToolTips(props){
    const [ showNextBusinessDay, toggleNextBusinessDay ] = useState(false);
    const [ showGeneral, toggleGeneral ] = useState(false);
    const [ bind, { height } ] = useMeasure();


    const modalVerticalCenter = useSpring({ 
        marginTop: (-(height + 40) / 2)
    });


    useMemo(() => {
        if( showNextBusinessDay || showGeneral ){
            document.getElementsByTagName("body")[0].classList.add("modal__freezeBody");

        }else{
            document.getElementsByTagName("body")[0].classList.remove("modal__freezeBody");
        }

    }, [showNextBusinessDay, showGeneral])



    return(
        <>
            {props.type === "tooltip" ? 
                <>
                    <div className="toolTip toolTip--show">
                        <button 
                            type="button" 
                            className="toolTip__iconCntr toolTip__iconCntr--dark"
                            onClick={() => toggleGeneral(true)}
                        >
                            <svg className="toolTip__icon toolTip__icon--white"><use xlinkHref="#icon-info"/></svg>
                        </button>  
                    </div>
                    <animated.div className={`toolTip__cntr toolTip__cntr--${showGeneral ? "show" : "hide" }`} ref={bind} style={modalVerticalCenter}>
                        <ToolTipClose toggleClose={toggleGeneral} />
                        <div dangerouslySetInnerHTML={{ __html: props.tip.join("") }}></div>
                    </animated.div>
                </>
            :null}



            {props.type === "tooltip.tabs" ? 
                <>
                    <div className="toolTip toolTip--show">
                        <button 
                            type="button" 
                            className="toolTip__iconCntr toolTip__iconCntr--dark"
                            onClick={() => toggleGeneral(true)}
                        >
                            <svg className="toolTip__icon toolTip__icon--white"><use xlinkHref="#icon-info"/></svg>
                        </button>  
                    </div>
                    <animated.div class={`toolTip__cntr toolTip__cntr--withTabs toolTip__cntr--${showGeneral ? "show" : "hide" }`} ref={bind} style={modalVerticalCenter}>
                        <div className="toolTip__tabsCntr">
                            <ToolTipClose toggleClose={toggleGeneral} />
                            {props.tip.map((item) => {
                                return  <div className="toolTip__tab" key={item.id}>
                                            <input type="radio" className="toolTip__tabControl" id={`toolTipTab_${item.id}`} />
                                            <label for="toolTipTab_${key}" className="toolTip__tabLabel">
                                                {item.label}
                                            </label>
                                            <div className="toolTip__tabContent" id={item.id}>
                                                {item.tabContent.join("")}
                                            </div>
                                        </div>
                            })}
                        </div>
                    </animated.div>
                </>
            :null}



            {props.type === "nextBusinessDay" ? 
                <>
                    <button type="button" className="shipping-range--tipLink" onClick={() => toggleNextBusinessDay(true)}>
                        <span className="toolTip__iconCntr toolTip__iconCntr--dark">
                            <svg className="toolTip__icon toolTip__icon--white"><use xlinkHref="#icon-info"/></svg>
                        </span>
                    </button>
                    <animated.div className={`toolTip__cntr toolTip__cntr--${showNextBusinessDay ? "show" : "hide" }`} ref={bind} style={modalVerticalCenter}>
                        <ToolTipClose toggleClose={toggleNextBusinessDay} />
                        <h2 className="toolTip__heading--2">Next Business Day Processing</h2>
                        <p className="toolTip__text">Transit time is determined by shipping method and destination. Orders placed by 12pm ET may be shipped same day. Orders placed after 2pm ET will be processed the next business day.</p>
                    </animated.div>
                </>
            :null}



            {props.type === "freeWhiteGlove" ? <p className="free-shipping-text">Free Standard Shipping</p> :null}
        </>
    )
}



function ToolTipClose(props){
    const close = (shouldOpen) => {
        let { toggleClose } = props;
        toggleClose(!shouldOpen);
    };

    return  <button type="button" className="toolTip__closeBtn" onClick={() => close(true)}>
                <svg className="toolTip__closeIcon"><use xlinkHref="#icon-close"/></svg>
            </button>
}