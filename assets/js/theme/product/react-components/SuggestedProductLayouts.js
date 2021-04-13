import React, { useEffect, useState, useContext, useMemo } from 'react';
import Slider from 'react-slick';
import AppContext from './context/AppContext';


export default function SuggestedProductLayouts(props){
    const appHook = useContext(AppContext);

    const [ layouts, setLayouts ] = useState([]);
    const [ title, setTitle ] = useState();
    const [ active, setActive ] = useState({});

    useMemo(() => {
        setActive(appHook.suggestedLayout)
    }, [appHook.suggestedLayout]);


    useEffect(() => {
        let sketches = props.data.filter(element => element.name.includes("sketch="));
        let suggested = props.data.filter(element => element.name.includes("layout="));


        suggested.forEach(element => {
            let obj = {};

            obj.totalPieces = 0;

            if( !title ){
                let title = element.name.split("=")[1];
                setTitle(title);
            }

            let layout = element.value.split(",");

            layout.forEach(ele => {
                let item = ele.split("=");
                obj[item[0]] = item[0] === "product_n_values" ? parseLayoutValues(item[1]) : item[1];
            });

            Object.values(obj.product_n_values).forEach((num) => {
                obj.totalPieces = obj.totalPieces + (Number.isNaN(num) ? 0 : num);
            });

            obj.sketch = sketches.find(ele => ele.name.split("=")[1] === obj.short_name)

            setLayouts(layouts => [...layouts, obj]);
        });



        function parseLayoutValues(valueData){
            let parsedObj = {};

            valueData.split(";").forEach(element => {
                let item = element.split("x");

                parsedObj[item[0]] = parseInt(item[1]);
            });

            return parsedObj;
        }

    }, []);






    return(
        <>
        { layouts.length > 0 &&
            <>
                <div className="product__row product__row--left">
                    <strong className="product__title product__title--upperBadge">Step {props.step}</strong>
                    <h2 className="product__title product__title--tight no-margin">Choose A {title}</h2>
                </div>
                
                {props.type === "slider" &&
                    <Slider {...TEAK.Globals.collections.suggestedSlider}>
                        {
                            layouts.map((item) => {
                                return <LayoutListItems key={item.icon_id} item={item} active={active} setActiveData={(data) => setActive(data)} />
                            })
                        }
                    </Slider>   
                }
                
                {props.type === "static" &&
                    layouts.map((item) => {
                        return <LayoutListItems key={item.icon_id} item={item} active={active} setActiveData={(data) => setActive(data)} />
                    })
                }
            </>
        }
        </>
    );
}



/*
    name=Small-U Sectional,text=Best for medium spaces,dim=113.5"w x 75"d x 29"h,short_name=Small-U,icon_id=icon-layout-small-u,product_n_values=7965x1;2881x1;2879x2;2877x1
*/

function LayoutListItems(props){
    const appHook = useContext(AppContext);

    // update parent 
    const updateProductLayout = (data) => {
        appHook.displaySuggestedLayout(data);
    };

    useMemo(() => {

        // sets the short corner sectional as the default selection
        if( props.item.short_name === 'short_corner_sectional' && appHook.collection.length ){
            updateProductLayout(props.item)
        }

    }, [appHook.collection]);


    return( <li className={`product__layoutItem ${props.active.icon_id === props.item.icon_id ? "product__layoutItem--active" : "" }`} key={props.item.icon_id}>
                <button className="product__layoutClose" type="button" onClick={() => updateProductLayout({})}>
                    <svg className="icon icon-close"><use xlinkHref="#icon-close" /></svg>
                </button>
                <button 
                    className={`product__layoutBtn ${props.active.icon_id === props.item.icon_id ? "product__layoutBtn--active" : "" }`} 
                    type="button" 
                    name={props.item.name} 
                    onClick={() => updateProductLayout(props.item)}>
                        
                    <span className="product__layoutBtnText">{props.item.name}</span>
                    <svg className="product__layoutIcon"><use xlinkHref={`#${props.item.icon_id}`} /></svg>
                    <span className="product__layoutBtnText product__layoutBtnText--desc">{props.item.text}<br/>{props.item.dim}</span>
                </button>
            </li>
    )
}


