import svgIcon from './svgIcon'

export default class Header {
	constructor(el) {
		this.$el = $(el);
		this.$body = $('body');
		this.$wrapper = $('.site-wrapper');
		this.$searchWrap = $('.search-wrap');
		this.$header = $('.site-header');

		this.$topBar = this.$header.find('.top-bar');
		this.$navBar = this.$header.find('.main-nav-bar');

		this.cartOpenClass = 'mini-cart-open';
		this.searchOpenClass = 'search-open';
		this.navOpenClass = 'nav-mobile-open scroll-locked';

		this.$loginRegister = $('.login-register-block');
		this.$forgotPassword = $('.forgot-password-block');

		this._bindEvents();
		this._adjustHeights();
		this._headerScroll();
		this._headerPromoBanner();
	}



	// sets the header promo banner on the page when marketing_content JSON has a value
	_headerPromoBanner() {
		var extra_config = getConfigData(),
			promoLink = document.createElement("a"),
			promoBanner = document.getElementById('topHeaderPromo');

		if ( extra_config.marketing_content.hasOwnProperty("banner") ) {
			let promo = extra_config.marketing_content.banner;

			if( promo.header_promo_link !== ""){
				promoLink.setAttribute("href", promo.header_promo_link);
			}
			
			promoLink.classList = "promoBanner__link " + ( promo.hasOwnProperty("header_custom_class") ? promo.header_custom_class : "" );
			promoLink.innerHTML = promo.header_promo;

			promoBanner.classList.add("promoBanner--" + promo.header_promo_color);
			promoBanner.appendChild(promoLink);
			promoBanner.style.display = promo.isVisable ? "flex" : "none";
		}
		
		if( extra_config.marketing_content.hasOwnProperty("inline") ){
			let promoNode = document.createElement("span"),				
				promoText = extra_config.marketing_content.inline.header_promo;

			promoNode.innerHTML = promoText;
			document.getElementById('globalHeaderPromo').appendChild(promoNode);
		}

		function getConfigData() {
			var data;

			if (TEAK.Modules.megaMenu.data) {
				data = window.TEAK.Modules.megaMenu.data;

			} else {

				if (document.getElementById("megaMenuEnhancement") && window.location.hostname !== "localhost") {
					data = document.getElementById("megaMenuEnhancement").innerHTML;
					data = JSON.parse(data);

				} else {
					// run it on on our local
					$.ajax({
						dataType: "json",
						url: "/assets/js/theme/header.json",
						async: false,
						success: (res) => { data = res; }
					});
				}

			}

			return data;
		}

	}


	_bindEvents() {
		// Toggle mini cart panel
		this.$el.find('.button-cart-toggle').on('click', (event) => {
			this._toggleMiniCart();
			event.stopPropagation();
		});

		// Close mini cart panel
		$('.button-cart-close').on('click', () => {
			this._toggleMiniCart(false);
		});

		$('.on-canvas').on('click', () => {
			if ($('.mini-cart-open').length) {
				this._toggleMiniCart(false);
			}
		});


		// Close UI elemets with esc key
		$(document).on('keyup', (e) => {
			// Mini cart
			if (e.keyCode === 27 && this.$body.hasClass(this.cartOpenClass)) {
				this._toggleMiniCart(false);
			}

			// Search
			if (e.keyCode === 27 && this.$searchWrap.hasClass(this.searchOpenClass)) {
				this._toggleSearch(false);
			}
		});

		// Toggle search
		$('.button-search-toggle').on('click', () => {
			this._toggleSearch();

			// Close cart
			if (this.$wrapper.hasClass(this.cartOpenClass)) {
				this._toggleMiniCart(false);
			}
		});

		// Close Search
		$('.button-search-close').on('click', () => {
			this._toggleSearch(false);
		});

		// Toggle mobile nav
		$('.button-mobile-nav-toggle').on('click', () => {
			this._toggleMobileNav();
		});

		// Handle resize events and provide debounce to prevent too much
		this._handleResize = _.debounce(this._handleResize.bind(this), 200);

		$(window).resize(this._handleResize);
	}



	_handleResize() {
		// Reset the mobile panel if window is made larger
		this._adjustHeights();

		// Check header height on resize for class application
		this._headerScroll();
	}

	_toggleMiniCart(open) {
		// Pass "false" to remove the class / close cart
		this.$body.toggleClass(this.cartOpenClass, open);
	}

	_toggleSearch(open) {
		this.$searchWrap.toggleClass(this.searchOpenClass, open);

		if (this.$searchWrap.hasClass(this.searchOpenClass)) {
			this.$searchWrap.find('.search-input').focus();
		}
	}

