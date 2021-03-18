import HeaderFlyout from './HeaderFlyout';
import MobileFlyout from './mobileFlyout';
import HeaderService from './HeaderService';

export default class Header {
	constructor() {		
		this.headerService = new HeaderService();

		// Mobile & Tablet Portrait flyout
		if( TEAK.Utils.isHandheld ){
			new MobileFlyout();
		}

		// Desktop & Tablet Landscape
		new HeaderFlyout();

		// if we are on the pdp collections
		this.notPDPCollections = !document.getElementById("buildAndBuyRoot") || !document.getElementById("clickAndBuyRoot");

		this.promoBanner = document.querySelectorAll('.promo--header');
		this.headerPromoBanner();

		this.cartCount = null;

		this.bindEvents();
	}


	bindEvents() {
		if( this.notPDPCollections ){
			this.headerScroll();
		}

		// on page load
		let cart = TEAK.Utils.getStoredCart();
		if( cart ){ this.updateCartQty(cart) }

		// on cart add
		window.addEventListener("cartDataStored", (e) => {
			this.updateCartQty(e.detail);
		});
	}


	updateCartQty(cart){
		let count = TEAK.Utils.getCartQnty(cart);

		document.querySelectorAll(".badge__cartQty").forEach(ele => {
			ele.classList.remove("hide");
			ele.innerHTML = count;
		});
	}


	// sets the header promo banner on the page when marketing_content JSON has a value
	async headerPromoBanner() {
		var headerMarketing = await this.headerService.getHeaderMarketingData(),
			promoLink = document.createElement("a");

			
		if( !this.promoBanner.length ){ return; }

		this.promoBanner.forEach(promoElement => {
			if(window.sessionStorage.getItem("TEAK__dismissPromoBanner")){
				let isDismissed = window.sessionStorage.getItem("TEAK__dismissPromoBanner");
				promoElement.style.display = isDismissed ? "none" : "flex";
				return;
			}
	
			if( typeof headerMarketing === "undefined" || Object.keys(headerMarketing).length === 0 ){ return; }
	
			if ( headerMarketing.hasOwnProperty("banner") ) {
				let promo = headerMarketing.banner;
	
				if( promo.header_promo_link !== ""){
					promoLink.setAttribute("href", promo.header_promo_link);
				}
				
				promoLink.setAttribute("class", "promoBanner__link " + ( promo.hasOwnProperty("header_custom_class") ? promo.header_custom_class : "" ) );
				promoLink.innerHTML = promo.header_promo;
	
				promoElement.classList.add("promoBanner--" + promo.header_promo_color);
				promoElement.appendChild(promoLink);
				promoElement.style.display = promo.isVisable ? "flex" : "none";
			}
		})
		
		
	}


	dismissHeaderPromoBanner(e){
		window.sessionStorage.setItem("TEAK__dismissPromoBanner", true);
		this.promoBanner.forEach(ele => ele.style.display = "none")

		e.preventDefault();
	}



	// scrolls Desktop, Tablet and Mobile headers
	headerScroll() {		
		const el = document.querySelector("#globalHeader");
		const headerBody = el.querySelector(".header__bodyCntr");

		let headerBodyHeight = headerBody.offsetHeight;

		// when our window changes shape
		window.onresize = () => { 
			headerBodyHeight = headerBody.offsetHeight;
		}


		const handelScroll = () => {
			let growHeight = -headerBodyHeight + (window.scrollY - 200)

			if( growHeight < 0){
				headerBody.style.top = `${growHeight}px`;

			// force to 0px if page loads far down on the page or if we scroll fast
			}else if( window.scrollY > headerBodyHeight ){
				headerBody.style.top = "0px";
			}
		}


		let observer = new IntersectionObserver((entries, observer) => {
				entries.forEach((entry) => {
					if( entry.isIntersecting ){
						headerBody.style.position = "static";
						headerBody.classList.remove("header__bodyCntr--fixed");

						window.removeEventListener('scroll', handelScroll);

					}else{
						headerBody.classList.add("header__bodyCntr--fixed");
						headerBody.style.position = "fixed";

						window.addEventListener('scroll', handelScroll);
					}
				})

			}, {
				root: null,
				rootMargin: "200px",
				threshold: 1.0
			});

		observer.observe(el);
	}


}