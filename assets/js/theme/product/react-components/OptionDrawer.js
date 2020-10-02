import React, { useContext, useEffect } from 'react';
import AppContext from '../collection/AppContext';
import OptionDrawerFilters from './OptionDrawer__Filters';

export default function OptionDrawer(props){
    const appHook = useContext(AppContext);
   
    return(
        <>
        { Object.keys(props.for).length > 0 ?
            <>
                <aside className={`drawer drawer--options drawer--${appHook.drawerState}`} id="optionsDrawer">
                    <div className="drawer__content" id="optionModalSwatches">
                        <div className={`drawer__main drawer__main--${appHook.drawerState}`}>
                            <button type="button" className="drawer__close" drawer--close="true" onClick={() => appHook.toggleDrawer("close") }>
                                <svg className="drawer__closeIcon"><use xlinkHref="#icon-close" /></svg>
                            </button>

                            <h2 className="drawer__contentHeading">
                                {props.for.displayName}
                            </h2>

                            <figure className="drawer__figCntr">
                                <span className="drawer__imgCntr">
                                    <img src={appHook[props.for.displayName].attributeValue ? appHook[props.for.displayName].swatch.image : "https://dummyimage.com/600x400/cccccc/fff.gif&text=+" } className="drawer__img" />
                                </span>
                                <figcaption className="drawer__selectedSwatchText">
                                    {appHook[props.for.displayName].attributeValue ? appHook[props.for.displayName].swatch.label : "" }
                                </figcaption>
                            </figure>

                            <OptionDrawerFilters options={props.options} for={props.for} />
                        </div>
                    </div>

                    <footer className="drawer__footer">
                        <button type="button" className="drawer__saveBtn" drawer--close="true" onClick={() => appHook.toggleDrawer("close")}>
                            <svg className="icon icon-long-arrow-left"><use xlinkHref="#icon-long-arrow-left" /></svg>
                            <span>Save &amp; Back</span>
                        </button>
                    </footer>

                </aside>
                <div className="drawer__overlay drawer__overlay--hide"></div>
            </>
        :null}
        </>
    );
}