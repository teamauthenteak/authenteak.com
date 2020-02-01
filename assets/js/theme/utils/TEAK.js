/**
 *  Global Namespace Object { TEAK }
 *  Usage: 
 *      - Primarly used to share data between the View & Model
 *      and other third party modules outside of the application 
 *      scope of app.js and its compilation
 */
window.TEAK = window.TEAK || {};



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
    },


    getStoredCart: function(){
        var storedCart = window.localStorage ? window.localStorage.getItem('cartData') : "";
           
        try{           
            storedCart = JSON.parse(storedCart);
            return storedCart[0];           
        }
        catch(e){}

        return this;
    },


    getCartQnty: function(cart){
        let count = 0;

        if( typeof cart.lineItems === "undefined" ){
            return 0;
        }
    
        cart.lineItems.physicalItems.forEach( function(element){
          count += element.quantity;
        });
    
        return count;
    },


    guid: function() {
		let nav = window.navigator,
			screen = window.screen,
			guid = nav.mimeTypes.length;

		guid += nav.userAgent.replace(/\D+/g, '');
		guid += nav.plugins.length;

		if( !TEAK.Utils.isHandheld ){
			guid += screen.height || '';
			guid += screen.width || '';
		}
		
		guid += screen.pixelDepth || '';

		return guid;
	}

};






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
    google:{
        getUID: function(){
            if(window.localStorage){
                let storedUID = window.localStorage.getItem('TEAK_customerUID'),
                    googleUID = storedUID ? storedUID : TEAK.Utils.guid() + '.authenteak.com';

                window.localStorage.setItem("TEAK_customerUID", googleUID);

                return googleUID;
            }
        }
    },



    heap:{

        /** 
         * Custom tracking events for heap analitics
         * {
         *      method: "",
         *      id: "",
         *      event: "",      add_to_cart, proceed_to_cart
         *      ... other properties
         * }
        */

        init(args){
            if( typeof window.heap === "undefined" ){ return; }

            switch(args.method){

                // custom tracking events
                case 'track':
                    if(args.event === 'orderCompleted'){
                        args = this.buildOrderData();
                    }

                    window.heap.track(args.event, args);
                    break;


                // user identification
                case 'identify':
                    let id = args.id ? args.id : TEAK.Utils.guid();

                    window.heap.identify(`${id}.authenteak.com`);
                    break;


                // adding info to a user profile
                case 'addUser':
                    let storedCart = TEAK.Utils.getStoredCart();

                    if( typeof storedCart.cartAmount !== "undefined" ){
                        args.createdAt = new Date(Date.now());
                        args.purchaseCount = window.TEAK.Utils.getCartQnty(storedCart).toString();
                        args.purchaseTotalValue = storedCart.cartAmount;
    
                        window.heap.addUserProperties(args);
                    }
                   
                    break;
            }

            return this;
        },


        buildOrderData: function(){
            var storedCart = TEAK.Utils.getStoredCart();

            if(typeof storedCart.lineItems !== "undefined"){
                let order = {
                    email: storedCart.email,
                    total: storedCart.cartAmount,
                    order_id: storedCart.id,
                    items: []
                };

                storedCart.lineItems.physicalItems.forEach((element) => {
                    order.items.push({
                        name: element.name.toString(),
                        sku: element.productId.toString(),
                        qty: element.quantity.toString(),
                        price: element.salePrice.toString()
                    });
                });

                return order;
            }
            
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
            let storedCart = TEAK.Utils.getStoredCart();

            if(typeof storedCart.lineItems !== "undefined"){
                this.cartAmount = storedCart.cartAmount;
                this.cartId = storedCart.id;

                storedCart.lineItems.physicalItems.forEach(element => {
                    this.initArray.push(element.productId.toString());       

                    this.haveItemArray.push({
                        sku: element.productId.toString(),
                        qty: element.quantity.toString(),
                        price: element.salePrice.toString()
                    });
                });
            }
            
            return this;
        }
    }
};

TEAK.thirdParty.IntelliSuggest.buildData();

if( window.location.hostname === "localhost" ){
    $(window).on("load", TEAK.thirdParty.IntelliSuggest.fixLinks);
}






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