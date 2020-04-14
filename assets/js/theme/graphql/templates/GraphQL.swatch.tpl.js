/**
 * Graph QL Templates for Swatch Option Modal
 */

export default class GraphQL_Swatch_TPL {

    // main drawer
    getSwatchDrawer(){
        return `<aside class='drawer drawer--options'></aside>`;
    }


    // filter controls
    buildFilter(filterObj){
        return `<h6 class="drawer__filterHeading">Filter by ${filterObj.name}:</h6>
                <ul class="drawer__filterList" id="${filterObj.target}">

        ${Object.keys(filterObj.items).map((key) => {
            return `<li class="drawer__filterListItem">
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
                    <input class="form-input swatch-radio"  data-option-title="${swatch.displayName}" data-parent-id="${swatch.entityId}" id="attribute-${thisOption.entityId}" type="radio" name="attribute[${thisOption.entityId}]" value="${thisOption.entityId}" data-label="${thisOption.label}" ${thisOption.isDefault ? 'checked' : ''} ${swatch.isRequired ? ' required' : ''} aria-required="${swatch.isRequired}">
                    <span class="swatch">
                        <span class="swatch-color swatch-pattern" style="background-image: url('https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg');">
                            <img class="swatch-pattern-image" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg" alt="${thisOption.label}">
                        </span>
                    ${thisOption.hexColors.length !== 0 ? '<span class="swatch-color" style="background-color: #'+thisOption.hexColors[0]+'"></span>' : '' }
                    </span>
                    <span class="form-label-cntr">
                        <span class="form-label-text">${thisOption.text}</span>
                        <span class="form-label-meta">
                            <span class="form-label-grade"> ${thisOption.grade ? `Grade ${thisOption.grade}` : ""}</span>
                            <span class="form-label-price"> ${thisOption.priceAdjust ? ` &nbsp; (${thisOption.priceAdjust})` : ""}</span>
                        </span>
                    </span>
                </label>`;
    }

}