import PageManager from '../PageManager';
import utils from '@bigcommerce/stencil-utils';
import productViewTemplates from './product/productViewTemplates';
import Personalization from './Personalization';
import GraphQL from './graphql/GraphQL';
import GraphQL_Collection_TPL from './graphql/templates/GraphQL.collection.tpl';
import ProductOptions from './product/customizations/ProductOptions';
import ProductSwatchModal from './product/ProductSwatchModal';
import AddToCartModal from './product/customizations/AddToCartModal';
import FormValidator from './utils/FormValidator';
import Yotpo from './thirdparty/Yotpo';
import ToolTips from './components/ToolTips';

export default class Collection extends PageManager {
    constructor() {
        super();

        this.graphQL = new GraphQL();
        this.graph_tpl = new GraphQL_Collection_TPL();

        this.yotpo = new Yotpo();

        new ProductSwatchModal();
        new ToolTips();
        new AddToCartModal();

        // options
        let optid = TEAK.Utils.getParameterByName("optid");
        this.optionsRefferenceId = optid ? optid : 2851;        // product used as the option anchor for the page

        // this.productOptionsCntr = document.getElementById("productOptions");
        this.requestSwatchCntr = document.getElementById("swatchpopuplist").querySelector(".swatchModal__list");

        this.optionsArray = [];                                 // temporary array for fetched options
        this.productOptionScope = {};                           // stores all product option objects with product ID key
        this.currentSelection = {};                             // saves the currently selected option
        this.atcItem = "";                                      // saved recently added cart item for app use
        this.atcCollection = [];                                // all of collection items added to cart

        // products
        this.collectionsCntr = document.getElementById("collectionsCntr");

        this.collectionsArray = [];                             // temporary array all fetched products
        this.collectionProducts = [];                           // stores all product ids for fetching of their options
        this.collectionSettings = {                             // used to fetched paginated options
            path: window.location.pathname,
            qty: 8
        };

        this.initOptions();
        this.initCollectionProducts();

        this.bindings();

        // add Personalization engine
        this.recentlyViewed = new Personalization({
            type: "recentlyViewed"
        });
        this.initRecentlyViewed();

        // Events: heap, pinrest, facebook, etc.
        this.initAnalytics();
    }




    bindings(){
        $(this.collectionsCntr)
            // .on("change", "input[type='radio']", (e) => { this.trackOptionRadioChange(e); })
            .on("submit", "form.add-to-cart-form", (e) => { e.preventDefault() })
            .on('click', 'button.product-quantity-toggle', (e) => { this.updateQuantity(e); });

        $(document.body)
            .on("change", "select.selectBox__select", (e) => { this.trackOptionDropdownChange(e); })
            .on("click", "button[button-atc]", (e) => { this.atcSubmit(e); });

        $(window)
            .on("cartDataStored", (e) => { this.handelATCModal(e.detail); })
            .on("form-field-error-state", (e) => { this.handelSubmitState(e); })
            .on("form-field-success-state", (e) => { this.handelSubmitState(e); });

        this.onProductOptionChange();
    }



    // on collection form submit
    atcSubmit(e){
        let $target = $(e.currentTarget);
        $target.parents("form").submit();
    }



    // on Success / Error of the form validation
    handelSubmitState(e){
        if( e.type === "form-field-error-state" ){
            let $targtBtn = $(e.detail[0].field).parents("form").find("button[button-atc]");
            this.toggleATCButton($targtBtn, false);

        }else if( e.type === "form-field-success-state" ){
            let form = e.originalEvent.detail;
            this.atcCollectionItem(form);
        }
    }



    // sends the product info to cart when its valid
    atcCollectionItem(form){
        if (window.FormData === undefined) { return; }

        let formData = new FormData(form);
        let $targetBtn = $(form).find("button[button-atc]");

        this.toggleATCButton($targetBtn, true);

        utils.api.cart.itemAdd(filterEmptyFilesFromForm(formData), (err, response) => {
            if (response.status === 'success') {
                $.event.trigger({
                    type: 'cart-item-add-success',
                    data: response
                });
            }
        });

        this.createCollectionData(form);

        /**
         * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
         * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
         * @param formData: FormData object
         * @returns FormData object
         */
        function filterEmptyFilesFromForm(formData) {
            try {
                for (const [key, val] of formData) {
                    if (val instanceof File && !val.name && !val.size) {
                        formData.delete(key);
                    }
                }
            } catch (e) {
                console.error(e); // eslint-disable-line no-console
            }

            return formData;
        }
    }




