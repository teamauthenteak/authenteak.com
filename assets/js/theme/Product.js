import PageManager from '../PageManager';
import ProductUtils from './product/ProductUtils';
import ProductImages from './product/ProductImages';
import ColorSwatch from './product/ColorSwatch';
import productViewTemplates from './product/productViewTemplates';
import variationImgPreview from './product/variationImgPreview';
import Tabs from 'bc-tabs';
import fitVids from 'fitvids';
import ScrollLink from 'bc-scroll-link';
import TabsModule from './components/TabsModule';
import ProductOptions from './product/customizations/ProductOptions';
import AddToCartModal from './product/customizations/AddToCartModal';
import PrintMode from './product/customizations/PrintMode';
import ProductSwatchModal from './product/ProductSwatchModal';
import LazyLoad from 'vanilla-lazyload';
import Yotpo from './thirdparty/Yotpo';
import Tooltips from './components/ToolTips';


export default class Product extends PageManager {
	constructor() {
		super();

		this.productId = $("#productDetails").data("productId");
		this.el = '[data-product-container]';
		this.$el = $(this.el);
		this.productImgs = '.product-slides-wrap';
		this.tabObj = {};
		this.fitVidsInitialized = false;

		this.lazyLoadInstance = new LazyLoad({
			elements_selector: ".swatch-color, .swatch-pattern-image, .swatchModal__swatchImg"
		});

		new ScrollLink({
			selector: '.accordion-title a',
			offset: -117
		});


		new ScrollLink({
			selector: '.reviews-jumplink'
		});


		// Product Images
		if( this.productImgs ){
			new ProductImages(this.productImgs);
		}


		// Product Swatches
		this.swatches = new ColorSwatch(); // Init our color swatches


		// Custom Options
		if( document.getElementById("optionModuleJSON") ){
			new ProductOptions();
		}


		// Custom Cart Modal
		if( this.productId ){
			new AddToCartModal();
		}


		if( document.getElementById("productInfo") ){
			try{
				this.productInfo = JSON.parse(document.getElementById("productInfo").innerHTML);
			}catch(err){}
		}


		if( document.getElementById("productModal") ){
			this.yotpo = new Yotpo({
				product: this.productInfo,
				productId: this.productId,
				isProductPage: true,
				dialog: $("#productModal")
			});
		}
		

		if( this.productInfo ){
			new Tooltips({ 
				type: "brands",
				key: this.productInfo.brand,
				id: this.productInfo.brand
			});

			// add product swatch modal
			new ProductSwatchModal(this.productInfo);
		}
		

		// if(document.getElementById("relatedProductIDs")){
		// 	// Recommend Products Yotpo Update
		// 	this.recommended = new Personalization({
		// 		type: "recommended"
		// 	});

		// 	this.initRecommendedProducts({
		// 		// our recommended product id array built in pages > product.html
		// 		productIdArray: JSON.parse( document.getElementById("relatedProductIDs").innerHTML )
		// 	});

		// 	this.recommendedProducts = [];
		// }
		

		if( document.getElementById("yotpoRating") ){
			// get this product's updated reviews from yotpo
			this._getReviews();
		}
		

		// Product UI
		this._bindEvents();

		// Print Mode (Tear Sheet)
		new PrintMode();
		

		if( document.getElementById("desc") ){
			// init custom PDP tabs
			this.pdpTabs = new TabsModule({
				id: "descTab",
				dataClass: ".tmp-prod-details",
				contentClass: ".descContent"
			});

			this._initTabs();
		}
		

		this.initAnalytics();
	}


	
	loaded(next) {
		if( document.querySelector(this.el) ){
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


		// if( document.getElementById("recentlyViewedProducts") ){
		// 	// Recently Viewed Module
		// 	const recentlyViewed = new Personalization({ 
		// 			selector: "#recentlyViewedProducts",
		// 			carousel_selector: ".product-rv-carousel",
		// 			type: "recentlyViewed",
		// 			product: {
		// 				url: this.context.product.url,
		// 				title: this.context.product.title,
		// 				product_id: this.context.product.id,
		// 				brand: this.context.product.brand.name,
		// 				price: this.context.product.price.without_tax.value,
		// 				availability: "in stock",
		// 				image: replaceSize(this.context.product.main_image.data, 200),
		// 				sku: this.context.product.sku
		// 			}
		// 		});

        // 	recentlyViewed.init()
		// }
	}



	_bindEvents() {
		
		// Activate the reviews tab when we jump down to it
		$('.product-reviews-link').on('click', () => {
			this.tabs.displayTabContent('#product-reviews');
			$('.accordion-title').removeClass('is-open');
			$('[href="#product-reviews"]').parent('.accordion-title').addClass('is-open');
		});



		$('.accordion-title').on('click', (event) => {
			event.preventDefault();
			this._accordionTabToggle(event);
		});

		$(document.body)
			.on("click", "[product-dialog-close], div.product__modalOverlay", (e) => { this.closeDialog(e); })
			.on("click", "[product-dialog-open]", (e) => { this.openDialog(e) })
			.on("click", "a.wishlist__link" ,this.addToWishList)
			.on("click", "button[whiteGloveBtn]", (e) => { this.openDialog(e) })
	}


	whiteGloveDelivery(){
		return `<div class="product__col-1-1">
					<h2 class="product__title c pad-bottom">How Does White Glove Delivery Work?</h2>

					<div class="product__row product__row--center product__row--podCntr">
						<div class="product__pod--1-4 product__pod--center">
							<svg class="icon icon-scheduled-delivery" width="150" height="150"><use xlink:href="#icon-scheduled-delivery" /></svg>
							<h3 class="c">Scheduled Delivery Appointment</h3>
							<p class="l">We first ship your oder to a delivery company in your local area and they will work with you to schedule your White Glove service.</p>
						</div>

						<div class="product__pod--1-4 product__pod--center">
							<svg class="icon icon-delivery-assembly" width="150" height="150"><use xlink:href="#icon-delivery-assembly" /></svg>
							<h3 class="c">Unpacking & Assembly</h3>
							<p class="l">The local service provider will carefully unpack, inspect and assemble each item in your order, and place the item(s) where you want.</p>
						</div>

						<div class="product__pod--1-4 product__pod--center">
							<svg class="icon icon-packaging-removal" width="150" height="150"><use xlink:href="#icon-packaging-removal" /></svg>
							<h3 class="c">Packaging Removal & Disposal</h3>
							<p class="l">All packaging like boxes, plastic, and shipping insulation will be removed and discarded for you.</p>
						</div>
					</div>

					<div class="product__row product__row--center margin-top">
						<p class="c">For more details click to visit our <a href="/shipping/" target="_blank">shipping policies &rsaquo;</a></p>
					</div>
				</div>`;
	}


	addToWishList(e){
		e.preventDefault();

		let $target = $(e.target);
		let url = $target.attr("href")

		$target.find("svg.icon").removeClass("hide");

		$.post(url).then(response => {
			if(response){
				$(` <div class="modal modal__mini modal__mini--toggle">
						<svg class="icon" width="24" height="24"><use xlink:href="#icon-check2" /></svg>
						<span>Added to My Product List</span>
					</div>`).appendTo(document.body)

				$target.find("svg.icon").addClass("hide");

				setTimeout(()=> {
					$("div.modal__mini").remove()
				}, 6000)
			}
		});
	}


	initAnalytics(){
		TEAK.ThirdParty.heap.init({
			method: 'track',
			event: 'pdp_view',
			location: 'pdp'
		});
	}



	openDialog(e){
		let thisDialog = $(e.currentTarget).attr("rel"), tpl;

		switch(thisDialog){
			case "writeReview":
				tpl = this.yotpo.buildReviewsModal();
				break;
			
			case "askQuestion":
				tpl = this.yotpo.buildQuestionModal();
				break;

			case "whiteGloveBtn":
				tpl = this.whiteGloveDelivery();
				break;
		}


		$("#productModal")
			.removeClass("hide")
			.find(".product__modalDialog").removeClass("product__modalDialog--success")
				.end()
			.find(".product__modalDialogCntr").html(tpl);

		$(document.body).addClass("product__freezeBody");

		e.preventDefault();
	}



	closeDialog(e){
		let $this = $(e.currentTarget);
		$this.parents(".product__modal").addClass("hide");
		$(document.body).removeClass("product__freezeBody");
	}



	/**
	 * Build Recommended Products
	 * @param {Array} args.productIdArray arry of recommend product ids 
	 */

	initRecommendedProducts(args){
		this.recommended.makeRecommProductQuery(args.productIdArray)
			.then(data => {
				this.recommendedProducts = this.recommended.normalizeQLResponse(data);
			})
			.then(() => {
				this.getProductRaiting(args.productIdArray);
			})
			.then(() => {
				this.buildRecommendationSlider();

				this.recommended.initProductSlider({
					dotObj: {appendDots: '.product-carousel', infinite: false},
					selector: '.product-carousel',
					context: "#recommendedProducts"
				});
			});
	}





	/**
	 * Yotpo: Fetch Bulk Ratings
	 * @param {Array} productIdArray arry of product ids 
	 */

	getProductRaiting(productIdArray){
		try{
			// get our bulk yotpo rating for recomm products on page
			this.yotpo.fetchBulk(productIdArray)
				.then((data) => {
					this.appendRating(data, productIdArray);
				});

		}catch(err){}
	}



	/**
	 * Bind the fetched yotpo rating field to the corresponding product
	 * @param {Array} dataArray - Data Array of Objects fetched from yotpo
	 * @param {Array} productIdArray - array of product ids
	 */

	appendRating(dataArray, productIdArray){
		for (let i = 0; i < productIdArray.length; i++) {
			Object.assign(this.recommendedProducts[i], {
				total_review: dataArray[i].result.total,
				rating: dataArray[i].result.average_score
			});
		}	
	}




	buildRecommendationSlider(){
		let $recomm = $("#recommendedProducts");

		this.recommendedProducts.forEach((element) => {
			let tpl = this.recommended.buildPersonalizationSlider(element);
			$(tpl).appendTo(".product-carousel", $recomm);
		});

		$recomm.toggleClass("hide");
	}





	// build our dynamic schema data
	buildProductSchema(data){
		let script = document.createElement('script');
		let schemaJSON =document.getElementById('schema-product');
		let schema = schemaJSON.innerHTML;
	  
		script.type = 'application/ld+json';
		script.text = JSON.stringify(schema);
		  
		document.querySelector('body').appendChild(script);
		script.parentElement.removeChild(schemaJSON);
	}




	// get and display bespoke yotpo product reviews
	_getReviews(){
		let $ratingCntr = $("#yotpoRating");

		$.when( 
			this.yotpo.getProductReviews(this.productId),
			this.yotpo.getProductQuestions(this.productId)
			
		).then((reviewData, questionData) => {
			this.questionData = questionData[0].response;
			this.reviewData = reviewData[0].response;

			let totalScore = this.reviewData.bottomline.average_score,
				totalReviews = this.reviewData.bottomline.total_review,
				totalQuestions = this.questionData.total_questions;

			totalScore = totalScore === 0 ? 0 : totalScore.toFixed(1);
			
			this.showRaiting($ratingCntr, totalScore, totalQuestions, totalReviews);

			this.buildCustQuestions();
			this.buildCustReviews();
		});

		
	}


	showRaiting($ratingCntr, totalScore, totalQuestions, totalReviews){
		if(totalScore !== 0){
			$ratingCntr.removeClass("hide");
		}else{
			return;
		}

		$ratingCntr
			.find(".yotpo-stars-rating")
				.css({"--rating": totalScore})
				.attr("aria-label", `Rating of ${totalScore} out of 5.`)
					.end()
			.find(".yotpo-reviews-num").text(totalReviews)
				.end()
			.find(".yotpo-questions-num").text(totalQuestions)
				.end()
			.find(".yotpo-questions-text").text(totalQuestions > 1 ? 'Questions' : (totalQuestions === 1 ? 'Question' : (totalQuestions === 0 ? 'Question' : 'Questions') ) )
	}




	buildCustQuestions(){
		let hasQuestions = this.questionData.total_questions > 0;

		$("#noQuestions").toggleClass("hide", hasQuestions);
		$("#questionsTitleBtn").toggleClass("hide", !hasQuestions);
		
		this.questionData.questions.forEach((element) => {
			let tpl = this.yotpo.buildProductQuestions(element);
			$(tpl).appendTo("#productQuestions");
		});
		
		// console.log(this.questionData)		
	}



	buildCustReviews(){
		let hasReviews = this.reviewData.bottomline.total_review > 0;

		$("#noReviews").toggleClass("hide", hasReviews);

		if( hasReviews ){
			let tpl = this.yotpo.buildProductReviews(this.reviewData);
			$(tpl).appendTo("#ratingsBlock");
		}
		
		// console.log(this.reviewData);
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


	


}
















