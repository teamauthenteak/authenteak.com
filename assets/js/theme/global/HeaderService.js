import GraphQL from "../graphql/GraphQL";
import firebase from 'firebase/app';
import 'firebase/firestore';

export default class HeaderService{
    constructor(){
        this.now =  new Date()

        // Category Data from Big Commerce
        this.graphQL = new GraphQL();
		const flyoutQuery = this.graphQL.getCategoryData();

		this.graphQL.get(flyoutQuery).then((data) => { 
			this.flyoutData = this.flyoutScheme(data.site.categoryTree);

            // save to local storage
            TEAK.Utils.storeData("TEAK_headerData", {categories: this.flyoutData, expiry: this.now.getTime() + 86400000} );
		});


        // Supplemental Data Stored Firebase
        if ( !firebase.apps.length ) {
            firebase.initializeApp(TEAK.Globals.firebase.config);
        }

        this.db = firebase.firestore();
        this.header = this.db.collection("site").doc("header");

        this.data = null;
        this.marketingData = null;

        this.getFlyoutData();

		// my list data
		const listData = document.getElementById("wishLists").innerHTML;
		this.myList = JSON.parse(listData);
    }



    // refactors the flyout data shape
    flyoutScheme(data){
		let categoryData = [...data];

		let accessories = {
			name: "Accessories",
			entityId: 1099911930,
			children: [{
				name: "Get Project Help",
				path: "/blog/",
				children: [
					{ name: "Helpful Tips for Teak Furniture Care", path: "/blog/helpful-tips-for-teak-furniture-care/" },
					{ name: "How to Protect your Patio Furniture During all Seasons", path: "/blog/how-to-protect-your-patio-furniture-during-all-seasons/" },
					{ name: "How to Use Patio Furniture Covers and Expert Tips To Protect Outdoor Furniture", path: "/blog/how-to-use-patio-furniture-covers-and-expert-tips-to-protect-outdoor-furniture/" },
					{ name: "Use Outdoor Planters to Define Your Outdoor Space", path: "/blog/use-outdoor-planters-to-define-your-outdoor-space/" },
					{ name: "All-Weather Outdoor Rugs: Define your Outdoor Living Space", path: "/blog/allweather-outdoor-rugs-define-your-outdoor-living-space/" },
					{ name: "Sunbrella Rain Fabrics", path: "/blog/sunbrella-rain-fabrics/" },
					{ name: "Choosing the Best Outdoor TV for Your Space", path: "/blog/choosing-the-best-outdoor-tv-for-your-space/" }
				]
			}]
		};


		// check and add supplemental category data
		const hasSupplemental = (id) => {
			let supplementalData = this.data[`category_${id}`];
			// console.log(supplementalData)
		}


		categoryData.forEach((ele, index) => {
		
			switch (ele.entityId) {
				case 2480: furniture(ele); break;
				case 1099: maintenanceCare(ele); break;
				case 2530: decor(ele); break;
				case 911: planters(ele); break;
				case 930: entertainment(ele); break;
				case 1196: brands(index); break;
				case 906: heating(ele); break;
				case 787: grillsKitchens(ele); break;
				case 798: umbrellas(ele); break;

				case 2425: removeCategory(index);break;
				case 2299: removeCategory(index);break;
				case 2508: removeCategory(index);break;
				default: break;
			}


			// remove unnecessary categories
			function removeCategory(i){
				categoryData.splice(i, 1);
			}


			// maintenance and care
			function maintenanceCare(ele){
				let maintenance = {
					entityId: 1099,
					name: "Maintenance & Care",
					path: "/maintenance-care/",
					children: []
				};

				ele.children.forEach(care => {
					if( care.name.includes("Shop All")){
						accessories.children.push(care);

					}else{
						maintenance.children.push(care);
					}
				});

				hasSupplemental(ele.entityId);
				accessories.children.unshift(maintenance);
			}


			// planters
			function planters(ele){
				let planters = {
					name: "Planters",
					path: "/planters/",
					entityId: 911,
					children: []
				};

				ele.children.forEach(plant => {
					if( plant.name.includes("In-Stock") || 
						plant.name.includes("New!") || 
						plant.name.includes("Shop All")
					){
						accessories.children.push(plant)

					}else{
						planters.children.push(plant)
					}
				});

				hasSupplemental(ele.entityId);
				accessories.children.unshift(planters);
			}


			// outdoor entertainment
			function entertainment(ele){
				let outdoor = {
					entityId: 930,
					name: "Outdoor Entertainment",
					path: "/outdoor-entertainment/",
					children: []
				}

				ele.children.forEach(entertain => {
					if( entertain.name.includes("New!") || 
						entertain.name.includes("Shop All")
					){
						accessories.children.push(entertain);

					}else{
						outdoor.children.push(entertain);
					}
				});

				hasSupplemental(ele.entityId)
				accessories.children.unshift(outdoor);
			}


			// Outdoor Decor
			function decor(ele){
				let decor = {
					entityId: 930,
					name: "Outdoor Decor",
					path: "/outdoor-decor/",
					children: []
				}

				ele.children.forEach(entertain => {
					if( entertain.name.includes("New!") || 
						entertain.name.includes("Shop All")
					){
						accessories.children.push(entertain);

					}else{
						decor.children.push(entertain);
					}
				});

				hasSupplemental(ele.entityId)
				accessories.children.unshift(decor);
			}


			// brands
			function brands(index){
				categoryData.splice(index, 1);

				let brands = {
					name: "Brands",
					entityId: 1196,
					children: [
						{
							name: "Outdoor Furniture",
							path: "/outdoor-furniture/",
							children: [
								{ name: "Lane Venture", path: "/shop-all-brands/lane-venture/" },
								{ name: "Kingsley Bate", path: "/shop-all-brands/kingsley-bate/" },
								{ name: "Cane-Line", path: "/shop-all-brands/cane-line/" },
								{ name: "All Outdoor Furniture Brands", path: "/shop-all-brands#Patio Furniture" },
								{ name: "Shop All Outdoor Furniture", path: "/outdoor-furniture/shop-all-outdoor-furniture/" },
							]
						},
						{
							name: "Patio Umbrellas",
							path: "/patio-umbrellas-accessories/",
							children: [
								{ name: "Treasure Garden", path: "/shop-all-brands/treasure-garden/" },
								{ name: "Barlow Tyrie", path: "/shop-all-brands/barlow-tyrie/#/filter:custom_category:Market$2520Umbrellas/filter:custom_category:Umbrella$2520Bases/filter:custom_category:Umbrella$2520Covers/filter:custom_category:Umbrellas/filter:custom_category:Cantilevers" },
								{ name: "Bambrella", path: "/shop-all-brands/bambrella/" },
								{ name: "All Patio Umbrella Brands", path: "/shop-all-brands#Patio Umbrellas" },
								{ name: "Shop All Patio Umbrellas & Accessories", path: "/patio-umbrellas-accessories/shop-all-patio-umbrellas-accessories/" },
							]
						},
						{
							name: "Grills & Outdoor Kitchens",
							path: "/grills-outdoor-kitchens/",
							children: [
								{ name: "Hestan", path: "/shop-all-brands/hestan/" },
								{ name: "Saber Grills", path: "/shop-all-brands/saber-grills/" },
								{ name: "Alfresco", path: "/shop-all-brands/alfresco-grills/" },
								{ name: "All Grill & Kitchen Brands", path: "/shop-all-brands#Grills & Outdoor Kitchens" },
								{ name: "Shop All Outdoor Kitchen Equipment", path: "/grills-outdoor-kitchens/outdoor-kitchen-equipment/shop-all-outdoor-kitchen-equipment/" },
							]
						},
						{
							name: "Outdoor Heating",
							path: "/outdoor-heating/",
							children: [
								{ name: "Aura Heaters", path: "/shop-all-brands/american-fireglass/" },
								{ name: "DEKKO", path: "/shop-all-brands/aura-heaters/" },
								{ name: "Elementi", path: "/shop-all-brands/elementi/" },
								{ name: "All Outdoor Heating Brands", path: "/shop-all-brands#Outdoor Heating" },
								{ name: "Shop All Outdoor Heating", path: "/outdoor-heating/shop-all-outdoor-heating/" },
							]
						},
						{
							name: "Planters",
							path: "/planters/",
							children: [
								{ name: "Capi", path: "/shop-all-brands/capi/" },
								{ name: "Pottery Pots", path: "/shop-all-brands/pottery-pots/" },
								{ name: "Gloster", path: "/shop-all-brands/gloster/#/filter:custom_category:Planters" },
								{ name: "All Planter Brands", path: "/shop-all-brands#Planters" },
								{ name: "Shop All Planters", path: "/planters/shop-all-planters/" },
							]
						},
						{
							name: "Outdoor Decor",
							path: "/outdoor-decor/",
							children: [
								{ name: "Elaine Smith Pillows", path: "/outdoor-decor/shop-all-outdoor-decor/#/filter:brand:Elaine$2520Smith$2520Pillows" },
								{ name: "Enduraleaf", path: "/shop-all-brands/enduraleaf/" },
								{ name: "Capel Rugs", path: "/outdoor-decor/shop-all-outdoor-decor/#/filter:brand:Capel" },
								{ name: "All Outdoor Decor Brands", path: "/shop-all-brands#Outdoor Decor" },
								{ name: "Shop All Outdoor Decor", path: "/outdoor-decor/shop-all-outdoor-decor/" },
							]
						},
						{
							name: "Maintenance & Care",
							path: "/maintenance-care/",
							children: [
								{ name: "Golden Care", path: "/maintenance-care/shop-all-maintenance-care/#/filter:brand:Golden$2520Care" },
								{ name: "KoverRoos", path: "/maintenance-care/shop-all-maintenance-care/#/filter:brand:KoverRoos" },
								{ name: "Classic Cushions", path: "/maintenance-care/shop-all-maintenance-care/#/filter:brand:Classic$2520Cushions" },
								{ name: "All Maintenance & Care Brands", path: "/shop-all-brands#Maintenance & Care" },
								{ name: "Shop All Maintenance & Care", path: "/maintenance-care/shop-all-maintenance-care/" },
							]
						},
						{
							name: "Outdoor Entertainment",
							path: "/outdoor-entertainment/",
							children: [
								{ name: "Sunbrite TV", path: "/shop-all-brands/sunbritetv/" },
								{ name: "Ecojet", path: "/shop-all-brands/ecojet/" },
								{ name: "Floating Luxuries", path: "/shop-all-brands/floating-luxuries/" },
								{ name: "All Outdoor Entertainment Brands", path: "/shop-all-brands#Outdoor Entertainment" },
								{ name: "Shop All Outdoor Entertainment", path: "/outdoor-entertainment/" },
							]
						}
					]
				}

				categoryData.push(brands);
			}



			// Outdoor Furniture
			function furniture(ele){
				ele.children.push({
					name: "Get Project Help",
					path: "/blog/",
					children: [
						{ name: "Choosing Furniture for Your Outdoor Space", path: "/blog/choosing-furniture-for-your-outdoor-space-/" },
						{ name: "Tablescape Ideas for an Outdoor Dinner Party", path: "/blog/tablescape-ideas-for-an-outdoor-dinner-party/" }
					]
				});
			}



			// heating
			function heating(ele){
				ele.children.push({
					name: "Get Project Help",
					path: "/blog/",
					children: [
						{ name: "Choosing a Fire Pit for your Backyard or Patio", path: "/blog/choosing-a-fire-pit-for-your-backyard-or-patio/" },
						{ name: "How to Enjoy Safe Outdoor Fire Pits", path: "/blog/how-to-enjoy-safe-outdoor-fire-pits/" },
						{ name: "Outdoor Header Buyer's Guide", path: "/blog/outdoor-heater-buyers-guide/" },
						{ name: "How to Buy A Patio Heater for Your Space", path: "/blog/how-to-buy-a-patio-heater-for-your-space/" },
						{ name: "Infrared Patio Heater Buying Guide", path: "/infrared-patio-heater-buying-guide" },
						{ name: "How to use Your Outdoor Living Space Year-Round", path: "/blog/how-to-use-your-outdoor-living-space-yearround/" }
					]
				});
			}


			// kitchens
			function grillsKitchens(ele){
				ele.children.push({
					name: "Get Project Help",
					path: "/blog/",
					children: [
						{ name: "Guide to Planning Your Outdoor Kitchen", path: "/blog/a-guide-to-planning-your-outdoor-kitchen/" },
						{ name: "Choose A Built-In Grill For Your Outdoor Space", path: "/choose-a-built-in-grill-for-your-outdoor-kitchen" },
						{ name: "Liven Up Your Backyard BBQ: 3 Tips to Elevate Your Cookout", path: "/liven-up-your-backyard-barbeque-3-tips-for-elevating-your-next-cookout" },
						{ name: "Gift Ideas for the Grill Master", path: "/blog/gift-ideas-for-the-grill-master/" },
						{ name: "How to Choose a Grill for Your Space", path: "/blog/how-to-choose-a-grill-for-your-space/" },
						{ name: "3 Things To Consider When Creating Your Own Outdoor Bar", path: "/3-things-to-consider-when-creating-your-own-outdoor-bar" },
						{ name: "Create Your Outdoor Kitchen With AuthenTEAK", path: "/create-your-outdoor-kitchen-with-authenteak" }
					]
				});
			}


			// umbrellas
			function umbrellas(ele){
				ele.children.push({
					name: "Get Project Help",
					path: "/blog/",
					children: [
						{ name: "Umbrella Buying Guide: Tips for Buying a Perfect Patio Umbrella", path: "/blog/umbrella-buying-guide-tips-for-buying-a-perfect-patio-umbrella/" },
						{ name: "Outdoor Inspiration: Upscale Roof Deck in Downtown Atlanta", path: "/blog/outdoor-inspiration-upscale-roof-deck-in-downtown-atlanta/" },
						{ name: "Hosting the Holidays Outdoors", path: "/blog/hosting-the-holidays-outdoors/" },
						{ name: "Treasure Garden Fabric Grade Resource Guide", path: "/treasure-garden-fabric-grades/" }
					]
				});
			}

		});

		categoryData.push(accessories);

		return categoryData;
	}



