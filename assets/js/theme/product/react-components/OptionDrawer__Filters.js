import React, { useContext } from 'react';
import AppContext from '../collection/AppContext';

export default function OptionDrawerFilters(props){
    const appHook = useContext(AppContext);

    const changeSwatch = (swatchData) => {
        appHook.setOption({
            displayName: props.for.displayName,
            optionData: {
                attribute: parseInt(props.for.id),
                attributeValue: parseInt(swatchData.id),
                swatch: {
                    label: swatchData.label,
                    image: swatchData.pattern
                }
            }
        });
    }

    return(
        <form className="drawer__filtersForm" id="optionForm"> 
            <div className="drawer__topCntr">
                <ul className="drawer__displayList">
                    <li className="drawer__displayItem drawer__displayItem--search">
                        <fieldset className="drawer__controlSet">
                            <div className="drawer__control--searchIcon"></div>
                            <input type="text" autoComplete="off" id="drawerSearchInput" className="drawer__control drawer__control--input" placeholder="Search" />
                            <button type="button" className="drawer__clearControl hide"><svg className="icon icon-close"><use xlinkHref="#icon-close" /></svg></button>
                        </fieldset>
                    </li>
                    <li className="drawer__displayItem drawer__displayItem--filters">
                        <button type="button" className="drawer__displayFiltersBtn">
                            <span className="drawer__displayFilterText drawer__displayFilterText--lg">
                                Filter Options
                                <svg className="icon icon-chevron-down"><use xlinkHref="#icon-chevron-down" /></svg>
                            </span>

                            <span className="drawer__displayFilterText drawer__displayFilterText--sm">
                                <svg className="icon icon-filter"><use xlinkHref="#icon-filter" /></svg>
                                <span className="drawer__displayFilterTextElem">Filter</span>
                                <svg className="icon icon-chevron-down"><use xlinkHref="#icon-chevron-down" /></svg>
                            </span>
                        </button>
                    </li>
                    <li className="drawer__displayItem">
                        <button type="button" className="drawer__displayType" rel="grid">
                            <svg className="icon icon-grid"><use xlinkHref="#icon-grid" /></svg>
                        </button>
                    </li>
                    <li className="drawer__displayItem">
                        <button type="button" className="drawer__displayType drawer__displayType--active" rel="list">
                            <svg className="icon icon-list"><use xlinkHref="#icon-list" /></svg>
                        </button>
                    </li>
                </ul>
                <div className="drawer__filterControlCntr" id="filterControlCntr"></div>
            </div>
            <div className="drawer__contentCntr">
                <div className="drawer__swatchControls">
                    <div className="form-field-control drawer__controls--list">
                        {props.options ? 
                            props.options.map((item, index) => {
                                return  <label key={index} className="swatch-wrap" htmlFor={`attribute-${item.id}`}>
                                            <input 
                                                className="form-input swatch-radio" 
                                                checked={appHook[props.for.displayName].attributeValue === item.id} 
                                                onChange={() => changeSwatch(item)} 
                                                id={`attribute-${item.id}`} 
                                                type="radio" 
                                                name={`attribute[${item.id}]`} 
                                                value={`${item.id}`} 
                                                required 
                                                aria-required="true" 
                                            />
                                            <span className="swatch">
                                                <span className="swatch-color swatch-pattern" style={{backgroundImage: `url("${item.pattern}")` }}>
                                                    <img className="swatch-pattern-image" src={item.pattern} alt={item.image.alt} />
                                                </span>
                                            </span>
                                            <span className="drawer__swatchLabelCntr">
                                                <OptionLabels label={item.label} />
                                            </span>
                                        </label>
                            })
                        : null}
                    </div>
                </div>
            </div>
        </form>
    );
}


function OptionLabels(props){
    const item = TEAK.Utils.parseOptionLabel(props.label);

    return(
        <>
            <span className="drawer__swatchLabel drawer__swatchLabel--grade">{item.grade ? `Grade ${item.grade}` : ""}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--brand">{item.brandName ? `${item.brandName}` : ""}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--color">{item.color}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--price">{item.priceAdjust ? `(${item.priceAdjust})` : ""}</span>
            <span className="drawer__swatchLabel drawer__swatchLabel--ship">{item.ship ? `${item.ship}` : ""}</span>
        </>
    );
}
