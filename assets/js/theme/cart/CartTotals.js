/**
 * CartTotals.js
 * script for the totals.html template
 */



/** ----------------------------
 * Clyde 3rd Party Module
 ------------------------------*/
 
(async function (document, window, TEAK, Clyde, $) {
	let cart = await TEAK.ThirdParty.bigCommerce.getCart(),
		clydeData = TEAK.Utils.getStoredData("clyde"),
		clydeObj = clydeData ? clydeData : {};


	if( document.readyState !== 'loading' && clydeObj ) {

		// if we already have a clyde contract on this product, hide the button
		for (const key in clydeObj) {
			if ( clydeObj[key].type === "contract" ) {
				let $clydeProduct = $(".cart-item[data-item-id="+ clydeObj[key].parent.id +"]");

				$clydeProduct.find(".cart-item-remove").data("clyde-item", { "itemId": clydeObj[key].bcProductId, "coveredProductCode": clydeObj[key].coveredProductCode });
				$clydeProduct.find(".clyde-cart-cta").addClass("hide");

				$clydeProduct.find(".button-control-action").each(function(){ 
					$(this).data("clyde-item-id", clydeObj[key].bcProductId);
				});
			}
		}


		
		// if we asked to delete the product delete the contract for that product
		let deleteClyde = TEAK.Utils.getStoredData("clyde_delete");

		if(deleteClyde){ 
			window.localStorage.removeItem("clyde_delete");

			let removeURL = $(".cart-item[data-product-id="+ deleteClyde +"]").find(".cart-item-remove").attr("href");
			window.location.assign(removeURL);
		}



		// increment/decrement clyde contracts
		let incrementClyde = TEAK.Utils.getStoredData("clyde_increment");

		if( incrementClyde ){
			window.localStorage.removeItem("clyde_increment");

			let $clydeProduct = $(".cart-item[data-product-id="+ incrementClyde.clydeItemId +"]");
			let clydeQty = $clydeProduct.find(".quantity-input");
			let value = parseInt(clydeQty.val(), 10);

			value = incrementClyde.quantityControlAction === "increment" ? value + 1 : value - 1;

			clydeQty.val(value).trigger("change");
		}
	}
		


	// when a contract is selected
	function clydeCallback() {
		let selectedContract = Clyde.getSelectedContract(),
			clydeProduct = Clyde.getActiveProduct(),
			key = selectedContract.coveredProductCode.split("/")[0];

		if( parseInt(key) === clydeProduct.sku ){
			
			// adding more clyde product details for later delete or modifications
			clydeProduct.contracts.forEach(function(element){ 
				 if( element.attributes.sku === selectedContract.sku ){
					 Object.assign(selectedContract, {
						 ...element.attributes,
						 id: element.id,
						 type: element.type
					 });
				 }
			});

			clydeObj[key] = {
				...clydeObj[key],
				...selectedContract
			};

			TEAK.Utils.storeData("clyde", clydeObj);


			// get variant data of the contract so we can update the contract with product info
			let graphVariantTpl = TEAK.Utils.graphQL.getVariantData(parseInt(selectedContract.bcProductId), parseInt(selectedContract.bcVariantId));
			

			// add product data to clyde data
			TEAK.Utils.graphQL.get(graphVariantTpl).then(function(response){
				let clydeItem = { 
					lineItems: [
						{
							quantity: parseInt(clydeObj[key].parent.quantity, 10),
							productId: parseInt(selectedContract.bcProductId, 10),
							optionSelections: []
						}
					]
				};


				// add covered product information to clyde contract item
				response.site.product.options.edges.forEach(function(element){
					switch(element.node.displayName){
						case "covered-product-code":
							clydeItem.lineItems[0].optionSelections.push({
								optionId: element.node.entityId,
								optionValue: selectedContract.coveredProductCode
							});
							break;
						
						case "Product":
							clydeItem.lineItems[0].optionSelections.push({
								optionId: element.node.entityId,
								optionValue: clydeObj[key].parent.name
							})
							break;
						
						default:return;
					}
				});


				// add the covered product's variant information to clyde contract item
				response.site.product.variants.edges[0].node.options.edges.forEach(function(element){
					clydeItem.lineItems[0].optionSelections.push({
						optionId: element.node.entityId,
						optionValue: element.node.values.edges[0].node.entityId
					});
				});


				// add the clyde item to cart
				TEAK.ThirdParty.bigCommerce.addCartItem(cart[0].id, clydeItem).then(function(){
					TEAK.ThirdParty.heap.init({
						method: 'track',
						event: 'clyde_contract_selected',
						location: 'cart'
					});

					window.location.reload();
				});
			});
		}
	}



	let variantIds = [];

	if( cart ){

		cart[0].lineItems.physicalItems.forEach(function(element){

			// if the clyde object doesn't already have this property
			if( !clydeObj.hasOwnProperty(element.variantId) ){
				clydeObj[element.variantId] = {
					parent: {
						quantity: element.quantity,
						name: element.name,
						id: element.id,
						productId: element.productId,
						variantId: element.variantId
					}
				};
			}

			variantIds.push(element.variantId);
		});
	

		Clyde.init({
			key: window.location.hostname === "authenteak.com" ? "ck_live_GdzpQY4puTBzYcfP" : "ck_live_J7GFzT46aQbtVHjF",
			type: 'simple',
			pageKey: 'cart',
			skipGeoIp: true,
			skuList: variantIds,
			onShowModal: function(){
				TEAK.ThirdParty.heap.init({
					method: 'track',
					event: 'clyde_contract_viewed',
					location: 'cart'
				});
			}
	
		}, function () {
			variantIds.forEach(function (element, index) {
				Clyde.appendToSelectorWithSku(element, '.clyde__'+ index +'', clydeCallback);
			});

			window.addEventListener('message', function(e) {
				try{
					if( e.data.data.frameName.includes("clyde-widget-cart-frame") || clydeObj ){

						document.getElementById("cartCoverage").classList.remove("hide");
						$("#" + e.data.data.frameName).parents(".cart-item--cntr").find(".clyde__faqBtn").removeClass("hide");
						
						TEAK.ThirdParty.heap.init({
							method: 'track',
							event: 'cart_has_clyde_products',
							location: 'cart'
						});
					}

				}catch(e){}
			});
		});

	}




	Object.assign(TEAK.ThirdParty, {
		getClydeFaq: function(){
			return `<div class="landing">
						<div class="landing__headerCntr no-pad">
							<h1 class="landing__header">CLYDE EXTENDED PROTECTION PLAN</h1>
							<div class="landing__hero no-margin"><img class="landing__heroImg" src="https://authenteak.s3.us-east-2.amazonaws.com/content-pages/clyde/Desktop_Hero.jpg" alt="Clyde Extended Protection Plan"></div>
						</div>
						<div class="landing__section">
							<div class="landing__row landing__row--noFlex bottom-pad">
								<p class="landing__p">If you love the look of your new cream-colored cushions on your daybed but you are worried about your dog’s tendency to jump on furniture after a walk through wet grass, we’ve got you covered. If you are worried about a family member or friend spilling red wine on your lovely teak dining table while enjoying a Sunday lunch, we’ve got you covered. Let’s not forget how children have a true passion for crayons and their unusual ability to make a canvas out of everything. We’ve got you covered there too.</p>
							</div>
						
							<ul class="clyde__iconList clyde__iconList--margin">
								<li class="clyde__iconListItem">
									<svg class="clyde__coverageIcons clyde__coverageIcons--large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:none;}</style></defs><rect class="cls-1" width="24" height="24"/><path d="M9,.37A1.52,1.52,0,0,0,7,1.2L4.84,6.39a7.12,7.12,0,0,0,2.83,8.75l-1.84,4.5L3.7,18.76a1.27,1.27,0,0,0-1.65.69h0a1.13,1.13,0,0,0,.61,1.46l6.72,2.75A1.12,1.12,0,0,0,10.85,23h0a1.24,1.24,0,0,0-.68-1.62L8,20.54,9.87,16A7.13,7.13,0,0,0,18,11.8l2-4.92a1.82,1.82,0,0,0-1-2.37Zm.7,13.13-.37-.15A4.37,4.37,0,0,1,6.89,7.64L8.47,3.79a1,1,0,0,1,1.27-.53l7.08,2.9a.89.89,0,0,1,.48,1.15l-1.48,3.61A4.74,4.74,0,0,1,9.65,13.5Z"/><path d="M17.74,1.8c-1.37.91-4.32,6.84-6.58,6.65C9,8.51,8,5.48,7.72,7.89,7.13,13.3,13.65,14.63,15.34,9c.47-1.54,1.94-6.28,4.5-6.12C21.55,3,21,5.63,21.61,4.52,22.8,2.35,19.78.55,17.74,1.8Z"/><path d="M14.83,22.85c-1,0-1.19-.39-1.38-.74a.89.89,0,0,0-.66-.56l-.54-.12c-.77-.18-1.38-.31-1.48-.66a.41.41,0,0,1,.07-.35c.46-.62,3-1.08,5.91-1.08a6.76,6.76,0,0,1,1.86.24,3.43,3.43,0,0,0,.94.14h.25l.54,0c.28,0,2.75,0,2.75.86,0,.21-.17.91-2.41,1.47a10.09,10.09,0,0,1-2.11.18H18.1a9.25,9.25,0,0,0-1.16.26,8.43,8.43,0,0,1-2.11.38Z"/></svg>
									<p class="clyde__iconTitle">Food and Beverage Stains</p>
								</li>
								<li class="clyde__iconListItem">
									<svg class="clyde__coverageIcons clyde__coverageIcons--large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:none;}</style></defs><rect class="cls-1" width="24" height="24"/><path d="M6.77,8.29a6.14,6.14,0,0,0,1.82,4.77l.1,0a1.32,1.32,0,0,0,0-.28,3.85,3.85,0,0,0-.08-.47,14.66,14.66,0,0,1,0-5.64,9,9,0,0,1,3.08-4.85c.54-.46,1.13-.85,1.69-1.27l.06.06a.9.9,0,0,1,0,.16,4.28,4.28,0,0,0,.9,4.52,14.47,14.47,0,0,0,2.36,2.06A11.28,11.28,0,0,1,19.48,10a7.55,7.55,0,0,1,1.36,4.24,10.84,10.84,0,0,1-.33,3.41,8.3,8.3,0,0,1-4.12,4.84A8.21,8.21,0,0,1,5.33,19.22,8,8,0,0,1,4.24,15.3a10.94,10.94,0,0,1,.51-4.1,9.88,9.88,0,0,1,1.67-3h0A.2.2,0,0,1,6.77,8.29Zm6.43,6-.09,0a.6.6,0,0,0-.09.13c-.13.33-.24.67-.4,1-.93,1.78-2,3.06-4,3.47h0a.21.21,0,0,0-.1.35,6,6,0,0,0,6.71,1.22,6.12,6.12,0,0,0,3.52-6.5A6.24,6.24,0,0,0,15,9.26a.19.19,0,0,0-.23.27c.14.28.28.55.4.82a7.81,7.81,0,0,1,.56,1.53A5.93,5.93,0,0,1,14.33,17a6,6,0,0,1-.92.89.17.17,0,0,1-.26-.18A7.93,7.93,0,0,0,13.2,14.25Z"/></svg>
									<p class="clyde__iconTitle">Burn and Heat Marks</p>
								</li>
								<li class="clyde__iconListItem">
									<svg class="clyde__coverageIcons clyde__coverageIcons--large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:none;}.cls-2{fill:#fff;}</style></defs><rect class="cls-1" width="24" height="24"/><rect class="cls-1" width="24" height="24"/><path d="M3.23.6h6c.17,0,.29.21.25.42L8.31,7.52l3.74,2.24L10.15,14l4.15,3.29-1.81,2.94,3-3.17L12,13.33,14.42,9,11.05,7.38,14,.6l5.9.05c1.65,0,2.95,1.9,2.86,4.14l-.55,14.79c-.08,2.14-1.38,3.82-3,3.82H5.18c-1.8,0-3.27-1.91-3.36-4.34L1.23,3.47C1.17,1.91,2.08.6,3.23.6Z"/><path class="cls-2" d="M7.71,2.29H4.63A1.34,1.34,0,0,0,3.29,3.7l.89,15.72A1.79,1.79,0,0,0,6,21.11h4.1L12,17.79l-4-3.1,2-4.19-3.63-2Z"/><path class="cls-2" d="M15.31,2.29,19,2.46A1.72,1.72,0,0,1,20.6,4.17l-.38,14.24a3,3,0,0,1-2.75,2.94l-3.68.32,3.94-4.38L14,12.82,16.4,8.39,13.19,6.73Z"/></svg>
									<p class="clyde__iconTitle">Rips, Gouges, Scratches & Breaks</p>
								</li>
								<li class="clyde__iconListItem">
									<svg class="clyde__coverageIcons clyde__coverageIcons--large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:none;}</style></defs><rect class="cls-1" width="24" height="24"/><path d="M9.45,20.93c-1.28-.49-2-.14-2.85-1.58a1.78,1.78,0,0,1-.24-1.07.26.26,0,0,0-.45-.2A5.94,5.94,0,0,0,4.71,20a.69.69,0,0,1-.71.43c-.28,0-.6-.07-1-.07a2.52,2.52,0,0,0-1.15.27c-1.4.72-1.49,2.4.31,2.85a1.34,1.34,0,0,0,.35,0c1,0,2.23-.86,3.63-.86a3,3,0,0,1,1.08.19,6.94,6.94,0,0,0,2.13.53,1.12,1.12,0,0,0,.72-.22A1.3,1.3,0,0,0,9.45,20.93Z"/><path d="M9.41,16.7,6.3,14A1.93,1.93,0,0,1,6,11.42L13,1.09A1.9,1.9,0,0,1,14.31.28a2,2,0,0,1,1.53.48L21.31,5.6A1.94,1.94,0,0,1,22,7.06a1.87,1.87,0,0,1-.64,1.41L12,16.72A1.92,1.92,0,0,1,9.41,16.7ZM14.89,1.83a.55.55,0,0,0-.41-.13.45.45,0,0,0-.31.19l-7,10.34a.49.49,0,0,0,.1.65l3.11,2.75a.49.49,0,0,0,.65,0l9.38-8.26a.44.44,0,0,0,.15-.33.53.53,0,0,0-.18-.39Z"/><path d="M7.58,18.2,5.05,16a1.48,1.48,0,0,1-.13-2.09l.49-.55a1.47,1.47,0,0,1,2.08-.13L10,15.43a1.47,1.47,0,0,1,.13,2.08l-.49.56A1.48,1.48,0,0,1,7.58,18.2Zm-1-3.94H6.48L6,14.82s0,0,0,.06l2.53,2.25s.05,0,.06,0l.5-.56a0,0,0,0,0,0-.06Z"/><path d="M13.93,8.7a1.5,1.5,0,0,1-.4-2.09,1.51,1.51,0,1,1,.4,2.09Z"/><path d="M15.9,6.07a.27.27,0,0,1-.05-.38l.51-.64a.27.27,0,0,1,.39,0,.28.28,0,0,1,0,.38L16.28,6A.26.26,0,0,1,15.9,6.07Z"/><path d="M16.65,7.33a.25.25,0,0,1-.11-.18.26.26,0,0,1,.22-.31l.8-.15a.29.29,0,0,1,.32.23.27.27,0,0,1-.23.31l-.8.14A.24.24,0,0,1,16.65,7.33Z"/><path d="M17,9.37h0l-.66-.48a.27.27,0,1,1,.32-.44l.66.48a.27.27,0,0,1-.31.45Z"/><path d="M15,10.52a.25.25,0,0,1-.12-.19l-.12-.8A.27.27,0,0,1,15,9.22a.27.27,0,0,1,.31.23l.12.8a.27.27,0,0,1-.23.31A.25.25,0,0,1,15,10.52Z"/><path d="M12.88,10h0a.27.27,0,0,1,0-.38l.5-.65a.27.27,0,0,1,.38-.05.27.27,0,0,1,.05.39l-.49.64A.27.27,0,0,1,12.88,10Z"/><path d="M11.78,8a.32.32,0,0,1-.12-.2.26.26,0,0,1,.24-.3l.81-.1a.27.27,0,0,1,.3.24.28.28,0,0,1-.24.31L12,8.05A.28.28,0,0,1,11.78,8Z"/><path d="M13,6.38l0,0-.63-.51a.27.27,0,1,1,.35-.42l.63.51a.28.28,0,0,1,0,.39A.28.28,0,0,1,13,6.38Z"/><path d="M14.46,5.64a.28.28,0,0,1-.12-.21l-.07-.81a.27.27,0,0,1,.25-.29.26.26,0,0,1,.29.24l.07.82a.26.26,0,0,1-.25.29A.25.25,0,0,1,14.46,5.64Z"/><polyline points="9.1 9.07 14.27 13.5 12.51 15.1 7.07 10.57 9.1 8.81"/></svg>
									<p class="clyde__iconTitle">Sun tan lotion and oil or cosmetic stains on fabric</p>
								</li>
							</ul>
							
							<div class="landing__row " style="background: #F5F5F5;">
								<h3 class="landing__headerCntr"><strong>FREQUENTLY ASKED QUESTIONS</strong></h3>
								<div class="landing__col-1-1">
									<h4><strong>What is Clyde?</strong></h4>
									<p>We’ve partnered with Clyde to allow you to purchase product coverage directly from our site.<br>Clyde handles all processing, claims, and follow up in case something happens to your product.</p>
									<h4>&nbsp;</h4>
									<h4><strong>What happens next?</strong></h4>
									<p>When you purchase a protection plan with us you’ll checkout exactly how you normally would.<br>You’ll receive a confirmation email from us on your purchase, as well as an email from Clyde with information about your protection plan.</p>
									<h4>&nbsp;</h4>
									<h4><strong>How do I file a claim?</strong></h4>
									<p>You can file a claim directly through Clyde at&nbsp;<a href="https:\\www.hiclyde.com">hiclyde.com</a>.<br>This link can be found in the email sent to you after you purchase coverage. If you lose this email, you can reach out to us or Clyde.</p>
									<h4>&nbsp;</h4>
									<h4><strong>What if I return my product?</strong></h4>
									<p>Your contract will also be returned and refunded, but at a prorated amount depending on<br>how long the contract has been in effect. You’ll get a full refund within 30 days.</p>
								</div>
							</div>
							<div class="landing__row landing__row--wrapCenter">
								<div class="landing__col-1-2">
									<table border="0">
										<tbody>
											<tr>
												<th>COVERED STAINS AND DAMAGE</th>
												<th>FABRIC</th>
											</tr>
											<tr>
												<td>Food and beverage stains</td>
												<td><strong>✓</strong></td>
											</tr>
											<tr>
												<td>Punctures, cuts, tears, rips</td>
												<td><strong>✓</strong></td>
											</tr>
											<tr>
												<td>Cosmetics, sun tan lotion and oils</td>
												<td><strong>✓</strong></td>
											</tr>
											<tr>
												<td>Human and pet biological stains<br>(except perspiration, hair and body oils)</td>
												<td><strong>✓</strong></td>
											</tr>
											<tr>
												<td>Ballpoint pen ink or marker</td>
												<td><strong>✓</strong></td>
											</tr>
											<tr>
												<td>Bleach or Chlorine</td>
												<td><strong>✓</strong></td>
											</tr>
											<tr>
												<td>Burns and heat marks</td>
												<td><strong>✓</strong></td>
											</tr>
											<tr>
												<td>Matching pieces</td>
												<td><strong>✓</strong></td>
											</tr>
										</tbody>
									</table>
								</div>
								<table border="0">
									<tbody>
										<tr>
											<th>COVERED STAINS AND DAMAGE</th>
											<th>HARD<br>SURFACES</th>
										</tr>
										<tr>
											<td>Food and beverage stains</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Burns and heat marks</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Breakage</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Breakage of table tops</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Breakage of weilds</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Breakage of rocker, swivel, glider and recline mechanism</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Scratches, gouges, chips or cracks</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Scratches on cast aluminum that penetrate through the<br>finish exposing the aluminum</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Fabric gazebo or cover sling frame</td>
											<td><strong>✓</strong></td>
										</tr>
										<tr>
											<td>Matching pieces</td>
											<td><strong>✓</strong></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>`;
		},

		clydeFaqOpen: function(){
			let clydeFaq = document.getElementById("clydeFAQ");
			tpl = TEAK.ThirdParty.getClydeFaq();

			clydeFaq.classList.remove("hide");
			clydeFaq.querySelector(".clyde__faqCntr").innerHTML = tpl;
		},

		clydeFaqClose: function(){
			document.getElementById("clydeFAQ").classList.add("hide");
		}
	});


}(document, window, window.TEAK, window.Clyde, window.jQuery));