    // Validates each collection row 
    initValidator(context){
        let formElement = `collection_${context.node.entityId}`,
            formContext = [{
                    name: "qty[]",
                    rules: "required"
                },
                {
                    name: "product_id",
                    rules: "required"
                },
                {
                    name: "action",
                    rules: "required"
                }];
        
        context.node.productOptions.forEach((element) => {
            formContext.push({
                name: `attribute[${element.node.entityId}]`,
                rules: element.node.isRequired ? "required" : ""
            });
        });

        this.Validator = new FormValidator(formElement, formContext);

        this.Validator.initSingle(
            $(`form[name=${formElement}]`), {
            
                onValid: (e) => {
                    let event = new CustomEvent("form-field-success-state", {detail: e.target});
                    window.dispatchEvent(event);
                },
            
                onError: function(e) {
                    // notify other apps of the form field error for specific ui updates
                    let invalidFields = this.getInvalidFields();
                    let event = new CustomEvent("form-field-error-state", {detail: invalidFields});
                    window.dispatchEvent(event);
                }
            }
        );
    }



    // toggles the ATC button for each form
    toggleATCButton($target, showAction){
        $target
            .find(".product__atcCollectionBtnText").toggleClass("hide", showAction)
                .end()
            .find(".icon-spinner").toggleClass("hide", !showAction);

        $target[0].toggleAttribute("disabled", showAction);
    }



    // setup this product to show the atc modal
    createCollectionData(form){
        let that = this,
            $form = $(form);

        // Save this cart item
        let atcItem = $form.attr('id').split("_")[1];
        atcItem = parseInt(atcItem);

        this.atcItem = this.collectionProducts.find(element => element.entityId === atcItem);

        // holds all of the selected options from the collection item added to cart
        this.atcItem["selected"] = {};

        let finalQty =  $form.find("[name='qty[]']").val();
        finalQty = parseInt(finalQty);
        this.atcItem["qty"] = finalQty;

        let adjustedPrice = $form.find(".product__priceValue").text();
        adjustedPrice = adjustedPrice.replace(/[^\d.-]/g, '');
        adjustedPrice = parseInt(adjustedPrice);
        this.atcItem["adjustedPrice"] = adjustedPrice;


        // gets the selected options from the cart collectino items form and then adds them to its atcitem object
        $form.find(":selected, :checked").each(addSelected);

        function addSelected(){
            let optionID = $(this).is("option") ? $(this).parents("select").attr("name") : $(this).attr("name");
            optionID = optionID.match(/\[(.*?)\]/)[1];
            optionID = parseInt(optionID);

            let value = $(this).val();
            value = parseInt(value);

            let selectedOption = that.atcItem.productOptions.find((element) => element.node.entityId === optionID);
            selectedOption = selectedOption.node;

            let selected = selectedOption.values.edges.find((element) => element.node.entityId === value );
            selected = selected.node;

            that.atcItem.selected[selectedOption.entityId] = selected.hasOwnProperty("text") ? selected : Object.assign( selected, TEAK.Utils.parseOptionLabel(selected.label) );
        }

        // save the cutomers cart added to the collection list
        this.atcCollection.push(this.atcItem);

        // track this product
        this.initATCAnalytics();
    }



    // on success open the atc confimration modal
    handelATCModal(cartDetail){
        $("#modalCartCntr").html("");

        $("#toaster").removeClass("toaster--hide");

        let tpl = this.graph_tpl.getAtcModalContent(this.atcItem, cartDetail);
        $("#modalCartCntr").addClass("toaster__atcModal--active").html(tpl);


        $("#toasterItemList").html("");
        this.atcCollection.forEach((element) => {
            let itemTpl = this.graph_tpl.getToasterItem(element);
            $(itemTpl).appendTo("#toasterItemList");
        });

        setTimeout(() => { $("#modalCartCntr").removeClass("toaster__atcModal--active").html(""); }, 5000);

        this.toggleATCButton( $(`#collection_${this.atcItem.entityId}`).find("button[button-atc]"), false );
    }



