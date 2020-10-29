import React, { useEffect, useReducer } from 'react';

const tabs = [
    { id: "descTab", title: "Product Overview", text: "", isActive: true },
    { id: "specsTab", title: "Specifications", text: "", isActive: false },
    { id: "careTab", title: "Care", text: "", isActive: false },
    { id: "shipTab", customContent: "No assembly required.", title: "Shipping", text: "", isActive: false },
    { id: "pdfTab", title: "Resources", text: "", isActive: false },
    { id: "warrantyTab", title: "Warranty", text: "", isActive: false },
    { id: "returnTab", title: "Returns", text: "", isActive: false }
];

export default function Tabs(props){
    const [ tabData, dispatch ] = useReducer((state, action) => {
        switch( action.type ){
            case "add": 
                return [ ...state, action.data ];

            case "toggle":
                return state.map((item) => {
                        if( item.id === action.data ){
                            return { ...item, isActive: !item.isActive };
                        }

                    return item;
                });
        }
    }, []);


    const getReturnsTabText = () => {
        let data = TEAK.Utils.getProductJSON();
        return data.tabs.returnTab.join("");
    };


    useEffect(() => {
        const temp = document.createElement('div');

        temp.className = "hide tempTabsCntr";
        temp.innerHTML = props.data;
        document.querySelector('body').appendChild(temp);

        tabs.forEach((element) => {
            switch( element.id ){
                case "returnTab":
                    element.text = getReturnsTabText();
                    break;

                case "warrantyTab":
                    element.text = props.warrantyTab;
                    break;

                case "descTab":
                    element.text = temp.innerHTML;
                    break;

                default:
                    if( document.getElementById(element.id) ){
                        element.text = document.getElementById(element.id).innerHTML;
                        document.getElementById(element.id).parentNode.removeChild(document.getElementById(element.id));
                    }
            }

            dispatch({
                type: "add",
                data: element
            });
        });
        
        // finish. clean up dom
        document.querySelector(".tempTabsCntr").parentNode.removeChild(document.querySelector(".tempTabsCntr"));

    }, []);



    const toggleTab = (e) => {
        dispatch({
            type: "toggle",
            data: e.currentTarget.name
        });
    };

    
    return(
        <>
            {tabData.map((item, index) => {
                if( item.text !== "" && item.id !== "pdfTab" ){
                    return <div className={`product__tabSection ${item.isActive ? "product__tabSection--active" : ""}`}  key={index}>
                                <h2 className="product__tabTitle">
                                    <button type="button" className="product__titleLink" onClick={(e) => toggleTab(e)} name={item.id}>
                                        <span className="product__titleText">
                                            {item.title}
                                        </span>
                                        <svg className="icon icon-chevron-down"><use xlinkHref="#icon-chevron-down" /></svg>
                                    </button>
                                </h2>

                                <div className={`product__col-1-1 pad-top ${item.isActive ? "" : "product__col--hide"}`}>
                                    <div className={`product__col-1-1 pad-right ${item.id === "descTab" ? "product__col-2-3--lg" : "" }`} dangerouslySetInnerHTML={{ __html: item.text }}></div>

                                    {item.id === "descTab" ?
                                        <div className="product__col-1-3--lg product__col-1-1 product__col--allBorder">
                                            <h3 className="product__title product__title--2 pad-bottom">Resources</h3>
                                                {tabData.map((element, index) => {
                                                    if( element.id === "pdfTab"){
                                                        return <div className="product__col-1-1 no-pad" key={index} dangerouslySetInnerHTML={{ __html: element.text }}></div>;
                                                    }
                                                })} 
                                        </div>
                                        : null
                                    }
                                </div>
                            </div>
                }
                
            })}
        </>
        
    );
}