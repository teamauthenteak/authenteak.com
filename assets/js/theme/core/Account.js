import initAlertDismissable from './alertDismissable';
import initDownloadGallery from './downloadGallery';
import updateState from './updateState';
import firebase from 'firebase';

export default class Account {
	constructor() {
		this._bindEvents();
		this.heapAnalytics();

		firebase.initializeApp(TEAK.Globals.firebase.config);
		this.db = firebase.firestore();
		this.customer = this.db.collection("customer").doc(TEAK.User.uuid);

		this.orderId = TEAK.Utils.getParameterByName("order_id", window.location.href);

		this.getCustomerInfo();
	}



	getCustomerInfo(){
		this.customer.get().then((doc) => {
			if( doc.exists ){
				let customerData = doc.data();

				customerData.orders.forEach((element) => {
					let orderID = Object.keys(element)[0].replace(/"/g, ""); /* fix for a extra " in the string defect */

					if( orderID === `order_${this.orderId}` ){
						this.setLeadTime(element);
					}
				});
			}

		}).catch((error) => {
			console.log(error);
		});
	}



	setLeadTime(order){
		order[Object.keys(order)[0]].forEach((product) => {
			$(`#${product.id}`)
				.find(".account-receipt-lead-time-cntr").text(product.lead_time)
					.end()
				.find(".account-receipt-lead-time").removeClass("hide");
		});
	}



	heapAnalytics() {
		var heapObj = {
				method: "identify",
				id: "",
				city: "",
				state: "",
				firstPurchaseDate: "",
				lastPurchaseDate: "",
				purchaseCount: 0,
				purchaseTotalValue: 0,
				createdAt: "",
				loggedIn: true
			};

		if(document.getElementById("customerOrderJSON")){
			let data = document.getElementById("customerOrderJSON").innerHTML;
			data = JSON.parse(data);

			heapObj.id = data.customer.id;
			heapObj.city = data.customer.city;
			heapObj.state = data.customer.state;

			let orderLength = data.orders.length;

			if(orderLength){
				heapObj.firstPurchaseDate = data.orders[0].purchaseDate;
				heapObj.lastPurchaseDate = data.orders[orderLength - 1].purchaseDate;

				data.orders.forEach((element) => {
					heapObj.purchaseCount += parseInt(element.totalItems);
					heapObj.purchaseTotalValue += parseInt(element.total);
				});

				heapObj.purchaseTotalValue = heapObj.purchaseTotalValue.toFixed(2);
			}

			// console.log(heapObj);
			
			window.TEAK.ThirdParty.heap.init(heapObj);
		}
		
		return this;
	}


	_bindEvents() {
		initAlertDismissable();
		initDownloadGallery();

		updateState(false, this.selectWrapCallback);

		// Toggle - a simple way to toggle elements
		$(document.body).on('click', '[data-account-toggle]', (event) => {
			const $el = $(event.currentTarget);
			const $target = $($el.data('account-toggle'));
			$target.toggle();
		});
	}

	/**
	 * Optional callback fired when a fresh state <select> element is added to the DOM
	 */
	selectWrapCallback($selectEl) {} //eslint-disable-line no-unused-vars

	// backwards compatibility for Page Manager
	loaded() {}
	before() {}
	after() {}
}