import PageManager from '../PageManager';
import Blog from '../theme/Blog';

export default class BlogPost extends PageManager {
    constructor() {
        super();

        this.Blog = new Blog();

        this.blogData = JSON.parse(document.getElementById("blogPostData").innerHTML);
        this.currentPostData = this.blogData.current;

        this.relatedCntr = document.getElementById("relatedPosts");
        this.relatedPosts = [];
        this.initRelatedPosts();

        this.pagination = document.getElementById("blogPagination");
        this.initPagination();    
    }


    // get the pagination data from the blogs
    initPagination(){
        this.blogData.posts.forEach( (element, index) => {
            if( this.currentPostData.title === element.title ){
                let prevPost = this.blogData.posts[index - 1];
                let nextPost = this.blogData.posts[index + 1];
                
                if( typeof prevPost !== "undefined" ){
                    prevPost.title = this.Blog.removeQuotEncoding(prevPost.title);

                    this.buildPagination({
                        item: ".blog__paginationItem--prev",
                        data: prevPost
                    });
                }

                if ( typeof nextPost !== "undefined" ){
                    nextPost.title = this.Blog.removeQuotEncoding(nextPost.title);

                    this.buildPagination({
                        item: ".blog__paginationItem--next",
                        data: nextPost
                    });
                }
                
            }
        });
    }



    // build the pagination UI
    buildPagination(args){
        $(args.item, this.pagination)
            .find(".blog__paginationTitle").text(args.data.title)
                .end()
            .find(".blog__paginationLink").attr("href", args.data.url)
                .end()
            .removeClass("hide")
    }



    // loop over the data to find the realted to the current post
    initRelatedPosts(){
        this.blogData.posts.forEach( (element, index) => {
            this.currentPostData.tags.forEach( (currentTag, currentTagIndex) => {
                if( element.tags.includes(currentTag) && element.title !== this.currentPostData.title ){                    
                    this.relatedPosts.push(element);
                }
            });
        });

        if( this.relatedPosts.length > 0 ){
            this.buildRelatedPosts(this.relatedPosts);

        }else{
            $(".blog__related", this.pagination).addClass("hide");
        }
    }



    // add the post pods to the UI
    buildRelatedPosts(){
        for (let i = 0; i < this.relatedPosts.length; i++) {
            
            let tpl = this.Blog.blogPod(this.relatedPosts[i]);
            $(tpl).appendTo(this.relatedCntr);

            if( i > 2 ){ break; }
        }
    }



}