	parseFlyoutData = (parent) => {
		let flyoutList = {
				tpl: "",
				total: 0
			};
		let parentId = parent.split(",");

		parentId.forEach(id => {
			let data = this.flyoutData.find(ele => ele.entityId === parseInt(id));
			let supplementalData = this.data[`category_${id}`];
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
					<li class="flyout__item flyout__item--heading ${child.children.length < 2 ? "flyout__item--noSpace" : ""}">
						<h3 class="flyout__listHeading">
							<a href="${child.path}" class="flyout__listLink flyout__listLink--heading" title="Visit ${child.name} category">
								${child.name}
							</a>
						</h3>
					</li>
					${child.children.map(kid => {
						if(kid.isHidden || child.children.length < 2){ return; }

						return	`<li class="flyout__item">
									<a href="${kid.path}" class="flyout__listLink ${kid.name.includes("Shop All") ? 'em' : ''}" title="Visit ${kid.name} category">
										${kid.name}
									</a>
								</li>`;
					}).join("")}
				</ul>`;
	}



	flyoutSupplemental(child){
		return `<ul class="flyout__list">
					<li class="flyout__item flyout__item--heading ${child.items.length < 2 ? "flyout__item--noSpace" : ""}">
						<h3 class="flyout__listHeading">
							<a href="${child.url}" class="flyout__listLink flyout__listLink--heading" title="Visit ${child.title} category">
								${child.title}
							</a>
						</h3>
					</li>
					${child.items && child.items.map(kid => {
						return	`<li class="flyout__item">
									<a href="${kid.url}" class="flyout__listLink ${kid.title.includes("Shop All") ? 'em' : ''}" title="Visit ${kid.name} category">
										${kid.title}
									</a>
								</li>`;
						}).join("")
					}
				</ul>`;
	}



	flyoutSingle(child){
		return `<ul class="flyout__list flyout__list--feature">
					${child.map((kid) => {
						return `<li class="flyout__item flyout__item--heading">
									<h3 class="flyout__listHeading">
										<a href="${kid.path}" class="flyout__listLink flyout__listLink--heading" title="Visit ${kid.name} category">
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



	lockBody = (e) => {
		$(document.body).toggleClass("scroll-locked",  e.type === "mouseover");
	}



    /**
     * Firebase Methods
     */


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
                
                data = Object.assign(data, {expiry: this.now.getTime() + 86400000} );
                
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