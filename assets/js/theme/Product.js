import PageManager from '../PageManager';
import Alert from './components/Alert';
import ProductUtils from './product/ProductUtils';
import ProductImages from './product/ProductImages';
import ProductReviews from './product/ProductReviews';
import ColorSwatch from './product/ColorSwatch';
import productViewTemplates from './product/productViewTemplates';
import variationImgPreview from './product/variationImgPreview';
import Tabs from 'bc-tabs';
import fitVids from 'fitvids';
import ScrollLink from 'bc-scroll-link';

import ProductOptions from './product/customizations/ProductOptions';
import AddToCartModal from './product/customizations/AddToCartModal';
import PrintMode from './product/customizations/PrintMode';

export default class Product extends PageManager {
	constructor() {
		super();

		this.el = '[data-product-container]';
		this.$el = $(this.el);
		this.productImgs = '.product-slides-wrap';

		this.fitVidsInitialized = false;

		new Alert($('[data-alerts]'));

		new ScrollLink({
			selector: '.accordion-title a',
			offset: -117
		});

		new ScrollLink({
			selector: '.reviews-jumplink'
		});
	}

	loaded(next) {
		// Product Utils
		this.ProductUtils = new ProductUtils(this.el, {
			priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
			priceWithTaxTemplate: productViewTemplates.priceWithTax,
			priceSavedTemplate: productViewTemplates.priceSaved,
			variationPreviewImageTemplate: productViewTemplates.variationPreviewImage,
			callbacks: {
				switchImage: variationImgPreview
			}
		}).init(this.context);

		// Product Images
		new ProductImages(this.productImgs);

		// Product Swatches
		this.swatches = new ColorSwatch(); // Init our color swatches

		// Reviews
		new ProductReviews(this.context);

		// Custom Options
		new ProductOptions();
		// Custom Cart Modal
		new AddToCartModal();
		// Print Mode (Tear Sheet)
		new PrintMode();

		// Product UI
		this._bindEvents();
		this._initTabs();
		this._initSlick();

		next();
	}

	_bindEvents() {
		// Activate the reviews tab when we jump down to it
		$('.product-reviews-link').on('click', () => {
			this.tabs.displayTabContent('#product-reviews');
			$('.accordion-title').removeClass('is-open');
			$('[href="#product-reviews"]').parent('.accordion-title').addClass('is-open');
		});

		// Show all the reviews
		$('.reviews-show-more-link').on('click', (event) => {
			event.preventDefault();

			$('.review-item.hidden').each((index, el) => {
				setTimeout(() => {
					$(el).revealer('show');
				}, index * 250);
			});

			$(event.currentTarget).hide();
		});

		$('.accordion-title').on('click', (event) => {
			event.preventDefault();
			this._accordionTabToggle(event);
		});
	}

	_initTabs() {
		this.tabs = new Tabs({
			afterSetup: (tabId) => {
				this._initVids(tabId);
				$('.tab-content-panel.active').prev('.accordion-title').addClass('is-open');
			},
			afterChange: (tabId) => {
				this._initVids(tabId);
			}
		});
	}

	// Add accordion style buttons to toggle tab panels
	_accordionTabToggle(event) {
		const tab = $(event.currentTarget).find('a').attr('href');
		$(event.currentTarget).addClass('is-open').siblings('.accordion-title').removeClass('is-open');
		this.tabs.displayTabContent(tab);
	}

	// if page loads with tabs hidden, we need to wait until the proper tab is clicked before running fitVids.
	_initVids(tabId) {
		if (tabId == '#product-videos' && !this.fitVidsInitialized) {
			fitVids('.product-videos-list');
			this.fitVidsInitialized = true;
		}
	}

	_initSlick() {

		// Related Product carousels
		$('.product-carousel').slick({
			infinite: true,
			slidesToShow: 4,
			slidesToScroll: 4,
			autoplaySpeed: 4000,
			appendDots: ".product-carousel",
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
		});
	}
}

