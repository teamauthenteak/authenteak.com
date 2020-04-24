import PageManager from '../PageManager';
import Personalization from './Personalization';
import GraphQL from './graphql/GraphQL';
import GraphQL_Collection_TPL from './graphql/templates/GraphQL.collection.tpl';
import ProductOptions from './product/customizations/ProductOptions';
import ProductSwatchModal from './product/ProductSwatchModal';

export default class Collection extends PageManager {
    constructor() {
        super();

        this.graphQL = new GraphQL();
        this.graph_tpl = new GraphQL_Collection_TPL();

        new ProductSwatchModal();

        this.$atc = $("form#collectionsATC");

        // options
        let optid = TEAK.Utils.getParameterByName("optid");
        this.optionsRefferenceId = optid ? optid : 2851;        // product used as the option anchor for the page

        this.productOptionsCntr = document.getElementById("productOptions");
        this.requestSwatchCntr = document.getElementById("swatchpopuplist").querySelector(".swatchModal__list");

        this.optionsArray = [];                                 // temporary array for fetched options
        this.productOptionScope = {};                           // stores all product option objects with product ID key
        this.currentSelection = {};                             // saves the currently selected option
        
        // products
        this.collectionsCntr = document.getElementById("collectionsCntr");

        this.collectionsArray = [];                             // temporary array all fetched products
        this.collectionsProductIds = [];                        // stores all product ids for fetching of their options
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
        $(this.$atc)
            .on("change", "input[type='radio']", (e) => { this.trackOptionRadioChange(e); });

        
        $(document.body)
            .on("change", "select.product__swatchSelect", (e) => { this.trackOptionDropdownChange(e); })
            .on("click", "[button-atc]", (e) => {})
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
            
            this.buildOptions();
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


        this.setOptionsJSON();
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
        }  
    }



    // fetch options for each of these products
    getEachProductOption(){
        let collectionsProductIds = []

        this.collectionsArray.edges.forEach((element) => {
            collectionsProductIds.push(element.node.entityId);
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



