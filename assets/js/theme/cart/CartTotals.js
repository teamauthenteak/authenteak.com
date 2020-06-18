/**
 * CartTotals.js
 * script for the totals.html template
 */


(function(document, window, TEAK){
	let cartProductJson;


	// set product data to local storage so we can show it on the user's my account page
	function getProductCartJSON(){
		cartProductJson = document.getElementById("cartProductJson").innerHTML.trim();
		cartProductJson = JSON.parse(cartProductJson);

		storeCartItems();
		brandShippingMessage();
	}

	

	// sets any analytics data
	function setAnalytics(){
		try {
			IntelliSuggest.init({
				siteId: TEAK.ThirdParty.IntelliSuggest.siteId,
				context: 'Basket',
				seed: TEAK.ThirdParty.IntelliSuggest.initArray
			});
	
			// Loop through products in cart
			TEAK.ThirdParty.IntelliSuggest.haveItemArray.forEach(function (element) {
				IntelliSuggest.haveItem(element);
			});
	
			IntelliSuggest.inBasket({});
		}
		catch (err) {
			console.log(err)
		}
	}



	// updates the grand total UI
	function updateGrandTotal(){
		let grandTotal = document.getElementById("grandTotal");
	
		if( grandTotal ){
			// updates the grand total
			let shippingTotal = grandTotal ? parseFloat(grandTotal.dataset.total.trim()) : 0;
	
			let subTotal = document.getElementById("subTotalJson") ? JSON.parse(document.getElementById("subTotalJson").innerHTML) : 0;
			subTotal = subTotal === 0 ? 0 : parseFloat(subTotal.total);
	
			let tax = document.getElementById("cartTax") ? parseFloat(document.getElementById("cartTax").dataset.tax.trim()) : 0;
			let total = shippingTotal + subTotal + tax;
	
			grandTotal.innerHTML = total.toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD'
			});
		}
	}



	// store cart items for Lead Time
	function storeCartItems(){
		TEAK.Utils.storeData("TEAK_cartLeadTime", cartProductJson);
	}



	// show brand Shipping Message based on number of brands
	function brandShippingMessage(){
		let cartBrands = {};

		cartProductJson.forEach(function(element){
			cartBrands[element.brand] = null;
		});

		if(  Object.keys(cartBrands).length >= 2 ){
			document.getElementById("multiPackageAlert").classList.remove("hide");
		}
	}



	document.addEventListener('DOMContentLoaded', function () {
		getProductCartJSON();
		updateGrandTotal();
		setAnalytics();
	});


}(document, window, window.TEAK));






/**
 * NOTE: this is a hack.
 * This is only a hack.
 * This needs to be done at the paypal level because...it's a hack.
 * This simply replaces the amazon button with a new one
*/

(function (document, window) {
	let amazonBtn;

	let change = {
		init: function () {
			change
				.swapButtonAmazon()
				.showButtonAmazon();

			return this;
		},

		swapButtonAmazon: function () {
			amazonBtn = document.querySelector("img.amazonpay-button-inner-image");
			amazonBtn.src = "//authenteak.com/content/amazon-pay-btn.png";
			amazonBtn.style.opacity = 1;
			amazonBtn.srcset = "//authenteak.com/content/amazon-pay-btn.png";

			return this;
		},


		showButtonAmazon: function () {
			document.getElementById("OffAmazonPaymentsWidgets0").classList.add("amazonpay-button-inner-image--show");

			amazonBtn.addEventListener("click", function () {
				let subTotal = TEAK.Data.cart.sub_total.replace(/\$|,/g, ''),
					qty = TEAK.Data.cart.quantity;

				subTotal = parseInt(subTotal); s
				qty = parseInt(qty);

				// TEAK.Modules.fbPixel.checkoutStart(subTotal, qty);
				TEAK.Modules.pintrest.checkOut(subTotal, qty);
			});

			return this;
		}
	};


	// Get the cart detail from localstorage
	function getStoredCart() {
		let storedCart = localStorage.getItem('cartData');
		return JSON.parse(storedCart);;
	}

	function getCartQnty(cart) {
		let count = 0;

		cart[0].lineItems.physicalItems.forEach(function (element) {
			count += element.quantity;
		});

		return count;
	}

	// update the cart header
	function updateHeaderMiniCart() {
		let $dataCart = $("[data-cart-quantity]"),
			cart = getStoredCart(),
			cartQty = getCartQnty(cart);

		$dataCart.data("cartQuantity", cartQty);
		$dataCart.html(cartQty);

		checkForDiscount(cart);
	}


	function checkForDiscount() {
		let cart = getStoredCart(),
			amount = 0;

		cart[0].discounts.forEach(function (element) {
			amount = amount + element.discountedAmount;
		});

		if (amount > 0 && !TEAK.User.isTradeCustomer ) {
			let discountCntr = document.getElementById("cartTotalItemDiscount"),
				subTotal = document.getElementById("cartSubTotal"),
				currencSymbol = cart[0].currency.symbol;

			subTotal.innerHTML = currencSymbol + (cart[0].baseAmount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

			discountCntr.classList.remove("hide");
			discountCntr.querySelector(".cart-total-item--discount").innerHTML = "-" + currencSymbol + (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		checkForDiscount();

		$(window)
			.on("load", change.init)
			.on("cartDataStored", updateHeaderMiniCart);
	});

}(document, window));





// Bolt Customizations
(function (window, document, TEAK) {
	let originalCheckoutButton = document.querySelector(".cart-actions .button-primary");
	let boltButtons = document.getElementsByClassName("bolt-button-wrapper");

	if (true) {
		for (let i = 0; i < boltButtons.length; i++) {
			boltButtons[i].style.display = 'contents';

			// Facebook Pixel track for Bolt - initiate checkout
			// cannot track 'AddPaymentInfo' because bolt is in a iframe
			boltButtons[i].addEventListener("click", function () {
				let subTotal = TEAK.Data.cart.sub_total.replace(/\$|,/g, ''),
					qty = TEAK.Data.cart.quantity;

				subTotal = parseInt(subTotal);
				qty = parseInt(qty);

				// TEAK.Modules.fbPixel.checkoutStart(subTotal, qty);
				TEAK.Modules.pintrest.checkOut(qty);
			});
		}

		if (originalCheckoutButton) {
			originalCheckoutButton.style.display = 'none';
		}
	}

	/*
	let interval = setInterval(function () {
		if (window.BoltCheckout) {
			window.BoltCheckout.setClientCustomCallbacks({
				success: function (trx) {
					fbq('track', 'Purchase', {
						value: trx.amount.amount / 100.0,
						currency: 'USD',
					});
				}
			});
			clearInterval(interval);
		}
	}, 200);
	*/

	let config = { childList: true, subtree: true };
	// Change totalClassName
	let totalClassName = "cart-total-grandTotal";
	let bigCommerceTotalPrice = "";

	let callback = function (mutationsList) {
		let elms = document.getElementsByClassName(totalClassName);
		
		if (elms.length == 0) { return; }
		
		let newPrice = elms[0].innerHTML;

		if (newPrice !== bigCommerceTotalPrice && window.BoltCheckout && window.BoltCheckout.reloadBigCommerceCart) {
			window.BoltCheckout.reloadBigCommerceCart();
		}
		
		bigCommerceTotalPrice = newPrice;
	};

	new MutationObserver(callback).observe(document.body, config);

}(window, document, window.TEAK));