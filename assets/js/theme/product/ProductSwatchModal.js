import GraphQL from '../graphql/GraphQL';
import GraphQL_Swatch_TPL from '../graphql/templates/GraphQL.swatch.tpl';
import ProductOptions from '../product/customizations/ProductOptions';

/**
 * Product Swatch Modal
 * Module for product swatch modal interactions
 */

export default class ProductSwatchModal {
    constructor(){
        this.graphQL = new GraphQL();
        this.graph_tpl = new GraphQL_Swatch_TPL();

        this.fetchedOptionsArray = [];
        this.optionsArray = [];
        this.optionsProductRefferenceId = "";
        this.optionSetRefferenceId = "";

        this.filter = {
            grade: {
                name: "Grade",
                key: "grade",
                items: [],
                target: "filterByGrade",
                values: []
            },
            brandName: {
                name: "Brand",
                key: "brandName",
                items: [],
                target: "filterByBrand",
                values: []
            }
        };

        this.filterKeyWord = "";

        this.$optionModalSwatches = $("#optionModalSwatches");
        this.$preloader = $(".preloader", this.$optionModalSwatches);
        this.$optionsDrawer = $("#optionsDrawer");
        this.$optionForm = $("#optionForm");
        this.$search = $("#drawerSearchInput");
        this.$filterCntr = $("#filterControlCntr");

        this.bindings();
    }



    init(){
        let base = this.graph_tpl.getSwatchDrawer();
        $(base).appendTo(document.body);
    }




    bindings(){
        $(document.body)
            .on("click", "[drawer--open]", (e) => { this.toggleDrawer(e); })
            .on("click", "[drawer--close]", (e) => { this.toggleDrawer(e); })
            .on("click", ".drawer__overlay", (e) => { this.toggleDrawer(e) })
            .on("keyup", (e) => { if( e.key === "Escape" ){ this.toggleDrawer(e) } });


        this.$optionForm
            .on("click", "button.drawer__displayType", (e) => { this.toggleSwatchList(e); })
            .on("click", "button.drawer__displayFilters", (e) => { this.toggleFiltersList(e); })
            .on("keyup", "input.drawer__control--input", (e) => { this.keyWordFilter(e); })
            .on("change", "input.swatch-radio", (e) => { this.labelInteract(e); })
            .on("click", ".drawer__clearControl", (e) => { this.clearKeyword(e) })
            .on("change", "input.drawer__filterControl", (e) => { this.attributeFilter(e); });


        // if we are on the collections page wait until the main optiosn json is setup
        if(document.getElementById("CategoryCollection")){
            window.addEventListener("Collection_Product_Options_Setup", () => {
                this.productOptionsModule = new ProductOptions();
            });
        
        }else{
            this.productOptionsModule = new ProductOptions();
        }
    }


    // when a swatch is clicked activate the selected UI
    labelInteract(e){
        let $this = $(e.currentTarget),
            label = $this.data("label");

        label = this.productOptionsModule.parseOptionLabel(label);

        this.$optionForm.find(".drawer__selectedSwatchText").text(`Selected: ${label.text}${label.priceAdjust ? ", " + label.priceAdjust : ''}`);
        
        e.preventDefault();
    }




    // when the checkboxes are clicked setup the filter
    attributeFilter(e){
        let name = $(e.currentTarget).attr("name"), key = $(e.currentTarget).attr("key");

        if( $(e.currentTarget).is(":checked") ){
            this.filter[key].values.push(name);
            this.swatchFilter({filter: true});

        }else{
            let index = this.filter[key].values.findIndex((element) => element === name);
            
            this.filter[key].values.splice(index, 1);
            this.swatchFilter({filter: false});
        }

        e.preventDefault();
    }



    // on keyup of the input field
    keyWordFilter(e){
        this.filterKeyWord = this.$search.val().toLowerCase();

        let hasKeyWords = this.filterKeyWord !== "";

        this.swatchFilter({filter: hasKeyWords });
        this.$optionForm.find(".drawer__clearControl").toggleClass("hide", !hasKeyWords);

        e.preventDefault();
    }



    // click on the x button to clear out the imput field
    clearKeyword(e){
        this.$search.val("").focus();
        this.$optionForm.find(".drawer__clearControl").addClass("hide");
        this.swatchFilter({filter: false });

        e.preventDefault();
    }



    // Swatch filtering based on conrol inputs
    swatchFilter(arg){
        let filterArray = [];

        if(arg.filter){
            this.optionsArray.values.edges.forEach((element) => {
                let label = element.node["label"].toLowerCase();

                if( this.filterKeyWord !== "" && label.includes(this.filterKeyWord) ){
                    filterArray.push(element);
                }


                for (const obj in this.filter) {
                    let filterKey = this.filter[obj].key;

                    if( this.filter[obj].values.length !== 0 ){

                        this.filter[obj].values.forEach((filterElement) => {
                            if( element.node.hasOwnProperty(filterKey) ){
                                if( filterElement === element.node[filterKey] ){
                                    filterArray.push(element);
                                }
                            }
                        });
                    }
                }
            });

        }else{
            filterArray = this.optionsArray.values.edges.concat([]);
        }
            
  
        this.buildFilteredSwatchList(filterArray);
    }



    // build the ui after we have filterd the data
    buildFilteredSwatchList(filterArray){
         let labelCntr = this.$optionModalSwatches.find(".form-field-control");

         labelCntr.html("");
 
         filterArray.forEach((element) => {
             let tpl = this.graph_tpl.getOptionSwatch(element.node, filterArray);
             $(tpl).appendTo(labelCntr);
         });
    }



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
        this.$optionForm.find("button.drawer__displayFilters--open").click();

        this.$optionsDrawer
            .toggleClass("drawer--close drawer--open")
            .siblings(".drawer__overlay").toggleClass("fadeIn drawer__overlay--hide");


        if( e.currentTarget.hasAttribute("drawer--open") ){            
            this.optionsProductRefferenceId = parseInt($(e.currentTarget).data("productId"));
            this.optionSetRefferenceId = parseInt($(e.currentTarget).attr("rel"));

            this.$optionModalSwatches
                .find(".drawer__img").attr("src", $(e.currentTarget).data("productImg"))
                    .end()
                .find(".drawer__contentCntr, .drawer__contentHeading").html("");

            this.initOptions();

        }else{
            this.$preloader.removeClass("hide");
            this.$optionModalSwatches.find(".drawer__main").addClass("hide");
        }

        e.preventDefault();
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

                this.$optionModalSwatches.find(".drawer__contentHeading").text(this.optionsArray.displayName);
            }
        });

    }



    /**
     * Construct each swath from the passed in swatch array
     * @param {'Array'} swatchArr - passed in swatch array
     */
    constructSwatch(swatchArr){
        let tpl = this.graph_tpl.buildSwatch(swatchArr);
        $(tpl).appendTo(".drawer__contentCntr", this.$optionModalSwatches);
    }



    // plucks out the filterable properties and stores them in our filter array
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

    }



}