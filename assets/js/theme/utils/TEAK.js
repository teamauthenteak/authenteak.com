/**
 *  Global Namespace Object { TEAK }
 *  Usage: 
 *      - Primarly used to share data between the View & Model
 *      and other third party modules outside of the scope of app.js
 */
window.TEAK = window.TEAK || {};


/** -----------------------------------------
 * TEAK Data
 * Store Model View data for interactions
 * ------------------------------------------ */
window.TEAK.Data = {};


/** -----------------------------------------
 * TEAK Utility Methods
 * ------------------------------------------ */
window.TEAK.Utils = {

    isHandheld: window.matchMedia("only screen and (max-width: 900px)").matches,

    getMenuData: () => {
        var data;
    
        if(document.getElementById("megaMenuEnhancement") && window.location.hostname !== "localhost"){
            data = document.getElementById("megaMenuEnhancement").innerHTML;
            data = data ? JSON.parse(data) : {};
        
        }else{
            // run it on on our local
            $.ajax({
                dataType: "json",
                url: "/assets/js/theme/megaMenu.json",
                async: false,
                success: (res) => { data = res; }
            });
        }

        return data;
    },



    /**
     * Picks out the cart resonse if its a JSON object and if it has cart.php
     * Saving this to local storage and emmiting an event with the data
     * for anybody to pick up to use in the view
     */
    saveCartResponse: (response) => {
        var event, storedData = JSON.stringify(response);
    
        window.localStorage.setItem('cartData', storedData);
    
        if( typeof(Event) === 'function' ) {
            event = new Event('cartDataStored');
            
        }else{
            event = document.createEvent('cartDataStored');
            event.initEvent('submit', true, true);
        }
    
        window.dispatchEvent(event);
    
        return this;
    }

};




/** -----------------------------------------
 * TEAK Modules
 * ------------------------------------------ */
window.TEAK.Modules = {};


/** -------------------------
 * Global Mega Menu Module 
 * -------------------------- 
 * {
    "category_1111":{
        "makeShort": false,
    	"landing_image":{
            "title": "",
            "url": "",
            "caption": "",
            "img":{
                "src": "",
                "alt": ""
            }
        },
        "shop_by_brand": {
            "title": "Shop by Brand",
            "url": "",
            "items": [
                {
                    "title": "",
                    "url": "",
                    "highlight": false,
                    "emphasis": false
                },
            ]
        },
        "shop_by_collection":{
            "title": "Shop by Collection",
            "url": "",
            "items": [
                {
                    "title": "",
                    "url": "",
                    "highlight": false,
                    "emphasis": false
                },
            ]
        }
    },
    .....
}
*/

