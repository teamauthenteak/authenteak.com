/**
 *  Global Namespace Object { TEAK }
 *  Usage: 
 *      - Primarly used to share data between the View & Model
 *      and other third party modules outside of the application 
 *      scope of app.js and its compilation
 */
window.TEAK = window.TEAK || {};


/** -----------------------------------------
 * TEAK Data
 * Store Model View data for interactions
 * ------------------------------------------ */
window.TEAK.Data = {};


/** -----------------------------------------
 * TEAK Modules
 * Module Controllers for external scripts
 * ------------------------------------------ */
window.TEAK.Modules = {};



/** -----------------------------------------
 * TEAK 3rd Parties
 * Store settigns for 3rd parties
 * ------------------------------------------ */
window.TEAK.thirdParty = {
    heap:{
        /** 
         * Custom tracking events for heap analitics
         * {
         *      event: "",      add_to_cart, proceed_to_cart
         *      location: ""       pdp, slideout or modal
         * }
        */
        track: function(args){
            // console.log(args);

            if( typeof window.heap !== "undefined" ){
                heap.track(args.event, {
                    location: args.location
                });
            }

            return this;
        }
    },

    IntelliSuggest:{
        initArray: [],
        haveItemArray: [],
        cartAmount: 0,
        cartId: null,
        siteId: "sm8dxk",

        // doing this becasue search spring refuses to make product links realtive for local dev
        fixLinks: function(){
            document.querySelectorAll("a[intellisuggest]").forEach( (element) => {
                var elementHref = element.getAttribute("href");
                elementHref = elementHref.replace("//authenteak.com", "");
                element.setAttribute("href", elementHref);
            });
        },

        buildData: function(){
            var storedCart = window.localStorage ? window.localStorage.getItem('cartData') : "";
           
            try{           
                storedCart = JSON.parse(storedCart);

                this.cartAmount = storedCart[0].cartAmount;
                this.cartId = storedCart[0].id;

                storedCart[0].lineItems.physicalItems.forEach(element => {
                    this.initArray.push(element.productId.toString());       

                    this.haveItemArray.push({
                        sku: element.productId.toString(),
                        qty: element.quantity.toString(),
                        price: element.salePrice.toString()
                    });
                });
            }
            catch(e){}

            return this;
        }
    }
};

TEAK.thirdParty.IntelliSuggest.buildData();

if( window.location.hostname === "localhost" ){
    $(window).on("load", TEAK.thirdParty.IntelliSuggest.fixLinks);
}



/** -----------------------------------------
 * TEAK Utility Methods
 * Global helper mehtods for any application
 * ------------------------------------------ */
window.TEAK.Utils = {

    removeSpaces(string){
        return string.replace(/\s/g, '');
    },

    isHandheld: window.matchMedia("only screen and (max-width: 900px)").matches,


    getProductJSON: function(){
        if( TEAK.Data.ProductData ){
            return TEAK.Data.ProductData;
        }

        TEAK.Data.ProductData = this.getTagData("productTipsJSON");

        return TEAK.Data.ProductData ? TEAK.Data.ProductData : this.getJsonData("/assets/js/theme/product.json");
    },

    
    getMenuJSON: function(){
        if( TEAK.Data.MenuData ){
            return TEAK.Data.MenuData;
        }

        TEAK.Data.MenuData = this.getTagData("megaMenuEnhancement");
        
        return TEAK.Data.MenuData ? TEAK.Data.MenuData : this.getJsonData("/assets/js/theme/header.json");
    },


    getTagData: function(id){
        var data;

        if(document.getElementById(id) && window.location.hostname !== "localhost"){
            data = document.getElementById(id).innerHTML;
            data = data ? JSON.parse(data) : {};

        }else{
            return false;
        }

        return data;
    },


    getJsonData: function(path){
        let responseData;

        // run it on on our local
        $.ajax({
            dataType: "json",
            url: path,
            async: false,
            success: (res) => { responseData = res; }
        });

        return responseData;
    },


    /**
     * Picks out the cart resonse if its a JSON object and if it has cart.php
     * Saving this to local storage and emmiting an event with the data
     * for anybody to pick up to use in the view
     */
    saveCartResponse: function(response){
        var event, storedData = JSON.stringify(response);

        if( window.localStorage ){
            window.localStorage.setItem('cartData', storedData);
        }
        
        if( typeof window.CustomEvent === 'function' ) {
            event = new CustomEvent('cartDataStored');
            
        }else{
            event = document.createEvent('cartDataStored');
            event.initEvent('submit', true, true);
        }
    
        window.dispatchEvent(event);
        
        return this;
    }

};



/** -----------------------------
 * window.CustomEvent Ployfill
 * needs to be moved to its own file at some point
 ------------------------------- */
(function () {
    if ( typeof window.CustomEvent === "function" ) return false;
  
    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: null };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
     }
  
    window.CustomEvent = CustomEvent;
})();
