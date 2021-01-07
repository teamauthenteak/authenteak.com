import PageManager from '../PageManager';
import Modal from 'bc-modal';
import Personalization from './Personalization';
import LazyLoad from 'vanilla-lazyload';

// const countdownEvents = [
//     {
//         text: "Early Black Friday Deal: Save 20% on Povl with code <code class='alert__code'>POVL20</code>",
//         link: "https://authenteak.com/shop-all-brands/povl-outdoor/shop-all-povl-outdoor/",
//         start_date: "13 Nov 2020",
//         end_date: "21 Nov 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/images/november_home/mobile_hero.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/images/november_home/hero.jpg"
//         }
//     },
//     {
//         text: "Early Black Friday Daily Deal: Save 10% on Umbrellas with code <code class='alert__code'>SHADE10</code>",
//         link: "https://authenteak.com/patio-umbrellas-accessories/shop-all-patio-umbrellas-accessories/",
//         start_date: "21 Nov 2020",
//         end_date: "22 Nov 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/mobile-umbrellas.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/hero-umbrellas.jpg"
//         }
//     },
//     {
//         text: "Early Black Friday Daily Deal: Save 15% on Planters with code <code class='alert__code'>PLANT15</code>",
//         link: "https://authenteak.com/planters/shop-all-planters/",
//         start_date: "22 Nov 2020",
//         end_date: "23 Nov 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/mobile-planters.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/hero-planters.jpg"
//         }
//     },
//     {
//         text: "Early Black Friday Daily Deal: Save 15% on Adirondacks & Rocking Chairs with code <code class='alert__code'>CHAIR15</code>",
//         link: "https://authenteak.com/outdoor-furniture/lounging/adirondacks-rocking-chairs/",
//         start_date: "23 Nov 2020",
//         end_date: "24 Nov 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/mobile-adirondacks.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/hero-adirondacks.jpg"
//         }
//     },
//     {
//         text: "Early Black Friday Daily Deal: Save 10% on Protective Covers with code <code class='alert__code'>COVER10</code>",
//         link: "https://authenteak.com/maintenance-care/protective-covers/",
//         start_date: "24 Nov 2020",
//         end_date: "25 Nov 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/mobile-covers.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/hero-covers.jpg"
//         }
//     },
//     {
//         text: "Early Black Friday Daily Deal: Save 10% on Enduraleaf with code <code class='alert__code'>ENDURA10</code>",
//         link: "https://authenteak.com/shop-all-brands/enduraleaf/shop-all-enduraleaf/",
//         start_date: "25 Nov 2020",
//         end_date: "26 Nov 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/mobile-enduraleaf.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/hero-enduraleaf.jpg"
//         }
//     },
//     {
//         text: " Black Friday Deal: Save 10% on Outdoor Furniture with code <code class='alert__code'>BLACKFRIDAY</code>",
//         link: "https://authenteak.com/outdoor-furniture/shop-all-outdoor-furniture/",
//         start_date: "26 Nov 2020",
//         end_date: "30 Nov 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/mobile-bf.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/hero-bf.jpg"
//         }
//     },
//     {
//         text: "Cyber Monday Deal: Last Chance on Daily Deals + Save 10% on Outdoor TVs with code <code class='alert__code'>CYBERMONDAY</code>",
//         link: "https://authenteak.com/black-friday-deals/",
//         start_date: "30 Nov 2020",
//         end_date: "2 Dec 2020",
//         hero_image: {
//             mobile: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/mobile-cm.jpg",
//             desktop: "https://authenteak.s3.us-east-2.amazonaws.com/2020-black-friday-deals/landing-page-heroes/hero-cm.jpg"
//         }
//     }
// ];



export default class Page extends PageManager {
    constructor() {
        super();

        this.warrantyModal = new Modal({
            el: $("#warantieModal"),
            modalClass: "landing__modal landing__modal--open",
            afterShow: this.initWufooWarrantyForm()
        });

        this.lazyLoadInstance = new LazyLoad({
			elements_selector: ".replaced-image, .lazy-image, .landing__figImg, .card__img, .flex-img, .landing__heroImg"
		});

        // add Personalization engine
        // this.recentlyViewed = new Personalization({
        //     type: "recentlyViewed"
        // });
        // this._initRecentlyViewed();

        this.bindEvents();

        if(window.location.pathname === "/"){
            this.initHero();
            // this.scrollArrow();

            // if( document.getElementById("countDownAlert") ){
            //     this.initCountDown();
            // }
        }
    }


