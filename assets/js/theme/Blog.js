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


    // build out the filtered pods UI
    buildFilteredPods(filteredPosts, filterTag){
        let hasPosts = filteredPosts.length > 0;

        this.blogPostCntr.innerHTML = "";

        $(this.blogFilter)
            .find(".filter__controlLabel--active").removeClass("filter__controlLabel--active")
                .end()
            .find("input[value="+ filterTag +"]").parent(".filter__controlLabel").addClass("filter__controlLabel--active");


        if( hasPosts ){
            filteredPosts.forEach( (element) => {
                let tpl = this.blogPod(element);
                $(tpl).appendTo(this.blogPostCntr);
            });
        }

        $(this.postTopicMeta)
            .html(` &mdash; Topic: ${filterTag}, ${filteredPosts.length} Posts`)
            .toggleClass("hide", !hasPosts);
        
        $(this.noPostsCntr).toggleClass("hide", hasPosts);
        $(this.morePostsBtn).addClass("hide");
    }



    toggleFilterMenu(e){
        let $this = $(e.currentTarget);
        $this.parent(".filter__heading").toggleClass("filter__heading--open");
    }




    // event listners
    initListners(){
        $(this.morePostsBtn).on("click", (e) => {
            this.initMoreButton(e);
        });

        $(this.blogFilter)
            .on("change", ".filter__controlInput", (e) => {
                this.initPostFilters(e);
            })
            .on("click", ".filter__headingControl", (e) => {
                if( window.TEAK.Utils.isHandheld ){ this.toggleFilterMenu(e); }
                e.preventDefault();
            });


    }
}

