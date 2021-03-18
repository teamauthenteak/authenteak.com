import PageManager from '../PageManager';
import GraphQL from './graphql/GraphQL';
import LazyLoad from 'vanilla-lazyload';
import Yotpo from './thirdparty/Yotpo';

/*
 * Personlaiation Module:
 *  Cutom personalization dispay and data interaction
 * 
 * Personalization Types:
 *  recentlyViewed: saves product data to local storage for later display
 * 
 * 
 * @param {String} settings.type - "recentlyViewed" or "recommended" | passed in settings for multi recommended types
 */

export default class Personalization extends PageManager {
    constructor(settings) {
        super();

        this.graphQL = new GraphQL();

        this.yotpo = new Yotpo();

        this.lazyLoadInstance = new LazyLoad({
			elements_selector: ".replaced-image, .lazy-image"
		});


        // must be passed in settings
        this.type = settings.type;
        this.settings = settings;
       
        this.savedLimit = 20;
        this.isSaved = false;

        this.savedProducts = this.getViewed();
    }



    init(){
		let $rv = $(this.settings.selector),
			recentProducts = this.savedProducts;

		if(recentProducts){ 
			recentProducts.forEach((element) => {
				let tpl = this.buildPersonalizationSlider(element);
				$(tpl).appendTo(this.settings.carousel_selector, $rv);
			});

			$rv.addClass("show");
		}

		this.saveViewedProduct();

		this.initProductSlider({
			dotObj: {appendDots: this.settings.carousel_selector},
			selector: this.settings.carousel_selector,
			context: this.settings.selector
		});	
    }



    // saved this viewed product - include the yotpo rating
	saveViewedProduct(){
		try{			
			this.yotpo.getProductReviews(this.settings.product.product_id)
				.done((dataObj) => {
					let totalScore = dataObj.response.bottomline.average_score;

					totalScore = (totalScore === 0) ? 0 : totalScore.toFixed(1);

					this.settings.product["rating"] = totalScore;
					this.settings.product["total_review"] = dataObj.response.bottomline.total_review;

					this.save(this.settings.product);
				});

		}catch(err){
			console.log(err)
		}
    }
    



    /**
     * Saves the viewed product object to localstorage
     * @param {Object} product as parsed json 
     */
    save(product){
        if( window.localStorage ){

            this.savedProducts = this.savedProducts === null ? [] : this.savedProducts;
            
            this.hasBeenSaved(product);

            // we want to update the ratings we have currently saved with any new data
            if( this.savedProducts.length > 0 ){
                this.updateStoredRatings(this.savedProducts).then((data) => {
                    
                    // update the saved array with the new rating from yotpo
                    this.savedProducts.forEach((element, i) => {
                        element["rating"] = data[i].result.average_score;
                        element["total_review"] = data[i].result.total;
                    });

                    this.finishSaving(product);

                });

            }else{
                this.finishSaving(product);
            }

        }
    }


    /**
     * Saves the procut to local storage
     * @param {Object} product - viewes product object
     */

    finishSaving(product){
        try{

            // put the recently viewed product at the beginning of the array
            if( !this.isSaved ){
                this.savedProducts.unshift(product);
            }

            // if its more than the limit we take off the last one saved
            if( this.savedProducts.length > this.savedLimit ){
                this.savedProducts.pop();
            }

            window.TEAK.Utils.storeData("TEAK_" + this.type, this.savedProducts);

        }catch(err){
            console.log(err)
        }
       
    }



    /**
     * Checkes to see if thie product we are attempting to save is already there
     * if so then we wont save it
     * @param {Object} product - passed in product object 
     */

    hasBeenSaved(product){
        // make sure we are not saving this again
        for (let i = 0; i < this.savedProducts.length; i++) {
            if(this.savedProducts[i].product_id === product.product_id){
                this.isSaved = true;
                break;
            }
        }
    }




    /**
     * Recently Viewed Product carousels
     * @param {object} args.dotObj - {appendDots: '.product-rv-carousel'}
     * @param {string} args.selctor - selctor class '.product-rv-carousel'
     * @param {string} args.context - jquery ID context of the selector
     * 
     */ 
    
	initProductSlider(args){
		let carouselObj = Object.assign(args.dotObj, TEAK.Globals.carouselSettings);
        $(args.selector, args.context).slick(carouselObj);
        
        this.lazyLoadInstance.update();
    }
    



    /**
     * takes all saved ratings and updates their raiting with the latest from yotpo
     * @param {Array} arr 
     */

    updateStoredRatings(arr){
        let savedProductIds = [];

        arr.forEach((element) => {
            savedProductIds.push(element.product_id);
        });

        return this.yotpo.fetchBulk(savedProductIds).then((data) => data);
    }




    /**
     * Fetch recently viewed from local storage
     */ 

    getViewed(){
        if( window.localStorage ){
            let saved = window.localStorage.getItem("TEAK_" + this.type);

            // legacy ~ remove eveuntually
            if(!saved){
                saved = window.localStorage.getItem(this.type);
                window.localStorage.removeItem(this.type);
            }
            
            try{
                saved = JSON.parse(saved);
            }catch(e){}
           
            return saved;
        }
    }






    /**
     * Personalized Product Template
     * @param {Object} product - product object from parsed storage
     */

    buildPersonalizationSlider(product){
        // give total reviews a number if present
        product["total_review"] = (typeof product.total_review === "number") ? product["total_review"] : 0;

        return `<a href="${product.url}" title="${product.title}" class="product-grid-item product-recomendation-pod product-block" data-product-title="${product.title}" data-product-id="${product.product_id}">
                    <figure class="product-item-thumbnail">
                        <div class="replaced-image lazy-loaded" data-bg="${product.image}">
                            <img class="lazy-image lazy-loaded" data-src="${product.image}" alt="You viewed ${product.title}">
                        </div>
                    </figure>
                    
                    <div class="product-item-details product-item-details--review">
                        <h5 class="product-item-title">${product.title}</h5>
                    </div>

                    <div class="product-price">${TEAK.Utils.formatPrice( parseInt(product.price) )}</div>

                    <div class="yotpo-rv-wrapper ${product.total_review === 0 ? 'hide' : 'show'}">
                        <span class="yotpo-stars-rating" style="--rating: ${product.rating};" aria-label="Rating of ${product.rating} out of 5."></span>
                        (<span class="yotpo-reviews-num">${product.total_review}</span>)
                    </div>
                </a>`;
    }



    makeRecommProductQuery(productIDArray){
        let productQuery = this.graphQL.getProductInfo(productIDArray);
        return this.graphQL.get(productQuery);
    }



    /* need to normalize this graphql object to fit the product schema */
    normalizeQLResponse(productData){
        let noramlized = [];

        productData.site.products.edges.forEach((element) => {
            noramlized.push({
                url: element.node.path,
                image: element.node.defaultImage.url,
                title: element.node.name,
                product_id: element.node.entityId,
                price: TEAK.Utils.graphQL.determinePrice(element.node.prices) 
            });
        });

        return noramlized;
    }


}