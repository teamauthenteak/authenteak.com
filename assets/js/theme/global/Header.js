import HeaderFlyout from './HeaderFlyout';
import GraphQL from '../graphql/GraphQL';

export default class Header {
	constructor() {		
		this.$header = $("#globalHeader", ".header__bodyCntr");

		this.graphQL = new GraphQL();

		const flyoutQuery = this.graphQL.getCategoryData();
		this.graphQL.get(flyoutQuery).then((data) => { 
			this.flyoutData = data;
		});

		this.headerFlyout = new HeaderFlyout();

		this._bindEvents();
		
		this.notPDPCollections = !document.getElementById("buildAndBuyRoot") || !document.getElementById("clickAndBuyRoot");

		this.promoBanner = document.getElementById('topHeaderPromo');
		this._headerPromoBanner();

		this.timeoutFlyout = null;
	}



	// sets the header promo banner on the page when marketing_content JSON has a value
	async _headerPromoBanner() {
		var headerMarketing = await this.headerFlyout.getHeaderMarketingData(),
			promoLink = document.createElement("a");

			
		if( !this.promoBanner ){ return; }
		
		if(window.sessionStorage.getItem("TEAK__dismissPromoBanner")){
			let isDismissed = window.sessionStorage.getItem("TEAK__dismissPromoBanner");
			this.promoBanner.style.display = isDismissed ? "none" : "flex";
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

			this.promoBanner.classList.add("promoBanner--" + promo.header_promo_color);
			this.promoBanner.appendChild(promoLink);
			this.promoBanner.style.display = promo.isVisable ? "flex" : "none";
		}
		
		// if( headerMarketing.hasOwnProperty("inline") ){
		// 	let promoNode = document.createElement("span"),				
		// 		promoText = headerMarketing.inline.header_promo;

		// 	promoNode.innerHTML = promoText;
		// 	document.getElementById('globalHeaderPromo').appendChild(promoNode);
		// }
	}


	_dismissHeaderPromoBanner(e){
		window.sessionStorage.setItem("TEAK__dismissPromoBanner", true);
		this.promoBanner.style.display = "none";

		e.preventDefault();
	}



	parseFlyoutData = (parent) => {
		let flyoutList = {
			tpl: "",
			total: 0
		};
		let parentId = parent.split(",");

		parentId.forEach(id => {
			let data = this.flyoutData.site.categoryTree.find(ele => ele.entityId === parseInt(id));
			let supplementalData = this.headerFlyout.data[`category_${id}`];
			let gotKids = [], aintGotKids = [];

			if( data ){
				data.children.forEach(kid => {
					if( kid.children.length < 2 && parseInt(id) !== 1196 ){
						aintGotKids.push(kid);
	
					}else{
						gotKids.push(kid);
					}
				});	
			}

			let flyoutData = this.createFlyout(gotKids, supplementalData, aintGotKids);

			flyoutList.tpl += flyoutData.tpl;
			flyoutList.total = flyoutList.total + flyoutData.total
		});
		
		return flyoutList;
	}



	createFlyout = (data, supplementalData, singletonData) => {
		let tpl = [];

		if( data.length ){
			data.forEach(child => {
				let tplData = this.flyoutTemplate(child);
				tpl.push(tplData)
			});
		}

		if( supplementalData ){
			let { pages, shop_by_brand, shop_by_collection } = supplementalData;

			let brand = shop_by_brand && shop_by_brand.items.length  ? this.flyoutSupplemental(shop_by_brand) : "";
			let collection = shop_by_collection && shop_by_collection.items.length ? this.flyoutSupplemental(shop_by_collection) : "";

			tpl.push(brand, collection);

			if( pages ){
				let newPages = pages.map((ele) => {
						return{
							name: ele.title,
							path: ele.url
						}
					});

				singletonData = [...newPages, ...singletonData];
			}
		}

		if( singletonData.length ){
			let tplData = this.flyoutSingle(singletonData);
			tpl.push(tplData)
		}
		
		return {
			tpl: tpl.join(""),
			total: data.length + 2
		}
	}




