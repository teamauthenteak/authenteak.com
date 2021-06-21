/**
 * Graph QL Templates for Swatch Option Modal
 */

export default class GraphQL_Swatch_TPL {

    // main drawer
    getSwatchDrawer(){
        return `<aside class='drawer drawer--options drawer--close' id="optionsDrawer">
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
                            <button class="drawer__close" drawer--close>
                                <svg class="drawer__closeIcon" enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.4 12l5.3-5.3c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0l-5.3 5.3-5.3-5.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4l5.3 5.3-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3l5.3-5.3 5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4l-5.3-5.3z"></path>
                                </svg>
                            </button>

                            <h2 class="drawer__contentHeading"></h2>
                
                            <figure class="drawer__figCntr">
                                <span class="drawer__imgCntr"></span>
                                <figcaption class="drawer__selectedSwatchText"></figcaption>
                            </figure>
                
                            <form class="drawer__filtersForm" id="optionForm"> 
                                <div class="drawer__topCntr">
                                    <ul class="drawer__displayList">
                                        <li class="drawer__displayItem drawer__displayItem--search">
                                            <fieldset class="drawer__controlSet">
                                                <div class="drawer__control--searchIcon"></div>
                                                <input type="text" autocomplete="off" id="drawerSearchInput" class="drawer__control drawer__control--input" placeholder="Search">
                                                <button type="button" class="drawer__clearControl hide"><svg class="icon icon-close"><use xlink:href="#icon-close" /></svg></button>
                                            </fieldset>
                                        </li>
                                        <li class="drawer__displayItem drawer__displayItem--filters">
                                            <button type="button" class="drawer__displayFiltersBtn">
                                                <span class="drawer__displayFilterText drawer__displayFilterText--lg">
                                                    Filter Options
                                                    <svg class="icon icon-chevron-down"><use xlink:href="#icon-chevron-down" /></svg>
                                                </span>

                                                <span class="drawer__displayFilterText drawer__displayFilterText--sm">
                                                    <svg class="icon icon-filter"><use xlink:href="#icon-filter" /></svg>
                                                    <span class="drawer__displayFilterTextElem">Filter</span>
                                                    <svg class="icon icon-chevron-down"><use xlink:href="#icon-chevron-down" /></svg>
                                                </span>
                                            </button>
                                        </li>
                                        <li class="drawer__displayItem">
                                            <button type="button" class="drawer__displayType" rel="grid">
                                                <svg class="icon icon-grid"><use xlink:href="#icon-grid" /></svg>
                                            </button>
                                        </li>
                                        <li class="drawer__displayItem">
                                            <button type="button" class="drawer__displayType drawer__displayType--active" rel="list">
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
                        <button type="button" class="drawer__saveBtn" drawer--close>
                            <svg class="icon icon-long-arrow-left"><use xlink:href="#icon-long-arrow-left" /></svg>
                            <span>Save &amp; Back</span>
                        </button>
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
                            <span class="drawer__filterLabelText">${filterObj.name === "Grade" ? "Grade" : ''} ${filterObj.items[key].split("_").join(" ")}</spam>
                        </label>
                    </li>`}).join("")}

                </ul>`;
    }


    // swatch container
    buildSwatch(swatch, disabledSwatches){        
        return `<div class="drawer__swatchControls ${swatch.isRequired ? 'form-required' : ''}" data-swatch-selector data-product-attribute="swatch">
                    <div class="form-field-control drawer__controls--list">

                    ${Object.keys(swatch.values.edges).map((key) => {
                        let thisOption = swatch.values.edges[key].node;

                        if( thisOption.label !== "not_an_option" ){
                            return this.getOptionSwatch(thisOption, swatch, disabledSwatches);
                        }
                        
                    }).join('')}

                    </div>
                </div>`;
    }


    // swatches
    getOptionSwatch(thisOption, swatch, disabledSwatches){
        var isDisabled = disabledSwatches ? disabledSwatches.split(",").find(item => thisOption.colorCode && thisOption.colorCode.includes(item.trim())) : null;
   
        return `<label class="swatch-wrap ${isDisabled && 'swatch-disabled'}" for="attribute-${thisOption.entityId}" data-swatch-value="${thisOption.label}" data-product-attribute-value="${thisOption.entityId}" data-is-selected>
                    <input ${isDisabled && 'disabled="true"'} class="form-input swatch-radio" data-option-title="${swatch.displayName}" data-parent-id="${swatch.entityId}" id="attribute-${thisOption.entityId}" type="radio" name="attribute[${swatch.entityId}]" value="${thisOption.entityId}" data-label="${thisOption.label}" ${thisOption.isDefault && 'checked'} ${swatch.isRequired && ' required'} aria-required="${swatch.isRequired}">
                    <span class="swatch">
                        <span class="swatch-color swatch-pattern" style="background-image: url('${thisOption.label.includes("No ") ? "https://authenteak.s3.us-east-2.amazonaws.com/images/2098122.preview.png" : decodeURIComponent(thisOption.imageUrl)}');">
                            <img class="swatch-pattern-image" src="${thisOption.label.includes("No ") ? "https://authenteak.s3.us-east-2.amazonaws.com/images/2098122.preview.png" : decodeURIComponent(thisOption.imageUrl)}" alt="${thisOption.label}">
                        </span>
                    </span>
                    <span class="drawer__swatchLabelCntr">
                        <span class="drawer__swatchLabel drawer__swatchLabel--grade">${thisOption.grade ? `Grade ${thisOption.grade}` : ""}</span>
                        <span class="drawer__swatchLabel drawer__swatchLabel--brand">${thisOption.brandName ? `${thisOption.brandName}` : ""}</span>
                        <span class="drawer__swatchLabel drawer__swatchLabel--color">${thisOption.color}</span>
                        <span class="drawer__swatchLabel drawer__swatchLabel--price">${thisOption.priceAdjust ? `(${thisOption.priceAdjust})` : ""}</span>
                        <span class="drawer__swatchLabel drawer__swatchLabel--ship">${thisOption.ship ? `${thisOption.ship}` : ""}</span>
                    </span>
                </label>`;
    }

}