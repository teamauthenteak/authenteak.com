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
import Personalization from './Personalization';

import ProductOptions from './product/customizations/ProductOptions';
import AddToCartModal from './product/customizations/AddToCartModal';
import PrintMode from './product/customizations/PrintMode';

export default class Product extends PageManager {
	constructor() {
		super();

		this.yotpoKey = "aS8rMIONwGgNbx1ATQmUtKY173Xk5HHc75qGrnuq";
		this.productId = $("#productDetails").data("productId");

		this.el = '[data-product-container]';
		this.$el = $(this.el);
		this.productImgs = '.product-slides-wrap';

		this.fitVidsInitialized = false;

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

		new Alert($('[data-alerts]'));

		new ScrollLink({
			selector: '.accordion-title a',
			offset: -117
		});

		new ScrollLink({
			selector: '.reviews-jumplink'
		});

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


		// add Personalization engine
		this.recentlyViewed = new Personalization({
			type: "recentlyViewed"
		});

		this._initRecentlyViewed();


		// Print Mode (Tear Sheet)
		new PrintMode();

		this._initSlick();
		this._getReviews();

		// Product UI
		this._bindEvents();
		
		this._buildTabs();
		this._initTabs();

		this.initAnalytics();
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


	initAnalytics(){
		TEAK.thirdParty.heap.init({
			method: 'track',
			event: 'pdp_view',
			location: 'pdp'
		});
	}



	_initRecentlyViewed(){
		let $rv = $("#recentlyViewedProducts"),
			recentProducts = this.recentlyViewed.getViewed();

		if(recentProducts){ 
			recentProducts.forEach((element) => {
				let tpl = buildViewedSlider(element);
				$(tpl).appendTo(".product-grid", $rv);
			});

			$rv.addClass("show");	
		}
		
		function buildViewedSlider(product){
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

		this.saveViewedProduct();
		this.initRVSlider();
	}


	// saved this viwerd poduct - include the yotpo rating
	saveViewedProduct(){
		let productInfo = document.getElementById("productInfo").innerHTML;
		
		productInfo = JSON.parse(productInfo);
		
		$.ajax(`https://api.yotpo.com/v1/widget/${this.yotpoKey}/products/${this.productId}/reviews.json`)
			.done((dataObj) => {
				let totalScore = dataObj.response.bottomline.average_score;

				totalScore = (totalScore === 0) ? 0 : totalScore.toFixed(1);
				productInfo.rating = totalScore;

				this.recentlyViewed.saveViewed(productInfo);
			});	
	}



	// Recently Viewed Product carousels
	initRVSlider(){
		let carouselObj = Object.assign({appendDots: '.product-rv-carousel'}, this.carouselSettings);
		$('.product-rv-carousel').slick(carouselObj);
	}




	// get and display bespoke yotpo product reviews
	_getReviews(){
		let $ratingCntr = $("#yotpoRating");

		$.when( 
			$.ajax(`https://api.yotpo.com/v1/widget/${this.yotpoKey}/products/${this.productId}/reviews.json`),
			$.ajax(`https://api.yotpo.com/products/${this.yotpoKey}/${this.productId}/questions`) 
			
		).then((reviewData, questionData) => {
			let totalScore = reviewData[0].response.bottomline.average_score,
				totalQuestions = questionData[0].response.total_questions;

			totalScore = totalScore === 0 ? 0 : totalScore.toFixed(1);
			
			this.showRaiting($ratingCntr, totalScore, totalQuestions);

			// console.log(reviewData[0].response.bottomline.average_score)
			// console.log(reviewData[0].response.bottomline.total_review)
			// console.log(questionData[0].response.total_questions)
		});

		
	}


	showRaiting($ratingCntr, totalScore, totalQuestions){
		$ratingCntr
			.find(".yotpo-stars-rating")
				.css({"--rating": totalScore})
				.attr("aria-label", `Rating of ${totalScore} out of 5.`)
					.end()
			.find(".yotpo-reviews-num").text(totalScore)
				.end()
			.find(".yotpo-questions-num").text(totalQuestions)
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


	// Related Products
	_initSlick() {
		let carouselObj = Object.assign({appendDots: '.product-carousel'}, this.carouselSettings);
		$('.product-carousel').slick(carouselObj);
	}


	_buildTabs(){
		var tabClone, tabValue,
			tabButtons = document.querySelectorAll('.tab-header a'),
			tabContentEl = document.querySelector('.tab-content'),
			mobileTabButtons = document.querySelectorAll('.mobile-tab-heading');
		
		const tabs = [
				{
					type: document.querySelector('#specsTab'),
					id: "specsTab",
					tabBtnClass: ".specsBtn",
					mobileClass: ".mobile-specsTab",
					mobileObj: document.querySelector('.specsContent')
				},
				{
					type: document.querySelector('#careTab'),
					id: "careTab",
					tabBtnClass: ".careBtn",
					mobileClass: ".mobile-careTab",
					mobileObj: document.querySelector('.careContent')
				},
				{
					type: document.querySelector('#shipTab'),
					id: "shipTab",
					tabBtnClass: ".shipBtn",
					mobileClass: ".mobile-shipTab",
					mobileObj: document.querySelector('.shipContent')
				},
				{
					type: document.querySelector('#pdfTab'),
					id: "pdfTab",
					tabBtnClass: ".pdfBtn",
					mobileClass: ".mobile-pdfTab",
					mobileObj: document.querySelector('.pdfContent')
				},
				{
					type: document.querySelector('#videoTab'),
					id: "videoTab",
					tabBtnClass: ".videoBtn",
					mobileClass: ".mobile-videoTab",
					mobileObj: document.querySelector('.videoContent')
				},
				{
					type: document.querySelector('#warrantyTab'),
					id: "warrantyTab",
					tabBtnClass: ".warrantyBtn",
					mobileClass: ".mobile-warrantyTab",
					mobileObj: document.querySelector('.warrantyContent')
				},
				{
					type: document.querySelector('#returnTab'),
					id: "returnTab",
					tabBtnClass: ".returnBtn",
					mobileClass: ".mobile-returnTab",
					mobileObj: document.querySelector('.returnContent')
				}
			];
		
		
		const tabsModule = {
		
			// activate the first tab
			activateFirstTab: function(args){
				var dataDumpEl = document.querySelector(args.dataClass),
					mobileDesc = document.querySelector(args.contentClass),
					prodDescEl = document.createElement('div');
		
				prodDescEl.setAttribute('id', args.id);
				prodDescEl.classList.add('active');
				prodDescEl.appendChild(dataDumpEl);
		
				tabClone = prodDescEl.cloneNode(true);
		
				tabContentEl.appendChild(prodDescEl);
				mobileDesc.appendChild(tabClone);

				document.querySelector(".mobile-tab-heading[data-tabval="+ args.id +"]").classList.add("mobile-tab-heading--active");
		
				return this;
			},
		
		
			//Initialize tabbed content
			initTabContent: function() {
		
				// itterate over our tabs object and build out each tab skipping any tabs that have no content
				tabs.forEach( function(element) {
					if (element.type !== null && document.getElementById(element.id).innerHTML.trim() !== "") {
						let cln = element.type.cloneNode(true);
			
						tabClone.querySelector('#' + element.id).parentNode.removeChild(tabClone.querySelector('#' + element.id))
						tabContentEl.appendChild(element.type);
						element.mobileObj.appendChild(cln);
			
					} else {
						// hide desktop button item 
						document.querySelector("[data-tabval='"+ element.id +"']").parentElement.classList.add('innactive-tab');
						// hide desktop pane
						document.querySelector("[data-tabval='"+ element.id +"']").parentElement.classList.add('innactive-tab');
						// hide mobile tab
						document.querySelector("[data-tabval='"+ element.id +"'].mobile-tab-heading").classList.add('innactive-tab');
					}
				});
		
				return this;
			},
		
		
			//Clear active tab headers
			clearTabHeaders: function() {
				tabButtons.forEach( function(element, i){
					tabButtons[i].parentElement.classList.remove('active');
				});
		
				return this;
			},
		
		
			//Clear active tab content
			clearTabContent: function() {
				let tabContentElements = document.querySelectorAll('.tab-content div');
				
				tabContentElements.forEach( function(element, i){
					tabContentElements[i].classList.remove('active');
				});
		
				return this;
			},
		
		
			//Update the tab contents based on tabValue
			updateTabContent: function() {
				this.clearTabContent();

				let tab = document.querySelector('#' + tabValue);
				tab.classList.add('active');

				return this;
			}
		
		};
		
		
		// Choose which tab to show first
		// this is also used to build its sibbling tabs
		// therefore we run this before we Instantiate the Tab Content
		
			tabsModule.activateFirstTab({
				id: "descTab",
				dataClass: ".tmp-prod-details",
				contentClass: ".descContent"
			}).initTabContent();

		
			//Add Tab Button Listeners
			tabButtons.forEach( function(element, i){  
				if (!tabButtons[i].parentElement.classList.contains('innactive-tab')) {
			
					tabButtons[i].addEventListener('click', function(event) {
						if (!this.parentElement.classList.contains('active')) {
							tabValue = this.dataset.tabval;
					
							tabsModule.clearTabHeaders();
							this.parentElement.classList.toggle('active');
							tabsModule.updateTabContent();
					
							event.preventDefault();
						}
					});
				}
			});
		
		
			//Add Mobile Tab Button Listeners
			mobileTabButtons.forEach( function(element, j){
				mobileTabButtons[j].addEventListener('click', function(event) {
					let mobileContent = document.querySelector('.mobile-tab-wrapper' + ' #' + this.getAttribute("data-tabval"));
					
					mobileContent.classList.toggle('active');
					
					$(event.target).toggleClass("mobile-tab-heading--active");

					event.preventDefault();
				});
			});

		



		  
	}
}


/* 
	Displays the free shipping text based on price 
	- do want this to run inline as it needs to be shown as the page is shown

	rrp_without_tax: parseInt('{{../../../product.price.rrp_without_tax.value}}'),
	with_tax: parseInt('{{../../../product.price.with_tax.value}}'),
	without_tax: parseInt('{{../../../product.price.without_tax.value}}'),
    custom: parseInt('{{~default ../../../product.price.sale_price_without_tax.value price.without_tax.value~}}')
*/
TEAK.Modules.freeShipping = {
	set: function(args, element){
		let excludedSkus = [
				"LPG-L5000",
				"EL-OFS006",
				"EL-OFS005",
				"EL-OFS014",
				"EL-OFS302",
				"EL-OFS303",
				"EL-OFS304"
			],
			isExcluded = excludedSkus.includes(args.sku),
			
			freeShipping = '<p class="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></p>',
			
			freeWhiteGlove = [
			'<p class="free-shipping-text" data-pricing-free-shipping>',
				'<a href="" class="free-shipping-text--link" data-tool-tip-open data-tool-tip-type="element" data-tool-tip-name="free_white_glove_delivery">',
				'Free White Glove Delivery Available &nbsp;',
					'<span class="toolTip__iconCntr toolTip__iconCntr--dark">',
					'<svg class="toolTip__icon toolTip__icon--white" enable-background="new 0 0 20 20" version="1.1" viewBox="0 0 20 20" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">',
						'<title>tool tip</title>',
					'<path d="M12.432 0c1.34 0 2.010 0.912 2.010 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-0.75-1.974-1.99 0-1.043 0.881-2.479 2.643-2.479zM8.309 20c-1.058 0-1.833-0.652-1.093-3.524l1.214-5.092c0.211-0.814 0.246-1.141 0-1.141-0.317 0-1.689 0.562-2.502 1.117l-0.528-0.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273 0.705 3.23l-1.391 5.352c-0.246 0.945-0.141 1.271 0.106 1.271 0.317 0 1.357-0.392 2.379-1.207l0.6 0.814c-2.502 2.547-5.235 3.527-6.291 3.527z"></path>',
					'</svg>',
					'</span>',
				'</a>',
				'<span class="toolTip__cntr hide" id="free_white_glove_delivery"></span>',
			'</p>'].join(""),

			tpl = ( (args.price.without_tax > 2998 || args.price.custom > 2998) && !isExcluded ) ? freeWhiteGlove : freeShipping;
	
		document.getElementById(element).innerHTML = tpl;

		return this;
	}
};



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
	data: TEAK.Utils.getProductJSON(),
	optionKeys: [],
	brandObj: {},
	elementObj: {},
	activeModal: "",

	closeBtn: 	['<button class="toolTip__closeBtn" data-tool-tip-close>',
					'<svg class="toolTip__closeIcon" enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">',
						'<path d="M13.4 12l5.3-5.3c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0l-5.3 5.3-5.3-5.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4l5.3 5.3-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3l5.3-5.3 5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4l-5.3-5.3z"></path>',
					'</svg>',
				'</button>'].join(""),
	
	
	init: function (arg) {
		if( !this.data ){ return; }

		this.name = arg.name;

		switch(arg.type){
			case "brand": this.brandTip();
				break;
			case "element": this.elementTip();
				break;
		}
		
		this.setListners();
		
		return this;
	},


	brandTip: function(){
		if( !this.data["tool-tips"].brands.hasOwnProperty(this.name) ){ return; }

		this.brandObj = this.data["tool-tips"].brands[this.name];
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
	elementTip: function(){
		if( !this.data["tool-tips"].elements.hasOwnProperty(this.name) ){ return; }

		this.elementObj = this.data["tool-tips"].elements;
		$("#" + this.name).html(this.closeBtn + this.elementObj[this.name].join("") );

		return this;
	},


	// open 
	openTipModal: function(e){
		let tipData = $(this).data();

		if( tipData.hasOwnProperty("toolTipType") ){
			TEAK.Modules.toolTip.init({
				type: tipData.toolTipType,
				name: tipData.toolTipName
			});
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
			if ( !$(e.target).closest('#'+ TEAK.Modules.toolTip.activeModal).length && !$(e.target).closest("[data-tool-tip-open]").length ){
				$("[data-tool-tip-close]", document.body).click();
			}
		}
	},


	// on keyup of the ESC key, close the open modal
	checkKeyToCloseModal: function(e){
		if ( TEAK.Modules.toolTip.activeModal !== "" ){
			if( e.which === 27 ){
				$("[data-tool-tip-close]", document.body).click();
			}
		}
	},


	// set event listners 
	setListners: function(){
		$(document.body)
			.on("click", this.checkClickToCloseModal)
			.on("keydown", this.checkKeyToCloseModal)
			.on("click", "[data-tool-tip-open]", this.openTipModal)
			.on("click", "[data-tool-tip-close]", this.closeTipModal);

		return this;
	}
};


/**
 * Sets custom pdp tab content
 * 
 * 	document.addEventListener("DOMContentLoaded", function(){
		window.TEAK.Modules.tabs.getTabContent({
			key: "",	// json key
			mobileCntr: "" // mobile content selector class
		});
	});
 */
TEAK.Modules.tabs = {
	data: TEAK.Utils.getProductJSON(),

	// fetch tab content
	getTabContent: function(tabElement){
		if( !this.data ){ return; }

		let content = this.data.tabs[tabElement.key].join("");
		
		if( !TEAK.Utils.isHandheld ){
			document.getElementById(tabElement.key).innerHTML = content;

		}else{
			document.querySelector(tabElement.mobileCntr).innerHTML = `<div id="${tabElement.key}">${content}</div>`; 
		}
		
		return this;
	}
};