	flyoutTemplate(child){
		child = this.mutateChildren(child);

		if(child.isHidden){ return; }

		return `<ul class="flyout__list">
					<li class="flyout__item ${child.children.length < 2 ? "flyout__item--noSpace" : ""}">
						<h3 class="flyout__listHeading">
							<a href="${child.path}" class="flyout__listLink" title="Visit ${child.name} category">
								${child.name}
							</a>
						</h3>
					</li>
					${child.children.map(kid => {
						if(kid.isHidden || child.children.length < 2){ return; }

						return	`<li class="flyout__item">
									<a href="${kid.path}" class="flyout__listLink" title="Visit ${kid.name} category">
										${kid.name}
									</a>
								</li>`;
					}).join("")}
				</ul>`;
	}



	flyoutSupplemental(child){
		return `<ul class="flyout__list">
					<li class="flyout__item ${child.items.length < 2 ? "flyout__item--noSpace" : ""}">
						<h3 class="flyout__listHeading">
							<a href="${child.url}" class="flyout__listLink" title="Visit ${child.title} category">
								${child.title}
							</a>
						</h3>
					</li>
					${child.items ? child.items.map(kid => {
						return	`<li class="flyout__item">
									<a href="${kid.url}" class="flyout__listLink" title="Visit ${kid.name} category">
										${kid.title}
									</a>
								</li>`;
					}).join("")
					:null}
				</ul>`;
	}



	flyoutSingle(child){
		return `<ul class="flyout__list flyout__list--feature">
					${child.map((kid) => {
						return `<li class="flyout__item">
									<h3 class="flyout__listHeading">
										<a href="${kid.path}" class="flyout__listLink" title="Visit ${kid.name} category">
											${kid.name}
										</a>
									</h3>
								</li>`;
					}).join("")}
				</ul>`;
	}



	mutateChildren = (child) => {
		let newKid = {...child};

		newKid.isHidden = newKid.name.includes("Shop by Collection")

		switch(newKid.name){
			case "In-Stock Furniture":
				newKid.name = "Quick Ship Furniture";
				break;
		}

		return newKid;
	}



	navHover = (e) => {
		if( $(e.target).hasClass("header__navLink--noFlyout") ){ 
			this.resetFlyoutUnderlay();
			return; 
		}

		if( e.type === "mouseout" ){
			this.timeoutFlyout = setTimeout(() => { 
				$(e.target).children(".flyout").remove();
				this.resetFlyoutUnderlay();
			}, 500);

			return;
		}


		$(e.target)
			.parents("ul.header__navList").find(".header__navItem--active")
				.find(".flyout").remove()
					.end()
				.removeClass("header__navItem--active");


		$(e.target).parents("li.header__navItem").addClass("header__navItem--active")


		let category_id = $(e.target).attr("rel");
		let flyoutContent = this.parseFlyoutData(category_id);

		$(e.target)
			.parents("li.header__navItem")
			.append('<div class="flyout"><svg className="icon icon-spinner"><use xlinkHref="#icon-spinner" /></svg></div>')
		
		$(e.target)
			.siblings("div.flyout")
				.html(
					`<div class="flyout__content ${flyoutContent.total < 7 ? "flyout__content--short" : ""} flyout__content--${$(e.target).text()}">
						${flyoutContent.tpl}
					</div>`
				)
				
		if( $("#globalHeader").nextUntil("div.flyout__underlay").length ){
			$("#globalHeader").after("<div class='flyout__underlay'></div>")
		}
	}



	resetFlyoutUnderlay = () => {
		if( !$(".flyout:visible").length ){
			$("#globalHeader").siblings("div.flyout__underlay").remove();
		}
	}



	lockBody = (e) => {
		$(document.body).toggleClass("scroll-locked",  e.type === "mouseover");
	}


	_bindEvents() {

		$(document.body)
			.on("mouseover", "a.header__navLink", this.navHover)
			.on("mouseout", "a.header__navLink", this.navHover)
			.on("mouseover", "div.flyout__underlay", this.resetFlyoutUnderlay)
			.on("mouseover", "div.header__bodyCntr", this.resetFlyoutUnderlay)
		
		this._headerScroll();
	}



	_headerScroll() {		
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