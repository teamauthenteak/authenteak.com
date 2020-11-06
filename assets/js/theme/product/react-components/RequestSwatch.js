import React, { useContext, useEffect, useState, useMemo, useReducer } from 'react';
import AppContext from './context/AppContext';
import LazyImg from './LazyImg';
import { setStorage } from './Utils';

export default function RequestSwatch(props){
    const appHook = useContext(AppContext);

    const [ checked, setChecked ] = useState({});
    const [ options, setOptions ] = useState([]);

    const checkedCount = Object.keys(checked).filter(key => checked[key]).length;
    const isDisabled = checkedCount > 2;

    useEffect(() => {
        appHook.product.options.forEach(element => {
            switch(element.display_name){
                case "Select Head Cushion Fabric":
                case "Select Canopy":
                case "Select Optional Cushions": 
                case "Select Optional Cushion": 
                case "Select Fabric":
                case "Select Cushion":
                case "Select Throw Pillows Fabric":
                    element.values.map(item => { 
                        setOptions(options => [...options, item]);
                    });
                    break;

                default:break;
            }
        });

        return function cleanUp(){
            setOptions(null);
            setChecked(null)
        }

    },[]);


    const [ selectedSwatches, dispatch ] = useReducer((state, action) => {
        switch(action.type){
            case "add": 
                return [
                    ...state,
                    action.data
                ];

            case "remove": 
                return state.filter((ele) => ele.id !== action.data.id );

            default: return state;
        }
    }, []);


    const selectSwatch = (item, index) => {
        let isAlreadySelected = selectedSwatches.findIndex(ele => ele.id === item.id);

        dispatch({
            type: isAlreadySelected !== -1 ? "remove" : "add",
            data: item
        });

        setChecked(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };



    const requestSwatches = () => {
        let requestObj = {
                product_url: appHook.product.url,
                product_title: appHook.product.title,
                product_sku: appHook.product.sku,
                swatch_colors: [],
                swatch_images: []
            };

        selectedSwatches.forEach((element) => {
            requestObj.swatch_colors.push(element.label.split("--")[0]);
            requestObj.swatch_images.push(element.pattern);
        });

        setStorage("TEAK_requestSWatch", requestObj);
		window.location = "/swatch-checkout";
    }
   

    return(<>
            <div className="swatchModal is-open">
                <button type="button" className="swatchModal__close" onClick={() => appHook.toggleRequestSwatch("close")}>
                    <svg className="icon icon-close"><use xlinkHref="#icon-close" /></svg>
                </button>

                <div className="swatchModal__wrapper">
                    <div className="swatchModal__cntr">
                        <div className="swatchModal__descCntr">
                            <h2 className="swatchModal__title">Free Shipping On All Swatches</h2>
                            <p className="swatchModal__text">Click to select the desired swatches. Once you have made your selection, click the "Request Swatches" button below and proceed through checkout.</p>
                            <p className="swatchModal__text swatchModal__text--highlight">
                                You've chosen <strong>{selectedSwatches.length}</strong> out of 3 free swatches.<br /> One swatch order valid per customer.
                            </p>
                            <button type="button" className="swatchModal__reqBtn" disabled={selectedSwatches.length < 1} onClick={requestSwatches}>
                                <span className="swatchModal__reqBtnText">Request Swatches</span>
                                <svg className="swatchModal__reqBtnIcon"><use xlinkHref="#icon-arrow-right" /></svg>
                            </button>
                        </div>

                        <div className="swatchModal__inner">
                            <ul className={`swatchModal__list`}>
                { options.length > 0 ?
                    options.map((item, index) => {
                        return  <li className={`swatchModal__listItem`} key={item.id}>
                                    <label htmlFor={`attribute-${item.id}`} className="swatchModal__itemControl">
                                        <input 
                                            className="swatchModal__checkBox" 
                                            onChange={() => selectSwatch(item, index)}
                                            id={`attribute-${item.id}`} 
                                            type="checkbox" 
                                            checked={checked[index] || false}
                                            disabled={!checked[index] && isDisabled}
                                            name={`attribute[${item.id}]`} 
                                            value={`${item.id}`} 
                                        />
                                        <figure className="swatchModal__swatchImgCntr">
                                            <LazyImg className="swatchModal__swatchImg" src={item.pattern} alt={item.image.alt} />
                                            <figcaption className="swatchModal__swatchTitle">
                                                {item.label.split("--")[0]}
                                            </figcaption>
                                        </figure>
                                    </label>
                                </li>
                    })
                :null}
                            </ul>
                        </div>

                        <button type="button" className="swatchModal__reqBtn swatchModal__reqBtn--mobile" disabled={selectedSwatches.length < 1} onClick={requestSwatches}>
                            <span className="button-text">Request Swatches</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="swatchModal__underlay" onClick={() => appHook.toggleRequestSwatch("close")}></div>
        </>);

}