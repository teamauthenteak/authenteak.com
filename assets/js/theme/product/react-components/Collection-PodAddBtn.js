import React, { useContext } from 'react';
import AppContext from '../collection/AppContext';

export default function AddButton(props){
    const appHook = useContext(AppContext);

    const addToCart = () => {
        const { addToCart } = props;
        addToCart()
    };

    return(
        <button disabled={props.disabled} type="button" className={`product__atcCollectionBtn ${appHook.cart.hasOwnProperty(props.id) ? "product__atcCollectionBtn--trans" : "" }`} onClick={() => addToCart()}>
            {
                props.update ? 
                <>
                    <svg className="icon icon-plus"><use xlinkHref="#icon-refresh" /></svg>
                    <span className="product__atcCollectionBtnText">Update</span>
                </>
                :
                <>
                    {
                        appHook.cart.hasOwnProperty(props.id) ? 
                        <>
                            <svg className="icon icon-check2"><use xlinkHref="#icon-check2" /></svg>
                            <span className="product__atcCollectionBtnText">Added</span>
                        </>
                        :
                        <>
                            <svg className="icon icon-plus"><use xlinkHref="#icon-plus" /></svg>
                            <span className="product__atcCollectionBtnText">Add</span>
                        </>
                    }
                </>
            }
        </button>
    )
}