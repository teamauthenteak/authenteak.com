import firebase from 'firebase';
/**
 * Tool Tips
 * Auto runs for every product page
 * keep this in product.js so we can babel compile the es6 code
 * ---------------------------------------
 * 
 * Data: 
 * 	Stored in product.json or in the script manager
 * 
 * Basic HTML:
 *  <div class="toolTip__cntr toolTip__cntr--hide" id="<TRIGGER ID>"></div>
 * 
 * Basic Tip
 * Link rel=""	genericly associated key and ID to open a tip
 * 
 * Trigers: 
 * 	Open tip: 	data-tool-tip-open
 * 	Close tip: 	data-tool-tip-cose
 * 
 * Custom Tip Settings: Use these to fine tune a tip
 * Type:		data-tool-tip-type="" 	// element or brand
 * Name:		data-tool-tip-name=""	// Key in the Product JSON object to pull from. can be comma sepearted to pull multipule
 * Id:			data-tool-tip-id=""		// Targets the element ID to open and close
 * 
 * 	
 * Adding Tabs to Tool Tips
 * -----------------------------------
 * HTML Markup:
 * 
	<div class="toolTip__cntr toolTip__cntr--withTabs toolTip__cntr--hide" id="<TRIGGER ID>">
		<div class="toolTip__tabsCntr">
			// Call to to get the tabs.  Pass in in tab array TEAK.Modules.toolTip.getTabs(ARRAY)
		</div>
	</div>
 * 
 *
 * Tab Object Array
 * 
 * [
		{
			id: "free_white_glove_delivery",	// key in Product JSON
			label: "White Glove Delivery"		// Custom Label. can include lite HTML
		},
		....
	]
 * 
 *	Pass this array in to TEAK.Modules.toolTip.getTabs(ARRAY)
 * 	to get custom tabs
 * 
 */

export default class ToolTips{
    constructor(settings){
        this.settings = settings;

        if( !firebase.apps.length ) {
            firebase.initializeApp(TEAK.Globals.firebase.config);   
        }

        this.db = firebase.firestore();
        this.productTips = this.db.collection("site").doc("product").collection("tool_tips");
        this.data = [];

        this.optionKeys = [];
        this.brandObj = {};
        this.elementObj = {};
        this.activeModal = "";

        this.closeBtn = `<button type="button" class="toolTip__closeBtn" data-tool-tip-close><svg class="toolTip__closeIcon"><use xlink:href="#icon-close"/></svg></button>`;
        
        this.on();
        this.init();

        // this.setProductData();
    }



    on(){
        $(document.body)
            .on("click", (e) => { this.checkClickToCloseModal(e); })
            .on("keydown", (e) => { this.checkKeyToCloseModal(e); })
            .on("click", "[data-tool-tip-open]", (e) => { this.openTipModal(e); })
            .on("click", "[data-tool-tip-close]", (e) => { this.closeTipModal(e); });
    }



    // get the local JSON version and update firebase
    // eventually this would get the UI generated JSON and update firebase
    setProductData(){
        let productData = TEAK.Utils.getProductJSON();
        
        // add option tips for brands
        for (const key in productData['tool-tips'].brands) {
            for (const optKey in productData["tool-tips"].brands[key] ) {
                this.productTips.doc("brands").collection(key).doc(optKey).set(productData["tool-tips"].brands[key][optKey])
            }
        }
       
        // tip elements
        this.productTips.doc("elements").set(productData["tool-tips"].elements);
    }