TEAK.Modules.megaMenu = {

    data: TEAK.Data.hasOwnProperty("megaMenu") ? TEAK.Data.megaMenu : TEAK.Utils.getMenuData(),

    init: function(id){
        this
            .setCustomMobileCategory(id, "shop_by_collection")
            .setCustomMobileCategory(id, "shop_by_brand")
            .setCustomMobileImg(id);

        if( !TEAK.Utils.isHandheld ){
            this
                .setLandingImage(id)
                .setCustomCategory(id, "shop_by_collection")
                .setCustomCategory(id, "shop_by_brand")
                .setDisplayHeight(id);
        }
        
        return this;
    },


    // Desktop: Build out the images in the flyout on runtime
    setLandingImage: function(id) {
        if( this.data[id] !== undefined && this.data[id].hasOwnProperty("landing_image") ){
            let data = this.data[id].landing_image,
                tpl = `<a href="${data.url}" title="${data.title}" class="landing__link">
                            <span class="landing__caption">${data.caption}</span>
                            <img class="landing__image" src="${data.img.src}" alt="${data.img.alt}">
                        </a>`;
    
            document.getElementById(id).querySelector(".mega-nav-landing").innerHTML = tpl;
    
        }else{
            document.getElementById(id).querySelector(".mega-nav-landing").style.display = "none";
        }
        
        return this;
    },


    // Desktop: gets the custom category brands for a given flyout
    setCustomCategory: function(id, customCategory){
        if( this.data[id] !== undefined && this.data[id].hasOwnProperty(customCategory) ){
            let data = this.data[id][customCategory], parentLi,
                sibblingItems = document.getElementById(id).querySelectorAll(".parent--collapse").limit,

                tpl =   `<a href="${data.url}">${data.title}</a>
                        <ul class="parent__child">
                ${Object.keys(data.items).map(key => {
                    return `<li itemprop="name" class="parent__childItem">
                                <a itemprop="url" href="${data.items[key].url}" class="parent__childLink ${data.items[key].highlight ? 'mega-nav-item-hightlight' : '' }">
                                ${data.items[key].emphasis ? "<em>" : ""}
                                    ${data.items[key].title}
                                ${data.items[key].emphasis ? "</em>" : ""}
                                </a>
                            </li>`}).join("")}
                        </ul>`;

            parentLi = document.createElement("li"),
            parentLi.className = "parent has-children tier-dropdown";
            parentLi.innerHTML = tpl;

            document.getElementById(id).querySelectorAll(".mega-nav-list")[0].insertBefore(parentLi, sibblingItems);
        }
        
        return this;
    },


    // Desktop: sets the display height for the container
    setDisplayHeight: function(id){
        if( this.data[id] !== undefined ){
            if( this.data[id].makeShort ){
                document.getElementById(id).querySelectorAll(".mega-nav-list")[0].classList.add("mega-nav-list--short");
            }
        }
       
        return this;
    },



    // Mobile: Set the mobile category link
    setCustomMobileCategory: function(id, customCategory){
        if( this.data[id] !== undefined && this.data[id].hasOwnProperty(customCategory) ){
            let data = this.data[id][customCategory], mobileItem,
                tpl = `<a href="${data.url}" class="nav-mobile-link" data-toggle-mobile="${data.url}" data-mobile-name="${data.title}" title="${data.title}">
                            <span class="nav-mobile-text" itemprop="name">${data.title}</span>
                            <svg class="icon-arrow-down" width="9" height="7" viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg">
                                <title>dropdown_arrow</title>
                                <path d="M1.832.753l2.668 2.7 2.67-2.7c.418-.42 1.097-.42 1.516 0 .417.424.42 1.11 0 1.533l-3.428 3.46c-.417.42-1.098.42-1.518 0L.314 2.287c-.42-.424-.42-1.11 0-1.533.42-.42 1.1-.42 1.518 0z"></path>
                            </svg>
                        </a>`;
                        
            mobileItem = document.createElement("li");
            mobileItem.className = "nav-mobile-item has-children";
            mobileItem.innerHTML = tpl;

            document.getElementById("mobile_" + id).appendChild(mobileItem);

            this.setCustomMobileNavPanel(data);
        }

        return this;
    },



    // Mobile: Add the unordered list of links for a given category with children to main nav container
    setCustomMobileNavPanel: function(data){
        let navPanel,
            tpl = `<li class="nav-mobile-item nav-mobile-panel-title">${data.title}</li>
        ${Object.keys(data.items).map(key => {
            return `<li class="nav-mobile-item">
                        <a href="${data.items[key].url}" class="nav-mobile-link">
                            <span class="nav-mobile-text" itemprop="name">
                                ${data.items[key].title}
                            </span>
                        </a>
                    </li>`}).join("")}`;

        navPanel = document.createElement("ul");
        navPanel.classList = "nav-mobile-panel nav-mobile-panel-child is-right";
        navPanel.setAttribute("data-mobile-menu", data.url);
        navPanel.setAttribute("data-panel-depth", "2");
        navPanel.innerHTML = tpl;

        document.getElementById("navMobileContainer").appendChild(navPanel);

        return this;
    },



    // Mobile: sets the category image
    setCustomMobileImg: function(id){
        if( this.data[id].landing_image !== undefined ){
            let data = this.data[id].landing_image, navItem,
                tpl = `<a href="${data.url}" title="${data.title}">
                            <img class="mobileNav__menuImg" alt="${data.img.alt}" src="${data.img.src}">
                            <p class="mobileNav__menuFeatured">${data.caption}</p>
                        </a>`;

            navItem = document.createElement("li")
            navItem.classList = "nav-mobile-item nav-mobile-item--image";
            navItem.innerHTML = tpl;
            
            document.getElementById("mobile_" + id).appendChild(navItem);
        }

        return this;
    }


};
