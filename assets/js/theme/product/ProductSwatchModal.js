import GraphQL from '../graphql/GraphQL';
import GraphQL_Swatch_TPL from '../graphql/templates/GraphQL.swatch.tpl';
import ProductOptions from '../product/customizations/ProductOptions';
import utils from '@bigcommerce/stencil-utils';
import { concatSeries } from 'async';

/**
 * Product Swatch Modal
 * Module for product swatch modal interactions
 */

export default class ProductSwatchModal {
    constructor(productObj){
        this.graphQL = new GraphQL();
        this.graph_tpl = new GraphQL_Swatch_TPL();

        // we are on the pdp
        if( document.getElementById("productInfo") ){
            this.productInfo = productObj;
        }

        this.fetchedOptionsArray = [];
        this.optionsArray = [];
        this.optionsProductRefferenceId = "";
        this.optionSetRefferenceId = "";
        this.selectedSwatchObj = {};

        // result items to be returned
        this.filteredArray = [];

        this.filter = {
            brandName: {
                name: "Brand",
                key: "brandName",
                target: "filterByBrand",
                items: [],
                values: []
            },
            grade: {
                name: "Grade",
                key: "grade",
                target: "filterByGrade",
                items: [],
                values: []
            },
            ships: {
                name: "Shipping",
                key: "ships",
                target: "filterByShip",
                items: [],
                values: []
            }
        };
        
        this.filterKeyWord = "";
        this.$optionTriggerButton = "";

        this.filteredKeywords = [];
        this.filteredBrands = [];
        this.filteredGrades = [];
        
        this.init();
        this.bindings();
    }



    init(){
        let base = this.graph_tpl.getSwatchDrawer();
        $(base).appendTo(document.body);

        // show the request-a-swatch button if we have the trigger from the tempaltes on the page
        if( document.getElementById("productOptions").querySelector("div[show-request-swatch-button]") ){
            document.getElementById("productDetails").querySelector(".product__swatchRequestBtn--pdp").style.display = "flex";
        }
    }




    bindings(){
        this.$optionModalSwatches = $("#optionModalSwatches");
        this.$preloader = $(".preloader", this.$optionModalSwatches);
        this.$optionsDrawer = $("#optionsDrawer");
        this.$optionForm = $("#optionForm");
        this.$search = $("#drawerSearchInput");
        this.$filterCntr = $("#filterControlCntr");

        $(document.body)
            .on("click", "[drawer--open]", (e) => { this.toggleDrawer(e); })
            .on("click", "[drawer--close]", (e) => { this.toggleDrawer(e); })
            .on("click", ".drawer__overlay", (e) => { this.toggleDrawer(e) })
            .on("click", ".product__swatchLabel", (e) => { this.$optionTriggerButton = $(e.currentTarget); })
            .on("keyup", (e) => { if( e.key === "Escape" ){ this.toggleDrawer(e); } });


        this.$optionForm
            .on("click", "button.drawer__displayType", (e) => { this.toggleSwatchList(e); })
            .on("click", "button.drawer__displayFilters", (e) => { this.toggleFiltersList(e); })
            .on("keyup", "input.drawer__control--input", () => { this.keyWordFilter(); })
            .on("change", "input.swatch-radio", (e) => { this.selectSwatchColor(e); })
            .on("click", ".drawer__clearControl", (e) => { this.clearKeyword(e) })
            .on("change", "input.drawer__filterControl", (e) => { this.attributeFilter(e); });


        // on page main label swatch Events from Product Utils
        window.addEventListener("form-field-error-state", (e) => { this.handelSwatchError(e) });
        window.addEventListener("form-field-success-state", (e) => { this.handelSwatchValid(e) });


        // if we are on the collections page wait until the main optiosn json is setup
        if(document.getElementById("CategoryCollection")){
            window.addEventListener("Collection_Product_Options_Setup", (e) => {
                this.productOptionsModule = new ProductOptions();
            });
        
        }else{
            this.productOptionsModule = new ProductOptions();
        }
    }




    /** --------------------------------------------
     * Add-to-cart Validation Handlers
     -----------------------------------------------*/