/**
 * Tool Tips
 * -------------------------
 * Data: 
 * 	Stored in product.json or in the script manager
 * 
 * HTML:
 *  <div class="toolTip__cntr hide" id="CustomTriggerFieldName"></div>
 * 
 * Trigers: 
 * 	Open tip: "tool-tip-open"
 * 	Close tip; "tool-tip-cose"
 * 
 * Product Swatch Tool Tips: 
 * 	Auto runs for every product page
 * 
 * Custom Tool Tips:
 * 	data-tool-tip-type = element / brand (only for swatches)
 * 
 * 	data-tool-tip-name = 
 * 		- The ID of your tool tip contaner to target. 
 * 		- Also acts as the rel of the element. 
 * 		- Should match the JSON field for the tip data 
 * 
 */

TEAK.Modules.toolTip = {
	data: TEAK.Utils.getProductTipData(),
	optionKeys: [],
	brandObj: {},
	elementObj: {},
	activeModal: "",

	closeBtn: `<button class="toolTip__closeBtn" tool-tip-close>
					<svg class="toolTip__closeIcon" enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.4 12l5.3-5.3c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0l-5.3 5.3-5.3-5.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4l5.3 5.3-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3l5.3-5.3 5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4l-5.3-5.3z"></path>
					</svg>
				</button>`,
	
	
	init: function (arg) {
		if( !this.data ){ return; }

		switch(arg.type){
			case "brand": this.brandTip(arg.name);
				break;
			case "element": this.elementTip(arg.name);
				break;
		}
		
		this.setListners();
		
		return this;
	},


	brandTip: function(brandName){
		if( !this.data["tool-tips"].brands.hasOwnProperty(brandName) ){ return; }

		this.brandObj = this.data["tool-tips"].brands[brandName];
		this.optionKeys = Object.keys(this.brandObj);

		this.optionKeys.forEach((element, i) => {
			let $optionSelector = $("#productOptions").find("[data-option-title='"+ this.optionKeys[i] +"'] .toolTip");

			$optionSelector
				.find(".toolTip__cntr")
					.append(this.closeBtn)
					.append(this.brandObj[element].tip)
						.end()
				.addClass("show");
		});

		return this;
	},


	// build custom element modal
	elementTip: function(elementName){
		if( !this.data["tool-tips"].elements.hasOwnProperty(elementName) ){ return; }

		this.elementObj = this.data["tool-tips"].elements;
		$("#" + elementName).html(this.closeBtn + this.elementObj[elementName].join("") );

		return this;
	},


	// open 
	openTipModal: function(e){
		let tipData = $(this).data();

		if( tipData.hasOwnProperty("toolTipType") ){
			TEAK.Modules.toolTip.init({type: tipData.toolTipType, name: tipData.toolTipName });
		}

		TEAK.Modules.toolTip.activeModal = tipData.hasOwnProperty("toolTipName")  ? tipData.toolTipName : $(this).attr("rel");

		$("#"+ TEAK.Modules.toolTip.activeModal).removeClass("hide");

		e.preventDefault();
	},


	// close
	closeTipModal: function(e){
		if ( TEAK.Modules.toolTip.activeModal !== "" ){
			$("#"+ TEAK.Modules.toolTip.activeModal).addClass("hide")
			TEAK.Modules.toolTip.activeModal = "";
		}

		e.preventDefault();
	},


	// on click check to see if the event happend outside or inside the modal, close if the former
	checkClickToCloseModal: function(e){
		if ( TEAK.Modules.toolTip.activeModal !== "" ){
			if ( !$(e.target).closest('#'+ TEAK.Modules.toolTip.activeModal).length && !$(e.target).closest("[tool-tip-open]").length ){
				$("[tool-tip-close]", document.body).click();
			}
		}
	},


	// on keyup of the ESC key, close the open modal
	checkKeyToCloseModal: function(e){
		if ( TEAK.Modules.toolTip.activeModal !== "" ){
			if( e.which === 27 ){
				$("[tool-tip-close]", document.body).click();
			}
		}
	},


	// set event listners 
	setListners: function(){
		$(document.body)
			.on("click", this.checkClickToCloseModal)
			.on("keydown", this.checkKeyToCloseModal)
			.on("click", "[tool-tip-open]", this.openTipModal)
			.on("click", "[tool-tip-close]", this.closeTipModal);

		return this;
	}
};
