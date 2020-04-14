/**
 * Graph QL Tempatles for Collection pages
 */

export default class GraphQL_Collection_TPL {

    /**
     * @param {Object} product product contrct from graphql
     * 
     *  Save this for later
     *  <button type="button" class="product__clearSwatch hide" title="Clear Swatch">
     *      <svg class="icon icon-minus"><use xlink:href="#icon-minus" /></svg>
     *  </button>
     */

    buildCollectionsPod(product){
        return `<section class="product__row product__row--border" id="${product.entityId}">
                    <div class="product__col-1-1">
                        <figure class="product__figure product__col-1-4">
                            <a href="${product.path}" title="See all details about ${product.name}">
                                <img data-product-image class="product__img product__img--thumb" src="${product.defaultImage.url}" alt="${product.name}">
                            </a>
                        </figure>

                        <div class="product__col-3-4">
                            <div class="product__col-2-3">
                                <header class="product__nameHeader">
                                    <h1 class="product__name product__name--sm">
                                        <a href="${product.path}" title="See all details about ${product.name}">${product.name}</a>
                                    </h1>
                                </header>
                            

                                <p class="product__itemNum">Item #: ${product.sku} &nbsp;&nbsp;&nbsp; Internet #: ${product.entityId}
                                    <a class="product__ratingWrapper yotpo-pdp-wrapper hide" href="${product.path}#yotpoReviews" id="yotpoRating" title="Reviews of ${product.path}">
                                        <span class="yotpo-stars-rating" style="--rating: 0;" aria-label="Rating of 0 out of 5."></span>
                                        (<span class="yotpo-reviews-num">0</span>)
                                        <span class="yotpo-questions">
                                            <span class="yotpo-questions-num">0</span> Questions
                                        </span>
                                    </a>
                                </p>

                                <ul class="product__highlights">
                        ${Object.keys(product.customFields.edges).map((key) => {
                            let name = product.customFields.edges[key].node.name, tpl = '';

                            if(name === "Highlight 1" || name === "Highlight 2" || name === "Highlight 3"){
                                tpl += `<li>${product.customFields.edges[key].node.value}</li>`;
                            }

                            return tpl;
                            
                        }).join('') }
                                </ul>


                        ${Object.keys(product.customFields.edges).map((key) => {
                            let name = product.customFields.edges[key].node.name, tpl = '';

                            if(name === "Lead-Time"){
                                tpl += `<p class="product__shipping">
                                            ${product.customFields.edges[key].node.value}
                                            <span id="nextBussinessDay" class="shipping-range--tip">
                                                <script>
                                                    document.addEventListener('DOMContentLoaded', function(){
                                                        TEAK.Modules.leadTime.setTip("nextBussinessDay");
                                                    });
                                                </script>
                                            </span>
                                        </p>`;
                            }


                            if(name === "Lead-Time 2"){
                                tpl += `<p class="product__shipping">${product.customFields.edges[key].node.value}</p>`;
                            }


                            if(name === "Promo Text"){
                                tpl += `<p class="product__promoText">${product.customFields.edges[key].node.value}</p>`;
                            }


                            if(name === "Free Shipping Icon" && product.customFields.edges[key].node.value === "Yes"){
                                tpl += `<div id="freeShipping">
                                            <p class="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></p>
                                        </div>`;
                            }

                            return tpl;
                            
                        }).join('') }
                            </div>
                        


                            <div class="product__col-1-3 no-pad">
                                <div class="product__price">
                                    <div class="product__priceLine">
                                        <span class="product__priceValue" data-price="${ TEAK.Utils.graphQL.determinePrice(product.prices) }">${TEAK.Utils.formatPrice( TEAK.Utils.graphQL.determinePrice(product.prices) )}</span>
                                        ${product.prices.retailPrice !== null ? ` <span class="product__priceRrp">${TEAK.Utils.formatPrice( product.prices.retailPrice.value )}</span>` : '' }
                                    </div>              
                                </div>
                                
                                <button type="button" button-atc class="button button-primary button--fullWidth button-primary--green">Add to Cart</button>
                            
                                <div class="product__swatchCol">
                                    <ul class="product__swatchList">

                            ${Object.keys(product.productOptions).map((key) => {
                                let productOption = product.productOptions[key].node;

                                if(productOption.displayStyle === "Swatch"){
                                    return `<li class="product__swatchItem" id="${product.entityId}.${productOption.entityId}">
                                                <button type="button" drawer--open class="product__swatchLabel" data-product-id="${product.entityId}" rel="${productOption.entityId}" data-product-img="${product.defaultImage.url}">
                                                    <div class="product__swatch">
                                                        <input class="product__swatchRadio" id="${productOption.entityId}" type="radio" name="" value="" data-label="${productOption.displayName}">
                                                        <div class="product__swatchColor" style="background-image: url('https://dummyimage.com/256x256/cccccc/777777.png&text=Choose');">
                                                            <img class="product__swatchImg" src="https://dummyimage.com/256x256/cccccc/777777.png&text=Choose">
                                                        </div>
                                                    </div>
                                                    <div class="product__swatchText">
                                                        <p class="product__swatchOptionText">
                                                            <span class="product__swatchName">${productOption.displayName}:</span>
                                                            <span class="product__swatchValue"></span>
                                                        </p>
                                                    </div>
                                                    <svg class="icon icon-long-arrow-right"><use xlink:href="#icon-long-arrow-right" /></svg>
                                                </button>
                                            </li>`;
                                }


                                if(productOption.displayStyle === "DropdownList"){
                                    return `<li class="product__swatchItem product__swatchItem--select" id="${productOption.entityId}">
                                                
                                                <select class="product__swatchSelect" id="attribute-${productOption.entityId}" name="attribute[${productOption.entityId}]" ${productOption.isRequired ? ' required' : ''} aria-required="true">
                                                    <option value="" selected disabled>${productOption.displayName}</option>

                                            ${Object.keys(productOption.values.edges).map((key) => {
                                                let dropdown = productOption.values.edges[key].node;

                                                return `
                                                    <option value="${dropdown.entityId}" data-product-attribute-value="${dropdown.label}">${dropdown.text !== undefined ? dropdown.text : dropdown.label.split("--")[0]}  ${dropdown.hasOwnProperty("priceAdjust") ? `(${dropdown.priceAdjust})` : '' }</option>
                                                `}).join('')}

                                                </select>
                                            </li>`;
                                }
                               
                            }).join('')}

                                    </ul>
                                </div>

                            </div>
                        </div>


                    </div>
                </section>`;
    }




