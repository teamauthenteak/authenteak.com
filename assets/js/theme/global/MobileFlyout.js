import HeaderService from "./HeaderService";

export default class MobileFlyout{
    constructor(){
        this.headerService = new HeaderService()

        this.MobileFlyout = document.getElementById("mobileFlyout");

        const mainNav = document.getElementById("globalHeader").querySelector(".header__navList").innerHTML;

        this.MobileFlyout.innerHTML = `
            <button type="button" class="mobileFlyout__close" aria-label="Close">
                <svg class="icon icon-close" width="30" height="30"><use xlink:href="#icon-close"/></svg>
            </button>
            <a href="/affirm" class="mobileFlyout__affirm">
                <svg class="icon icon-credit-card" width="24" height="24"><use xlink:href="#icon-credit-card" /></svg>
                <span class="mobileFlyout__affirmText">Pay over time, on your terms<br /><small>With as low as 0% APR. Terms & Conditions apply.</small></span>
                <svg class="icon icon-chevron-with-circle-right" width="24" height="24"><use xlink:href="#icon-chevron-with-circle-right" /></svg>
            </a>
            <ul class="header__navList">
                ${mainNav}
            </ul>
            <ul class="header__utilityBtnCntr">
                <li class="header__utilityBtnItem">
                    <a title="Your account" href="tel:18332577070" class="header__utilityBtn" type="button">
                        <svg class="header__utilityIcon" width="24" height="24"><use xlink:href="#icon-phone2" /></svg>
                        <span class="header__utilityText">Call 1-833-257-7070</span>
                    </a>
                </li>
                <li class="header__utilityBtnItem">
                    <a title="Your account" href="/account.php" class="header__utilityBtn header__utilityBtn--myAccount" type="button">
                        <svg class="header__utilityIcon" width="24" height="24"><use xlink:href="#icon-person" /></svg>
                        <span class="header__utilityText">My Account</span>
                    </a>
                </li>
                <li class="header__utilityBtnItem">
                    <a href="/cart.php" class="header__utilityBtn header__utilityBtn--cart" type="button">
                        <span class="badge__cartQty hide">0</span>
                        <div class="header__utilityBtnContent">
                            <svg class="header__utilityIcon" width="24" height="24"><use xlink:href="#icon-shopping_cart" /></svg>
                            <span class="header__utilityText">My Cart</span>
                        </div>
                    </a>
                </li>
                <li class="header__utilityBtnItem">
                    <button aria-label="Online Chat" class="header__utilityBtn header__utilityBtn--chat" type="button" onclick="javascript:$zopim.livechat.window.show()" title="Chat with us today">
                        <svg class="footer__chatBtn chat__offline" viewBox="0 0 260 93" width="260" height="93" id="footerChatOffline"><use xlink:href="#desktop-footer-offline"/></svg>
                        <svg class="footer__chatBtn chat__online hide" viewBox="0 0 260 93" width="260" height="93" id="footerChatOnline"><use xlink:href="#desktop-footer-online"/></svg>
                    </button>
                <li>
            </ul>`;

        this.bindings();
    }


    bindings(){
        $(this.MobileFlyout).doubleTapToGo()

        $(this.MobileFlyout)
            .on("click", "a.header__navLink", this.navExpand)
            .on("click", "a.header__navLink--active", this.navCollapse)
            .on("click", "a.flyout__listLink--heading", this.subNavExpand)
            .on("click", "a.flyout__listLink--headingActive", this.subNavContract)

        $(document.body)
            .on("click", "button.header__mainNavBtn", this.toggleFlyout)
            .on("click", "button.mobileFlyout__close", this.toggleFlyout)
    }


    toggleFlyout = (e) => {
        if( !$("#mobileFlyout").find(".promo--header").length ){
            let promo = document.querySelector(".promo--header").outerHTML;
            $(promo).prependTo("#mobileFlyout")
        }
       
        $("#mobileFlyout").toggleClass("mobileFlyout--show");
        this.headerService.lockBody(e);
    }


    subNavContract = (e) => {
        e.preventDefault();

        $(e.target)
            .removeClass("flyout__listLink--headingActive")
            .parents("li.flyout__item--heading ").removeClass("flyout__item--headingActive")
    }



    subNavExpand = (e) => {
        e.preventDefault();

        $(e.target)
            .addClass("flyout__listLink--headingActive")
            .parents("li.flyout__item--heading ").addClass("flyout__item--headingActive")
    }



    navCollapse = (e) => {
        // remove and reset the previously initialized flyout
        $(e.target)
            .removeClass("header__navLink--active")
            .parents(".header__navItem--active")
                .find(".flyout").remove()
                    .end()
                .removeClass("header__navItem--active");
    }


    navExpand = (e) => {
        if( $(e.target).hasClass("header__navLink--noFlyout") ){
            window.href = $(e.target).attr("href")
            
        }else{
            e.preventDefault();
        }


        $(e.target)
            .addClass("header__navLink--active")
            .parents("li.header__navItem").addClass("header__navItem--active");


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
    }



}