// moved this to Analytics.js

let _learnq = _learnq || [];

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
                var k_email = "";

                if (k_counter < 1) {
                    try {
                        k_email = document.querySelector('#email').value;
                    } catch(err) {
                        k_email = $('.customerView-body').html().trim();
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