    // swatch options
    buildSwatch(swatch){
        return `<div class="product__swatchControls form-field form-field-options form-field-swatch ${swatch.isRequired ? 'form-required' : ''}" data-swatch-selector data-product-attribute="swatch">
                    <div class="form-field-title-cntr" data-option-title="${swatch.displayName}">                    
                        <span class="form-field-title">${swatch.displayName}:</span> &nbsp; <span class="swatch-value" data-swatch-value></span>
                        ${swatch.isRequired ? '<span class="required-text">*</span>' : ''}
                    </div>
                
                    <div class="form-field-control-wrapper" >
                        <div class="form-field-control">

                ${Object.keys(swatch.values.edges).map((key) => {
                    let thisOption = swatch.values.edges[key].node;
                   
                    return `<label class="swatch-wrap" for="attribute-${thisOption.entityId}" data-swatch-value="${thisOption.label}" data-product-attribute-value="${thisOption.entityId}">
                                <input class="form-input swatch-radio"  data-option-title="${swatch.displayName}" data-parent-id="${swatch.entityId}" id="attribute-${thisOption.entityId}" type="radio" name="attribute[${thisOption.entityId}]" value="${thisOption.entityId}" data-label="${thisOption.label}" ${thisOption.isDefault ? 'checked' : ''} ${swatch.isRequired ? ' required' : ''} aria-required="${swatch.isRequired}">
                                <span class="swatch">
                                    <span class="swatch-color swatch-pattern" style="background-image: url('https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg');">
                                        <img class="swatch-pattern-image" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisOption.entityId}.preview.jpg" alt="${thisOption.label}">
                                    </span>
                                ${thisOption.hexColors.length !== 0 ? '<span class="swatch-color" style="background-color: #'+thisOption.hexColors[0]+'"></span>' : '' }
                                </span>
                                <span class="form-label-text">${thisOption.label}</span>
                            </label>`}).join('')}

                        </div>
                    </div>
                </div>`;
    }



    // reqeust swatch form
    swatchRequestSwatches(swatch){
        return Object.keys(swatch.values.edges).map((key) => {
                let thisSwatch = swatch.values.edges[key].node;

                return `<li class="swatchModal__listItem" data-request-swatch data-swatch-title="${thisSwatch.label}">
                            <figure class="swatchModal__swatchImgCntr swatch-img">
                                <img class="swatchModal__swatchImg" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${thisSwatch.entityId}.preview.jpg" alt="${thisSwatch.displayName}" />
                                <figcaption class="swatchModal__swatchTitle">
                                    ${thisSwatch.label}
                                </figcaption>
                            </figure>
                        </li>`;

            }).join('');
    }



    // dropdown options
    buildDropdown(dropdown){
        return `<div class="form-field form-field-options form-field-select ${dropdown.isRequired ? 'form-required' : ''}" data-product-attribute="set-select">
                    <label class="form-label">
                        <span class="form-field-title-cntr" data-option-title="${dropdown.displayName}">
                            <span class="form-field-title">${dropdown.displayName}:</span> &nbsp; ${dropdown.isRequired ? '<span class="required-text">*</span>' : ''}
                        </span>

                        <span class="form-field-control">
                            <div class="form-select-wrapper">
                                <select class="form-input form-select" id="attribute-${dropdown.entityId}" name="attribute[${dropdown.entityId}]" ${dropdown.isRequired ? ' required' : ''} aria-required="${dropdown.isRequired}">
                                <option value="" selected disabled>Pick One...</option>

                        ${Object.keys(dropdown.values.edges).map((key) => {
                            return `
                                <option value="${dropdown.values.edges[key].node.entityId}" data-product-attribute-value="${dropdown.values.edges[key].node.entityId}">${dropdown.values.edges[key].node.label}</option>
                            `}).join('')}

                                </select>
                            </div>
                        </span>
                    </label>
                </div>`;
    }


}