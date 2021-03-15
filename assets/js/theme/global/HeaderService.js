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
					{ name: "FOO", path: "" },
					{ name: "FOO", path: "" },
					{ name: "FOO", path: "" },
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
				case 1099: maintenanceCare(ele); break;
				case 911: planters(ele); break;
				case 930: outdoorEntertainment(ele); break;
				case 1196: brands(index); break;
				case 906: heating(ele); break;
				case 787: grillsKitchens(ele); break;

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
			function outdoorEntertainment(ele){
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
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Outdoor Furniture", path: "/outdoor-furniture/shop-all-outdoor-furniture/" },
							]
						},
						{
							name: "Patio Umbrellas",
							path: "/patio-umbrellas-accessories/",
							children: [
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Patio Umbrellas & Accessories", path: "/patio-umbrellas-accessories/shop-all-patio-umbrellas-accessories/" },
							]
						},
						{
							name: "Grills & Outdoor Kitchens",
							path: "/grills-outdoor-kitchens/",
							children: [
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Outdoor Kitchen Equipment", path: "/grills-outdoor-kitchens/outdoor-kitchen-equipment/shop-all-outdoor-kitchen-equipment/" },
							]
						},
						{
							name: "Outdoor Heating",
							path: "/outdoor-heating/",
							children: [
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Outdoor Heating", path: "/outdoor-heating/shop-all-outdoor-heating/" },
							]
						},
						{
							name: "Planters",
							path: "/planters/",
							children: [
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Planters", path: "/planters/shop-all-planters/" },
							]
						},
						{
							name: "Outdoor Decor",
							path: "/outdoor-decor/",
							children: [
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Outdoor Decor", path: "/outdoor-decor/shop-all-outdoor-decor/" },
							]
						},
						{
							name: "Maintenance & Care",
							path: "/maintenance-care/",
							children: [
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Maintenance & Care", path: "/maintenance-care/shop-all-maintenance-care/" },
							]
						},
						{
							name: "Outdoor Entertainment",
							path: "/outdoor-entertainment/",
							children: [
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "FOO", path: "" },
								{ name: "Shop All Outdoor Entertainment", path: "/outdoor-entertainment/" },
							]
						}
					]
				}

				categoryData.push(brands);
			}


			// heating
			function heating(ele){
				ele.children.push({
					name: "Get Project Help",
					path: "/blog/",
					children: [
						{ name: "FOO", path: "" },
						{ name: "FOO", path: "" },
						{ name: "FOO", path: "" },
					]
				});
			}


			// kitchens
			function grillsKitchens(ele){
				ele.children.push({
					name: "Get Project Help",
					path: "/blog/",
					children: [
						{ name: "FOO", path: "" },
						{ name: "FOO", path: "" },
						{ name: "FOO", path: "" },
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
					${child.items ? child.items.map(kid => {
						return	`<li class="flyout__item">
									<a href="${kid.url}" class="flyout__listLink ${kid.title.includes("Shop All") ? 'em' : ''}" title="Visit ${kid.name} category">
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