    // on page main label swatch for ATC
    handelSwatchError(e){
        this.handelSwatchValid();

        e.detail.forEach((element) => {
            $(element.field.labels[0]).addClass("product__swatchLabel--error");
        });
    }


    
    // on page main label swatch for ATC
    handelSwatchValid(e){
        $("#productOptions").find(".product__swatchLabel--error").each(function(){
            $(this).removeClass("product__swatchLabel--error");
        });
    }



    /** --------------------------------------------
     * Swatch select in Drawer
    -----------------------------------------------*/

    // on click of the actual swatch color make this choice and notify
    selectSwatchColor(e){
        let $this = $(e.currentTarget).parents("label");

        $this.parents(".form-field-control").find("input:checked").prop("checked", false).attr("checked", false);
    
        if ( $this.attr('data-is-selected') && $this.find("input[type=radio]").is(":checked")) {
            $this.find('input[type=radio]').prop('checked', false).attr('checked', false);

        }else{
            $this.attr('data-is-selected', true);
            $this.find('input[type=radio]').prop('checked', true).attr('checked', true);

            this.$optionsDrawer.find(".drawer__footer").removeClass("hide");
        }

        this.labelInteract(e);
        this.updateSwatchButton(e, $this);
    }



    // when a swatch is clicked activate the selected UI
    labelInteract(e){
        let $this = $(e.currentTarget),
            label = $this.data("label"),
            swatchImg = $this.siblings(".swatch").find("img").clone();

        label = this.productOptionsModule.parseOptionLabel(label);

        this.$optionsDrawer.find(".drawer__selectedSwatchText").text(`Selected: ${label.text}${label.priceAdjust ? ", " + label.priceAdjust : ''}`);
        this.$optionsDrawer.find(".drawer__imgCntr").html(swatchImg);

        e.preventDefault();
    }



    // feel like this should be a type of direcite or seperate module...
    updateSwatchButton(e, $this){
        let labelData = $this.data(),
            inputData =  $(e.currentTarget).data(),
            parsedLabel = this.productOptionsModule.parseOptionLabel(labelData.swatchValue);

        this.selectedSwatchObj = Object.assign(labelData, inputData, parsedLabel)

        this.$optionTriggerButton
            .find("input:radio")
                .val(this.selectedSwatchObj.productAttributeValue)
                .prop("selected", true)
                .data("parsedLabel", this.selectedSwatchObj.text)
                .attr({'checked': true, "id": `attribute[${this.selectedSwatchObj.productAttributeValue}]`})
                    .end()
            .find(".product__swatchValue").addClass("show").text(this.selectedSwatchObj.text + (this.selectedSwatchObj.hasOwnProperty("priceAdjust") ? ` (${this.selectedSwatchObj.priceAdjust})` : '') )
                .end()
            .find(".product__swatchColor").css("backgroundImage", `https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${this.selectedSwatchObj.productAttributeValue}.preview.jpg`)
            .find(".product__swatchImg").attr("src", `https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${this.selectedSwatchObj.productAttributeValue}.preview.jpg`)
        
                // .end()
            // needs to be a function that updates price differently if collections page
            // .parents(".product__row").find(".product__priceValue").text(function(){
            //     if(opt.hasOwnProperty("priceAdjust")){
            //         let productPrice = $(this).data("price"),
            //             newTotal = that.calculateAdjustedPrice(productPrice, opt);

            //         $(this).data("price", newTotal);
            //         return TEAK.Utils.formatPrice(newTotal);
            //     }
            // });

            // this triggers a price update on the PDP from ProductUtils.js
            let thisInput =  this.$optionTriggerButton.find("input:radio");
            utils.hooks.emit('product-option-change', null, thisInput);

    }




    /** --------------------------------------------
     * Filter Event Methods
     -----------------------------------------------*/

    // open show filter list with checkbox controls
    toggleFiltersList(e){
        $(e.currentTarget)
            .toggleClass("drawer__displayFilters--open")
            .find(".drawer__displayFilterText")
                .text(function(){
                    return $(this).hasClass("drawer__displayFilters--open") ? "Close Filters" : "Filter Options";
                });

        this.$filterCntr.slideToggle("fast");
        e.preventDefault();
    }


