/** -----------------------------------------------------------------------
 * Yotpo Service
 * Fetches the Yotpo 3rd party service for product ratings
 * ------------------------------------------------------------------------ */

export default class Yotpo {

    /**
     * 
     * @param {$selector} options.dialog - selector for the Questions and Reviews dialog 
     * @param {object} options.product - object literal for product
     * @param {number} options.productId - this product id to associate reviews
     * @param {boolean} options.isProductPage - if on product page
     */
    constructor(options){

        this.settings = {
            key: "aS8rMIONwGgNbx1ATQmUtKY173Xk5HHc75qGrnuq",
            secret: "E4xXDHZQzX38EpHzT5P67u8ME7Etp34PI6iNFRQY",
            account_id: "209994",
            fetchOptions: {
                post: {
                    method: "POST",
                    cache: 'default',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                get: {
                    method: "GET",
                    cache: 'default',
                }
            },
            urls: {
                oauth: "https://api.yotpo.com/oauth/token",
                batch: "https://staticw2.yotpo.com/batch?",
                reviews: "https://api.yotpo.com/v1/widget",
                questions: "https://api.yotpo.com/products",
                search: "https://api.yotpo.com/v1/reviews",
                create_review: "https://api.yotpo.com/v1/widget/reviews",
                create_question: "https://api.yotpo.com/questions"
            }
        };

        Object.assign(this.settings, options);        

        // if we are on the PDP ~ therefore the ReviewQuestion Module
        if( this.settings.isProductPage ){ 

            this.createBody = {
                appkey: this.settings.key,
                sku: this.settings.product.sku,
                product_title: this.settings.product.title,
                product_url: window.location.origin + this.settings.product.url,
                product_image_url: this.settings.product.image,
                prevent_duplicate_review: true
            };

            this.fetchToken().then(res => { this.createBody["utoken"] = res.access_token; });
            this.bindings();
        }
    }


    bindings(){
        $("#reviews")
            .on("click", "button.ratings__distroButton", (e) => { this.getScoreRatings(e); })
            .on("click", "button.ratings__loadMoreBtn", (e) => { this.getNextPage(e); })
            .on("change", "select[name='sort_by_star_rating']", (e) => { this.getScoreRatings(e); })
            .on("keydown", "input.ratings__control--input", (e) => { if( e.code === "Enter" ){ this.getKeywordReviews(e); } })
            .on("click", "button.ratings__control--searchIcon", (e) => { this.getKeywordReviews(e); });

        $(this.settings.dialog)
            .on("change", "input[name='review_score']", (e) => { this.setOverallRating(e); })
            .on("submit", "form", (e) => { this.createYotpoObject(e); });
    }




    /**
     * Toggles the button loading UI
     * @param {element} $target - $ button element 
     * @param {boolean} isLoading - toggles hide/show state
     */
    toggleButtonUI($target, isLoading){
        if( isLoading ){
            $target.attr("disabled", true);
        }else{
            $target.removeAttr("disabled");
        }

        $target
            .find("[rel='load-more-text']").toggleClass("hide", isLoading)
                .end()
            .find("[rel='load-more-icon']").toggleClass("hide", !isLoading);
    }




    toggleModal(type){
        let modalCntr = $("#productModal"),
            tpl =  `<h1 class="product__modalTitle">Thanks For Sharing Your Thoughts!</h1>
                    <div class="product__col-1-1 no-pad">
                        <p>Your ${type} has been submitted successfully. Please note that it may take up to 48 hours to be displayed on AuthenTEAK.com</p>
                    </div>
                    <div class="product__col-1-1 pad-top">
                        <div class="product__col-1-2--lg product__col-1-1 no-pad">&nbsp;</div>
                        <div class="product__col-1-2--lg product__col-1-1 no-pad">
                            <button type="button" class="product__modalSubmitBtn" product-dialog-close>Continue</button>
                        </div>
                    </div>`;

        modalCntr
            .find(".product__modalDialog").addClass("product__modalDialog--success")
                .end()
            .find(".product__modalDialogCntr").html("");

        $(tpl).appendTo(".product__modalDialogCntr", modalCntr);
    }




    // sets the star rating widget in the dialog modal
    setOverallRating(e){
        let $rating = $(e.currentTarget);

        Object.assign(this.createBody, {
            score: parseInt($rating.val())
        });

        $rating.parents("fieldset.ratings--widget").find("label.ratings__widgetLabel--active").removeClass("ratings__widgetLabel--active") 
        $rating.parents("label.ratings__widgetLabel").addClass("ratings__widgetLabel--active");

        $(this.settings.dialog).find(".product__modalOutput").val($rating.attr("title"));
    }



    // serializes the dialog form
    createYotpoObject(e){
        let formName =  $(e.target).attr("name"),
            formData =  $(e.target).serializeArray(),
            obj = { time_stamp: Date.now() },
            $button = $(e.target).find("button");

        this.toggleButtonUI($button, true);

        formData.forEach(element => { obj[`${element.name}`] = element.value; });

        let formObj = Object.assign({}, this.createBody, obj);

        this.sendCreatedData(formObj, formName, $button);

        e.preventDefault();
    }



    // sends the serialized data to yotpo from the dialog form
    sendCreatedData(formObj, formName, $button){
        let res, type;

        switch(formName){
            case "reviews_dialog":
                res = this.createReview(formObj);
                type = "review";
                break;

            case "questions_dialog":
                res = this.createQuestion(formObj);
                type = "question"
                break;
        }

        res.then(data => {
            // console.log(data)
            this.toggleButtonUI($button, false);
            this.toggleModal(type);
        });

    }





    /**
     * Gets the score rating for a given product
     * https://apidocs.yotpo.com/reference#retrieve-reviews-for-a-specific-product
     * @param {jquery} e - $ DOM event object
     */
    getScoreRatings(e){
        let $target = $(e.currentTarget),
            requestedScore = $target.val(),
            res = this.getProductReviews(this.settings.productId, {
                star: requestedScore 
            });

        res.then((data) => {
            this.updateReviewsList({
                reviewData: data.response,
                add_to: false
            });

            $("#productRatingPageBtn")
                .find("button.ratings__loadMoreBtn").val(data.response.pagination.page).data("star", requestedScore)
                    .end()
                .toggleClass("hide", data.response.pagination.total < (data.response.pagination.page * data.response.pagination.per_page) );
        });


        if( $target.hasClass("selectBox__select") ){
            $target.parents(".selectBox__label").find(".selectBox__value").text(`${$target.val()} Stars`).addClass("selectBox__value--choosen");
        }
    } 



    /**
     * Gets the next page for a given target with the value being the current page
     * https://apidocs.yotpo.com/reference#retrieve-reviews-for-a-specific-product
     * @param {jquery} e - $ DOM event object
     */
    getNextPage(e){
        let $target = $(e.currentTarget),
            targetData = $target.data(),
            pageNo = $target.val(),
            obj = { page: parseInt(pageNo) + 1 };

        $target.val(obj.page);
        this.toggleButtonUI($target, true);
 
        if( targetData.hasOwnProperty("star") ){ 
            Object.assign(obj, {
                star: parseInt(targetData.star)
            });
        }

        let res = this.getProductReviews(this.settings.productId, obj);
        res.then((data) => {
            this.updateReviewsList({
                reviewData: data.response,
                add_to: true
            });

            this.toggleButtonUI($target, false);
            $("#productRatingPageBtn").toggleClass("hide", data.response.reviews.length === 0);
        });

    }



    /** Search Reviews
     * Not sure if this works correctly...
     * https://apidocs.yotpo.com/reference#search-reviews
     */
    getKeywordReviews(e){
        e.preventDefault();

        let res = this.searchProductReviews({
                body: {
                    domain_key: `${this.settings.productId}`,
                    free_text_search: $("[name='query']", "#ratingsFilter").val(),
                    per_page: 5
                },
                page: 1
            });

        res.then((data) => {
            console.log(data)
        });
    }




    /**
     * Updates the single reviews Element
     * @param {array} args.reviewData - review response data
     * @param {boolean} args.add_to - should append or clear out the reviews
    */
    updateReviewsList(args){
        let $reviews = $("#productRatingsList");

        if( args.reviewData.reviews.length > 0 ){
            if( !args.add_to ){ $reviews.html(""); }

            args.reviewData.reviews.forEach(element => {
                let tpl = this.getRatingListItem(element);
                $(tpl).appendTo($reviews);
            });

        }else if( !args.add_to ){
            $reviews.html("");
            $("<li><h3 class='ratings__sorryMessage'>Sorry, but it looks like we don't have any reviews that match what you are looking for.</h3></li>").appendTo($reviews);
        }
        
    }



    /**
    * GET bulk response from Yotpo
    * @param {Array} productIdArray arry of product ids 
    */
    async fetchBulk(productIdArray){
        let body = this.buildBulkObject({
                products: productIdArray,
                method: "bottomline",
                pageNumber: 1,
                format: "json"
            }),
            res = this.postYotpoData(this.settings.urls.batch, body);

        return res;
    }




    /**
     * Builds the yotpo object to send to yotpo for 
     * the updated ratings
     * @param {string}  args.method - fetching string
     * @param {array}   args.products - array of product id strings
     * @param {string}  args.free_text_search - searched keyword
    */
    buildBulkObject(args){
        let yotpoObj = {
            app_key: this.settings.key,
            methods: []
        };
        
        try{
            args.products.forEach( (element) => {
                let batchObj = {
                        method: args.method,
                        params: {
                            pid: element,
                            pictures_per_review: 10,
                            is_mobile: false
                        },
                        format: "json"
                    };

                yotpoObj.methods.push(batchObj);
            });

        }catch(err){}
        
        return yotpoObj;
    }



    // General fetching service to get products
    async postYotpoData(url, body){
        const response = await fetch(url, Object.assign(this.settings.fetchOptions.post, {  body: JSON.stringify(body) } ));
        return response.json();
    }


    // POST Customer Review Data
    async createReview(body){    
        let response = await this.postYotpoData(this.settings.urls.create_review, body);
        return response;
    }


    // POST Customer Question Data
    async createQuestion(body){
        let response = await this.postYotpoData(this.settings.urls.create_question, body);
        return response;
    }


    // Get Yotpo Auth Token via POST
    async fetchToken(){
        let opts = {
                client_id: this.settings.key,
                client_secret: this.settings.secret,
                grant_type: "client_credentials"
            };

        let response = await this.postYotpoData(this.settings.urls.oauth, opts);

        return response;
    }


    /**
     * Fetches reviews for a given product
     * @param {number} productId 
     * @param {number} args.page - page number 
     * @param {number} args.page - star rating 
     */
    getProductReviews(productId, args){
        let query = this.setQueryPrams(args);
        return $.ajax(`${this.settings.urls.reviews}/${this.settings.key}/products/${productId}/reviews.json${query}`);
    }



    /**
     * POST keyword based searched reviews
     * @param {number} args.page - page number 
     * @param {number} args.page - star rating 
     * @param {object} args.body - the search body 
     */
    async searchProductReviews(args){
        let query = this.setQueryPrams(args);
        let opts = JSON.stringify(args.body);
        let url = `${this.settings.urls.search}/${this.settings.key}/filter.json${query}`;

        let response = await this.postYotpoData(url, opts);
        return response;
    }



    // fetches yotpo questions for a given product
    getProductQuestions(productId){
        return $.ajax(`${this.settings.urls.questions}/${this.settings.key}/${productId}/questions`);
    }



    /**
     * Sets most used query parameters
     * @param {number} args.page - page number 
     * @param {number} args.page - star rating 
     */
    setQueryPrams(args){
        let params = "?per_page=5";

        if( args ){
            params += `${args.hasOwnProperty("page") ? `&page=${args.page}` : ''}`;
            params += `${args.hasOwnProperty("star") ? `&star=${args.star}` : ''}`;
        }

        return params;
    }



    // gets the distribution % for each rating
    getDistributionPercentage(totalReviews, reviewDistribution){
        let distro = (reviewDistribution/totalReviews) * 100;
        return distro.toFixed();
    }



    // gets the sentiment score to determine the recommendation percentage
    getSentimentScore(reviewsArray){
        let avg = 0;
        reviewsArray.forEach(element => { avg = element.sentiment + avg; });
        avg = (avg/reviewsArray.length) * 100;
        
        return avg.toFixed();
    }



    // product reviews widget
    buildProductReviews(reviewData){
        return `<div class="ratings">
                    <div class="ratings__overView">
                        <div class="ratings__highlights">
                            <h2 class="ratings__avgRate">
                                <span class="ratings__avg">${reviewData.bottomline.average_score.toFixed(1)}</span>
                                <span class="ratings__totalRate">out of 5</span>
                            </h2>
                            <div class="ratings__stars" style="--rating:${reviewData.bottomline.average_score};" aria-label="Rating of ${reviewData.bottomline.average_score} out of 5."></div>
                            <p class="ratings__meta">${reviewData.bottomline.total_review} ${reviewData.bottomline.total_review > 1 ? 'ratings' : 'rating'}</p>
                        </div>
                        <form class="ratings__distroCntr">
                            <ul class="ratings__distroList">
                    ${ Object.keys(reviewData.bottomline.star_distribution).reverse().map(key => {
                        return `<li class="ratings__distroData">
                                    <button type="button" class="ratings__distroButton" value="${key}">
                                        <span class="ratings__distroLabel">${key}</span>
                                        <ul class="ratings__distro">
                                            <li class="ratings__distroBar ratings__distroBar--${this.getDistributionPercentage(reviewData.bottomline.total_review, reviewData.bottomline.star_distribution[key])}"></li>
                                        </ul>
                                        <span class="ratings__distroValue">(${reviewData.bottomline.star_distribution[key]})</span>
                                    </button>
                                </li>`;
                    }).join("")}
                            </ul>
                        </form>
                    </div>
                    <div class="ratings__writeCta">
                        <p><button type="button" class="ratings__btn" product-dialog-open rel="writeReview">Write a Review</button></p>
                        <dl class="ratings__recomm ${this.getSentimentScore(reviewData.reviews) < 50 ? 'hide' : ''}">
                            <dt class="ratings__recommPercent">
                                ${this.getSentimentScore(reviewData.reviews)}%
                                <span class="ratings__recommCust">of customers</span>
                            </dt>
                            <dd class="ratings__recommText">Recommend<br>this product</dd>
                        </dl>
                        <p>Your feedback will help customers like you make informed decisions and will help us to improve our product offerings!</p>
                    </div>
                </div>

                <form class="ratings__filter" id="ratingsFilter">
                    <fieldset class="ratings__controlSet hide">
                        <button class="ratings__control--searchIcon" type="button"></button>
                        <input name="query" value="" class="ratings__control ratings__control--input" autocomplete="off" placeholder="Search Reviews">
                    </fieldset>
                    <label class="selectBox__label selectBox__label--scores"> 
                        <div class="selectBox__text selectBox__text--right">
                            <p class="selectBox__optionText">
                                <span class="selectBox__name selectBox__name--labelLeft">Sort by:</span>
                                <span class="selectBox__value">Select Star Rating</span>
                            </p>
                        </div>
                        <select class="selectBox__select" name="sort_by_star_rating">
                            <option value="5">5 ★★★★★</option>
                            <option value="4">4 ★★★★</option>
                            <option value="3">3 ★★★</option>
                            <option value="2">2 ★★</option>
                            <option value="1">1 ★</option>
                        </select>
                    </label>
                </form>

                <div class="product__col-1-1 no-pad">
                    <ul class="ratings__list" id="productRatingsList">
                ${Object.keys(reviewData.reviews).map((key) => {
                    return this.getRatingListItem(reviewData.reviews[key]);
                }).join('')}
                    </ul>
                </div>
                
                <div id="productRatingPageBtn">
                    <div class="product__col-1-1 no-pad ${reviewData.pagination.page !== reviewData.pagination.total ? '' : 'hide'}">
                        <button type="button" class="ratings__loadMoreBtn" value="1">
                            <span class="ratings__loadMoreText" rel="load-more-text">Load more reviews</span>
                            <span class="ratings__loadMoreIcon hide" rel="load-more-icon"><svg class="icon icon-spinner"><use xlink:href="#icon-spinner" /></svg></span>
                        </button>
                    </div>
                </div>`;
    }



    // the user ratings list HTML
    getRatingListItem(reviewData){
        return `<li class="ratings__listItem">
                    <ul class="ratings__customerInfo">
                        <li class="ratings__avgRate pad-bottom">
                            <span class="ratings__avg ratings__avg--small">${reviewData.score.toFixed(1)}</span>
                            <span class="ratings__totalRate ratings__totalRate--small">out of 5</span>
                        </li>
                        <li class="ratings__stars" style="--rating:${reviewData.score};" aria-label="Rating of ${reviewData.score} out of 5."></li>
                        <li class="ratings__customer">${reviewData.user.display_name}</li>
                        ${reviewData.verified_buyer ? '<li class="ratings__customerVerified">Verified Buyer</li>' : ''}
                        <li class="ratings__customerRateDate">${TEAK.Utils.formatDate(reviewData.created_at)}</li>
                    </ul>
                    <div class="ratings__content">
                        <h3 class="ratings__contentTitle">${reviewData.title}</h3>
                        <p class="ratings__contentText">${reviewData.content}</p>
                    ${reviewData.hasOwnProperty("comment") ? 
                        `<div class="ratings__contentAnswer">
                            <span class="ratings__contentAnswerText">${reviewData.comment.content}</span>
                            <span class="ratings__contentAnswerMeta">&mdash; By AuthenTEAK Representative on ${TEAK.Utils.formatDate(reviewData.comment.created_at)}</span>
                        </div>` : ''
                    }
                    </div>
                </li>`;
    }



    buildReviewsModal(){
        return `<form name="reviews_dialog">
                    <h1 class="product__modalTitle">Write a review</h1>
                    <div class="product__modalHeading">
                        <div class="product__col-1-4--lg product__col-1-1 c">
                            <img class="product__modalImg" src="${this.settings.product.image}">
                        </div>
                        <div class="product__col-3-4--lg product__col-1-1">
                            <cite class="product__modalTitle--4">${this.settings.product.brand}</cite>
                            <h2 class="product__modalTitle--2">${this.settings.product.title}</h2>

                            <div class="product__col-1-1 product__modalControlForm">
                                <div class="product__modalControlGroup">
                                    <div class="product__col-1-2--lg product__col-1-1 no-pad product__modalControl product__modalControl--row">
                                        <h4 class="product__modalTitle--3">Your Overall Rating:</h4>
                                        <output class="product__modalOutput" name="result"></output>
                                    </div>
                                    <div class="product__col-1-2--lg product__col-1-1 no-pad">
                                        <fieldset class="ratings ratings--widget">
                                            <label class="ratings__widgetLabel" for="fiveStars">
                                                ★ <input required type="radio" name="review_score" value="5" title="Excellent" id="fiveStars" class="ratings__widgetScore">
                                            </label>
                                            <label class="ratings__widgetLabel" for="fourStars">
                                                ★ <input required type="radio" name="review_score" value="4" title="Good" id="fourStars" class="ratings__widgetScore">
                                            </label>
                                            <label class="ratings__widgetLabel" for="threeStars">
                                                ★ <input required type="radio" name="review_score" value="3" title="Average" id="threeStars" class="ratings__widgetScore">
                                            </label>
                                            <label class="ratings__widgetLabel" for="twoStars">
                                                ★ <input required type="radio" name="review_score" value="2" title="Fair" id="twoStars" class="ratings__widgetScore">
                                            </label>
                                            <label class="ratings__widgetLabel" for="oneStar">
                                                ★ <input required type="radio" name="review_score" value="1" title="Poor" id="oneStar" class="ratings__widgetScore">
                                            </label>
                                        </fieldset>
                                    </div>
                                </div>

                                <div class="product__modalControlGroup no-pad">
                                    <div class="product__col-1-2--lg no-pad product__modalControl product__modalControl--row">
                                        <h4 class="product__modalTitle--3">Do you recommend this product?</h4>
                                    </div>
                                    <fieldset class="product__modalFieldset">
                                        <label class="product__modalControlLabel product__modalControlLabel--small">
                                            <input type="radio" name="--33401" value="yes"> &nbsp; Yes
                                        </label> 
                                        &nbsp; &nbsp;
                                        <label class="product__modalControlLabel product__modalControlLabel--small">
                                            <input type="radio"  name="--33401" value="no"> &nbsp; No
                                        </label>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="product__col-1-1 no-pad">
                        <div class="product__col-1-1 product__modalControlGroup">
                            <div class="product__col-1-1 product__modalControl">
                                <label class="product__modalControlLabel">Review Title</label>
                                <input required type="text" class="product__modalControlInput product__modalControlInput--input" name="review_title" placeholder="The most important point">
                            </div>
                        </div>
                        <div class="product__col-1-1 product__modalControlGroup">
                            <div class="product__col-3-4--lg product__col-1-1 product__modalControl">
                                <label class="product__modalControlLabel">Your Review</label>
                                <textarea required class="product__modalControlInput product__modalControlInput--textarea" name="review_content" placeholder="Example: This Umbrella was easy to assemble and came with all of its parts. I'm highly pleased with it's color, size and durability."></textarea>
                            </div>
                            <div class="product__col-1-4--lg product__col-1-1 product__bgHighlight">
                                <h4 class="product__modalTitle--4">Review Guidelines</h4>
                                <ul class="product__modalHelpList">
                                    <li>&check; Focus on the product and its features.</li>
                                    <li>&check; What do you like or dislike about the product?</li>
                                    <li>&check; Did the product meet your expectations?</li>
                                    <li>&check; Please contact us directly at <a href="tel:1-833-257-7070">1-833-257-7070</a> to ask about delivery, availability and customer service issues.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="product__col-1-1 product__modalControlGroup">
                            <div class="product__col-1-2--lg product__col-1-1 product__modalControl">
                                <label class="product__modalControlLabel">Your Nickname</label>
                                <input type="text" required class="product__modalControlInput product__modalControlInput--input" name="display_name">
                                <p class="product__modalControlHelp">Please do not use your own name, spaces or special characters.</p>
                            </div>
                            <div class="product__col-1-2--lg product__col-1-1 product__modalControl">
                                <label class="product__modalControlLabel">Your Email Address</label>
                                <input type="email" required class="product__modalControlInput product__modalControlInput--input" name="email">
                                <p class="product__modalControlHelp">Your email will not be displayed publicly, sold nor used for SPAM.  Your email will allow for us to send notifications.</p>
                            </div>
                        </div>
                        <div class="product__col-1-1 product__modalControlGroup">
                            <div class="product__col-2-3--lg product__col-1-1 no-pad"></div>
                            <div class="product__col-1-3--lg product__col-1-1 no-pad">
                                <button type="submit" class="product__modalSubmitBtn">
                                    <span class="product__modalSubmitText" rel="load-more-text">Submit</span>
                                    <span class="product__modalSubmitIcon hide" rel="load-more-icon"><svg class="icon icon-spinner"><use xlink:href="#icon-spinner" /></svg></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>`;
    }


    // Question Modal
    buildQuestionModal(){
        return `<form name="questions_dialog">
                    <h1 class="product__modalTitle">Ask a question</h1>
                    <div class="product__modalHeading">
                        <div class="product__col-1-4--lg product__col-1-1 c">
                            <img class="product__modalImg" src=${this.settings.product.image}">
                        </div>
                        <div class="product__col-3-4--lg product__col-1-1">
                            <cite class="product__modalTitle--4">${this.settings.product.brand}</cite>
                            <h2 class="product__modalTitle--2">${this.settings.product.title}</h2>
                        </div>
                    </div>
                    <div class="product__col-1-1 no-pad">
                        <div class="product__col-1-1 no-pad product__modalControlGroup">
                            <div class="product__col-3-4--lg product__col-1-1 product__modalControl">
                                <label class="product__modalControlLabel">Your Question</label>
                                <textarea required class="product__modalControlInput product__modalControlInput--textarea" name="review_content" placeholder="Example: Does this fit with my existing furniture piece? Does this require assembly?  Where is this made?"></textarea>
                            </div>
                            <div class="product__col-1-4--lg product__col-1-1 product__bgHighlight">
                                <h4 class="product__modalTitle--4">Question Guidelines</h4>
                                <ul class="product__modalHelpList">
                                    <li>&check; Ask about the product, it's features and functionality.</li>
                                    <li>&check; Please contact us directly at <a href="tel:1-833-257-7070">1-833-257-7070</a> to ask about delivery, availability and customer service issues.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="product__col-1-1 product__modalControlGroup">
                            <div class="product__col-1-2--lg product__col-1-1 product__modalControl">
                                <label class="product__modalControlLabel">Your Nickname</label>
                                <input type="text" required class="product__modalControlInput product__modalControlInput--input" name="display_name">
                                <p class="product__modalControlHelp">Please do not use your own name, spaces or special characters.</p>
                            </div>
                            <div class="product__col-1-2--lg product__col-1-1 product__modalControl">
                                <label class="product__modalControlLabel">Your Email Address</label>
                                <input type="email" required class="product__modalControlInput product__modalControlInput--input" name="email">
                                <p class="product__modalControlHelp">Your email will not be displayed publicly, sold nor used for SPAM.  Your email will allow for us to send notifications.</p>
                            </div>
                        </div>
                        <div class="product__col-1-1 product__modalControlGroup">
                            <div class="product__col-2-3--lg product__col-1-1 no-pad"></div>
                            <div class="product__col-1-3--lg product__col-1-1 no-pad">
                                <button type="submit" class="product__modalSubmitBtn">
                                    <span class="product__modalSubmitText" rel="load-more-text">Submit</span>
                                    <span class="product__modalSubmitIcon hide" rel="load-more-icon"><svg class="icon icon-spinner"><use xlink:href="#icon-spinner" /></svg></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>`;
    }



    // question list
    buildProductQuestions(question){
        return `<li class="product__questionItem">
                    <div class="product__questionCol">
                        <button type="button" class="product__questionBtn"><svg class="icon icon-plus2"><use xlink:href="#icon-plus2" /></svg></button>
                    </div>
                    <div class="product__questionCol product__questionCol--main">
                        <h2 class="product__questionHeading">
                            <span class="product__questionText">
                                ${question.content}
                                <span class="product__questionAnswerCount">
                                    &mdash; &nbsp; 
                                    <svg class="icon icon-message-square"><use xlink:href="#icon-message-square" /></svg> 
                                    ${question.sorted_public_answers.length} ${question.sorted_public_answers.length === 1 ? 'answer' : 'answers'}
                                </span>
                            </span>
                            <span class="product__questionMeta">Asked by ${question.asker.display_name} on ${TEAK.Utils.formatDate(question.created_at)}</span>
                        </h2>

            ${Object.keys(question.sorted_public_answers).map((key) => {
                return `<p class="product__answer">
                            <span class="product__answerText">${question.sorted_public_answers[key].content}</span>
                            <span class="product__answerMeta">&mdash; By ${question.sorted_public_answers[key]["is_store_owner_comment?"] ? 'AuthenTEAK Representative' : question.sorted_public_answers[key].display_name} on ${TEAK.Utils.formatDate(question.sorted_public_answers[key].created_at)}</span>
                        </p>`;
            }).join('')}
                        
                    </div>
                </li>`;
    }




}