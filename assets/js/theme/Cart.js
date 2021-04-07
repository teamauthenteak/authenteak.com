import PageManager from '../PageManager';
import utils from '@bigcommerce/stencil-utils';
import CartUtils from './cart/CartUtils';
import ShippingCalculator from './cart/ShippingCalculator';
import CouponCodes from './cart/CouponCodes';
import GiftCertificates from './cart/GiftCertificates';
import GiftWrapping from './cart/GiftWrapping';
import Loading from 'bc-loading';
import QuantityWidget from './components/QuantityWidget';
import svgIcon from './global/svgIcon';
import Personalization from './Personalization';
import EditOptions from './cart/customizations/EditOptions';

export default class Cart extends PageManager {
	constructor() {
		super();

		this.$cartContent = $('[data-cart-content]');

		// add Personalization engine
		// this.recentlyViewed = new Personalization({
		//     type: "recentlyViewed"
		// });

		// this._initRecentlyViewed();


		// brute-force apple-pay bodyclass in local environment
		if (window.ApplePaySession && $('.dev-environment').length) {
			$(document.body).addClass('apple-pay-supported');
		}
	}

	loaded(next) {
		const context = this.context;

		new QuantityWidget({ scope: '[data-cart-content]' });

		// Custom Options
		new EditOptions();

		const loadingOptions = {
			loadingMarkup: `<div class="loading-overlay">${svgIcon('spinner')}</div>`,
		};

		new GiftWrapping({ scope: '[data-cart-content]', context });
		const cartContentOverlay = new Loading(loadingOptions, true, '.product-listing');
		const cartTotalsOverlay = new Loading(loadingOptions, true, '[data-cart-totals]');

		this.ShippingCalculator = new ShippingCalculator('[data-shipping-calculator]', {
			context,
			visibleClass: 'visible',
			callbacks: {
				willUpdate: () => cartTotalsOverlay.show(),
				didUpdate: () => cartTotalsOverlay.hide(),
			},
		});

		this.CouponCodes = new CouponCodes('[data-coupon-codes]', {
			context,
			visibleClass: 'visible',
			callbacks: {
				willUpdate: () => cartTotalsOverlay.show(),
				didUpdate: () => cartTotalsOverlay.hide(),
			},
		});

		this.GiftCertificates = new GiftCertificates('[data-gift-certificates]', {
			context,
			visibleClass: 'visible',
			callbacks: {
				willUpdate: () => cartTotalsOverlay.show(),
				didUpdate: () => cartTotalsOverlay.hide(),
			},
		});

		this.CartUtils = new CartUtils({
			ShippingCalculator: this.ShippingCalculator,
			CouponCodes: this.CouponCodes,
			GiftCertificates: this.GiftCertificates,
		}, {
			callbacks: {
				willUpdate: () => cartContentOverlay.show(),
				didUpdate: () => cartContentOverlay.hide(),
			},
		}).init();

		next();

		// Cart Page Prop 65 Toggle
		if (document.querySelector('.prop-link')) {
			let propBtnEl = document.querySelector('.prop-link');
			let propWrapEl = document.querySelector('.prop-wrapper');
			let propActive = false;

			propBtnEl.addEventListener('click', togglePropEl);

			function togglePropEl() {
				propActive = !propActive;
				propWrapEl.classList.toggle('open');
				updatePropBtn();
				console.log(propActive);
			}

			function updatePropBtn() {
				if (propActive) {
					propBtnEl.innerHTML = "Close Information";
				} else {
					propBtnEl.innerHTML = "California's Residents see Proposition 65 Information";
				}
			}
		}
		


	}


	// _initRecentlyViewed(){
	// 	let $rv = $("#recentlyViewedProducts"),
	// 		recentProducts = this.recentlyViewed.getViewed();

	// 	if (recentProducts) {
	// 		recentProducts.forEach((element) => {
	// 			let tpl = this.recentlyViewed.buildPersonalizationSlider(element);
	// 			$(tpl).appendTo(".product-rv-carousel", $rv);
	// 		});

	//     $rv.addClass("show");
	// 	}

	// 	this.recentlyViewed.initProductSlider({
	//     dotObj: {appendDots: '.product-rv-carousel'},
	//     selector: '.product-rv-carousel',
	//     context: '#recentlyViewedProducts'
	//   });
	// }



}