/** ------------------------------------------------
 * 1. 3rd Party Analytics: IntelliSuggest
 * 2. Trade User Customizations for Grand Total
 --------------------------------------------------*/

(function (document, window, TEAK) {
	let cartProductJson;


	// set product data to local storage so we can show it on the user's my account page
	function getProductCartJSON() {
		cartProductJson = document.getElementById("cartProductJson").innerHTML.trim();
		cartProductJson = JSON.parse(cartProductJson);

		storeCartItems();
		brandShippingMessage();
	}


	// sets any analytics data
	function setAnalytics() {
		try {
			IntelliSuggest.init({
				siteId: TEAK.ThirdParty.IntelliSuggest.siteId,
				context: 'Basket',
				seed: TEAK.ThirdParty.IntelliSuggest.initArray
			});

			// Loop through products in cart
			TEAK.ThirdParty.IntelliSuggest.haveItemArray.forEach(function (element) {
				IntelliSuggest.haveItem(element);
			});

			IntelliSuggest.inBasket({});
		}
		catch (err) {
			console.log(err)
		}
	}



	// updates the grand total UI
	function updateGrandTotal() {
		let grandTotal = document.getElementById("grandTotal");

		if (grandTotal) {
			// updates the grand total after template calculation
			let shippingTotal = grandTotal ? parseFloat(grandTotal.dataset.total.trim()) : 0;

			let subTotal = TEAK.Data.cart.sub_total_raw;
			subTotal = subTotal === "0" ? 0 : parseFloat(subTotal);

			let tax = TEAK.Data.cart.hasOwnProperty("tax") ? parseFloat(TEAK.Data.cart.tax) : 0;
			let total = shippingTotal + subTotal + tax;

			grandTotal.innerHTML = total.toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD'
			});
		}
	}


	// store cart items for Lead Time
	function storeCartItems() {
		TEAK.Utils.storeData("TEAK_cartLeadTime", cartProductJson);
	}


	// show brand Shipping Message based on number of brands
	function brandShippingMessage() {
		let cartBrands = {};

		cartProductJson.forEach(function (element) {
			cartBrands[element.brand] = null;
		});

		if (Object.keys(cartBrands).length >= 2) {
			document.getElementById("multiPackageAlert").classList.remove("hide");
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		getProductCartJSON();
		updateGrandTotal();
		setAnalytics();
	});



	let cartSummaryBtn = document.getElementById("cartSummaryBtn");
	let cartContent = document.querySelector(".cart-content-cntr");

	cartSummaryBtn.addEventListener("click", function(){		
		cartSummaryBtn.classList.toggle("cart__summaryBtn--closed");
		cartSummaryBtn.querySelector(".cart__summaryBtnText").innerHTML = cartSummaryBtn.classList.contains("cart__summaryBtn--closed") ? "Show Cart Summary" : "Hide Cart Summary";
		cartContent.classList.toggle("hide");
	});


}(document, window, window.TEAK));