    // toggles the swatch listing view 
    toggleSwatchList(e){
        let $target = $(e.currentTarget);

        $target
            .parents(".drawer__displayList").find(".drawer__displayType--active")
                .prop("disabled", false)
                .removeClass("drawer__displayType--active");
        
        $target
            .prop("disabled", true)
            .addClass("drawer__displayType--active");

        this.$optionForm.find(".form-field-control").toggleClass("drawer__controls--grid drawer__controls--list");

        e.preventDefault();
    }


    // open/close the swatch drawer
    toggleDrawer(e){
        let productImg = this.getProductImg(e);
        e.preventDefault();

        this.$optionForm.find("button.drawer__displayFilters--open").click();
        
        $(document.body).toggleClass("drawer__freezeBody");
        
        this.$optionModalSwatches.find(".drawer__contentCntr, .drawer__contentHeading").html("");
        
        this.$optionsDrawer
            .toggleClass("drawer--close drawer--open")
            .siblings(".drawer__overlay").toggleClass("fadeIn drawer__overlay--hide")
                .end()
            .find(".drawer__selectedSwatchText").html("");


        if( e.currentTarget.hasAttribute("drawer--open") ){         
            this.optionsProductRefferenceId = this.getProductID(e);
            this.optionSetRefferenceId = parseInt($(e.currentTarget).attr("rel"));

            this.$optionModalSwatches.find(".drawer__img").attr("src", productImg)
            this.initOptions();

        }else{
            this.$preloader.removeClass("hide");
            this.$optionModalSwatches.find(".drawer__main").addClass("hide");
            this.$optionsDrawer.find(".drawer__footer").addClass("hide");
        }
    }





    // when the checkboxes are clicked setup the filter
    attributeFilter(e){
        let name = $(e.currentTarget).attr("name"),
            key = $(e.currentTarget).attr("key");

        if( $(e.currentTarget).is(":checked") ){
            this.filter[key].values.push(name);

        }else{
            let index = this.filter[key].values.findIndex((element) => element === name);
            this.filter[key].values.splice(index, 1);
        }

        let hasValues = (this.filter.grade.values.length > 0 || this.filter.brandName.values.length > 0 || this.filter.ships.values.length > 0);

        this.swatchFilterController({filter: hasValues });
    }



    // on keyup of the input field
    keyWordFilter(){
        this.filterKeyWord = this.$search.val().toLowerCase();

        let hasKeyWords = this.filterKeyWord !== "";

        this.swatchFilterController({filter: hasKeyWords });
        this.$optionForm.find(".drawer__clearControl").toggleClass("hide", !hasKeyWords);
    }



    // click on the x button to clear out the imput field
    clearKeyword(e){
        this.$search.val("").focus();
        this.$optionForm.find(".drawer__clearControl").addClass("hide");
        this.swatchFilterController({filter: false });

        e.preventDefault();
    }


    /**
     * Swatch filtering Controller
     * @param {Object} arg.filter - boolean - to filter or to restore to normal
     * 
     * Hierarchy: Keyword > Brand > Grade
     * 
     *  - runing through the options array object check to see if any options have:
     *      1) label I typed in has a keyword;
     *      2) if any options have the grade I am looking for;
     *      3) if any optiosn have the Brand I am looking for;
     * 
     * - IF my option has the Keyword I am looking for then show,
     * - IF my option has the Keyword AND the brand then show
     * - IF my option has the keyword AND the brand AND the Grade then show
     * 
     * - WITH this keyword RETURN all the options that have this brand OR this brand AND this grade OR this grade
     * - RETURN all options WITH this this brand OR this brand AND this grade OR this grade
     * 
     */
    
