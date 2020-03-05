import PageManager from '../PageManager';
import { filter } from 'async';

export default class Blog extends PageManager {
    constructor() {
        super();

        this.blogData = JSON.parse(document.getElementById("blogPostData").innerHTML);

        this.blogFilter = document.getElementById("blogFilter");
        this.blogPostCntr = document.getElementById("blogPostCntr");
        this.morePostsBtn = document.getElementById("morePostsBtn");
        this.noPostsCntr = document.getElementById("noPosts");
        this.postTopicMeta = document.getElementById("postTopicMeta");
        this.postsTracker = 6;

        this.initListners();
    }

    // helper to remove encoding used in stencil tempalte
    removeQuotEncoding(str){
        return str.replace(/&quot;/gi, '');
    }


    // standard blog pod template
    blogPod(post){
        return `<div class="blog__postPod">
                    <figure>
                        <a class="post-more" href="${post.url}" title="${this.removeQuotEncoding(post.title)}">
                            <img src="${post.thumb ? post.thumb : 'https://dummyimage.com/640x400/ccc/ccc' }" alt="${this.removeQuotEncoding(post.title)}" class="post-thumb">
                        </a>
                    </figure>
                    <h2 class="post-title">
                        <a href="${post.url}">${this.removeQuotEncoding(post.title)}</a>
                    </h2>
                    <p class="post-summary">${this.removeQuotEncoding(post.summary)}</p>
                    <strong class="post-summary-actions">
                        <a class="post-more" href="${post.url}" title="Read more about ${this.removeQuotEncoding(post.title)}">Read More &rsaquo;</a>
                    </strong>
                </div>`;
    }


    // whent the "load more posts" button is clicked get the next set of posts to show
    initMoreButton(e){
        let nextPosts = this.blogData.posts.slice(this.postsTracker, this.postsTracker + 6);
        this.postsTracker = this.postsTracker + 6;

        this.addMorePosts(nextPosts);

        e.preventDefault();
    }


    // handle the UI once the next posts are loaded
    addMorePosts(nextPosts){
        nextPosts.forEach(element => {
            let tpl = this.blogPod(element);
            $(tpl).appendTo(this.blogPostCntr);
        });

        if( this.blogData.posts.length <= this.postsTracker ){
            $(morePostsBtn).addClass("hide");

        }else{
            return;
        }
    }



    // on click of top radio filters create our filter model
    initPostFilters(e){
        let filterTag = e.currentTarget.value,
            filteredPosts = [];
        
        this.blogData.posts.forEach( (element) => {
            element.tags.find((tag) => {
                if( tag === filterTag ){
                    filteredPosts.push(element);
                }
            });
        });

        this.buildFilteredPods(filteredPosts, filterTag);
    }



    // handles the UI for label clicked based toggle
    toggleFilter(e){
        let $this = $(e.currentTarget),
            $thisParent = $($this).parents("label.filter__controlLabel"),
            isActive = $thisParent.hasClass("filter__controlLabel--active");

        $(this.blogFilter).find(".filter__controlLabel--active").removeClass("filter__controlLabel--active");
        $thisParent.toggleClass("filter__controlLabel--active", !isActive);

        // label + input race
        setTimeout(()=>{
            $this.prop("checked", !isActive);
        }, 1);
        

        if(isActive){
            this.clearFilter(e);

        }else{
            this.initPostFilters(e);
        }
    }



    // build out the filtered pods UI
    buildFilteredPods(filteredPosts, filterTag){
        let hasPosts = filteredPosts.length > 0;

        this.blogPostCntr.innerHTML = "";

        if( hasPosts ){
            filteredPosts.forEach( (element) => {
                let tpl = this.blogPod(element);
                $(tpl).appendTo(this.blogPostCntr);
            });
        }

        $(this.postTopicMeta)
            .html(`Topic: ${filterTag}, ${filteredPosts.length} ${filteredPosts.length === 1 ? 'Post' : 'Posts'}`)
            .parent(".blog__postTopicMeta").toggleClass("hide", !hasPosts);
        
        $(this.noPostsCntr).toggleClass("hide", hasPosts);
        $(this.morePostsBtn).parent(".blog__loadMoreCntr").toggleClass("hide", hasPosts);
    }



    toggleFilterMenu(e){
        let $this = $(e.currentTarget);
        $this.parent(".filter__heading").toggleClass("filter__heading--open");
    }




    clearFilter(e){
        this.blogPostCntr.innerHTML = "";

        this.blogData.posts.forEach( (element) => {
            let tpl = this.blogPod(element);
            $(tpl).appendTo(this.blogPostCntr);
        });

       $(".blog__postTopicMeta").addClass("hide");

        $(this.morePostsBtn).parent(".blog__loadMoreCntr").removeClass("hide");
        this.initMoreButton(e);

        if( window.TEAK.Utils.isHandheld ){
            $(".filter__headingControl").click();
        }

        $(this.blogFilter)
            .find(".filter__controlLabel--active").removeClass("filter__controlLabel--active")
            .find("input:checked").prop("checked", false);

        e.preventDefault();
    }




    // event listners
    initListners(){
        $(this.morePostsBtn).on("click", (e) => {
            this.initMoreButton(e);
        });

        $(this.blogFilter)
            .on("click", ".filter__controlInput", (e) => {
                e.preventDefault();
                this.toggleFilter(e);
            })
            .on("click", ".filter__headingControl", (e) => {
                if( window.TEAK.Utils.isHandheld ){ this.toggleFilterMenu(e); }
                e.preventDefault();
            });


        $(document)
            .on("click", ".blog__clearFilter", (e) => {
                this.clearFilter(e);
            });

    }
}

