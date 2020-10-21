import React, { useEffect, useState, useContext } from 'react';
import AppContext from '../collection/AppContext';


export default function SuggestedProductLayouts(props){
    const appHook = useContext(AppContext);

    const [ layouts, setLayouts ] = useState([]);
    const [ title, setTitle ] = useState();
    const [ active, setActive ] = useState({});

    useEffect(() => {

        props.data.forEach(element => {
            if( element.name.includes("layout=") ){
                let obj = {};

                if( !title ){
                    let title = element.name.split("=")[1]
                    setTitle(title);
                }

                let layout = element.value.split(",");

                layout.forEach(ele => {
                    let item = ele.split("=");
                    obj[item[0]] = item[0] === "product_n_values" ? parseLayoutValues(item[1]) : item[1];
                });

                setLayouts(layouts => [...layouts, obj]);
            }
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


    const updateProductLayout = (data) => {
        setActive(data);
        appHook.displaySuggestedLayout(data);
    }


    return(
        <>
        { layouts.length > 0 ?
            <div className="product__layouts">
                <h2 className="product__title">{title}</h2>
                <ul className="product__layoutList">
                    {
                        layouts.map((item) => {
                            return <li className={`product__layoutItem ${active.icon_id === item.icon_id ? "product__layoutItem--active" : "" }`} key={item.icon_id}>
                                        <button 
                                            className={`product__layoutBtn ${active.icon_id === item.icon_id ? "product__layoutBtn--active" : "" }`} 
                                            type="button" 
                                            name={item.name} 
                                            onClick={() => updateProductLayout(item)}
                                        >
                                            <span className="product__layoutBtnText">{item.name}</span>
                                            <svg className="product__layoutIcon"><use xlinkHref={`#${item.icon_id}`} /></svg>
                                        </button>
                                    </li>
                        })
                    }
                </ul>
            </div>
        :null}
        </>
    );
}


