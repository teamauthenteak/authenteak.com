import HeaderService from "./HeaderService";

export default class HeaderFlyout {
    constructor(){
        this.headerService = new HeaderService();
        this.timeoutFlyout = null;
        this.bindEvents()
    }


    bindEvents(){
        $(document.body)
			.on("mouseover", "div.flyout__underlay", this.resetFlyoutUnderlay)

		$("#globalHeader")
			.on("mouseover", "a.header__navLink", this.navHover)
			.on("mouseout", "a.header__navLink", this.navHover)
			.on("mouseout", "div.flyout", this.navHover)
			.on("mouseover", "a.header__utilityBtn--myAccount, a.header__utilityBtn--myList",this.showOverlay)
			.on("mouseout", "a.header__utilityBtn--myAccount, a.header__utilityBtn--myList", this.resetFlyoutUnderlay)
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
			}, 100);

			return;
		}

		// remove and reset the previously initialized flyout
		$(e.target)
			.parents("ul.header__navList").find(".header__navItem--active")
				.find(".flyout").remove()
					.end()
				.removeClass("header__navItem--active");


		$(e.target).parents("li.header__navItem").addClass("header__navItem--active");


		let category_id = $(e.target).attr("rel");
		let flyoutContent = this.headerService.parseFlyoutData(category_id);

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
				
		this.showOverlay(e);
	}




	showOverlay = (e) => {
		if( $("#globalHeader").nextUntil("div.flyout__underlay").length ){
			// we have to adjust the height of the underlay because we are changing the size of the fixed header
			$("#globalHeader").after(`<div class='flyout__underlay' ${window.scrollY > 200 ? "style='top:115px'" : ""}></div>`)
		}

		this.disableScroll()

		if( $(e.currentTarget).hasClass("header__utilityBtn--myList") && TEAK.User.uuid && Array.isArray(this.headerService.myList) ){
			let tpl = [`<li class="header__utilMenuItem">
							<a href="/wishlist.php?action=addwishlist" title="create an account" class="header__utilMenuBtn header__utilMenuBtn--green">
								Create a New List
							</a>
						</li>`];

			if( this.headerService.myList.length ){
				this.headerService.myList.forEach(ele => {
					tpl.unshift(`<li class="header__utilMenuItem">
									<a href="${ele.path}" class="header__utilMenuLink">${ele.name}</a>
							  	</li>`);
				});

				document.getElementById("myListMenu").innerHTML = tpl.join("");
			}
		}


	}



	resetFlyoutUnderlay = () => {
		if( $("div.flyout:visible").length === 0 && $("ul.header__utilMenu:visible").length === 0 ){
			$("#globalHeader").siblings("div.flyout__underlay").remove();
			
			this.enableScroll()
		}
	}


	disableScroll = () => {
		// Get the current page scroll position
		let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	  
		// if any scroll is attempted, set this to the previous value
		window.onscroll = function() {
			window.scrollTo(scrollLeft, scrollTop);
		};
	}
		
	enableScroll = () => {
		window.onscroll = function() {};
	}

}