	_toggleMobileNav(open) {
		this.$body.toggleClass(this.navOpenClass, open);

		if (open === false) {
			$('.navigation-mobile').revealer('hide');
		} else {
			$('.navigation-mobile').revealer('toggle');
		}
	}

	_headerScroll() {
		// determine whether the navigtion has a second row, and disallow "compressed" state if true
		const defaultNavbarHeight = 56;
		const $currentNavBar = this.$navBar.find('.navigation').find('ul:first-child');
		var currentNavBarHeight = $currentNavBar.outerHeight();

		if (currentNavBarHeight > defaultNavbarHeight) {
			this.$navBar.addClass('multi-row');
			$currentNavBar.addClass('enforce-max-width');
			return false;
		} else {
			this.$navBar.removeClass('multi-row');
			$currentNavBar.removeClass('enforce-max-width');
		}

		const $win = $(window);
		const threshold = 50;
		const scrollClass = 'compressed';

		// if we load the page part way down
		if ($win.scrollTop() > threshold) {
			this.$header.addClass(scrollClass);
		}

		$win.resize(() => {
			const compressHeader = false;
			currentNavBarHeight = $currentNavBar.outerHeight();

			if (currentNavBarHeight > defaultNavbarHeight) {
				this.$header.toggleClass(scrollClass, compressHeader);
			}
		});

		$win.scroll(() => {
			const st = $win.scrollTop();
			var compressHeader = (st > threshold) ? true : false;

			currentNavBarHeight = $currentNavBar.outerHeight();
			compressHeader = currentNavBarHeight > defaultNavbarHeight
				? false
				: compressHeader;

			this.$header.toggleClass(scrollClass, compressHeader);
		});
	}

	_adjustHeights() {
		const $canvas = this.$body.find('.site-canvas');
		const defaultTopBarHeight = window.TEAK.Utils.isHandheld ? 150 : 90;
		const topBarHeight = this.$topBar.outerHeight();
		const defaultFullHeaderHeight = 170;
		const currentFullHeaderHeight = this.$header.outerHeight();

		if (this.$navBar.is(':hidden')) {
			if (topBarHeight > defaultTopBarHeight) {
				$canvas.css('padding-top', topBarHeight + 'px');
			} else {
				$canvas.css('padding-top', defaultTopBarHeight + 'px');
			}
		} else {
			if (currentFullHeaderHeight > defaultFullHeaderHeight) {
				$canvas.css('padding-top', currentFullHeaderHeight + 'px');
			} else {
				$canvas.css('padding-top', defaultFullHeaderHeight + 'px');
			}
		}

		if (topBarHeight > defaultTopBarHeight) {
			const $mobileNav = this.$body.find('.navigation-mobile');

			$mobileNav.css({ 'top': topBarHeight + 'px' });
		}
	}
}





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

TEAK.Modules.megaMenu = {

    data: TEAK.Utils.getMenuData(),

    init: function(id){
        this
            .setCustomMobilePages(id)
            .setCustomMobileCategory(id, "shop_by_collection")
            .setCustomMobileCategory(id, "shop_by_brand")
            .setCustomMobileImg(id);
            

        if( !TEAK.Utils.isHandheld ){
            this
                .setCustomPages(id)
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


    // Desktop: sets custom pages
    setCustomPages: function(id){
        if( this.data[id].hasOwnProperty("pages") ){

            this.data[id].pages.forEach((element) => {
                let parentLi,
                    tpl = `<a itemprop="url" href="${element.url}" title="${element.title}">
                                <span itemprop="name">${element.title}</span>
                            </a>`;

                parentLi = document.createElement("li"),
                parentLi.className = "parent parent--collapse tier-dropdown";
                parentLi.innerHTML = tpl;

                document.getElementById(id).querySelectorAll(".mega-nav-list")[0].appendChild(parentLi);
            });
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
        }

        return this;
    },



    // Mobile: sets custom pages
    setCustomMobilePages: function(id){
        if( this.data[id].hasOwnProperty("pages") ){
            this.data[id].pages.forEach((element) => {
                let navItem,
                    tpl =   `<a itemprop="url" href="${element.url}" title="${element.title}" class="nav-mobile-link">
                                <span class="nav-mobile-text" itemprop="name">${element.title}</span>
                            </a>`;

                navItem = document.createElement("li"),
                navItem.className = "nav-mobile-item";
                navItem.innerHTML = tpl;

                document.getElementById("mobile_" + id).appendChild(navItem);
            });
        }

        return this;
    },


};
