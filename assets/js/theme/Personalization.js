import PageManager from '../PageManager';

/**
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

        this.yotpoKey = "aS8rMIONwGgNbx1ATQmUtKY173Xk5HHc75qGrnuq";

        this.yotpoBatchUrl = "https://staticw2.yotpo.com/batch?";
        this.yotpoReviewsUrl = "https://api.yotpo.com/v1/widget";
        this.yotpoQuestionsUrl = "https://api.yotpo.com/products";

        // must be passed in settings
        this.type = settings.type;
       
        this.savedLimit = 20;
        this.isSaved = false;

        this.savedProducts = this.getViewed();
    }

    /**
     * Saves the viewed product object to localstorage
     * @param {Object} product as parsed json 
     */
    saveViewed(product){
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

            this.savedProducts = JSON.stringify(this.savedProducts);
            window.localStorage.setItem("TEAK_"+this.type, this.savedProducts);

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

        let yotpoObj = this.buildYotpoBulkObject(savedProductIds);

        return this.fetchYotpoBulk(yotpoObj).then((data) => data);
    }




    /**
     * Fetch recently viewed from local storage
     */ 

    getViewed(){
        if( window.localStorage ){
            let saved = window.localStorage.getItem("TEAK_"+this.type);

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
     * GET bulk resopnse from Yotpo
     * @param {Object} body JSON object for yotpo
     */

    async fetchYotpoBulk(body){
        const response = await fetch(this.yotpoBatchUrl, {
			method: "POST",
			cache: 'default',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
        });
        
        return response.json();
    }



    /**
     * Builds the yotpo object to send to yotpo for 
     * the updated ratings
     * @param {Array} arr - Array of product ids
     */

    buildYotpoBulkObject(arr){
        let yotpoObj = {
            app_key: this.yotpoKey,
			methods: []
        };
        
		try{
			arr.forEach( (element) => {
				let batchObj = {
                        method: "bottomline",
						params: {
							pid: element
                        },
                        format: "json",
					};

				yotpoObj.methods.push(batchObj);
            });

        }catch(err){}
        
        return yotpoObj;
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
                        <div class="replaced-image lazy-loaded" style="background-image:url(${product.image})">
                            <img class="lazy-image lazy-loaded" src="${product.image}" alt="You viewed ${product.title}">
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
        let productQueryTpl = TEAK.QueryGraphTPL.getProductInfo(productIDArray);

        return fetch('https://authenteak.com/graphql', {
                    method: 'POST',
                    credentials: 'include',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${TEAK.Globals.graphQl_dev}`
                    },
                    body: JSON.stringify({
                        query: productQueryTpl
                    })
                })
                .then(res => res.json())
                .then(res => res.data);
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
                price: determinePrice(element.node.prices) 
            });
        });

        // get product price
        function determinePrice(prices){
            if(prices.salePrice !== null){
                if(prices.salePrice.value !== 0){
                    return prices.salePrice.value;

                }else{
                    return  prices.price.value;
                }

            }else{
                return  prices.price.value;
            }
        }


        return noramlized;
    }






}