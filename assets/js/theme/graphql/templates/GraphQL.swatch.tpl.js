/**
 * Graph QL Templates for Swatch Option Modal
 */

export default class GraphQL_Swatch_TPL {

    // main drawer
    getSwatchDrawer(){
        return `<aside class='drawer drawer--options drawer--close' id="optionsDrawer">
                    <button class="drawer__close" drawer--close>
                        <svg class="drawer__closeIcon" enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.4 12l5.3-5.3c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0l-5.3 5.3-5.3-5.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4l5.3 5.3-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3l5.3-5.3 5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4l-5.3-5.3z"></path>
                        </svg>
                    </button>
                    <div class="drawer__content" id="optionModalSwatches">
                        <ul class="preloader preloader--short preloader--background">
                            <li class="preloader__swatchTopTitle"></li>
                            <li class="preloader__swatchProductImg"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                            <li class="preloader__swatch"></li>
                        </ul>
                
                        <div class="drawer__main hide">
                            <h2 class="drawer__contentHeading"></h2>
                
                            <figure class="drawer__imgCntr">
                                <img src="https://dummyimage.com/600x400/cccccc/fff.gif&text=" class="drawer__img" />
                            </figure>
                
                            <form class="drawer__filters" id="optionForm">
                                <fieldset class="drawer__controlSet">
                                    <input type="text" autocomplete="off" id="drawerSearchInput" class="drawer__control drawer__control--input" placeholder="Search By Name">
                                    <button type="button" class="drawer__clearControl hide"><svg class="icon icon-close"><use xlink:href="#icon-close" /></svg></button>
                                </fieldset>
                                
                                <div class="drawer__topCntr">
                                    <ul class="drawer__displayList">
                                        <li class="drawer__displayItem drawer__displayItem--filters">
                                            <button type="button" class="drawer__displayFilters">
                                                <span class="drawer__displayFilterText">Filter Options</span>
                                                <svg class="icon icon-arrow-down"><use xlink:href="#icon-arrow-down" /></svg>
                                            </button>
                                        </li>
                                        <li class="drawer__displayItem">
                                            <button type="button" class="drawer__displayType drawer__displayType--active" rel="grid">
                                                <svg class="icon icon-grid"><use xlink:href="#icon-grid" /></svg>
                                            </button>
                                        </li>
                                        <li class="drawer__displayItem">
                                            <button type="button" class="drawer__displayType" rel="list">
                                                <svg class="icon icon-list"><use xlink:href="#icon-list" /></svg>
                                            </button>
                                        </li>
                                    </ul>
                                    <div class="drawer__filterControlCntr" id="filterControlCntr"></div>
                                </div>
                                <div class="drawer__contentCntr"></div>
                            </form>
                        </div>
                    </div>
                    <footer class="drawer__footer">
                        <span class="drawer__selectedSwatchText"></span>
                        <button type="button" class="drawer__saveBtn" drawer--close disabled>Save & Finish</button>
                    </footer>
                </aside>
                <div class="drawer__overlay drawer__overlay--hide"></div>`;
    }


    // filter controls
    buildFilter(filterObj){
        return `<h6 class="drawer__filterHeading">Filter by ${filterObj.name}:</h6>
                <ul class="drawer__filterList" id="${filterObj.target}">

        ${Object.keys(filterObj.items).map((key) => {
            return `<li class="drawer__filterListItem" name="${filterObj.items[key]}">
                        <label class="drawer__filterLabel">
                            <input type="checkbox" class="drawer__filterControl" key="${filterObj.key}" name="${filterObj.items[key]}">
                            ${filterObj.name === "Grade" ? "Grade" : ''} ${filterObj.items[key]} 
                        </label>
                    </li>`}).join("")}
            
                </ul>`;
            
    }


    // swatche contaner
    buildSwatch(swatch){        
        return `<div class="drawer__swatchControls ${swatch.isRequired ? 'form-required' : ''}" data-swatch-selector data-product-attribute="swatch">
                    <div class="form-field-control drawer__controls--grid">

                    ${Object.keys(swatch.values.edges).map((key) => {
                        let thisOption = swatch.values.edges[key].node;
                        return this.getOptionSwatch(thisOption, swatch);
                    }).join('')}

                    </div>
                </div>`;
    }


    // swatches
    getOptionSwatch(thisOption, swatch){
        return `<label class="swatch-wrap" for="attribute-${thisOption.entityId}" data-swatch-value="${thisOption.label}" data-product-attribute-value="${thisOption.entityId}" data-is-selected>
                    <input class="form-input swatch-radio"  data-option-title="${swatch.displayName}" data-parent-id="${swatch.entityId}" id="attribute-${thisOption.entityId}" type="radio" name="attribute[${swatch.entityId}]" value="${thisOption.entityId}" data-label="${thisOption.label}" ${thisOption.isDefault ? 'checked' : ''} ${swatch.isRequired ? ' required' : ''} aria-required="${swatch.isRequired}">
                    <span class="swatch">
                        <span class="swatch-color swatch-pattern" style="background-image: url('https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg');">
                            <img class="swatch-pattern-image" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg" alt="${thisOption.label}">
                        </span>
                    ${thisOption.hexColors.length !== 0 ? '<span class="swatch-color" style="background-color: #'+thisOption.hexColors[0]+'"></span>' : '' }
                    </span>
                    <span class="form-label-cntr">
                        <span class="form-label-text">${thisOption.grade ? `Grade ${thisOption.grade}` : ""} ${thisOption.text} ${thisOption.priceAdjust ? ` &nbsp; (${thisOption.priceAdjust})` : ""}</span>
                        <span class="form-label-meta">
                            <span class="form-label-grade"></span>
                            <span class="form-label-price"></span>
                        </span>
                    </span>
                </label>`;
    }

}