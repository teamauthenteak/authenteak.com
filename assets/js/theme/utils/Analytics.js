/* ------------------------
    Google Tracking & Analytics


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    
var TEAK_UID = function(){if(window.localStorage){let e=window.localStorage.getItem("TEAK_customerUID"),t=e||function(){let e=window.navigator,t=window.screen,n=e.mimeTypes.length;n+=e.userAgent.replace(/\D+/g,""),n+=e.plugins.length,window.matchMedia("only screen and (max-width: 900px)").matches||(n+=t.height||"",n+=t.width||"");return n+=t.pixelDepth||""}()+".authenteak.com";return  window.localStorage.setItem("TEAK_customerUID",t) ,t}}();

ga('create', 'UA-22800200-2', 'authenteak.com', { userId: TEAK_UID });
ga('send', 'pageview');
ga('require', 'ecommerce', 'ecommerce.js');
ga('require', 'GTM-MPRRXR6');

function trackEcommerce() {
    this._addTrans = addTrans;
    this._addItem = addItems;
    this._trackTrans = trackTrans;
}

function addTrans(orderID,store,total,tax,shipping,city,state,country) {
    ga('ecommerce:addTransaction', {
        'id': orderID,
        'affiliation': store,
        'revenue': total,
        'tax': tax,
        'shipping': shipping,
        'city': city,
        'state': state,
        'country': country
    });
}

function addItems(orderID,sku,product,variation,price,qty) {
    ga('ecommerce:addItem', {
        'id': orderID,
        'sku': sku,
        'name': product,
        'category': variation,
        'price': price,
        'quantity': qty
    });
}


function trackTrans() {
    ga('ecommerce:send');
}

var pageTracker = new trackEcommerce();



/* ------------------------
 Google Tag Manager Analytics
--------------------------- 
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-PXMD6Q');


/* ------------------------
 Bing Analytics
--------------------------- 
(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"4073793"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
--------------------------- */


/* ------------------------
 Facebook Pixel
--------------------------- */
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    
fbq('set', 'autoConfig', 'false', '139262066429295');
fbq('init', '139262066429295');
fbq('set', 'agent', 'plbigcommerce1.2', '139262066429295');

window.addEventListener("load", function(){
    let m,
        productIdMap = {},
        productIdsOnPage = getUniqueProductIdsOnPage(),
        urlParams = decodeURIComponent(window.location.search);
    
    fbq('track', 'PageView');

    TEAK.Modules = TEAK.hasOwnProperty("Modules") ? TEAK.Modules : {};

    TEAK.Modules.fbPixel = {

        // checkout start for bolt or any dynamic button
        checkoutStart: function(total, qty){
            fbq('track', 'InitiateCheckout', {
                content_ids: productIdsOnPage,
                content_type: "product",
                num_items: qty,
                value: total
            });
        },

        // Dynamic add to cart
        addToCart: function(productName, price, sku){
            fbq('track', 'AddToCart', {
                content_name: productName,
                content_ids: [sku],
                content_type: 'product',
                value: price,
                currency: 'USD'
            });
        }
    };


    // Search events start -- only fire if the shopper lands on the /search.php page
    if (window.location.pathname.indexOf('/search.php') !== -1) {
        if ( urlParams.indexOf("search_query") !== -1) {
            m = getUrlParameter("search_query");
            fbq('track', 'Search', { content_ids: productIdsOnPage, content_type: 'product_group', search_string: m });
        }
    }

    // Wishlist events start -- only fire if the shopper attempts to add an item to their wishlist
    if (window.location.pathname.indexOf('/wishlist.php') !== -1 && ( m = /added_product_id=(.\d)/.exec(urlParams)) !== null) {
        fbq('track', 'AddToWishlist', { content_ids: [m[1]], content_type: 'product_group' });
    }

    // Lead events start -- only fire if the shopper subscribes to newsletter
    if (window.location.pathname.indexOf('/subscribe.php') !== -1 && (m = getUrlParameter("result") === "success") ) {
        fbq('track', 'Lead', {});
    }

    // Registration events start -- only fire if the shopper registers an account
    if (window.location.pathname.indexOf('/login.php') !== -1 && (m = getUrlParameter("action") === "account_created") ) {
        fbq('track', 'CompleteRegistration', {});
    }

    // NON Bolt Version: Checkout events start -- only fire if the shopper lands on a /checkout* page
    // Bolt verstion tracking is in totals.html
    if(window.location.pathname.indexOf('/checkout') !== -1) {
        if (urlParams.indexOf('process_payment') !== -1) {
            fbq('track', 'AddPaymentInfo');
        } else {
            fbq('track', 'InitiateCheckout');
        }
    }

    function getUniqueProductIdsOnPage() {
        return Array.prototype.reduce.call(document.querySelectorAll('[data-product], [data-product-id]'), function(acc, obj) {
            let productId = obj.getAttribute('data-product') || obj.getAttribute('data-product-id');
            
            // check to see if we already picked up this product id AND if its a non alphanumeric (integer) string
            if (!productIdMap[productId] && (/^[0-9]+$/i.test(productId)) ) {
                productIdMap[productId] = true;
                productId = parseInt(productId);
                acc.push(productId);
            }
            return acc;
        }, []);
    }

    // helper to get URL parameters
    function getUrlParameter(name) {
        let regex, results;
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

});





/* ------------------------
 Pinterest Tag Analytics
--------------------------- */
!function(e){
    if(!window.pintrk){
        window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))
        };

        let n = window.pintrk;n.queue=[], n.version = "3.0";
        let t = document.createElement("script"); t.async =! 0, t.src = e;
        let r = document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r);
    }
}("https://s.pinimg.com/ct/core.js");

