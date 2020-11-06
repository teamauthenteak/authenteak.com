import React, { useContext } from 'react';
import DrawerContext from './context/DrawerContext';

export default function OptionFilterBtn(){
    const drawerHook = useContext(DrawerContext);

    return(
        <button type="button" className={`drawer__displayFiltersBtn ${drawerHook.filterOptionControlState ? "drawer__displayFiltersBtn--open" : "" }`} onClick={() => drawerHook.toggleFilterOptionControls()}>
            <span className="drawer__displayFilterText">
                <svg className="icon icon-filter"><use xlinkHref="#icon-filter" /></svg>
                <span className="drawer__displayFilterTextElem">Filter <span>Options</span></span>
                <svg className="icon icon-chevron-down"><use xlinkHref="#icon-chevron-down" /></svg>
            </span>
        </button>
    )
}