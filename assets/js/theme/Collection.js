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


export default class Collection extends PageManager {
    constructor() {
        super();

        this.graphQL = new GraphQL();
        this.graph_tpl = new GraphQL_Collection_TPL();

        new ProductSwatchModal();

        new AddToCartModal();

        // options
        let optid = TEAK.Utils.getParameterByName("optid");
        this.optionsRefferenceId = optid ? optid : 2851;        // product used as the option anchor for the page

        this.productOptionsCntr = document.getElementById("productOptions");
        this.requestSwatchCntr = document.getElementById("swatchpopuplist").querySelector(".swatchModal__list");

        this.optionsArray = [];                                 // temporary array for fetched options
        this.productOptionScope = {};                           // stores all product option objects with product ID key
        this.currentSelection = {};                             // saves the currently selected option
        this.atcItem = "";

        // products
        this.collectionsCntr = document.getElementById("collectionsCntr");

        this.collectionsArray = [];                             // temporary array all fetched products
        this.collectionProducts = [];                        // stores all product ids for fetching of their options
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
            .on("change", "input[type='radio']", (e) => { this.trackOptionRadioChange(e); })
            .on("submit", "form.add-to-cart-form", (e) => { e.preventDefault() });

        $(document.body)
            .on("change", "select.product__swatchSelect", (e) => { this.trackOptionDropdownChange(e); })
            .on("click", "[button-atc]", (e) => { this.atcSubmit(e); });

        $(window)
            .on("cartDataStored", (e) => { this.handelATCModal(e.detail); })
            .on("form-field-error-state", (e) => { 
                this.handelSubmitState(e);
            })
            .on("form-field-success-state", (e) => { 
                this.handelSubmitState(e);
            });
       

        this.onProductOptionChange();
    }



    atcSubmit(e){
        let $target = $(e.currentTarget);
        $target.parents("form").submit();
    }



    handelSubmitState(e){
        let $target, $targtBtn, isShown;

        if( e.type === "form-field-error-state" ){
            $target = $(e.detail[0].field);
            $targtBtn = $target.parents("form").find(".product__atcCollectionBtn");
            isShown = false;

        }else if( e.type === "form-field-success-state" ){
            console.log(e)
            isShown = true;
            this.atcCollectionItem(e, $target);
        }

        this.toggleATCButton($targtBtn, isShown);
    }



    atcCollectionItem($target){
        if (window.FormData === undefined) { return; }

        this.toggleATCButton($target, true);

        let form = $target.parents("form")[0];
        let formData = new FormData(form);

        utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(formData), (err, response) => {
            if (response.status === 'success') {
                $.event.trigger({
                    type: 'cart-item-add-success',
                    data: {}
                });
            }
        });

        // setup this product to show the atc modal
        let atcItem = $target.parents("form").attr('id').split("_")[1];
        atcItem = parseInt(atcItem);

