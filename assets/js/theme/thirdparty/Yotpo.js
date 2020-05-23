/** -----------------------------------------------------------------------
 * Yotpo Service
 * Fetches the Yotpo 3rd party service for product ratings
 * ------------------------------------------------------------------------ */

export default class Yotpo {
    constructor(options){

        this.settings = {
            key: "aS8rMIONwGgNbx1ATQmUtKY173Xk5HHc75qGrnuq",
            secret: "E4xXDHZQzX38EpHzT5P67u8ME7Etp34PI6iNFRQY",
            account_id: "209994",
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
            this.createReview();
            this.bindings();
        }
    }


    bindings(){
        $("#reviews").off();

        $("#reviews")
            .on("click", "button.ratings__distroButton", (e) => { this.getScoreRatings(e); })
            .on("click", "button.ratings__loadMoreBtn", (e) => { this.getNextPage(e); })
            .on("change", "select[name='sort_by_star_rating']", (e) => { this.getScoreRatings(e); })
            .on("keydown", "input.ratings__control--input", (e) => { if( e.code === "Enter" ){ this.getKeywordReviews(e); } })
            .on("click", "button.ratings__control--searchIcon", (e) => { this.getKeywordReviews(e); });
    }



    createReview(){
        let body = {
                appkey: this.settings.key,
                sku: this.settings.product.sku,
                product_title: this.settings.product.title,
                product_url: window.location.origin + this.settings.product.url,
                product_image_url: this.settings.product.image,
                display_name: "John Smith",
                email: "john@shop.com",
                review_content: "It’s really good",
                review_title: "Great Phone",
                review_score: 5,
                time_stamp: Date().now()
            };

        console.log(body)
    }




    createQuestion(){
        let body = {
                "review_content": "Do you have this in white?",
                "display_name": "John",
                "email": "john@yotpo.com",
                "appkey": "##### YOUR APP KEY HERE #####",
                "utoken": "#### YOUR UTOKEN HERE #####",
                "sku": "761060802",
                "product_title": "T-Shirt",
                "product_description": "The most comfortable shirt you will ever own.",
                "product_url": "http://john-doe.mystore.com/products/long-sleeve-t-shirt",
                "product_image_url": "//cdn.mystore.com/s/files/1/0864/8972/products/t-shirt-template-ljrmrs7o_large.png%3Fv=1423289315",
                "prevent_duplicate_review": "true",
            };
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
        toggleButtonUI(true, false);
 
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

            toggleButtonUI(false, data.response.reviews.length === 0);
        });



        // toggles the load more button UI
        function toggleButtonUI(isLoading, shouldHide){
            if( isLoading ){
                $target.attr("disabled", true);
            }else{
                $target.removeAttr("disabled");
            }

            $target
                .find(".ratings__loadMoreText").toggleClass("hide", isLoading)
                    .end()
                .find(".ratings__loadMoreIcon").toggleClass("hide", !isLoading);

            $("#productRatingPageBtn").toggleClass("hide", shouldHide);
        }
    }



    /** Search Reviews
     * Not sure if this works correctly...
     * https://apidocs.yotpo.com/reference#search-reviews
     */
    getKeywordReviews(e){
        e.preventDefault();

        let obj = {
                domain_key: `${this.settings.productId}`,
                free_text_search: $("[name='query']", "#ratingsFilter").val(),
                per_page: 5
            };

        let res = this.searchProductReviews({
                body: obj,
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
                $(tpl).appendTo("#productRatingsList");
            });

        }else{
            $reviews.html("");
            $("<li><h3 class='ratings__sorryMessage'>Sorry, but it looks like we don't have any reviews that match what you are looking for.</h3></li>").appendTo($reviews);
        }
        
    }



    /**
    * GET bulk resopnse from Yotpo
    * @param {Array} productIdArray arry of product ids 
    */
    async fetchBulk(productIdArray){
        let body = this.buildBulkObject({
                products: productIdArray,
                method: "bottomline",
                pageNumber: 1,
                format: "json"
            }),
            res = this.fetchYotpoBatch(body);

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
    async fetchYotpoBatch(body){
        const response = await fetch(this.settings.urls.batch, {
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
     * Get keyword based searched reviews
     * @param {number} args.page - page number 
     * @param {number} args.page - star rating 
     * @param {object} args.body - the search body 
     */
    searchProductReviews(args){
        let query = this.setQueryPrams(args);

        return $.ajax({
                method: "POST",
                url: `${this.settings.urls.search}/${this.settings.key}/filter.json${query}`,
                data: JSON.stringify(args.body)
            });
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
                        <p><button type="button" class="ratings__btn">Write a Review</button></p>
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
                    <fieldset class="ratings__controlSet">
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
                            <span class="ratings__loadMoreText">Load more reviews</span>
                            <span class="ratings__loadMoreIcon hide"><svg class="icon icon-spinner"><use xlink:href="#icon-spinner" /></svg></span>
                        </button>
                    </div>
                </div>`;
    }



    // the user ratings list HTML
    getRatingListItem(reviewData){
        return `
            <li class="ratings__listItem">
                <ul class="ratings__cutomerInfo">
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


    // Question Modal
    buildQuestionModal(){
        return `<h1 class="product__modalTitle">Ask a question</h1>
                <div class="product__col-1-1">
                    <div class="product__col-1-4">
                        <img class="product__modalImg" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/1024x1024/products/5223/53403/CP901__01269.1496156394.jpg?c=2&imbypass=on">
                    </div>
                    <div class="product__col-3-4">
                        <cite class="product__modalTitle--4">Treasure Garden</cite>
                        <h2 class="product__modalTitle--2">Treasure Garden Umbrella &amp; Cantilever Covers</h2>
                    </div>
                </div>
                <form>
                    <div class="product__col-1-1 no-pad product__modalControlGroup">
                        <div class="product__col-3-4 product__modalControl">
                            <label class="product__modalControlLabel">Your Question</label>
                            <textarea class="product__modalControlInput product__modalControlInput--textarea" name="review_content" placeholder="Example: Does this fit with my existing furniture piece? Does this require assembly?  Where is this made?"></textarea>
                        </div>
                        <div class="product__col-1-4 product__bgHighlight">
                            <h4 class="product__modalTitle--4">Question Guidelines</h4>
                            <ul class="product__modalHelpList">
                                <li>&check; Ask about the product, it's features and functionality.</li>
                                <li>&check; Please contact us directly at <a href="tel:1-833-257-7070">1-833-257-7070</a> to ask about delivery, availability and customer service issues.</li>
                            </ul>
                        </div>
                    </div>
                    <div class="product__col-1-1 product__modalControl">
                        <label class="product__modalControlLabel">Nickname</label>
                        <input type="text" class="product__modalControlInput product__modalControlInput--input" name="display_name" placeholder="Please do not use your own name, spaces or special characters">
                    </div>
                    <div class="product__col-1-1 product__modalControlGroup">
                        <div class="product__col-2-3"></div>
                        <div class="product__col-1-3 no-pad">
                            <button type="button" class="button button-primary button-primary--green button--fullWidth">Submit</button>
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