    swatchFilterController(arg){
        let hasKeywords = this.filterKeyWord !== "",
            hasBrandNames = this.filter.brandName.values.length > 0,
            hasGrades = this.filter.grade.values.length > 0,
            hasShipping = this.filter.ships.values.length > 0;

        // reset our temporary containers
        this.filteredKeywords = [];
        this.filteredBrands = [];
        this.filteredGrades = [];
        this.filteredShipping = [];


        if(arg.filter){
           
            // filter by keyword only
            if( hasKeywords && !hasBrandNames && !hasGrades && !hasShipping ){ 
                this.filterKeyword();
                this.filteredArray = this.filteredKeywords;

            // filer by brand only
            } else if( hasBrandNames && !hasKeywords && !hasGrades && !hasShipping ){
                this.filterBrands();
                this.filteredArray = this.filteredBrands;

            // filter by grade only
            } else if( hasGrades && !hasKeywords && !hasBrandNames && !hasShipping ){ 
                this.filterGrades();
                this.filteredArray = this.filteredGrades;

            // filter by shipping only
            } else if( hasShipping && !hasGrades && !hasKeywords && !hasBrandNames ){ 
                this.filterShipping();
                this.filteredArray = this.filteredShipping;
            
             // if we want all options
            }else {
                this.filterKeyword();
                this.filterBrands();
                this.filterGrades();
                this.filterShipping();

                this.filteredArray = this.filterAll( hasKeywords, hasBrandNames, hasGrades, hasShipping );
            }

        }else{
            this.filteredArray = this.optionsArray.values.edges;
        }

        this.buildFilteredSwatchList();
    }



    // WITH this keyword RETURN all the options that have this brand OR this brand AND this grade OR this grade
    filterAll( hasKeywords, hasBrandNames, hasGrades, hasShipping ){
        let fetchedResults = [];

        // get all of the objects that match our inital filters
        fetchedResults = fetchedResults.concat( 
            hasBrandNames ? this.filteredBrands : [], 
            hasGrades ? this.filteredGrades : [], 
            hasShipping ? this.filteredShipping : [],
            hasKeywords ? this.filteredKeywords : []
        );


        // check for duplicates
        let results = this.duplicateItemCheck(fetchedResults);

        
        // filter our checked results
        results = results.filter((item) => {
            let isIncluded = [];

            // check all of the multi option values
            for ( const obj in this.filter ) {
                let filterKey = this.filter[obj].key;
                
                if( this.filter[obj].values.length > 0 ){
                    isIncluded.push(this.filter[obj].values.includes( item.node[filterKey] ));
                }
            }

            // check for keywords
            if( hasKeywords ){
                let label = item.node.label.toLowerCase();
                isIncluded.push( label.includes(this.filterKeyWord) );
            }
            
            // if this item passes all tests then use it
            return isIncluded.every(testItem => testItem === true);
        });


        return results;
    }

    


    /** --------------------------------------------
     * Helper Filters
     * Pluck out options we want from optionsArray 
     -----------------------------------------------*/

    // filter all option's labels based on this keword
    filterKeyword(){
        this.optionsArray.values.edges.forEach((element) => {
            let label = element.node["label"].toLowerCase();

            if( label.includes(this.filterKeyWord) ){
                this.filteredKeywords.push(element);
            }
        });
    }

    // filter each option base on Brand name
    filterBrands(){
        this.optionsArray.values.edges.forEach((element) => {
            this.filter.brandName.values.forEach((filterElement) => {
                if( filterElement === element.node.brandName ){
                    this.filteredBrands.push(element);
                }
            });
        });
    }

    // filter each option based on Grade
    filterGrades(){
        this.optionsArray.values.edges.forEach((element) => {           
            this.filter.grade.values.forEach((filterElement) => {
                if( filterElement === element.node.grade ){
                    this.filteredGrades.push(element);
                }
            });
        });
    }

    // filter each option based on Shipping
    filterShipping(){
        this.optionsArray.values.edges.forEach((element) => {           
            this.filter.ships.values.forEach((filterElement) => {
                if( filterElement === element.node.ships ){
                    this.filteredShipping.push(element);
                }
            });
        });
    }

