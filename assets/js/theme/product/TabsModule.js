/**
 * Custom PDP Tabs Module
 * ----------------------------
 * Builds the PDP tabs based on data added to the PDP via ShoGun by content team
 * 
 */

export default class TabsModule {
    constructor(firsTabSettings) {
        this.tabClone = ""; 
        this.tabValue = "";

        this.tabButtons = document.getElementById("tabHeader").querySelectorAll('a'),
        this.tabContentEl = document.getElementById('tabContent'),
        this.mobileTabButtons = document.getElementById("mobileTabWrapper").querySelectorAll('.mobile-tab-heading');

        this.tabObj = JSON.parse(document.getElementById("tabJSON").innerHTML);
        this.buildTabObj();

        this.activateFirstTab(firsTabSettings);
        this.initTabContent();

        this.bindListners();
    }



    buildTabObj(){
        this.tabObj.forEach((element) => {
            element["type"] = document.getElementById(element.id);
            element["mobileObj"] = document.querySelector(element.contentCntr)
        });
    }


    bindListners(){
        //Add Tab Button Listeners
		this.tabButtons.forEach((element) => {  
			if (!element.parentElement.classList.contains('innactive-tab')) {
		
				element.addEventListener('click', (e) => {
					if (!$(element).parent().hasClass("active")) {
						this.tabValue = $(element).data("tabval");
				
                        this.clearTabHeader();
                        
                        $(element).parent().toggleClass("active");

						this.updateTabContent();
				
						e.preventDefault();
					}
				});
			}
        });
        

        //Add Mobile Tab Button Listeners
        this.mobileTabButtons.forEach((element, j) => {
            element.addEventListener('click', function(e) {
                let mobileContent = document.querySelector('.mobile-tab-wrapper' + ' #' + this.getAttribute("data-tabval"));
                
                mobileContent.classList.toggle('active');
                
                $(e.target).toggleClass("mobile-tab-heading--active");

                e.preventDefault();
            });
        });
    }



		
    // activate the first tab
    activateFirstTab(args){
        var dataDumpEl = document.querySelector(args.dataClass),
            mobileDesc = document.querySelector(args.contentClass),
            prodDescEl = document.createElement('div');

        prodDescEl.setAttribute('id', args.id);
        prodDescEl.classList.add('active');
        prodDescEl.appendChild(dataDumpEl);

        this.tabClone = prodDescEl.cloneNode(true);

        this.tabContentEl.appendChild(prodDescEl);
        mobileDesc.appendChild(this.tabClone);

        document.querySelector(".mobile-tab-heading[data-tabval="+ args.id +"]").classList.add("mobile-tab-heading--active");
    }




    //Initialize tabbed content
    initTabContent() {

        // itterate over our tabs object and build out each tab skipping any tabs that have no content
        this.tabObj.forEach((element) => {
            if (element.type !== null && document.getElementById(element.id).innerHTML.trim() !== "") {
                let cln = element.type.cloneNode(true);

                this.tabClone.querySelector('#' + element.id).parentNode.removeChild(this.tabClone.querySelector('#' + element.id))
                this.tabContentEl.appendChild(element.type);

                element.mobileObj.appendChild(cln);

                this.setCustomContent(element);
    
            } else {
                // hide desktop button item 
                document.querySelector("[data-tabval='"+ element.id +"']").parentElement.classList.add('innactive-tab');
                // hide desktop pane
                document.querySelector("[data-tabval='"+ element.id +"']").parentElement.classList.add('innactive-tab');
                // hide mobile tab
                document.querySelector("[data-tabval='"+ element.id +"'].mobile-tab-heading").classList.add('innactive-tab');
            }
        });
    }




    setCustomContent(element){
        if(element.hasOwnProperty("customContent")){
            let customNode = document.createElement('p');
            customNode.innerHTML = element.customContent;
            document.getElementById(element.id).appendChild(customNode);
        }
    }



    //Clear active tab headers
    clearTabHeader() {
        this.tabButtons.forEach((element, i) => {
            this.tabButtons[i].parentElement.classList.remove('active');
        });
    }



    //Clear active tab content
    clearTabContent() {
        let tabContentElements = document.querySelectorAll('.tab-content div');
        
        tabContentElements.forEach((element, i) => {
            tabContentElements[i].classList.remove('active');
        });
    }



    //Update the tab contents based on tabValue
    updateTabContent() {
        this.clearTabContent();

        let tab = document.querySelector('#' + this.tabValue);
        tab.classList.add('active');
    }
    


}
  


/**
 * Sets custom pdp tab content
 * 
 * 	document.addEventListener("DOMContentLoaded", function(){
		window.TEAK.Modules.tabs.getTabContent({
			key: "",	// json key
			mobileCntr: "" // mobile content selector class
		});
	});
 */
TEAK.Modules.tabs = {
	data: TEAK.Utils.getProductJSON(),

	// fetch tab content
	getTabContent: function(tabElement){
		if( !this.data ){ return; }

		let content = this.data.tabs[tabElement.key].join("");
		
		if( !TEAK.Utils.isHandheld ){
			document.getElementById(tabElement.key).innerHTML = content;

		}else{
			document.querySelector(tabElement.mobileCntr).innerHTML = `<div id="${tabElement.key}">${content}</div>`; 
		}
		
		return this;
	}
};