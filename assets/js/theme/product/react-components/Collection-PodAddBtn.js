import React, { useContext, useMemo, useState } from 'react';
import AppContext from './context/AppContext';

export default function AddButton(props){
    const appHook = useContext(AppContext);
    const [ cartHasItem, setCartHasItem ] = useState(false);

    const addToCart = () => {
        const { addToCart } = props;
        addToCart()
    };


    useMemo(() => {
        setCartHasItem(appHook.cart.hasOwnProperty(props.id));
        setTimeout(() => { setCartHasItem(false); }, 3000);
        
    }, [appHook.cart]);


    return(
        <button 
            disabled={props.disabled} 
            type="button" 
            className={`product__atcCollectionBtn ${cartHasItem ? "product__atcCollectionBtn--trans" : "" }`} 
            onClick={() => addToCart()}
        >
            {
                props.update ? 
                <>
                    <svg className="icon icon-plus"><use xlinkHref="#icon-refresh" /></svg>
                    <span className="product__atcCollectionBtnText">Update</span>
                </>
                :
                <>
                    {
                        cartHasItem ? 
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