    // updates collection item quty
    updateQuantity(e){
        e.preventDefault();
    
        let $target = $(e.currentTarget);
        let $quantity = $target.parents('label.product__qtyCntr').find('input[type="number"]');
        let min = parseInt($quantity.prop('min'), 10);
        let max = parseInt($quantity.prop('max'), 10);
    
        let newQuantity = parseInt($quantity.val(), 10);
        newQuantity = isNaN(newQuantity) ? min : newQuantity;
        
        if ($target.hasClass('product-quantity-increment') && (!max || newQuantity < max)) {
            newQuantity++;

        } else if ($target.hasClass('product-quantity-decrement') && newQuantity - 1 > min) {
            newQuantity--;
        }
    
        $quantity.val(newQuantity);
    
        utils.hooks.emit('product-option-change', null, $quantity[0]);
    }



    // this updates the price price when the product option changes   
    onProductOptionChange(){

        utils.hooks.on('product-option-change', (event, changedOption) => {
            let $changedOption = $(changedOption);
            let $form = $changedOption.parents('form');
            let $productid = $form.find("[name='product_id']").val();

            utils.api.productAttributes.optionChange($productid, $form.serialize(), (err, response) => {
                let viewModel = getViewModel($form);
                let data = response ? response.data : {};
            
                // Apply quantity changes
                let qty = Number.parseInt( $form.find('.product-quantity').val() );

                if (qty > 1) {
                    for (var i in data.price) {
                        if (data.price[i].value) {
                            data.price[i].value *= qty;

                            if (data.price[i].formatted) {
                                data.price[i].formatted = data.price[i].value.toLocaleString('en-us', {style: 'currency', currency: 'USD'});
                            }
                        }
                    }
                }

                 // Extrapolate and test for base price
                if (data.base || (typeof data.variantID == 'undefined' && typeof data.v3_variant_id == 'undefined')) {
                    viewModel.$price.data('base-price', data.price.without_tax);
                }
      
                if (data.price.without_tax !== viewModel.$price.data('base-price')) {
                    delete data.price.rrp_without_tax;
                    delete data.price.rrp_with_tax;
                    delete data.price.saved;
                }
        
                // updating price (Update price based on quantity HERE!)
                if (viewModel.$price.length) {
                    $form.find(".product__priceValue").data("price", data.price.without_tax.value).text(data.price.without_tax.formatted);
                }
      
                if (viewModel.$priceWithTax.length) {
                    $form.find(".product__priceValue").data("price", data.price.with_tax.value).text(data.price.with_tax.formatted);
                }

            });
        });


        function getViewModel($el) {
            return {
                $price: $('[data-product-price-wrapper="without-tax"]', $el),
                $testBit: $('[data-test-bit]', $el),
                $freeShip: $('[data-pricing-free-shipping]', $el),
                $priceWithTax: $('[data-product-price-wrapper="with-tax"]', $el),
                $saved: $('[data-product-price-saved]', $el),
                $sku: $('[data-product-sku]', $el),
                $weight: $('[data-product-weight]', $el),
                $addToCart: $('[data-button-purchase]', $el),
                $imagePreview: $('[data-variation-preview]', $el),
                stock: {
                    $selector: $('[data-product-stock]', $el),
                    $level: $('[data-product-stock-level]', $el),
                }
            };
        }
    }