    // build the new UI after we have filterd the options
    buildFilteredSwatchList(){
         let labelCntr = this.$optionForm.find(".form-field-control");

         labelCntr.html("");

         if( this.filteredArray.length === 0 ){       
            $("<h3 class='drawer__sorryMessage'>Sorry, but it looks like we don't have any swatches that match your filters.</h3>").appendTo(labelCntr);
            return;
         }
 
         this.filteredArray.forEach((element) => {
             let tpl = this.graph_tpl.getOptionSwatch(element.node, this.filteredArray);
             $(tpl).appendTo(labelCntr);
         });
    }

    // check for duplicates in our fetched array
    duplicateItemCheck(mergedResults){
        let checkedArray = [],
            tmp = {},
            resultsLength = mergedResults.length;
    
        while( resultsLength-- ){
            let item = mergedResults[resultsLength],
                itemID = item.node.entityId;

            if( !tmp[itemID] ){
                checkedArray.unshift(item);
                tmp[itemID] = true;
            }
        }

        return checkedArray;
    }







    // gets the page product id
    getProductID(e){
        let collectionsID = $(e.currentTarget).data("productId"),
            pdpID = this.productInfo ? this.productInfo.product_id : null,
            productID = pdpID ? pdpID : collectionsID;

        return parseInt(productID);
    }


    // gets the product image
    getProductImg(e){
        let collectionsImg = $(e.currentTarget).data("productImg"),
            pdpImg = this.productInfo ? this.productInfo.image : null;

        return pdpImg ? pdpImg : collectionsImg
    }



    // prepare and fetch options
    initOptions(){
        this.getOptions().then((data) => {
            this.fetchedOptionsArray = data.site.products.edges[0].node.productOptions.edges;

             // clear out the filterable items
            for(const obj in this.filter){ this.filter[obj].items = []; }

            // build our new options for this newly fetched group
            this.buildOptions();
        });
    }



    // fetch the options
    getOptions(){
        let optionScheme = this.graphQL.getProductOptions(this.optionsProductRefferenceId);
        return this.graphQL.get(optionScheme);
    }



    // build the options
    buildOptions(){
        this.$preloader.addClass("hide");
        this.$optionModalSwatches.find(".drawer__main").removeClass("hide");


        this.fetchedOptionsArray.forEach((element) => {

            // if this option for this prodcut is what we asked for
            if(element.node.entityId === this.optionSetRefferenceId){

                // parse each of the options
                element.node.values.edges.forEach((element) => {
                    let labelObj = this.productOptionsModule.parseOptionLabel(element.node.label);
                    this.getFilteredItem(labelObj);
                    return Object.assign(element.node, labelObj);
                });
                
                this.optionsArray = element.node;

                this.constructSwatch(this.optionsArray);
                this.constructFilterItem();
            }
        });

    }



    /**
     * Construct each swatch from the passed in swatch array
     * @param {'Array'} swatchArr - passed in swatch array
     */
    constructSwatch(swatchArr){
        let tpl = this.graph_tpl.buildSwatch(swatchArr);
        $(tpl).appendTo(".drawer__contentCntr", this.$optionModalSwatches);
    }



    // plucks out the filterable properties based on this.filter and stores them in our filter array
    getFilteredItem(optionItem){
        // rebuild the items
        for (const obj in this.filter) {
            if( optionItem[this.filter[obj].key] && !isInFilterArray( this.filter[obj].items, optionItem[this.filter[obj].key] ) ){
                this.filter[obj].items.push(optionItem[this.filter[obj].key]);
            }
        }

        function isInFilterArray(filterArray, filterItem){
            return filterArray.some(ArrVal => filterItem === ArrVal);
        }
    }



    // builds the custom filter controls based on what is filterable
    // Need to work on a way to exclude the options filter when we have an option group that doesn require it
    constructFilterItem(){
        let tracker = [];

        this.$filterCntr.html("");

        for(const obj in this.filter){
            if( this.filter[obj].items.length !== 0 ){
                let tpl = this.graph_tpl.buildFilter(this.filter[obj]);

                $(tpl).appendTo(this.$filterCntr);
                tracker.push(this.filter[obj].name);
            }
        }

        this.$optionForm.find(".drawer__displayFilters").toggleClass("hide", tracker.length === 0);
        this.$optionModalSwatches.find(".drawer__contentHeading").text(this.optionsArray.displayName);
    }



}