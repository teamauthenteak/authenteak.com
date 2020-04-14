/**
 *  Global Namespace Object { TEAK }
 *  Usage: 
 *      - Primarly used to share data between the View & Model
 *      and other third party modules outside of the application 
 *      scope of app.js and its compilation
 * 
 *  - Globals
 *  - User
 *  - Data
 *  - GraphQL
 *  - Utils
 *  - Modules
 *  - ThirdParty
 */

window.TEAK = window.TEAK || {};


/** -----------------------------------------------------------------------------------------
 * TEAK Globals Config Model
 * Global Configuration object to hold general settigns and globally used STATIC variables
 * Template rendred dynamic globals are in templates > components > common > TEAK-js.html
 * ------------------------------------------------------------------------------------------ */

window.TEAK.Globals = {
    graphQl_dev: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJlYXQiOjE2MDIyODgwMDAsInN1Yl90eXBlIjoyLCJ0b2tlbl90eXBlIjoxLCJjb3JzIjpbImh0dHA6Ly9sb2NhbC5hdXRoZW50ZWFrLmNvbTozMzAwIl0sImNpZCI6MSwiaWF0IjoxNTg1MjQxNTQ0LCJzdWIiOiJhOTRjM2MzMDk0bzVpdThsdTduYWVpbms2eTUxMTQwIiwic2lkIjo5OTkyMzI0MzIsImlzcyI6IkJDIn0.Lq9Re5VLVYh56F6PXEumWHaWkT_z8UK2bB5dwlXilkGAmQYO0e8gmaW4K2NH23g3GEWszp6FwLi_Cs4vypqnAA",
    carouselSettings: {
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplaySpeed: 4000,
        dots: true,
        speed: 800,
        lazyLoad: "progressive",
        prevArrow: '<span class="carousel-navigation-item previous"><svg class="icon icon-arrow-left"><use xlink:href="#icon-arrow-left" /></svg></span>',
        nextArrow: '<span class="carousel-navigation-item next"><svg class="icon icon-arrow-right"><use xlink:href="#icon-arrow-right" /></svg></span>',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    autoplay: false
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    autoplay: true
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true
                }
            }
        ]
    }
};


/** -------------------------------------------------------
 * TEAK User Config Model
 * User Configuration object to hold global user settings
 * -------------------------------------------------------- */
window.TEAK.User = {};



/** -----------------------------------------
 * TEAK Utility Services
 * Global helper mehtods for any application
 * ------------------------------------------ */
window.TEAK.Utils = {

    graphQL: {
        // get product price
        determinePrice: function(prices){
            if(prices.salePrice !== null){
                if(prices.salePrice.value !== 0){
                    return prices.salePrice.value;

                }else{
                    return  prices.price.value;
                }

            }else{
                return  prices.price.value;
            }
        }
    },



    // parse url paramters
    getParameterByName: function(name, url) {
        if (!url){url = window.location.href;}

        name = name.replace(/[\[\]]/g, '\\$&');

        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);

        if (!results){return null;}
        if (!results[2]){return '';}

        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },


    // test if we are on local hose
    isLocal(){
        return (window.location.hostname === "localhost" || window.location.hostname === "local.authenteak.com");
    },


    // removes extra spaces from a string
    removeSpaces(string){
        return string.replace(/\s/g, '');
    },


    // if we are on a handheld device
    isHandheld: window.matchMedia("only screen and (max-width: 900px)").matches,


    // gets the product json with tool tips from local or script manager
    getProductJSON: function(){
        if( TEAK.Data.ProductData ){
            return TEAK.Data.ProductData;
        }

        TEAK.Data.ProductData = this.getTagData("productTipsJSON");

        return TEAK.Data.ProductData ? TEAK.Data.ProductData : this.getLocalJsonData("/assets/js/theme/product.json");
    },

    
    // gets the main drop down json from local or script manager
    getMenuJSON: function(){
        if( TEAK.Data.MenuData ){
            return TEAK.Data.MenuData;
        }

        TEAK.Data.MenuData = this.getTagData("megaMenuEnhancement");
        
        return TEAK.Data.MenuData ? TEAK.Data.MenuData : this.getLocalJsonData("/assets/js/theme/header.json");
    },



    getTagData: function(id){
        var data;

        if(document.getElementById(id) && !TEAK.Utils.isLocal() ){
            data = document.getElementById(id).innerHTML;
            data = data ? JSON.parse(data) : {};

        }else{
            return false;
        }

        return data;
    },


    getLocalJsonData: function(path){
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
        var storedCart = window.localStorage ? window.localStorage.getItem('cartData') : {};
           
        try{           
            storedCart = JSON.parse(storedCart);

            if(typeof storedCart !== "undefined" && typeof storedCart.lineItems !== "undefined"){
                storedCart[0].cartQty = this.getCartQnty(storedCart[0]);
            }

            return storedCart[0];
        }
        catch(e){}

        return this;
    },


    // formats a number string to local currency format
    formatPrice: function(price){
        return price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    },


    // get cart quantiy from local storage object
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


    // creates a unique guid
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
 * TEAK Data Model
 * Store Model View data for interactions
 * ------------------------------------------ */