    calculateAdjustedPrice(productPrice, optionObj){
        let newPrice;

        // if the selected option has a price adjustment and its NOT currently active
        if(optionObj.hasOwnProperty("priceAdjustNumeric")){
            if( !this.currentSelection.hasOwnProperty(optionObj.name) ){
                newPrice = productPrice + optionObj.priceAdjustNumeric;

            }else{
                if( this.currentSelection[optionObj.name].value !== optionObj.value ){
                    newPrice = productPrice + (this.currentSelection[optionObj.name].priceAdjustNumeric !== undefined ? -this.currentSelection[optionObj.name].priceAdjustNumeric : 0);
                    newPrice = newPrice + optionObj.priceAdjustNumeric;
                }
            }
           
        }else{
            newPrice =  productPrice + (-this.currentSelection[optionObj.name].priceAdjustNumeric);
        }
        
        this.currentSelection[optionObj.name] = optionObj;

        return newPrice;
    }



    // when the select box option is changed, update the price and make it look selected
    trackOptionDropdownChange(e){
        let selectObj = {},
            $target = $(e.currentTarget);
        
        selectObj["name"] = $target.attr("name");
        selectObj["value"] = $target.val();

        Object.assign(selectObj, TEAK.Utils.parseOptionLabel(e.currentTarget.selectedOptions[0].label));

        $target.parents(".selectBox__label").find(".selectBox__value").text(selectObj.text).addClass("selectBox__value--chosen");
        utils.hooks.emit('product-option-change', null, $target);
    }




    // updates each product in the collection with a top swatch is clicked
    /*
    trackOptionRadioChange(e){
        let  that = this, radioObj = $(e.currentTarget).data();       

        // find all of the corresponding products options with this same option title
        $(this.collectionsCntr).find(`input[data-label*="${radioObj.optionTitle}"]`).each(function(){
            let $this = $(this),
                optObj = Object.assign($this.data(), TEAK.Utils.parseOptionLabel(radioObj.label), {id: $this.attr("id")}, {value: $this.val()} ),
                opt = getOptionValues(optObj);
            
            $this
                .val(opt.entityId)
                .attr("name", `attribute[${opt.entityId}]`)
                .siblings(".product__swatchColor").css("backgroundImage", `https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${opt.entityId}.preview.jpg`)
                .find(".product__swatchImg").attr("src", `https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${opt.entityId}.preview.jpg`)
                    .end()
                .parents(".product__swatchItem").find(".product__swatchValue").text(opt.text + (opt.hasOwnProperty("priceAdjust") ? ` (${opt.priceAdjust})` : '') )
                    .end()
                .parents(".product__row").find(".product__priceValue").text(function(){
                    if(opt.hasOwnProperty("priceAdjust")){
                        let productPrice = $(this).data("price"),
                            newTotal = that.calculateAdjustedPrice(productPrice, opt);

                        $(this).data("price", newTotal);
                        return TEAK.Utils.formatPrice(newTotal);
                    }
                });
        });


        function getOptionValues(optObj){
            console.log(optObj.id)
            console.log(that.productOptionScope)
            let optionNode = that.productOptionScope[optObj.id].find((element) => element.node.displayName === radioObj.optionTitle),
                swatch = optionNode.node.values.edges.find((element) => {
                    let parsedSwatch = TEAK.Utils.parseOptionLabel(element.node.label);

                    if(parsedSwatch.text === optObj.text){
                        return Object.assign(element.node, parsedSwatch, {name: `attribute[${element.node.entityId}]`});
                    }
                });

            return swatch.node;
        }
    }
*/




    /**
     * Builds Options watches for products
     */
  
   
    // fetch the collection options
    getOptions(){
        let optionScheme = this.graphQL.getProductOptions(this.optionsRefferenceId);
        return this.graphQL.get(optionScheme);
    }



    initOptions(){
        this.getOptions().then((data) => {
            this.optionsArray = data.site.products.edges[0].node.productOptions.edges;
            
            // this.buildOptions(); - adds the global options
            this.setOptionsJSON();
        });
    }


    // build the options
    buildOptions(){
        this.productOptionsCntr.innerHTML = "";

        this.optionsArray.forEach((element) => {
            let tpl = this.parseOption(element.node);
            $(tpl).appendTo(this.productOptionsCntr);

            // Select Cushion
            if(element.node.displayName === "Select Cushion"){
                let requestTpl = this.graph_tpl.swatchRequestSwatches(element.node);

                $(requestTpl).appendTo(this.requestSwatchCntr);
                $(".product__swatchRequestBtn").css("display", "flex");
            }
        });
    }



