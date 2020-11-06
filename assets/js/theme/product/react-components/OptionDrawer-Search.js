import React, { useContext, useState } from 'react';
import DrawerContext from './context/DrawerContext';

export default function OptionSearch(){
    const drawerHook = useContext(DrawerContext);
    const [ key, setKey ] = useState("");

    const search = (e) => {
        drawerHook.searchOptions(e);
        setKey(e.currentTarget.value);
    }

    return(
        <fieldset className="drawer__controlSet">
            <div className="drawer__control--searchIcon"></div>
            
            <input 
                type="text" 
                autoComplete="off" 
                onChange={(e) => search(e)}
                className="drawer__control drawer__control--input" 
                placeholder="Search" 
                value={key}
            />
            
            <button onClick={(e) => search(e)} value="" type="button" className={`drawer__clearControl ${drawerHook.searchKey !== "" ? "flex" : "hide"}`}>
                <svg className="icon icon-close"><use xlinkHref="#icon-close" /></svg>
            </button>
        </fieldset>
    )
}