    bindEvents(){
        $(document)
            .on("click", "[rel=fileAClaim]", (e) => {
                this.warrantyModal.open();
                e.preventDefault();
            });
    }




    // count down alert
    initCountDown(){
        let countDown = document.getElementById("countDownAlert")
        let countDownText = countDown.querySelector(".countDown__text");
        let countDownLink = countDown.querySelector(".alert__blockLink");
        let countDownTimer = countDown.querySelector(".countDown__timer");

        let timer = null;
        
        
        function getTimeRemaining(endBy){
            let remaining = Date.parse(endBy) - Date.parse(new Date());

            return{
                remaining: remaining,
                days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
                hours: Math.floor((remaining / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((remaining / 1000 / 60) % 60),
                seconds: Math.floor((remaining / 1000) % 60)
            }
        }


        function updateTimer(eventElement){
            let time = getTimeRemaining(eventElement.end_date);

            countDownTimer.innerHTML = `Offer ends  
                <ul class="countDown__clock">
                    <li class="countDown__clockDigit">
                        <span class="countDown__digit">${time.days}</span>
                        <span class="countDown__digitLabel">Day${time.days === 1 ? "" : "s"}</span>
                    </li>
                    <li class="countDown__clockDigit">
                        <span class="countDown__digit">${time.hours}</span>
                        <span class="countDown__digitLabel">Hour${time.hours === 1 ? "" : "s"}</span>
                    </li>
                    <li class="countDown__clockDigit">
                        <span class="countDown__digit">${time.minutes}</span>
                        <span class="countDown__digitLabel">Minute${time.minutes === 1 ? "" : "s"}</span>
                    </li>
                    <li class="countDown__clockDigit">
                        <span class="countDown__digit">${time.seconds}</span>
                        <span class="countDown__digitLabel">Second${time.seconds === 1 ? "" : "s"}</span>
                    </li>
                </ul>`;

            if( time.remaining <= 0 ){
                clearInterval(timer);
                countDown.innerHTML =   `<span class="alert__blockLink alert__blockLink--large">
                                            <span class="countDown">
                                                <span class="countDown__text">This offer has now ended. Thank you!</span>
                                            </span>
                                        </div>`;
            }
        }


        countdownEvents.forEach((element) => {
            let start = Date.parse(element.start_date)
            let end = Date.parse(element.end_date)
            let now = Date.parse(new Date());

            if( end > now && start <= now ){
                // update the alert HTML
                countDownText.innerHTML = element.text;
                countDownLink.setAttribute("href", element.link);

                // update our hero
                if( element.hero_image !== undefined ){
                    this.dynamicHeroUpdate(element);
                }
                
                // start the timer
                timer = setInterval(() => updateTimer(element), 1000);

                // show the alert
                countDown.classList.remove("alert--hide");
            }
        });

    }



    // assumes that there is just a single non slick slide hero
    dynamicHeroUpdate(element){
        let hero = document.getElementById("homeHero");

        hero.querySelector(".landing__heroImg--default").setAttribute("src", element.hero_image.desktop);
        hero.querySelector(".landing__heroImg--desktop").setAttribute("srcset", element.hero_image.desktop);
        hero.querySelector(".landing__heroImg--mobile").setAttribute("srcset", element.hero_image.mobile);

        hero.querySelector(".landing__heroImg--default").classList.remove("landing__heroImg--blur")

        hero.querySelector(".landing__heroSlideLink").setAttribute("href", element.link);
        hero.querySelector(".landing__heroSlideLink").setAttribute("title", element.text.split("with")[0]);
    }




    initHero(){
        let carouselObj = Object.assign({appendDots: '.landing__heroCarousel'}, TEAK.Globals.heroCarouselSettings);
        
        $(".landing__heroCarousel")
            .on("init", function(event, slick){
                $(this).find(".landing__heroSlide").each(function(){
                    $(this).removeClass("hide");
                });
            })
            .slick(carouselObj);
        
        this.lazyLoadInstance.update();
    }



    scrollArrow(){
		let hero = document.getElementById("homeHero").getBoundingClientRect();
		let arrow = document.getElementById("heroScrollLink");
		let winHeight = window.innerHeight;

        if( arrow ){
            $(window).on("resize", () => { winHeight = window.innerHeight });

            $(window).on("scroll", () => {
                // subtract get window height from size of hero
                let scrollAmount = hero.bottom - winHeight;
    
                // watch to see if that is how much we have scrolled by: window.scrollY
                // when we have scrolled that much then change the arrow to a absolute position
                arrow.classList.toggle("landing__heroScroll--static", scrollAmount < window.scrollY);
            })
        }
    }
    


    // _initRecentlyViewed(){
	// 	let $rv = $("#recentlyViewedProducts"),
	// 		recentProducts = this.recentlyViewed.getViewed();

	// 	if (recentProducts) {
    //         // only doing this because of shogun ~ delete once shogun is removed
    //         if(window.location.pathname === "/"){
    //             $(`<section class="products-related products-recently-viewed section show" id="recentlyViewedProducts">
    //                     <div class="container">
    //                         <h3 class="section-title">RECENTLY VIEWED ITEMS</h3>
    //                         <div class="product-grid product-rv-carousel"></div>
    //                     </div>
    //                 </section>`).insertAfter(".page-content"); 
    //         }


	// 		recentProducts.forEach((element) => {
    //             let tpl = this.recentlyViewed.buildPersonalizationSlider(element);
                
    //             if(document.querySelector(".product-grid")){
    //                 $(tpl).appendTo(".product-rv-carousel", $rv);
    //             }
	// 		});

    //         $rv.addClass("show");

    //         this.lazyLoadInstance.update();
            
    //         this.recentlyViewed.initProductSlider({
    //             dotObj: { appendDots: '.product-rv-carousel' },
    //             selector: '.product-rv-carousel',
    //             context: '#recentlyViewedProducts'
    //         });
	// 	}
	// }


    

    initWufooWarrantyForm(){
        let s11hxi4x1j1ouoy,
            s = document.createElement("script"),
            options = {
                'userName': 'authenteak',
                'formHash': 's11hxi4x1j1ouoy',
                'autoResize': true,
                'height': '1305',
                'async': true,
                'host': 'wufoo.com',
                'header': 'show',
                'ssl': true
            };

        s.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'secure.wufoo.com/scripts/embed/form.js';
        
        s.onload = s.onreadystatechange = function() {
            let rs = this.readyState;

            if (rs)
                if (rs != 'complete')
                    if (rs != 'loaded') return;
            try {
                s11hxi4x1j1ouoy = new WufooForm();
                s11hxi4x1j1ouoy.initialize(options);
                s11hxi4x1j1ouoy.display();
            } catch (e) {}
        };
        
        let scr = document.getElementsByTagName("script")[0],
            par = scr.parentNode;
        
        par.insertBefore(s, scr);
    }





}







/**
 * Calculator Module
 *      ~ Renders calculators for various content pages  
 * --------------------------------------------------------
 * 
 * HTML to call the module from a content page entry: Example call the Firepit calculator
 *  <div class="calculator" id="firepitCalculator">
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                TEAK.Modules.calculator.init({
                    id: "firepitCalculator",
                    type: "firepit"
                });
            });
        </script>
    </div>
*
* TEAK.Modules.calculator.init({})
---------------------------------
* id        id of the element container to render the calculator
* type      the calculator type to rednder
*


*/

TEAK.Modules.calculator = {
    
    settings: {
        element: "",
        $sliderElement: "",
        progressBar: "",
        calcName: "",
        shape: ""
    },

    materials: [
        {   
            id: "fireGlass",
            img: "//cdn11.bigcommerce.com/s-r14v4z7cjw/products/351/images/44655/AFF-BRZRF12__00623.1495733246.270.270.jpg?c=2",
            name: "Fireglass"
        },
        {   
            id: "lavaRocks",
            img: "//cdn11.bigcommerce.com/s-r14v4z7cjw/products/6514/images/56805/ATH-NL-3050__86806.1533818236.270.270.jpg?c=2",
            name: "Lava Rocks"
        }
    ],

    features: [
        {
            id: "fireBowl",
            img: "//authenteak.s3.us-east-2.amazonaws.com/Category_assets/firebowl_img.png",
            name: "Fire Bowl",
            shape: "ellipsoid",
            note: "",
            dimentions: ["depth", "diameter"]
        },
        {
            id: "firePlace",
            img: "//authenteak.s3.us-east-2.amazonaws.com/Category_assets/fireplace_img.png",
            name: "Fire Place",
            shape: "prism",
            note: 'We recommend 2" - 4" of glass depth for most fireplaces',
            dimentions: ["depth", "width", "length", "backWidth"]
        },
        {
            id: "rectFirePit",
            img: "//authenteak.s3.us-east-2.amazonaws.com/Category_assets/rectangularfire_img.png",
            name: "Rectangular Firepit",
            shape: "cube",
            note: "For both square and rectunaglar shapes",
            dimentions: ["depth", "width", "length"]
        },
        {
            id: "roundFirePit",
            img: "//authenteak.s3.us-east-2.amazonaws.com/Category_assets/roundfire_img.png",
            name: "Round Firepit",
            shape: "cylinder",
            note: "",
            dimentions: ["depth", "diameter"]
        }
    ],
    

    init: function(args){
        if( this.checkBeforeInit(args) ){ return; }

        this.settings = Object.assign(this.settings, args); 
        this.settings.element = document.getElementById(this.settings.id);
      
        this.build();

        return this;
    },


    checkBeforeInit: function(args){
        try{
            if( !args.hasOwnProperty("id") || !args.hasOwnProperty("type") ){
                throw "TEAK Calculator Exception: Please define the type and/or the ID of the calculator to be rendered in TEAK.Modules.calculator.init().";
            }
        }
        catch(err){
            console.error(err);
            return err;
        }
    },


    build: function(){
        let tpl = this.templates.getFireglassCalculator(this);

        this.settings.element.innerHTML = tpl;
        this.settings.$sliderElement = $(".calculator__fieldCntr");
        this.settings.progressSteps = this.settings.element.querySelectorAll("li.progress__step");

        this.initSlick();

        return this;
    },

    

    initSlick: function(){
        this.settings.$sliderElement.slick({
            infinite: false,
            draggable: false,
            swipe: false,
            touchMove: false,
            adaptiveHeight: true,
            nextArrow: ".calculator__btn[name=next]",
            prevArrow: ".calculator__btn[name=back]"
        });

        this.settings.$sliderElement.on('beforeChange', (e, slick, currentSlide, nextSlide) => {
            if(nextSlide < currentSlide){
                // go back and reset the current step
                this.stepBack(currentSlide, nextSlide);

            }else{
                // if we are not going back
                // the enabled / disabled in this case prevents this from being default if nothing has been
                // checked, so then re-complete this step and go to next slide.
                this.stepComplete(currentSlide, nextSlide);
            }
        });

        return this;
    },



    toggleActiveRadio: function(e){
        $(e.target).parents("fieldset")
            .find(".calculator__controlFigure--active").removeClass("calculator__controlFigure--active")
                .end()
            .find("button[disabled]").prop("disabled", false)
                .end()
            .find("[type=radio]:checked")
                .parents(".calculator__controlFigure").addClass("calculator__controlFigure--active");
            
        return this;
    },


    setMaterial: function(e){
        this.settings.calcName = e.target.value;
        
        this.toggleActiveRadio(e);

        this.settings.element.querySelectorAll(".calculator__titleName").forEach((element) => {
            element.innerHTML = this.settings.calcName;
        });

        this.stepComplete(0, 1);

        return this;
    },


    setShape: function(e){
        this.settings.solidShape = this.features.find((element) => {
            return element.id === e.currentTarget.id;
        });

        this.toggleActiveRadio(e);

        this.stepComplete(1, 2);

        document.getElementById("calcReferenceImg").src = this.settings.solidShape.img;
        document.getElementById("figureName").innerHTML = this.settings.solidShape.name;
        document.getElementById("figureNote").innerHTML = this.settings.solidShape.note;

        this.toggleCalcInputControls();

        return this;
    },


    stepComplete: function(currentStep, nextStep){
        this.settings.progressSteps[currentStep].classList.remove("progress__step--active");
        this.settings.progressSteps[currentStep].classList.add("progress__step--complete");

        if(nextStep){
            this.settings.progressSteps[nextStep].classList.add("progress__step--active");
        }

        return this;
    },


    stepBack: function(currentStep, nextStep){
        this.settings.progressSteps[currentStep].classList.remove("progress__step--active");
        this.settings.progressSteps[currentStep].classList.remove("progress__step--complete");

        this.settings.progressSteps[nextStep].classList.remove("progress__step--complete");
        this.settings.progressSteps[nextStep].classList.add("progress__step--active");
        
        return this;
    },


    // show/hide input controls
    toggleCalcInputControls: function(){
        let controls = document.querySelectorAll("[data-control]");

        controls.forEach((element) => {
            let controlDimention = element.getAttribute("data-control"),
                controlInput = element.querySelector("input");

            controlInput.value = "";
           
            if( this.settings.solidShape.dimentions.includes(controlDimention) ){
                element.style.display = "flex";
                controlInput.setAttribute("required", true);

            }else{
                element.style.display = "none";
                controlInput.removeAttribute("required", true);
            }
        });

        return this;
    },


    getDimentions: function(){
        this.settings.calcForm = document.fireglassCalculatorForm;
        this.depth = parseInt(this.settings.calcForm.depth.value);
        this.length = parseInt(this.settings.calcForm.length.value);
        this.diameter = parseInt(this.settings.calcForm.diameter.value);
        this.width = parseInt(this.settings.calcForm.width.value);
        this.backWidth = parseInt(this.settings.calcForm.backWidth.value);

        return this;
    },


    /**
     * Note:
     * Each of these calculatos are in cubic in, as volume is mesaured in cubes (3d) 
     * while surface area is measued in squares (2d).
    */
    calcVolume: function(){
        var cubicIn, cubicFt;

        this.getDimentions();

        switch(this.settings.solidShape.shape){
            case "cylinder":
                cubicIn = ( Math.pow(( this.diameter / 2 ), 2) * 3.14 ) * this.depth;
                break;
                
            // a half filled Oblate Ellipsoid
            case "ellipsoid":
                cubicIn = (( Math.pow(( this.diameter / 2 ), 2) * this.depth ) * 3.14) * 1.33;
                cubicIn = cubicIn / 2;
                break;
            
            // Rectangular (includes Square) Prisim
            case "cube": 
                cubicIn = this.width * this.length * this.depth;
                break;

            // Trapezoidal Prism
            case "prism":
                let faceArea = (this.depth * (this.width + this.backWidth)) * 0.5;
                cubicIn = faceArea * this.length;
                break;
        }

        // we need a whole-ish interger number so we base 10 for the cu. ft.
        cubicFt = (cubicIn / 1728) * 10;

        return cubicFt;
    },

    

    // 1 bag of fireglass & lava rock is 10 lbs.
    // 1 bag of fireglass has an aproximate volume of 0.92 cu. ft.
    calcPounds: function(e){
        var usingLavaRock = this.settings.calcName === "Lava Rock",
            volume = this.calcVolume(),
            bags = (volume * 0.92),
            lbs = bags * 10;

        lbs = lbs.toFixed(1);
        bags = Math.round(bags);

        this.settings.calcForm.totalWeight.value = usingLavaRock ? lbs / 2 : lbs;
        document.getElementById("totalBags").innerHTML = usingLavaRock ? bags / 2 : bags;
        
        this.settings.element.querySelector(".calculator__totalCta").classList.remove("hide");

        this.stepComplete(2);

        e.preventDefault();

        return this;
    },


    

    templates: {
        getFireglassCalculator: function(self){
            return `<form class="calculator__form" id="fireglassCalculatorForm" name="fireglassCalculatorForm" onsubmit="TEAK.Modules.calculator.calcPounds(event)">
                        <legend class="calculator__title">
                            <span class="calculator__titleName">Fireglass</span> Calculator
                        </legend>

                        <ol class="progress">
                            <li class="progress__step progress__step--active">Select Material</li>
                            <li class="progress__step">Choose Fire Feature</li>
                            <li class="progress__step">Calculate</li>
                        </ol>
                       
                        <div class="calculator__fieldCntr">
                            <fieldset class="calculator__fieldSet">
                                <div class="calculator__controlGroupHeading">
                                    <h3 class="calculator__controlHeading">Choose a material</h3>
                                </div>
                                
                                <div class="calculator__controlGroup calculator__controlGroup--radioGroup">                            
                                ${self.materials.map(function(key){
                                    return `<label for="${key.id}" class="calculator__controlLabel calculator__controlLabel--radioGroup">
                                                <figure class="calculator__controlFigure">    
                                                    <img class="calculator__controlImg" src="${key.img}" alt="${key.name}">
                                                    <input type="radio" name="firepitMaterial" id="${key.id}" class="calculator__controlInput" value="${key.name}" onchange="TEAK.Modules.calculator.setMaterial(event)">
                                                    <figcaption class="calculator__controlFigureText">${key.name}</figcaption>
                                                </figure>
                                            </label>`}).join("")}
                                </div>

                                <div class="calculator__controlGroup">
                                    <button class="calculator__btn calculator__btn--trans" type="button" name="next" disabled>Next</button>
                                </div>
                            </fieldset>



                            <fieldset class="calculator__fieldSet">
                                <div class="calculator__controlGroupHeading">
                                    <h3 class="calculator__controlHeading">Choose your Fire Feature</h3>
                                </div>
                                
                                <div class="calculator__controlGroup calculator__controlGroup--radioGroup">
                                ${self.features.map(function(key){
                                    return `<label for="${key.id}" class="calculator__controlLabel calculator__controlLabel--radioGroup">
                                                <figure class="calculator__controlFigure">    
                                                    <img class="calculator__controlImg" src="${key.img}" alt="${key.name}">
                                                    <input type="radio" name="firepitFeature" id="${key.id}" class="calculator__controlInput" value="${key.name}" onchange="TEAK.Modules.calculator.setShape(event)">
                                                    <figcaption class="calculator__controlFigureText">${key.name}</figcaption>
                                                </figure>
                                            </label>`}).join("")}
                                </div>
                                <div class="calculator__controlGroup">
                                    <button class="calculator__btn calculator__btn--trans" type="button" name="back">Back</button>
                                    <button class="calculator__btn calculator__btn--trans" type="button" disabled name="next">Next</button>
                                </div>
                            </fieldset>

                        

                            <fieldset class="calculator__fieldSet">
                                <div class="calculator__controlGroupHeading">
                                    <h3 class="calculator__controlHeading">Calculate</h3>
                                    <p class="calculator__controlNote">All measurements should be made in inches.</p>
                                </div>

                                <div class="calculator__controlGroupWithFigure">
                                    <figure class="calculator__calcReferenceCntr">
                                        <img src="" alt="" class="calculator__calcReferenceImg" id="calcReferenceImg">
                                        <figurecaption class="calculator__calcReferenceCaption">
                                            <span class="calculator__figureName" id="figureName"></span>
                                            <span class="calculator__figureNote" id="figureNote"></span>
                                        </figurecaption>
                                    </figure>

                                    <div class="calculator__controlGroupCntr calculator__controlGroupCntr--1-2">
                                        <div class="calculator__controlGroup" data-control="depth">
                                            <label for="depth" class="calculator__controlLabel">Glass Depth</label>
                                            <input type="number" required placeholder="Inches" name="depth" id="depth" class="calculator__controlInput">
                                        </div>

                                        <div class="calculator__controlGroup" data-control="width">
                                            <label for="width" class="calculator__controlLabel">Width</label>
                                            <input type="number" required placeholder="Inches" name="width" id="width" class="calculator__controlInput">
                                        </div>

                                        <div class="calculator__controlGroup" data-control="backWidth">
                                            <label for="backWidth" class="calculator__controlLabel">Fireplace Back Width</label>
                                            <input type="number" required placeholder="Inches" name="backWidth" id="backWidth" class="calculator__controlInput">
                                        </div>

                                        <div class="calculator__controlGroup" data-control="length"> 
                                            <label for="length" class="calculator__controlLabel">Length</label>
                                            <input type="number" required placeholder="Inches" name="length" id="fireplceLength" class="calculator__controlInput">
                                        </div>

                                        <div class="calculator__controlGroup" data-control="diameter">
                                            <label for="diameter" class="calculator__controlLabel">Diameter</label>
                                            <input type="number" required placeholder="Inches" name="diameter" id="fireplceDiameter" class="calculator__controlInput">
                                        </div>
                                        
                                    </div>
                                </div>


                                <div class="calculator__controlGroup">
                                    <button class="calculator__btn calculator__btn--trans" type="button" name="back">Back</button>
                                    <button type="submit" class="calculator__btn" id="firepitButton">Calculate</button>
                                </div>

                                <div class="calculator__controlGroup calculator__controlGroup--col">
                                    <p class="calculator__total"><output class="calculator__controlOutput" name="totalWeight">0</output> lbs. of <span class="calculator__titleName">Fireglass</span> needed  ~  About <span id="totalBags">0</span> Bags</p>
                                    <p class="calculator__totalCta hide">Shop all <a href="/outdoor-heating/fireglass-lava-rocks/" title="shop fireglass" class="calculator__totalLink">Fireglass & Lava Rocks &rsaquo;</a></p>
                                </div>
                            </fieldset>
                        </div>
                    </form>`;
        }
    }
};