    // Helper: parse the product option into the tempatle based on type
    parseOption(option){
        let tpl = "";

        switch(option.displayStyle){
            case "Swatch" :
                tpl = this.graph_tpl.buildSwatch(option);
                break;

            case "DropdownList" :
                tpl = this.graph_tpl.buildDropdown(option);
                break;
        }

        return tpl;
    }



    // builds the JSON object needed for the ProductOptions Module
    setOptionsJSON(){
        let arr = [];

        this.optionsArray.forEach((element) => {
            let obj = {
                    id: element.node.entityId,
                    type: element.node.displayStyle === "Swatch" ? "Configurable_PickList_Swatch" : "",
                    display_name: element.node.displayName,
                    required: element.node.isRequired,
                    condition: true,
                    state: element.node.displayStyle === "Swatch" ? "variant_option" : "",
                    values: []
                };

            let options = element.node.values.edges;

            for (let i = 0; i < options.length; i++) {
                let values = {
                        label: options[i].node.label,
                        id: options[i].node.entityId,
                        selected: options[i].node.isDefault,
                        pattern: `https://cdn11.bigcommerce.com/s-r14v4z7cjw/product_images/attribute_value_images/${options[i].node.entityId}.preview.jpg`,
                        image: {
                            data: `https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${options[i].node.entityId}.preview.jpg`,
                            alt: options[i].node.label
                        }
                    };

                obj.values.push(values);
            }

            arr.push(obj);
        });

        document.getElementById("optionModuleJSON").innerHTML = JSON.stringify(arr);
        
        //trigger productOption setup event for collections pages
        this.triggerOptionModuleSetup();
    }



    // notifies other modules that the options module JSON is ready - for collections / non PDP pages
    triggerOptionModuleSetup(){
        let event = new Event("Collection_Product_Options_Setup");
        window.dispatchEvent(event);
    }



    /**
	 * Yotpo: Fetch Bulk Ratings
	 */
	getProductRating(collectionsArray){
        let productIdArray = [];

        collectionsArray.edges.forEach((element) => {
            productIdArray.push(element.node.entityId);
        });

        // get our bulk yotpo rating for recomm products on page
        this.yotpo.fetchBulk(productIdArray)
            .then((data) => {
                this.appendRating(data, productIdArray, collectionsArray);
                this.updateRatingUI(collectionsArray);
            });
    }



    /**
	 * Bind the fetched yotpo rating field to the corresponding product
	 * @param {Array} dataArray - Data Array of Objects fetched from yotpo
	 * @param {Array} productIdArray - array of product ids
	 */

	appendRating(dataArray, productIdArray, collectionsArray){        
		for (let i = 0; i < productIdArray.length; i++) {
            Object.assign( collectionsArray.edges[i].node, {
                total_review: dataArray[i].result.total,
                rating: dataArray[i].result.average_score
            });
		}	
    }
    

    
    // Updates the collection product UI with the rating
    updateRatingUI(collectionsArray){
        collectionsArray.edges.forEach(element => {
            if( element.node.total_review > 0 ){
                $(`#yotpoRating${element.node.entityId}`)
                    .find(".yotpo-reviews-num").text(element.node.total_review)
                        .end()
                    .find(".yotpo-stars-rating").css({"--rating": element.node.rating}).attr("aria-label", `Rating of ${element.node.rating} out of 5.`)
                        .end()
                    .removeClass("hide")
            }       
        });
    }


    


    /**
     * builds our product collections
     * the quantity to fetch is related to the complexity of the query
     */ 
    getCollections(){
        let collectionsScheme = this.graphQL.getCategoryByUrl(this.collectionSettings);
        return this.graphQL.get(collectionsScheme);
    }



