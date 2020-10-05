import GraphQL from '../graphql/GraphQL';
import GraphQL_Swatch_TPL from '../graphql/templates/GraphQL.swatch.tpl';
import utils from '@bigcommerce/stencil-utils';

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
        this.selectedSwatcHTML = null;

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
            },
            features: {
                name: "Feature",
                key: "customFilter",
                target: "filterByFeature",
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

        // show the request-a-swatch button if we have the trigger from the templates on the page
        if( document.getElementById("productOptions") && document.getElementById("productOptions").querySelector("div[show-request-swatch-button]") ){
            document.getElementById("productDetails").querySelector(".product__swatchRequestBtn--pdp").style.display = "flex";
        }
    }



    /** --------------------------------------------
     * Event Listeners and Selector Pre-Cache
     -----------------------------------------------*/

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
            .on("click", "button.drawer__displayFiltersBtn", (e) => { this.toggleFiltersList(e); })
            .on("keyup", "input.drawer__control--input", () => { this.keyWordFilter(); })
            .on("change", "input.swatch-radio", (e) => { this.selectSwatchColor(e); }) // main back to parent interaction
            .on("click", "button.drawer__clearControl", (e) => { this.clearKeyword(e) })
            .on("change", "input.drawer__filterControl", (e) => { this.attributeFilter(e); })
            .on("click", "div.drawer__control--searchIcon", (e) => { this.focusSearch(e); });


        // on page main label swatch Events from Product Utils
        $(window)
            .on("form-field-error-state", (e) => { this.handelSwatchError(e) })
            .on("form-field-success-state", (e) => { this.handelSwatchValid(e) });

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


    
    // on page main label swatch for ATC ~ Collections page and PDP
    handelSwatchValid(e){
        $("#productOptions, #collectionsCntr").find(".product__swatchLabel--error").each(function(){
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

            this.$optionsDrawer
                .find(".drawer__content").css("paddingBottom", 83)
                    .end()
                .find(".drawer__footer").css("position", "absolute");
        }

        this.labelInteract(e);
        this.updateSwatchButton(e, $this);

        // save this so that we can re-use the selection
        this.selectedSwatcHTML = $this;
    }



    // when a swatch is clicked activate the selected UI
    labelInteract(e){
        let $this = $(e.currentTarget),
            label = $this.data("label"),
            swatchImg = $this.siblings(".swatch").find("img").clone();

        label = TEAK.Utils.parseOptionLabel(label.toString());

        this.$optionsDrawer
            .find(".drawer__selectedSwatchText").text(`Selected: ${label.text}${label.priceAdjust ? ", " + label.priceAdjust : ''}`).addClass("show")
                .end()
            .find(".drawer__imgCntr").html(swatchImg)
                .end()
            .find(".drawer__saveBtn").prop("disabled", false);

        e.preventDefault();
    }


    // update the parent or remote swatch
    // feel like this should be a type of directive or seperate module...
    updateSwatchButton(e, $this){
        let that = this,
            labelData = $this.data(),
            inputData =  $(e.currentTarget).data(),
            parsedLabel = TEAK.Utils.parseOptionLabel(labelData.swatchValue.toString());

        let selectedSwatchObj = Object.assign(labelData, inputData, parsedLabel);

        this.$optionTriggerButton
            .find("input:radio")
                .val(selectedSwatchObj.productAttributeValue)
                .prop({ "selected": true, 'checked': true })
                .data( "parsedLabel", selectedSwatchObj.text)
                .attr({ "checked": true, "id": `attribute[${selectedSwatchObj.productAttributeValue}]` })
                    .end()
            .find(".product__swatchValue").addClass("show").text( `${selectedSwatchObj.text} ${selectedSwatchObj.priceAdjust ? ` (${selectedSwatchObj.priceAdjust})` : '' }` )
                .end()
            .find(".product__swatchColor").css("backgroundImage", `https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${selectedSwatchObj.productAttributeValue}.preview.jpg`)
            .find(".product__swatchImg").attr("src", `https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${selectedSwatchObj.productAttributeValue}.preview.jpg`);

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
            .toggleClass("drawer__displayFiltersBtn--open");

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

        this.$optionForm.find("button.drawer__displayFiltersBtn--open").click();
        $(document.body).toggleClass("drawer__freezeBody");
        this.$optionModalSwatches.find(".drawer__contentCntr, .drawer__contentHeading").html("");
        
        this.$optionsDrawer.toggleClass("drawer--close drawer--open")
            .siblings(".drawer__overlay").toggleClass("fadeIn drawer__overlay--hide")
                .end()
            .find(".drawer__selectedSwatchText").html("").removeClass("show")
                .end()
            .find(".drawer__content").css("paddingBottom", 20)
                .end()
            .find(".drawer__footer").css("position", "static");


        if( e.currentTarget.hasAttribute("drawer--open") ){         
            this.optionsProductRefferenceId = this.getProductID(e);
            this.optionSetRefferenceId = parseInt($(e.currentTarget).attr("rel"));

            this.$optionModalSwatches.find(".drawer__imgCntr").find("img").attr("src", productImg)
            this.initOptions();

        }else{
            this.$preloader.removeClass("hide");
            this.$optionModalSwatches.find(".drawer__main").addClass("hide");
            this.$optionsDrawer.find(".drawer__saveBtn").prop("disabled", true);
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

        let hasValues = (this.filter.grade.values.length > 0 || this.filter.brandName.values.length > 0 || this.filter.ships.values.length > 0 || this.filter.features.values.length > 0);

        this.swatchFilterController({ filter: hasValues });
    }



    // on keyup of the input field
    keyWordFilter(){
        this.filterKeyWord = this.$search.val().toLowerCase();

        let hasKeyWords = this.filterKeyWord !== "";

        this.swatchFilterController({filter: hasKeyWords });
        this.$optionForm.find(".drawer__clearControl").toggleClass("hide", !hasKeyWords);
    }


    // if a person clicks the search icon make sure we focus on the search box
    focusSearch(e){
        e.preventDefault();
        this.$search.focus();
    }


    // click on the x button to clear out the input field
    clearKeyword(e){
        this.filterKeyWord = "";
        this.$search.val(this.filterKeyWord).focus();
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
     *  - running through the options array object check to see if any options have:
     *      1) label I typed in has a keyword;
     *      2) if any options have the grade I am looking for;
     *      3) if any options have the Brand I am looking for;
     * 
     * - IF my option has the Keyword I am looking for then show,
     * - IF my option has the Keyword AND the brand then show
     * - IF my option has the keyword AND the brand AND the Grade then show
     * 
     * - WITH this keyword RETURN all the options that HAVE this brand OR this brand AND this grade OR this grade
     * - However, RETURN all options WITH this brand OR this brand AND this grade OR this grade
     * 
     */
    
    swatchFilterController(arg){
        let hasKeywords = this.filterKeyWord !== "",
            hasBrandNames = this.filter.brandName.values.length > 0,
            hasGrades = this.filter.grade.values.length > 0,
            hasShipping = this.filter.ships.values.length > 0,
            hasFeatures = this.filter.features.values.length > 0;

        // reset our temporary containers
        this.filteredKeywords = [];
        this.filteredBrands = [];
        this.filteredGrades = [];
        this.filteredShipping = [];
        this.filteredFeatures = [];


        if(arg.filter){
           
            // filter by keyword only
            if( hasKeywords && !hasBrandNames && !hasGrades && !hasShipping && !hasFeatures ){ 
                this.filterKeyword();
                this.filteredArray = this.filteredKeywords;

            // filer by brand only
            } else if( hasBrandNames && !hasKeywords && !hasGrades && !hasShipping && !hasFeatures ){
                this.filterBrands();
                this.filteredArray = this.filteredBrands;

            // filter by grade only
            } else if( hasGrades && !hasKeywords && !hasBrandNames && !hasShipping && !hasFeatures ){ 
                this.filterGrades();
                this.filteredArray = this.filteredGrades;

            // filter by shipping only
            } else if( hasShipping && !hasGrades && !hasKeywords && !hasBrandNames ){ 
                this.filterShipping();
                this.filteredArray = this.filteredShipping;

            // filter by shipping only
            } else if( hasFeatures && !hasShipping && !hasGrades && !hasKeywords && !hasBrandNames ){ 
                this.filterFeatures();
                this.filteredArray = this.filteredFeatures;
            
             // if we want all options
            }else {
                this.filterKeyword();
                this.filterBrands();
                this.filterGrades();
                this.filterShipping();
                this.filterFeatures();

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

        // get all of the objects that match our initial filters
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

    // filter all option's labels based on this keyword
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

    // filter each option based on custom features
    filterFeatures(){
        this.optionsArray.values.edges.forEach((element) => {           
            this.filter.features.values.forEach((filterElement) => {
                if( filterElement === element.node.ships ){
                    this.filteredShipping.push(element);
                }
            });
        });
    }

    // build the new UI after we have filtered the options
    buildFilteredSwatchList(){
        let labelCntr = $("#optionForm").find(".form-field-control");

        labelCntr.html("");

        if( this.filteredArray.length === 0 ){       
            $("<h3 class='drawer__sorryMessage'>Sorry, but it looks like we don't have any swatches that match your filters.</h3>").appendTo(labelCntr);
            return;
        }
 
        this.filteredArray.forEach((element) => {
            let tpl = this.graph_tpl.getOptionSwatch(element.node, this.filteredArray);
            $(tpl).appendTo(labelCntr);
        });

        // if there is a selected swatch when we filter make sure we show it in the results
        if( this.selectedSwatcHTML ){
            let currentlySelected = $(this.selectedSwatcHTML).attr("for");
            $(`label[for='${currentlySelected}']`, labelCntr).replaceWith(this.selectedSwatcHTML);
        }
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

            // if this option for this product is what we asked for
            if(element.node.entityId === this.optionSetRefferenceId){

                // parse each of the options
                element.node.values.edges.forEach((element) => {
                    let labelObj = TEAK.Utils.parseOptionLabel(element.node.label);
                    this.getFilteredItem(labelObj);
                    return Object.assign(element.node, labelObj);
                });
                
                // this.optionsArray = element.node;
                this.optionsArray = this.filterOutDiscontinued(element.node);


                this.constructSwatch(this.optionsArray);
                this.constructFilterItem();
            }
        });

    }


    // Temp fix - removed discontinued swatches from products
    filterOutDiscontinued(swatch){
        let newSwatch = {...swatch},
            discontinued = [
                'Sunbrella Rain Meadow',
                'Sunbrella Agra Indigo',
                'Sunbrella Fretwork Navy',
                'Sunbrella Idol Stripe Navy',
                'Sunbrella Lila Dove',
                'Sunbrella Lilac',
                'Sunbrella Rochelle Pebble',
                'Sunbrella Terrazzo Cobalt',
                'Sunbrella Toile Meadow White Flowers',
                'Sunbrella Toile White Meadow Flowers',
            ];

        newSwatch.values.edges.forEach((element, index) => {
            if( discontinued.includes(element.node.text) ){
                newSwatch.values.edges.splice(index, 1);
            }
        });

        return newSwatch;
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
                
                if( Array.isArray(optionItem[this.filter[obj].key]) ){
                    optionItem[this.filter[obj].key].forEach((element) => {
                        if( !isInFilterArray(this.filter[obj].items, element) ){
                            this.filter[obj].items.push(element);
                        }
                    });

                }else{
                    this.filter[obj].items.push( optionItem[this.filter[obj].key] );
                }
               
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

        this.$optionForm
            .find(".drawer__displayFiltersBtn, .drawer__controlSet").toggleClass("hide", tracker.length === 0);
               
        this.$optionModalSwatches
            .find(".drawer__contentHeading").text(this.optionsArray.displayName);
    }

}