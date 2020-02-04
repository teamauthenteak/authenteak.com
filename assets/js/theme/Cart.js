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
    this.recentlyViewed = new Personalization({
      type: "recentlyViewed"
	});
	
	this.carouselSettings = {
		infinite: true,
		slidesToShow: 4,
		slidesToScroll: 4,
		autoplaySpeed: 4000,
		dots: true,
		speed: 800,
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
	};

	this._initRecentlyViewed();

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
    var propBtnEl = document.querySelector('.prop-link');
    var propWrapEl = document.querySelector('.prop-wrapper');
    var propActive = false;

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


	_initRecentlyViewed(){
		let $rv = $("#recentlyViewedProducts"),
			recentProducts = this.recentlyViewed.getViewed();

		if (recentProducts) {
			recentProducts.forEach((element) => {
				let tpl = buildViewedSlider(element);
				$(tpl).appendTo(".product-grid", $rv);
			});

			$rv.addClass("show");
		}

		function buildViewedSlider(product) {
			return `<a href="${product.url}" title="${product.title}" class="product-grid-item product-block" data-product-title="${product.title}" data-product-id="${product.product_id}">
						<figure class="product-item-thumbnail">
							<div class="replaced-image lazy-loaded" style="background-image:url(${product.image})">
							<img class="lazy-image lazy-loaded" src="${product.image}" alt="You viewed ${product.title}">
							</div>
						</figure>
						
						<div class="product-item-details product-item-details--review">
							<h5 class="product-item-title">${product.title}</h5>
						</div>
			
						<div class="yotpo-rv-wrapper">
							<span class="yotpo-stars-rating" style="--rating: ${product.rating};" aria-label="Rating of ${product.rating} out of 5."></span>
							(<span class="yotpo-reviews-num">${product.rating}</span>)
						</div>
					</a>`;
		}

  		this.initRVSlider();
	}


	// Recently Viewed Product carousels
	initRVSlider(){
		let carouselObj = Object.assign({appendDots: '.product-rv-carousel'}, this.carouselSettings);
		$('.product-rv-carousel').slick(carouselObj);
	}

}