    // fetches the collection products and each product option
    async initCollectionProducts(){
        await this.getCollections().then((data) => {
            this.collectionsArray = data.site.route.node.products;
        });

        // we have to do this because the graphql API is too complex so we have to make separate calls
        this.getEachProductOption();


        if(!this.collectionSettings.hasOwnProperty("after")){ this.collectionsCntr.innerHTML = ""; }
        
        // if you have a end cursor to paginate and we are still hitting the max number of products to get            
        if(this.collectionsArray.pageInfo.hasOwnProperty("endCursor") && this.collectionsArray.edges.length === this.collectionSettings.qty){
            Object.assign(this.collectionSettings, {
                after: this.collectionsArray.pageInfo.endCursor
            });

            this.initCollectionProducts();

        }else{
            new ProductOptions();
        }
    }



    // fetch options for each of these products
    getEachProductOption(){
        let collectionsProductIds = []

        this.collectionsArray.edges.forEach((element) => {
            collectionsProductIds.push(element.node.entityId);

            // save for later reference
            this.collectionProducts.push(element.node);
        });

        let optScheme = this.graphQL.getProductOptions(collectionsProductIds);
        
        this.graphQL.get(optScheme).then((data) => {
            let theseProductOpts = data.site.products;
            this.parseProductData(theseProductOpts)
        });
    }


    // Combine the fetched product data and Product Options
    parseProductData(prodOptData){
        prodOptData.edges.forEach((element, i) => {
            this.collectionsArray.edges[i].node["productOptions"] = element.node.productOptions.edges;

            // save this option to our global scope
            this.productOptionScope[this.collectionsArray.edges[i].node.entityId] = element.node.productOptions.edges;

            // we are doing this to extract text data from dropdown swatches for price adjustment and UI
            let dropdownIndex = this.collectionsArray.edges[i].node.productOptions.findIndex((element) => element.node.displayStyle === "DropdownList")
            
            if(dropdownIndex !== -1){
                this.collectionsArray.edges[i].node.productOptions[dropdownIndex].node.values.edges.forEach((dropDownElement) => {
                    let dropDownData = TEAK.Utils.parseOptionLabel(dropDownElement.node.label);
                    return Object.assign(dropDownElement.node, dropDownData);
                });
            }

        });

        this.buildCollections();
    }


    // builds the product pod collections UI
    buildCollections(){
        this.collectionsArray.edges.forEach((element) => {
            let tpl = this.graph_tpl.buildCollectionsPod(element.node);
            $(tpl).appendTo(this.collectionsCntr);

            this.initValidator(element);
        
            if(element.node.brand){
                window.TEAK.Modules.toolTip.init({
                    type: "brand",
                    key: element.node.brand.name,
                    id: element.node.brand.name
                });
            }
        });

        // get the product rating from yotpo for each product id
        this.getProductRating(this.collectionsArray);
    }





    // Event based analytics and tracking
    initAnalytics(){
		TEAK.ThirdParty.heap.init({
            method: 'track',
            event: 'plp_collections_view',
            location: 'collections'
        });
    }

    // analytics on ATC
    initATCAnalytics(){    
        // TEAK.Modules.fbPixel.addToCart(this.atcItem.name, this.atcItem.adjustedPrice, this.atcItem.entityId);

        TEAK.Modules.pintrest.addToCart({
            price: this.atcItem.adjustedPrice,
            qty: this.atcItem.qty,
            id: this.atcItem.entityId,
            name: this.atcItem.name,
            categories: document.getElementById("CategoryCollection").dataset.categoryName,
            brand: this.atcItem.brand.name
        });
    }
    

    
    // RV Personalization
    initRecentlyViewed(){
		let $rv = $("#recentlyViewedProducts"),
			recentProducts = this.recentlyViewed.getViewed();

		if (recentProducts) {
			recentProducts.forEach((element) => {
                let tpl = this.recentlyViewed.buildPersonalizationSlider(element);
                
                if(document.querySelector(".product-grid")){
                    $(tpl).appendTo(".product-rv-carousel", $rv);
                }
			});

            $rv.addClass("show");
            
            this.recentlyViewed.initProductSlider({
                dotObj: {appendDots: '.product-rv-carousel'},
                selector: '.product-rv-carousel',
                context: '#recentlyViewedProducts'
            });
		}
    }


    
    


}