window.TEAK.Data = {};





/** -----------------------------------------
 * TEAK GraphQL Service
 * Fetches the BC GraphOL API Endpoint
 * - may move this into app.js - not sure if this is needed externally

window.TEAK.GraphQL = {
    tpl: {
        productInfo: function(arr){
            return `query getProductInfo{
                        site{
                            products(entityIds:[${arr}]){
                                edges{
                                    node{
                                        entityId
                                        name
                                        path
                    
                                        defaultImage {
                                            url(width: 500, height: 500)
                                        }
                                        
                                        prices {
                                            price {
                                                ...PriceFields
                                            }
                                            salePrice {
                                                ...PriceFields
                                            }
                                            retailPrice {
                                                ...PriceFields
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    fragment PriceFields on Money {
                        value
                    }`;
        }
    },

    get: function(queryObj){
        return fetch('https://authenteak.com/graphql', {
                    method: 'POST',
                    credentials: 'include',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${ TEAK.Utils.isLocal() ? TEAK.Globals.graphQl_dev : TEAK.Globals.graphQl }`
                    },
                    body: JSON.stringify({
                        query: queryObj
                    })
                })
                .then(res => res.json())
                .then(res => res.data);
    }    
};
 * ------------------------------------------ */


 



/** -----------------------------------------
 * TEAK Module Services
 * Module Controllers for external scripts
 * ------------------------------------------ */
window.TEAK.Modules = {};



/** -----------------------------------------
 * TEAK 3rd Parties Services
 * Store settigns for 3rd parties
 * ------------------------------------------ */
window.TEAK.ThirdParty = {
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

        load(){
            let HEAP_ENV_ID = !TEAK.Utils.isLocal() ? '702616063' : '753981833';  
            window.heap.load(HEAP_ENV_ID);
        },

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
                    let id = args.id ? args.id + '.authenteak.com' : "";

                    window.heap.identify(id);
                    break;


                // adding info to a user profile
                case 'addUser':
                    let storedCart = TEAK.Utils.getStoredCart();

                    if(typeof storedCart !== "undefined" && typeof storedCart.cartAmount !== "undefined"){
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

            if(typeof storedCart !== "undefined" && typeof storedCart.lineItems !== "undefined"){
                let order = {
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


    Searchspring: {},


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

            if(typeof storedCart !== "undefined" && typeof storedCart.lineItems !== "undefined"){
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

// intellisuggest
TEAK.ThirdParty.IntelliSuggest.buildData();

if( window.location.hostname !== "authenteak.com" ){
    $(window).on("load", TEAK.ThirdParty.IntelliSuggest.fixLinks);
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