        this.atcItem = this.collectionProducts.find(element => element.entityId === atcItem);
    }



    initValidator(context){
        let formElement = `collection_${context.node.entityId}`,
            formContext = [];
        
        context.node.productOptions.forEach((element) => {
            formContext.push({
                name: `attribute[${element.node.entityId}]`,
                rules: element.node.isRequired ? "required" : ""
            });
        });

        // console.log(formContext)

        this.Validator = new FormValidator(formElement, formContext);

        this.Validator.initSingle(
            $(`form[name=${formElement}]`), {
            
                onValid: (e) => {
                    // console.log("success " + e)
                    let event = new CustomEvent("form-field-success-state", {detail: this});
                    window.dispatchEvent(event);
                },
            
                onError: function(e) {
                    // console.log(e)

                    // let $firstError = $(e.target).find('.product__swatchLabel--error').first();
            
                    // notify other apps of the form field error for specific ui updates
                    let invalidFields = this.getInvalidFields();
                    let event = new CustomEvent("form-field-error-state", {detail: invalidFields});
                    window.dispatchEvent(event);
            
            
                    // if ('scrollBehavior' in document.documentElement.style) {
                    //     window.scroll({
                    //         top: $firstError.offset().top - 112,
                    //         left: 0,
                    //         behavior: 'smooth'
                    //     });
            
                    // } else {
                    //     window.scroll(0, $firstError.offset().top - 200);
                    // }
        
                }
            }
        );
    }


    toggleATCButton($target, showAction){        
        $target
            .find(".product__atcCollectionBtnText").toggleClass("hide", showAction)
                .end()
            .find(".icon-spinner").toggleClass("hide", !showAction);
    }



    handelATCModal(cartDetail){
        console.log(this.atcItem)

        let tpl = this.graph_tpl.getAtcModalContent(this.atcItem, cartDetail);

        $("#modalCartCntr").html(tpl);
        $('.modal-cart').addClass('is-open');

        this.toggleATCButton( $(`#collection_${this.atcItem.entityId}`), false );
    }




    onProductOptionChange(){

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


        utils.hooks.on('product-option-change', (event, changedOption) => {
            let $changedOption = $(changedOption);
            let $form = $changedOption.parents('form');
            let $productid = $form.find("[name='product_id']").val();

            utils.api.productAttributes.optionChange($productid, $form.serialize(), (err, response) => {
                const viewModel = getViewModel($form);
                const data = response ? response.data : {};
      
              // If our form data doesn't include the product-options-count with a positive value, return
            //   if (this.$el.find('[data-product-options-count]').val < 1) {
            //     return;
            //   }
      
            //   this._updateAttributes(data);
      
              // Apply quantity changes
            //   let qty = Number.parseInt($('.product-quantity').val());
              let qty = 1;

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
      
              console.log(data)
      
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
                // const priceStrings = {
                //   price: data.price,
                //   excludingTax: "(exc tax)",
                // };

                $form.find(".product__priceValue")
                    .data("price", data.price.without_tax.value).text(data.price.without_tax.formatted);
      
                // viewModel.$price.html(productViewTemplates.priceWithoutTaxTemplate(priceStrings));
                // console.log('updating!');
                // console.log(this);
                // console.log(priceStrings);
                // console.log(data.price);
              }
      
              if (viewModel.$priceWithTax.length) {
                // const priceStrings = {
                //   price: data.price,
                //   includingTax: this.context.productIncludingTax,
                // };

                $form.find(".product__priceValue")
                    .data("price", data.price.with_tax.value).text(data.price.with_tax.formatted);

                // viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
              }
      
            //   if (viewModel.$saved.length) {
            //     const priceStrings = {
            //       price: data.price,
            //       savedString: this.context.productYouSave,
            //     };
            //     viewModel.$saved.html(this.options.priceSavedTemplate(priceStrings));
            //   }
      
              // stock
            //   if (data.stock) {
            //     viewModel.stock.$selector.removeClass('product-details-hidden');
            //     viewModel.stock.$level.text(data.stock);
            //   } else {
            //     viewModel.stock.$level.text('0');
            //   }
      
              // update sku if exists
            //   if (viewModel.$sku.length) {
            //     viewModel.$sku.html(data.sku);
            //   }
      
              // update testBit if exists
            //   if (viewModel.$testBit.length) {
            //     viewModel.$testBit.html("-----");
            //   }
      
              // update free shipping if exists
            //   if (viewModel.$freeShip.length) {
            //     viewModel.$testBit.html("Free Shipping");
            //   }
      
              // update weight if exists
            //   if (data.weight && viewModel.$weight.length) {
            //     viewModel.$weight.html(data.weight.formatted);
            //   }
      
              // handle product variant image if exists
            //   if (data.image) {
            //     const productImageUrl = utils.tools.image.getSrc(
            //       data.image.data,
            //       this.context.themeImageSizes.zoom
            //     );
            //     const zoomImageUrl = utils.tools.image.getSrc(
            //       data.image.data,
            //       this.context.themeImageSizes.product
            //     );
      
            //     // to maintain a reference between option images, pull out the
            //     // filename from the image URL and use it as an ID
            //     const imageId = data.image.data.replace(/^.*[\\\/]/, '');
      
            //     this.callbacks.switchImage(productImageUrl, zoomImageUrl, data.image.alt, imageId);
            //   }
      
              // update submit button state
            //   if (!data.purchasable || !data.instock) {
            //     if (data.purchasing_message && showMessage) {
            //       if ($('.modal-quick-shop').length) {
            //         this.productAlerts.error(data.purchasing_message, true);
            //       } else {
            //         setTimeout(() => {
            //           this.pageAlerts.error(data.purchasing_message, true);
            //         }, 50);
            //       }
            //     }
      
            //     viewModel.$addToCart
            //       .addClass(this.buttonDisabledClass)
            //       .prop('disabled', true);
            //   } else {
            //     viewModel.$addToCart
            //       .removeClass(this.buttonDisabledClass)
            //       .prop('disabled', false);
            //   }


            });
          });
    }




    /**
  * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
  * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
  * @param formData: FormData object
  * @returns FormData object
  */
  filterEmptyFilesFromForm(formData) {
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




    calculateAdjustedPrice(productPrice, optionObj){
        let newPrice; //optid = optionObj[additional[0]];

        // if the selected optoin has a price adjustmetn and its NOT currently active
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



    trackOptionDropdownChange(e){
        let selectObj = {},
            that = this;
        
        selectObj["name"] = $(e.currentTarget).attr("name");
        selectObj["value"] = $(e.currentTarget).val();

        Object.assign(selectObj, TEAK.Utils.parseOptionLabel(e.currentTarget.selectedOptions[0].label));

        $(e.currentTarget)
            .parents(".product__row").find(".product__priceValue").text(function(){
                let productPrice = $(this).data("price"), 
                    newTotal = that.calculateAdjustedPrice(productPrice, selectObj);

                $(this).data("price", newTotal);
                return TEAK.Utils.formatPrice(newTotal);
            });

        utils.hooks.emit('product-option-change');
    }



    // udpates each product in the collection with a top swatch is clicked
    trackOptionRadioChange(e){
        let  that = this, radioObj = $(e.currentTarget).data();       

        // find all of the coresponding products options with this same option title
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

            // $(this).parents(".product__swatchItem").find(".product__clearSwatch").removeClass("hide");
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
            this.productOptionsCntr.innerHTML = "";

            // this.buildOptions();
            this.setOptionsJSON();
        });
    }


    // build the options
    buildOptions(){
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



    // notifys other modules that the options module JSON is ready - for collections / non PDP pages
    triggerOptionModuleSetup(){
        let event = new Event("Collection_Product_Options_Setup");
        window.dispatchEvent(event);
    }







    /**
     * builds our product collections
     */ 

    // the quantaty to fetch is related toe the complexity of the query
    getCollections(){
        let collectionsScheme = this.graphQL.getCategoryByUrl(this.collectionSettings);
        return this.graphQL.get(collectionsScheme);
    }



    // fetches the collection products and each product option
    async initCollectionProducts(){
        await this.getCollections().then((data) => {
            this.collectionsArray = data.site.route.node.products;
        });

        // we have to do this becasue the graphql API is too complex so we have to make seperate calls
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


    // Combine the fetched product data and Prodcut Options
    parseProductData(prodOptData){
        prodOptData.edges.forEach((element, i) => {
            this.collectionsArray.edges[i].node["productOptions"] = element.node.productOptions.edges;

            // save this option to our global scope
            this.productOptionScope[this.collectionsArray.edges[i].node.entityId] = element.node.productOptions.edges;

            // we are doing this to extract text data from dropdown swatches for price adjustmetn and UI
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
        });   
    }





    // Event based analytics and tracking
    initAnalytics(){
		TEAK.ThirdParty.heap.init({
            method: 'track',
            event: 'plp_collections_view',
            location: 'collections'
        });

        // $(document.body).on("click", function(){
        //     let qty = document.querySelector(".product-quantity").value,
        //         price = document.querySelector(".product__priceValue").innerText.trim().replace(/\$|,/g, '');
    
        //     TEAK.Modules.fbPixel.addToCart("{{product.title}}", price, "{{product.id}}");
    
        //     TEAK.Modules.pintrest.addToCart({
        //         price: price,
        //         qty: qty,
        //         id: "{{product.id}}",
        //         name: "{{product.title}}",
        //         brand: "{{product.brand.name}}",
        //         categories: ["{{product.category}}"]
        //     });
        // });
        
    }
    

    
    // RV Persaonlization
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