    async getProductData(){
        return this.productTips.doc(this.settings.type).collection(this.settings.key).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.data.push( Object.assign({}, {[doc.id]: doc.data()} ) );
            });
        });
    }



    async init() {
        await this.getProductData().then(() => {

            switch(this.settings.type){
                case "brands": this.brandTip();
                    break;

                case "elements": this.elementTip();
                    break;
            }
        });
    }
    


    brandTip(){
		this.data.forEach((element) => {
            let key = Object.keys(element)[0];
			let $optionSelector = $("#productOptions").find(`[data-option-title='${key}']`);

			switch(element[key].type){
				case "tabs": 
					this.tabsTip($optionSelector, element[key].tip);
                    break;
                    
				default: 
					this.generalTip($optionSelector, element[key].tip);
			}
		});
    }
    


    getTabs(tabArr){
		return `<div class="toolTip__tabsCntr">
        ${Object.keys(tabArr).map(key => {
            return `<div class="toolTip__tab">
                        <input type="radio" class="toolTip__tabControl" id="toolTipTab_${key}" name="toolTipTabs" ${key === '0' ? 'checked' : '' }>
                        <label for="toolTipTab_${key}" class="toolTip__tabLabel">${tabArr[key].label}</label>
                        <div class="toolTip__tabContent" id="${tabArr[key].id}">${tabArr[key].tabContent.join("")}</div>
                    </div>`}).join("")}
				</div>`;
	}



	tabsTip($optionSelector, tipArr){
		let tabs = this.getTabs(tipArr);

		$optionSelector
			.find(".toolTip").addClass("toolTip--show")
				.end()
			.find(".toolTip__cntr")
				.addClass("toolTip__cntr--withTabs")
				.append(tabs)
				.append(this.closeBtn);
	}



	generalTip($optionSelector, tipObj){
		tipObj = tipObj.join("");

		console.log(tipObj)

		$optionSelector
			.find(".toolTip").addClass("toolTip--show")
				.end()
			.find(".toolTip__cntr")
				.append(tipObj)
				.append(this.closeBtn);	
	}


	// open 
	openTipModal(e){
		let tipData = $(e.currentTarget).data();
		
		TEAK.ThirdParty.heap.init({
            method: 'track',
            event: 'pdp_view_tooltip',
            location: 'pdp'
		});
		        
		e.preventDefault();

        this.activeModal = tipData.hasOwnProperty("toolTipId") ? tipData.toolTipId : $(e.currentTarget).attr("rel");

		let $activeModal = $("#"+ this.activeModal);
		$activeModal.toggleClass("toolTip__cntr--hide toolTip__cntr--show");

        let modalHeight = $activeModal.outerHeight();
        
		$activeModal.css({
			height: modalHeight,
			marginTop: -(modalHeight/2)
		});
	}



	// close
	closeTipModal(e){
		if ( this.activeModal !== "" ){
			$("#"+ this.activeModal).toggleClass("toolTip__cntr--hide toolTip__cntr--show");
			this.activeModal = "";
		}

		e.preventDefault();
	}



	// on click check to see if the event happened outside or inside the modal, close if the former
	checkClickToCloseModal(e){
		let clickedOpenLink = $(e.target).closest("[data-tool-tip-open]").length;

		if ( this.activeModal !== "" ){
			if ( !$(e.target).closest('#'+ this.activeModal).length && !clickedOpenLink ){
				this.closeTipModal(e);
			
			}else{
				if( !$(e.target).closest('.toolTip__tabsCntr').length && $('#'+ this.activeModal).hasClass("toolTip__cntr--withTabs") && !clickedOpenLink ){
					this.closeTipModal(e);
				}
			}
		}
	}


	// on keyup of the ESC key, close the open modal
	checkKeyToCloseModal(e){
		if ( this.activeModal !== "" ){
			if( e.which === 27 ){
				this.closeTipModal();
			}
		}
    }
    



    /**
     * have to rethink this as we aren't really using the element tips any longer
     */

    // build custom element modal
	elementTip(){
        this.productTips.doc("elements")

		let keys = this.settings.key.replace(/ /g,'').split(",");

		keys.forEach((ele) => {
			if( this.data["tool-tips"].elements.hasOwnProperty(ele) ){ 
				this.elementObj = this.data["tool-tips"].elements;
				$("#" + ele).html(this.elementObj[ele].join("") );
			}
		});

		$("#"+this.id).append(this.closeBtn);

		return this;
	}


}







