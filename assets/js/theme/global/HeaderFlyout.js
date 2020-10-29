import firebase from 'firebase/app';
import 'firebase/firestore';

/** --------------------------------------------
 * Global Header Mega Menu Module 
 * --------------------------------------------- 
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

export default class HeaderFlyout {
    constructor(){

        if ( !firebase.apps.length ) {
            firebase.initializeApp(TEAK.Globals.firebase.config);
        }

        this.db = firebase.firestore();
        this.header = this.db.collection("site").doc("header");

        this.data = null;
        this.marketingData = null;

        // this.setFlyoutData();
        this.buildFlyout();
    }


    buildFlyout(){
        this.getFlyoutData();

        try{
            let megaJSON = JSON.parse(document.getElementById("megaNavJSON").innerHTML);
    
            megaJSON.forEach((element) => {
                if(element.id !== "category_2425" && element.id !== "category_2299"){
                    this.init(element.id);
                }
            });
    
        }catch(e){}
    }




    init(id){
        if( this.data[id] === undefined ){ return; }
            
        this.setCustomMobilePages(id);
        this.setCustomMobileCategory(id, "shop_by_collection");
        this.setCustomMobileCategory(id, "shop_by_brand");
		this.setCustomMobileImg(id);
            
        if( !TEAK.Utils.isHandheld ){
            this.setCustomPages(id);
            this.setLandingImage(id);
            this.setCustomCategory(id, "shop_by_collection");
            this.setCustomCategory(id, "shop_by_brand");
            this.setDisplayDimention(id);
        }
		
		// if is "trade customer" then hide this category
		if(TEAK.User.isTradeCustomer){
			document.querySelector("li[category_2508]").style.display = "none";
		}
    }


    // Desktop: Build out the images in the flyout on runtime
    setLandingImage(id) {
        if( this.data[id] !== undefined && this.data[id].hasOwnProperty("landing_image") ){
            let data = this.data[id].landing_image,
                tpl = `<a href="${data.url}" title="${data.title}" class="landing__link">
                            <span class="landing__caption">${data.caption}</span>
                            <img class="landing__image" src="${data.img.src}" alt="${data.img.alt}">
                        </a>`;
    
            document.getElementById(id).querySelector(".mega-nav-landing").innerHTML = tpl;
    
        }else{
            document.getElementById(id).querySelector(".mega-nav-landing").style.visibility = "hidden";
        }
    }


    // Desktop: gets the custom category brands for a given flyout
    setCustomCategory(id, customCategory){
        if( this.data[id] !== undefined && this.data[id].hasOwnProperty(customCategory) ){
            let data = this.data[id][customCategory], parentLi,
                sibblingItems = document.getElementById(id).querySelectorAll(".parent--collapse").limit,

                tpl =  `<a href="${data.url}">${data.title}</a>
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
            parentLi.setAttribute("class", "parent has-children tier-dropdown");
            parentLi.innerHTML = tpl;

            document.getElementById(id).querySelectorAll(".mega-nav-list")[0].insertBefore(parentLi, sibblingItems);
        }
        
    }


    // Desktop: sets custom pages
    setCustomPages(id){
        if( this.data[id].hasOwnProperty("pages") ){

            this.data[id].pages.forEach((element) => {
                let parentLi,
                    tpl =  `<a itemprop="url" href="${element.url}" title="${element.title}" class="${element.highlight ? 'mega-nav-item-hightlight' : '' }">
								${element.emphasis ? "<em>" : ""}
								<span itemprop="name">${element.title}</span>
								${element.emphasis ? "</em>" : ""}
                            </a>`;

                parentLi = document.createElement("li"),
                parentLi.setAttribute("class", "parent parent--collapse tier-dropdown");
                parentLi.innerHTML = tpl;

                document.getElementById(id).querySelectorAll(".mega-nav-list")[0].appendChild(parentLi);
            });
        }
    }



    // Desktop: sets the display height for the container
    setDisplayDimention(id){
        if( this.data[id] !== undefined ){
			var categoryId = document.getElementById(id);
			
            if( this.data[id].makeShort ){
                categoryId.querySelectorAll(".mega-nav-list")[0].classList.add("mega-nav-list--short");
			}
			
			if( this.data[id].minWidth ){
				let wrapperWidth = checkWrapperWidth(this.data[id]);

				$(categoryId)
					.parents(".dropdown-panel").css({
						"minWidth": this.data[id].minWidth
					})
						.end()
					.parents(".dropdown-panel-wrapper").css("width", wrapperWidth.width);
			}
		}

		/**
		 * if the width you are asking me to set is just 40 pixels less than the 
		 * actual window width, just set my width to 100% of the current window width 
		 * 
		 * Later, if this is the case make sure that you postion my left to be flush
		 * to the left side of screen realitive to where I currenty live
		 */

		function checkWrapperWidth(element){
			let hasImageWidth =  (typeof element.landing_image !== "undefined" ? 384 : 0),
				newSetWidth = element.minWidth + hasImageWidth,
				fitsWindow = (window.innerWidth - newSetWidth < 40);

			return { 
				fits: fitsWindow,
				width: fitsWindow ? window.innerWidth - hasImageWidth : newSetWidth
			};
		}



		/*
		* Modified, but inspired by: 
		* Chris Ferdinandi, MIT License, https://gomakethings.com
		*/
		function isInViewport(elem) {
			let bounding = elem.getBoundingClientRect();

			return {
				top: bounding.top < 0,
				left: bounding.left < 0,
				bottom: bounding.bottom > window.innerHeight,
				right: bounding.right > window.innerWidth
			};
		}



		function getNewPosition(pos, elementPosition){
			let update = {}, margin = 5;

			switch(pos){
				case "right": 
					update = {pos: -((elementPosition - window.innerWidth) + margin), direction: "left" }; 
					break;
			}

			return update;
		}



		document.getElementById("mainNavBar").querySelector("li["+id+"]").addEventListener("mouseenter", function() { 
			let dropDown = this.querySelectorAll(".dropdown-panel-wrapper")[0];
			
			setTimeout(function(){
				let dropdownCheck = isInViewport(dropDown);
				
				for(let key in dropdownCheck){
					if(dropdownCheck[key]){
						let newPosition = getNewPosition(key, dropDown.getBoundingClientRect()[key]);
						$(dropDown).css(newPosition.direction, newPosition.pos);
					}
				}

			}, 300);
			
		});
       
    }



    // Mobile: Set the mobile category link
    setCustomMobileCategory(id, customCategory){
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
            mobileItem.setAttribute("class", "nav-mobile-item has-children");
            mobileItem.innerHTML = tpl;

            document.getElementById("mobile_" + id).appendChild(mobileItem);

            this.setCustomMobileNavPanel(data);
        }

    }



    // Mobile: Add the unordered list of links for a given category with children to main nav container
    setCustomMobileNavPanel(data){
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
        navPanel.setAttribute("class", "nav-mobile-panel nav-mobile-panel-child is-right");
        navPanel.setAttribute("data-mobile-menu", data.url);
        navPanel.setAttribute("data-panel-depth", "2");
        navPanel.innerHTML = tpl;

        document.getElementById("navMobileContainer").appendChild(navPanel);

    }



    // Mobile: sets the category image
    setCustomMobileImg(id){
        if( this.data[id].landing_image !== undefined ){
            let data = this.data[id].landing_image, navItem,
                tpl = `<a href="${data.url}" title="${data.title}">
                            <img class="mobileNav__menuImg" alt="${data.img.alt}" src="${data.img.src}">
                            <p class="mobileNav__menuFeatured">${data.caption}</p>
                        </a>`;

            navItem = document.createElement("li")
            navItem.setAttribute("class", "nav-mobile-item nav-mobile-item--image");
            navItem.innerHTML = tpl;
        }
    }



    // Mobile: sets custom pages
    setCustomMobilePages(id){
        if( this.data[id].hasOwnProperty("pages") ){
            this.data[id].pages.forEach((element) => {
                let navItem,
                    tpl =  `<a itemprop="url" href="${element.url}" title="${element.title}" class="nav-mobile-link">
                                <span class="nav-mobile-text" itemprop="name">${element.title}</span>
                            </a>`;

                navItem = document.createElement("li"),
                navItem.setAttribute("class", "nav-mobile-item");
                navItem.innerHTML = tpl;

                document.getElementById("mobile_" + id).appendChild(navItem);
            });
        }
    }


    // get top bar marketing content from storage if not, then firebase and save
    async getHeaderMarketingData(){
        this.marketingData = TEAK.Utils.getStoredData('TEAK_headerMarketing');

        if( !this.marketingData ){
            this.marketingData = this.getFirebaseHeaderData("marketing_content", "TEAK_headerMarketing");
            return this.marketingData;

        }else{
            return this.marketingData;
        }

        
    }


    // get flyout data from storage if not, then firebase and save
    async getFlyoutData(){
        this.data = TEAK.Utils.getStoredData('TEAK_flyoutData');

        if( !this.data ){
            this.data = this.getFirebaseHeaderData("flyout", "TEAK_flyoutData");
            return this.data;
            
        }else{
            return this.data;
        }

    }


    // fetch from firebase and then save 
    async getFirebaseHeaderData(collection, storageKey){
        let data = {};

        return this.header.collection(collection).get().then((querySnapshot) => {
                querySnapshot.forEach(doc => Object.assign(data, {[doc.id]: doc.data()} ));
                
                let now =  new Date();
                data = Object.assign(data, {expiry: now.getTime() + 86400000} );
                
                TEAK.Utils.storeData(storageKey, data);

                return data;
            });
    }



    // updates firebase with the new JSON data.  this will be in a app at some point
    setFlyoutData(){
        this.data = TEAK.Utils.getMenuJSON();

        if( this.data ){
            for (const key in this.data ) {
                if( key.includes("category_") ){
                    this.header.collection("flyout").doc(key).set( this.data[key] );
                }
            }

            this.setMarketingContent();
        }
    }


    // update firebase with marketing
    setMarketingContent(){
        for (const key in this.data.marketing_content ) {
            this.header.collection("marketing_content").doc(key).set( this.data.marketing_content[key] );
        }
    }


}