pintrk('load', '2615666729486');
pintrk('page');
pintrk('track', 'pagevisit');

window.addEventListener("load", function(){
    TEAK.Modules = TEAK.hasOwnProperty("Modules") ? TEAK.Modules : {};

    TEAK.Modules.pintrest = {
        cart: null,

        addToCart: function(args){
            let pinObj = {
                    value: parseInt(args.price),
                    order_quantity: args.qty,
                    order_id: "",
                    currency: 'USD',
                    line_items: [
                        {
                            product_name: args.name,
                            product_id: args.id,
                            product_category: args.categories,
                            product_brand: args.brand
                        }
                    ]
                };

            
            $(window).on("cartDataStored", function(){
                TEAK.Modules.pintrest.getCart();
                
                try{
                    pinObj.order_id = TEAK.Modules.pintrest.cart.id;
                }catch(e){}
                
                window.pintrk('track', 'addtocart', pinObj);
            });
           
        },

        checkOut: function(qty){
            if( this.cart !== null ){
                let pinObj = {
                    value: this.cart.cartAmount,
                    order_quantity: qty,
                    currency: 'USD',
                    order_id: this.cart.id,
                    line_items: []
                };

                this.cart.lineItems.physicalItems.forEach(function(element){
                    pinObj.line_items.push({
                        product_name: element.name,
                        product_id: element.productId,
                        product_brand: element.brand,
                        product_price: element.extendedSalePrice,
                        product_quantity: element.quantity
                    });
                });

                window.pintrk('track', 'checkout', pinObj);
            }
        },


        getCart: function(){
            if( window.localStorage ){
                this.cart = TEAK.Utils.getStoredCart();

                try{
                    this.cart = JSON.parse(this.cart);
                    this.cart = this.cart[0];

                }catch(e){}
                
            }

            return this;
        }
    };

    TEAK.Modules.pintrest.getCart();
});



/* ------------------------
 HEAP Analytics
--------------------------- */
(function(window, document){
    window.heap = window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
    const TEAK_HEAP_ENV_ID = (window.location.hostname !== "localhost" || window.location.hostname !== "local.authenteak.com") ? '702616063' : '753981833';  
    window.heap.load(TEAK_HEAP_ENV_ID);
}(window, document));


/* ------------------------
 Klaviyo Analytics
--------------------------- */
var _learnq = _learnq || [];

_learnq.push(['account', 'JL4kkS']);

(function() {
    let b = document.createElement('script');
    b.async = true;
    b.src = '//a.klaviyo.com/media/js/analytics/analytics.js';
    let a = document.getElementsByTagName('script')[0];
    a.parentNode.insertBefore(b, a);
})();

window.addEventListener("load", function(){

    function identifyKlaviyoEmail(klaviyo_email) {
        if (klaviyo_email !== "" && (klaviyo_email.indexOf('@') !== -1 && klaviyo_email.indexOf('.') !== -1)) {
            _learnq.push(['identify', {
                $email: klaviyo_email
            }]);
            return true
        }
    }

    function getDataSendToKlaviyo() {
        let itemList = document.querySelectorAll('.productList-item');
        let itemNames = [];
        let allItems = [];
        let totalPrice = document.querySelector('.cart-priceItem-value span').innerHTML;

        itemList.forEach((item, i) => {
            let itemString = item.querySelector('.product-title').innerHTML;
            let itemQuantity = itemString.charAt(0);
            let itemName = itemString.split('x ')[1].toString();
            let itemPrice = item.querySelector('.product-price').innerHTML;
            let itemImage = item.querySelector('.product-column img').src;

            itemNames[i] = itemName;

            allItems[i] = {
                'Name': itemName,
                'Price': itemPrice,
                "ImageURL": itemImage,
                "Quantity": itemQuantity
            }
        });

        let k_checkout_url = window.location.href;
            
        _learnq.push(['track', 'Checkout Started', {
            "value": totalPrice,
            "itemNames": itemNames,
            "CheckoutURL": k_checkout_url,
            'Items': allItems
        }]);
    }


    if (window.location.href.indexOf('checkout') > -1) {
        let k_counter = 0;

        if ($('.customerView-body').html() === undefined) {
            $(document).on('change', 'input', function() {
                if (k_counter < 1) {
                    try {
                        let k_email = document.querySelector('#email').value;
                    } catch(err) {
                        let k_email = $('.customerView-body').html().trim();
                    };

                    let valid = identifyKlaviyoEmail(k_email);
                    valid === true ? getDataSendToKlaviyo() : console.log('Tried to send ' + k_email);
                    
                    k_counter++;
                }
            });

        } else {

            $(document).on('change', '#email', function() {
                if (k_counter < 1) {
                    let k_email = this.value;
                    let valid = identifyKlaviyoEmail(k_email);

                    valid === true ? getDataSendToKlaviyo() : console.log('Tried to send ' + k_email);

                    k_counter++;
                }
            });
        };
    }
});
