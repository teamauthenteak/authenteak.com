/**
 *  Global Namespace Object { TEAK }
 *  Usage: 
 *      - Primarily used to share data between the View & Model
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



/** -----------------------------------------
 * TEAK Data Model
 * Store Model View data for interactions
 * ------------------------------------------ */
window.TEAK.Data = {};



/** -------------------------------------------------------
 * TEAK User Config Model
 * User Configuration object to hold global user settings
 * -------------------------------------------------------- */
window.TEAK.User = {};



/** -----------------------------------------------------------------------------------------
 * TEAK Globals Config Model
 * Global Configuration object to hold general settings and globally used STATIC variables
 * Template rendered dynamic globals are in templates > components > common > TEAK-js.html
 * ------------------------------------------------------------------------------------------ */

window.TEAK.Globals = {
    firebase: {
        config: {
            apiKey: "AIzaSyA99IwZolQj97wBxcm2IyYPnm8kxw7KGKA",
            authDomain: "authenteak-b0b4b.firebaseapp.com",
            databaseURL: "https://authenteak-b0b4b.firebaseio.com",
            projectId: "authenteak-b0b4b",
            storageBucket: "authenteak-b0b4b.appspot.com",
            messagingSenderId: "603457517921",
            appId: "1:603457517921:web:aad9da00b949350031ed20"
          }
    },
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



/** -----------------------------------------
 * TEAK Utility Services
 * Global helper methods for any application
 * ------------------------------------------ */
window.TEAK.Utils = {

    // gets the global svg sprite and then appends it to the DOM
    getSvgSprite: function(url){
        $.get(url).then(data => {
            let spriteDiv = document.createElement("div");
            spriteDiv.className = "icons-svg-sprite";
            spriteDiv.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
            document.body.insertBefore(spriteDiv, document.body.childNodes[0]);
        });
    },

    // Converts any string to SHA256 Encryption
    digestMessageSHA256: async function(message) {
        const msgUint8 = new TextEncoder().encode(message);                           
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           
        const hashArray = Array.from(new Uint8Array(hashBuffer));                     
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.toLowerCase();
    },


    // Parses an Option's Label String unto a useable object
    parseOptionLabel: function(label) {
		let data = {},
			additional = [];

		let parts = label.split('--');

		for (var i in parts) {
			let part = parts[i].trim();

			if (i == 0) {

				let grade = part.match(/Grade ([^ ]+)/i);
				if (grade) {
					data.grade = grade[1].toUpperCase();
				}


				let priceAdjust = part.match(/\(([+-]\$[\d.]+)\)/);
				if (priceAdjust) {
					data.priceAdjust = priceAdjust[1];
				}


				let priceAdjustNumeric = part.match(/\(([+-])\$([\d.]+)\)/);
				if (priceAdjustNumeric) {
					data.priceAdjustNumeric = Math.round(Number.parseFloat(priceAdjustNumeric[1] + priceAdjustNumeric[2]) * 100) / 100;
				}

				data.text = part.replace(/Grade [^ ]+ /ig, '').replace(/\([+-][^ ]+/g, '').trim();


				// brand name ~ We're making a bad assumption here but...have too
				let brandName = data.text.split(" ")[0];
				switch(brandName){
					case "Outdura": data.brandName = brandName; break;
					case "Sunbrella": data.brandName = brandName; break;
					case "Bella": data.brandName = brandName + " Dura"; break;
					case "Acrylic": data.brandName = brandName; break;
                    case "Obravia": data.brandName = brandName; break;
                    case "Spuncrylic": data.brandName = brandName; break;
                }


                // Sumbrella Rain Brand
				let sunbrellaRain = data.text.toLowerCase().includes("sunbrella rain");
				if(sunbrellaRain){
					data.brandName = "Sunbrella Rain";
                }

                
                let color = data.text.split(data.brandName);
                if(color){
                    data.color = color.length > 1 ? color[1] : color[0];
                    data.color = data.color.indexOf("-") !== -1 ? data.color.split("-")[0] : data.color;
                }


				// ships by 
				let ships = data.text.split("Ships")[1];
				if(ships){
					data.ships = "Ships " + ships;
                }
                


			} else if (part.match(/^LEAD:/)) {

				let match = part.match(/^LEAD:(\d+)([W|D])/);

				data.leadtime_from = {
					value: Number.parseInt(match[1]),
					unit: match[2].match(/^d$/i) ? 'day' : 'week'
				};

				data.leadtime_weeks_from = data.leadtime_from.unit == 'week' ?
					data.leadtime_from.value :
					data.leadtime_from.value / 5;
				match = part.match(/^LEAD:(\d+)([W|D])(?:-(\d+)([W|D])|)$/);

				if (match && match[3]) {
					data.leadtime_to = {
						value: Number.parseInt(match[3]),
						unit: match[4].match(/^d$/i) ? 'day' : 'week'
					};

					data.leadtime_weeks_to = data.leadtime_to.unit == 'week' ?
						data.leadtime_to.value :
						data.leadtime_to.value / 5;

				} else {

					data.leadtime_to = data.leadtime_from;
					data.leadtime_weeks_to = data.leadtime_weeks_from;
				}

			} else {
                additional.push(part);

                // custom filters
                let customFilter = part.split("-f-");
                if( customFilter ){
                    console.log( customFilter[1].trim().split(" ")[1].split(" ") )

                    data.customFilters = customFilter[1].trim().split(" ")[1].split(" ")
                }
			}
		}

		if (additional.length > 0) {
            data.additional = additional;

           
        }
        
		data.raw = label;

		return data;
    },
    


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


    // test if we are on localhost
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
     * Picks out the cart response if its a JSON object and if it has cart.php
     * Saving this to local storage and emitting an event with the data
     * for anybody to pick up to use in the view
     */
    saveCartResponse: function(response){
        TEAK.Data.cart = response[0];

        TEAK.Utils.storeData("cartData", response, {
            name: "cartDataStored",
            data: response[0]
        });
    
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




    /**
     * Stores any object to LocalStorage and can emit a subsequent event
     * 
     * @param {string} key - storage key (use TEAK_ as the namespace)
     * @param {*} data - data to be stored
     * @param {string} eventArgs.name - event name to emitted
     * @param {object} eventArgs.data - event data to be dispatched 
     */

    storeData: function(key, data, eventArgs){
        let event;

        if( window.localStorage ){
            window.localStorage.setItem(key, JSON.stringify(data));
        }

        if( eventArgs ){
            if( typeof window.CustomEvent === 'function' ) {
                let eventDetail = eventArgs.hasOwnProperty("data") ? { detail: eventArgs.data } : null;

                event = new CustomEvent(eventArgs.name, eventDetail);
                
            }else{
                event = document.createEvent(eventArgs.name);
                event.initEvent('submit', true, true);
            }
    
            window.dispatchEvent(event);
        }
    },



    // formats a number string to local currency format
    formatPrice: function(price){
        return price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    },


    formatDate: function(dateString){
        let dateFormatted = new Date(dateString);
        dateFormatted = dateFormatted.toString().split(" ");
        return `${dateFormatted[1]}. ${dateFormatted[2]}, ${dateFormatted[3]}`;
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

    klaviyo: {
        api_key: "pk_3784e980b946e8c97f81595f193161ec09",
        site_id: "JL4kkS"
    },


    google:{
        getUID: function(){
            if(window.localStorage){
                let storedUID = window.localStorage.getItem('TEAK_customerUID'),
                    googleUID = storedUID ? storedUID : TEAK.Utils.guid() + '.authenteak.com';

                window.TEAK.Utils.storeData("TEAK_customerUID", googleUID);

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
         * Custom tracking events for heap analytics
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

// IntelliSuggest
TEAK.ThirdParty.IntelliSuggest.buildData();

if( window.location.hostname !== "authenteak.com" ){
    $(window).on("load", TEAK.ThirdParty.IntelliSuggest.fixLinks);
}





/** -----------------------------
 * window.CustomEvent Polyfill
 * needs to be moved to its own file at some point
 ------------------------------- */
 (function () {
    if ( typeof window.CustomEvent === "function" ) { return false; }
        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        }
        window.CustomEvent = CustomEvent;
})();