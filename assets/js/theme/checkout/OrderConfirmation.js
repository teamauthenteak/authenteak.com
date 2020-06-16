
(function(firebase){
	let leadTimeData;

	firebase.initializeApp(TEAK.Globals.firebase.config);
	let db = firebase.firestore();

	if( window.localStorage ){
		leadTimeData = window.localStorage.getItem("TEAK_cartLeadTime");
		leadTimeData = JSON.parse(leadTimeData);

		window.localStorage.removeItem("TEAK_cartLeadTime");
	}

	let order = document.getElementById("orderID").innerHTML.trim();
	order = JSON.parse(order.replace(/&quot;/g,'"'));

	let orderData = {};
	orderData["order_" + order.id] = leadTimeData;


	db.collection("customer").doc(TEAK.User.uuid).update({
		orders: firebase.firestore.FieldValue.arrayUnion(orderData)
	})

}(firebase));




var TEAK = window.TEAK || {};

TEAK.Checkout = {

	toggleModal: function (isHidden) {
		$("#feedBackModal").toggleClass("toolTip__cntr--hide", isHidden);
	},

	checkClickToCloseModal: function (e) {
		if (!$(e.target).closest('#feedBackModal').length && !$(e.target).closest("[data-open-modal]").length) {
			TEAK.Checkout.toggleModal(true);
		}
	},

	checkKeyToCloseModal: function (e) {
		if (e.which === 27) {
			TEAK.Checkout.toggleModal(true);
		}
	},

	// clear cart from local storage
	clearStorage: function (item) {
		window.localStorage.removeItem(item);
		return this;
	},

    /* 
      Injects the unsubscribe form into the pages
      - Note: this is a work around because Bolt doesn't support Klaviyo  email signup from it's UI
    */
	buildUI: function () {
		try {
			let confirmSection = document.getElementById("micro-app-ng-checkout");

			if (confirmSection) {
				confirmSection.querySelector(".orderConfirmation-section");

				let klaviyoForm = document.createElement('div');
				klaviyoForm.setAttribute("class", "klaviyo-form-MnvYmV");

				let text = document.createElement('p');
				text.setAttribute("class", "unsubscribe__text");
				text.innerHTML = "It's official, you're an AuthenTEAK Insider! You'll be the first to know about promotions, events & new arrivals. If you wish to unsubscribe, <a href='' onclick='TEAK.Checkout.unsubscribePopupOpen(event);'>let us know</a>.";

				let closeBtn = document.createElement('a');
				closeBtn.setAttribute("class", "unsubscribe__closeModal");
				closeBtn.setAttribute("onclick", "TEAK.Checkout.unsubscribePopupClose(event)");
				closeBtn.innerHTML = "&times;";
				klaviyoForm.appendChild(closeBtn);

				confirmSection.appendChild(text);
				confirmSection.appendChild(klaviyoForm);

				TEAK.Checkout.hidePayByCheck();
			}


		} catch (err) {
			console.log(err)
		}

		return this;
	},

	/* Open Modal */
	unsubscribePopupOpen: function (event) {
		event.preventDefault();
		document.querySelector(".klaviyo-form-MnvYmV").style.display = "flex";
		return this;
	},

	/* Close Modal */
	unsubscribePopupClose: function (event) {
		event.preventDefault();
		document.querySelector(".klaviyo-form-MnvYmV").style.display = "none";
		return this;
	},

	// hide pay by check field
	hidePayByCheck: function () {
		let tags = document.getElementsByClassName("orderConfirmation-section");

		for (let i = 0; i < tags.length; i++) {
			let txt = tags[i].innerText || tags[i].innerHTML;
			if (txt.includes("pay by check")) {
				tags[i].style.display = 'none';
			}
		}

		return this;
	},

	insertSurveyLink: function () {
		setTimeout(function(){
			let survey = '<a href="#feedBackModal" class="feedback__link" rel="#feedBackModal" data-open-modal>[+] Provide Website Feedback &rsaquo;</a>';
			$(survey).appendTo(".continueButtonContainer");
		},1000);

		return this;
	},


	initAnalytics: function(){
		let storedCart = TEAK.Utils.getStoredCart();

		if (typeof storedCart !== "undefined" && typeof storedCart.lineItems !== "undefined") {
			TEAK.Checkout.heap(storedCart);
			TEAK.Checkout.facebookPixel(storedCart);
			TEAK.Checkout.intelliSuggest();
		}

		return this;
	},


	// heap order completed track
	heap: function (storedCart) {
		let heapObj = { method: 'identify' };

		if (TEAK.User.uuid !== "") {
			Object.assign(heapObj, { id: TEAK.User.uuid + '.authenteak.com' });
		}

		TEAK.ThirdParty.heap.init(heapObj);

		TEAK.ThirdParty.heap.init({
			method: 'track',
			event: 'order_completed',
			location: 'OrderConfirmation',
			order_id: storedCart.id,
			subtotal: storedCart.baseAmount,
			total: storedCart.cartAmount,
			shipping: "",
			discount: storedCart.discountAmount,
			discount_code: storedCart.discounts.length ? storedCart.discounts[0].id : ""
		});

		return this;
	},


	// facebook purchase track
	facebookPixel: function(storedCart){
		window.fbq('track', 'Purchase', {
			currency: "USD", 
			value: storedCart.baseAmount,
			content_type: 'product'
		});

		return this;
	},


	// third party intelliSuggest tracking
	intelliSuggest: function (storedCart) {
		try {
			IntelliSuggest.init({
				siteId: TEAK.ThirdParty.IntelliSuggest.siteId,
			});

			// Loop through products in cart
			TEAK.ThirdParty.IntelliSuggest.haveItemArray.forEach(function (element) { IntelliSuggest.haveItem(element); });

			IntelliSuggest.inSale({
				orderId: storedCart.id,
				transactionId: storedCart.id,
				total: storedCart.baseAmount,
				city: "{{order.shipping_address.city}}",
				state: "{{order.shipping_address.state}}",
				country: "US"
			});

		} catch (err) {
			console.log(err)
		}

		return this;
	}
};

setTimeout(TEAK.Checkout.buildUI, 500);



document.addEventListener('DOMContentLoaded', function(){
	TEAK.Checkout.initAnalytics();

	$(window).on("load", TEAK.Checkout.insertSurveyLink);

	// clear out stored cart data
	TEAK.Checkout.clearStorage('cartData');

	$(document.body)
		.on("click", TEAK.Checkout.checkClickToCloseModal)
		.on("keydown", TEAK.Checkout.checkKeyToCloseModal)
		.on("click", "[data-open-modal]", function(e){ TEAK.Checkout.toggleModal(false); e.preventDefault();})
		.on("click", "[data-close-modal]", function(e){ TEAK.Checkout.toggleModal(true); e.preventDefault();});
});