/**
 * NOTE: this is a hack.
 * This is only a hack.
 * This needs to be done at the paypal level because...it's a hack.
 * This simply replaces the amazon button with a new one
 * 
 * 1. Amazon Button
 * 2. More Trade User
*/

(function (document, window) {
	let amazonBtn;

	let change = {
		init: function () {
			change
				.swapButtonAmazon()
				.showButtonAmazon();

			return this;
		},

		swapButtonAmazon: function () {
			try {
				amazonBtn = document.querySelector("img.amazonpay-button-inner-image");
				amazonBtn.src = "//authenteak.com/content/amazon-pay-btn.png";
				amazonBtn.style.opacity = 1;
				amazonBtn.srcset = "//authenteak.com/content/amazon-pay-btn.png";

			} catch (e) { }

			return this;
		},


		showButtonAmazon: function () {
			try {
				document.getElementById("OffAmazonPaymentsWidgets0").classList.add("amazonpay-button-inner-image--show");

				amazonBtn.addEventListener("click", function () {
					let subTotal = TEAK.Data.cart.sub_total.replace(/\$|,/g, ''),
						qty = TEAK.Data.cart.quantity;

					subTotal = parseInt(subTotal); s
					qty = parseInt(qty);

					// TEAK.Modules.fbPixel.checkoutStart(subTotal, qty);
					TEAK.Modules.pintrest.checkOut(subTotal, qty);
				});
			} catch (e) { }

			return this;
		}
	};


	// Get the cart detail from localstorage
	function getStoredCart() {
		let storedCart = localStorage.getItem('cartData');
		return storedCart ? JSON.parse(storedCart) : [];
	}

	function getCartQnty(cart) {
		let count = 0;

		cart[0].lineItems.physicalItems.forEach(function (element) {
			count += element.quantity;
		});

		return count;
	}

	// update the cart header
	function updateHeaderMiniCart() {
		let $dataCart = $("[data-cart-quantity]"),
			cart = getStoredCart(),
			cartQty = getCartQnty(cart);

		$dataCart.data("cartQuantity", cartQty);
		$dataCart.html(cartQty);

		checkForDiscount(cart);
	}


	function checkForDiscount() {
		let cart = getStoredCart(),
			amount = 0;

		if (cart.length > 0) {
			cart[0].discounts.forEach(function (element) {
				amount = amount + element.discountedAmount;
			});

			if (amount > 0 && !TEAK.User.isTradeCustomer) {
				let discountCntr = document.getElementById("cartTotalItemDiscount"),
					subTotal = document.getElementById("cartSubTotal"),
					currencSymbol = cart[0].currency.symbol;

				subTotal.innerHTML = currencSymbol + (cart[0].baseAmount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

				discountCntr.classList.remove("hide");
				discountCntr.querySelector(".cart-total-item--discount").innerHTML = "-" + currencSymbol + (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
			}
		}

	}


	document.addEventListener('DOMContentLoaded', function () {
		checkForDiscount();

		$(window)
			.on("load", change.init)
			.on("cartDataStored", updateHeaderMiniCart);
	});

}(document, window));





/* -------------------------------
 Bolt 3rd Party Customizations
---------------------------------- */
(function (window, document, TEAK) {
	let originalCheckoutButton = document.querySelector(".cart-actions .button-primary");
	let boltButtons = document.getElementsByClassName("bolt-button-wrapper");

	if (true) {
		for (let i = 0; i < boltButtons.length; i++) {
			boltButtons[i].style.display = 'contents';

			// Facebook Pixel track for Bolt - initiate checkout
			// cannot track 'AddPaymentInfo' because bolt is in a iframe
			boltButtons[i].addEventListener("click", function () {
				let subTotal = TEAK.Data.cart.sub_total.replace(/\$|,/g, ''),
					qty = TEAK.Data.cart.quantity;

				subTotal = parseInt(subTotal);
				qty = parseInt(qty);

				// TEAK.Modules.fbPixel.checkoutStart(subTotal, qty);
				TEAK.Modules.pintrest.checkOut(qty);
			});
		}

		if (originalCheckoutButton) {
			originalCheckoutButton.style.display = 'none';
		}
	}

	/*
	let interval = setInterval(function () {
		if (window.BoltCheckout) {
			window.BoltCheckout.setClientCustomCallbacks({
				success: function (trx) {
					fbq('track', 'Purchase', {
						value: trx.amount.amount / 100.0,
						currency: 'USD',
					});
				}
			});
			clearInterval(interval);
		}
	}, 200);
	*/

	let config = { childList: true, subtree: true };
	// Change totalClassName
	let totalClassName = "grand-total";
	let bigCommerceTotalPrice = "";

	let callback = function (mutationsList) {
		setTimeout(function () {
			let elms = document.getElementsByClassName(totalClassName);

			if (elms.length == 0) { return; }

			let newPrice = elms[0].innerText || elms[0].innerHTML;

			if (newPrice !== bigCommerceTotalPrice && window.BoltCheckout && window.BoltCheckout.reloadBigCommerceCart) {
				window.BoltCheckout.reloadBigCommerceCart();
			}

			bigCommerceTotalPrice = newPrice;
		}, 200);
	};

	new MutationObserver(callback).observe(document.body, config);

}(window, document, window.TEAK));