/* 
	Displays the free shipping text based on price 
	- do want this to run inline as it needs to be shown as the page is shown

	rrp_without_tax: parseInt('{{../../../product.price.rrp_without_tax.value}}'),
	with_tax: parseInt('{{../../../product.price.with_tax.value}}'),
	without_tax: parseInt('{{../../../product.price.without_tax.value}}'),
    custom: parseInt('{{~default ../../../product.price.sale_price_without_tax.value price.without_tax.value~}}')
*/
TEAK.Modules.freeShipping = {
	set: function(args, element){
		let excludedSkus = [
				"LPG-L5000",
				"EL-OFS006",
				"EL-OFS005",
				"EL-OFS014",
				"EL-OFS302",
				"EL-OFS303",
				"EL-OFS304"
			],
			isExcluded = excludedSkus.includes(args.sku),
			freeShipping = '<p class="free-shipping-text" data-pricing-free-shipping>Free Shipping</p></p>',
			shippingTabs = [
					{
						id: "free_white_glove_delivery",
						label: "White Glove Delivery"
					},
					{
						id: "threshold_delivery",
						label: "First Threshold Delivery"
					}
				],

			freeWhiteGlove = '<p class="free-shipping-text" data-pricing-free-shipping>Free Standard Shipping</p></p>',
				// `<p class="free-shipping-text" data-pricing-free-shipping>
				// 	<a href="" class="free-shipping-text--link" data-tool-tip-open data-tool-tip-type="element" data-tool-tip-name="free_white_glove_delivery, threshold_delivery" data-tool-tip-id="free_delivery">
				// 		<span>This item qualifies for free upgraded delivery</span> &nbsp;
				// 		<span class="toolTip__iconCntr toolTip__iconCntr--dark">
				// 			<svg class="toolTip__icon toolTip__icon--white" enable-background="new 0 0 20 20" version="1.1" viewBox="0 0 20 20" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
				// 				<title>tool tip</title>
				// 				<path d="M12.432 0c1.34 0 2.010 0.912 2.010 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-0.75-1.974-1.99 0-1.043 0.881-2.479 2.643-2.479zM8.309 20c-1.058 0-1.833-0.652-1.093-3.524l1.214-5.092c0.211-0.814 0.246-1.141 0-1.141-0.317 0-1.689 0.562-2.502 1.117l-0.528-0.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273 0.705 3.23l-1.391 5.352c-0.246 0.945-0.141 1.271 0.106 1.271 0.317 0 1.357-0.392 2.379-1.207l0.6 0.814c-2.502 2.547-5.235 3.527-6.291 3.527z"></path>
				// 			</svg>
				// 		</span>
				// 	</a>
				// 	<div class="toolTip__cntr toolTip__cntr--withTabs toolTip__cntr--hide" id="free_delivery">
				// 		${TEAK.Modules.toolTip.getTabs(shippingTabs)}
				// 	</div>
				// </p>`,

				tpl = ( (args.price.without_tax > 2998 || args.price.custom > 2998) && !isExcluded ) ? freeWhiteGlove : freeShipping;
	
		document.getElementById(element).innerHTML = tpl;

		return this;
	}
};


TEAK.Modules.leadTime = {
	setTip: function(element, isInline){
		let tpl = [
			'<a href="" class="shpping-range--tipLink" data-tool-tip-open data-tool-tip-type="element" data-tool-tip-name="next_bussiness_day" data-tool-tip-id="next_bussiness_day">',
				'<span class="toolTip__iconCntr toolTip__iconCntr--dark">',
					'<svg class="toolTip__icon toolTip__icon--white"><use xlink:href="#icon-info"/></svg>',
				'</span>',
			'</a>',
			'<span class="toolTip__cntr toolTip__cntr--hide" id="next_bussiness_day">',
				'<button type="button" class="toolTip__closeBtn" data-tool-tip-close><svg class="toolTip__closeIcon"><use xlink:href="#icon-close"/></svg></button>',
				'<h2 class="toolTip__heading--2">Next Business Day Processing</h2>',
                '<p class="toolTip__text">Transit time is determined by shipping method and destination. Orders placed by 12pm ET may be shipped same day. Orders placed after 2pm ET will be processed the next business day.</p>',
			'</span>'].join("");

		return isInline ? tpl : document.getElementById(element).innerHTML = tpl;
	}
}