import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import refreshContent from './refreshContent';

export default class CartUtils {
	constructor(modules, options) {
		this.modules = modules;
		this.$cartContent = $('[data-cart-content]');
		this.quantityInput = '[data-quantity-control-input]';
		this.cartAlerts = new Alert($('[data-alerts]'));
		this.cartPromos = $('[data-cart-promos]');
		this.productData = {};

		this.callbacks = $.extend({
			willUpdate: () => console.log('Update requested.'),
			didUpdate: () => console.log('Update executed.'),
		}, options.callbacks);
	}

	init() {
		this._cacheInitialQuantities();
		this._bindEvents();
	}

	_bindEvents() {

		this.$cartContent.on('change', this.quantityInput, _.bind(_.debounce(this._updateCartItem, 750), this));

		this.$cartContent.on('change', '[data-quantity-control-input]', (evt) => {
			const $target = $(evt.target);
			const itemId = $target.closest('[data-quantity-control]').data('quantity-control');

			this.productData[itemId].quantityAltered = true;
			this.productData[itemId].newQuantity = parseInt($target.val(), 10);
		});

		this.$cartContent.on('click', '[data-cart-item-remove]', (event) => {
			event.preventDefault();
			this._removeCartItem(event);
		});

		$('body').on('click', '.mini-cart [data-cart-item-remove]', () => {
			this.callbacks.willUpdate();
		});

		utils.hooks.on('cart-item-remove-remote', () => {
			refreshContent(this.callbacks.didUpdate, true);
		});
	}

	_cacheInitialQuantities() {
		$('[data-cart-item]').each((i, el) => {
			const $cartItem = $(el);
			const itemId = $cartItem.data('item-id');
			this.productData[itemId] = {
				oldQuantity: parseInt($cartItem.find('[data-quantity-control-input]').attr('value'), 10),
				quantityAltered: false,
			};
		});
	}

	_updateCartItem(event) {
		const $target = $(event.currentTarget);
		const $cartItem = $target.closest('[data-cart-item]');
		const itemId = $cartItem.data('item-id');

		this.callbacks.willUpdate();

		if (this.productData[itemId].quantityAltered) {
			const $quantityInput = $cartItem.find('[data-cart-item-quantity-input]');
			const newQuantity = this.productData[itemId].newQuantity;

			utils.api.cart.itemUpdate(itemId, newQuantity, (err, response) => {
				if (response.data.status === 'succeed') {
					const remove = (newQuantity === 0);

					this.productData[itemId].oldQuantity = newQuantity;
					refreshContent(this.callbacks.didUpdate, remove);

					// update our cart model data for other apps and UI
					utils.api.cart.getCart({ includeOptions: true }, (err, response) => {
						window.TEAK.Utils.saveCartResponse(response);

						window.location.reload();
					});


				} else {
					$quantityInput.val(this.productData[itemId].oldQuantity);
					this.cartAlerts.error(response.data.errors.join('\n'), true);

					this.callbacks.didUpdate();
				}
				// this.cartPromos.empty();
			});

		}
	}



	_removeCartItem(event) {
		const $target = $(event.currentTarget);
		const itemId = $target.closest('[data-cart-item]').data('item-id');

		this.callbacks.willUpdate();


		/**
		 * Remove Clyde Contracts
		 */

		// if this product has a clyde contract attached or is a clyde product, remove it too
		let clydeProduct = $target.parents(".cart-item--cntr");
		let removeCoveredProduct = $target.data("clydeItem");
		let coveredProductCode = "";

		// if its a clyde contract
		if( clydeProduct.attr("name").includes("Clyde Protection Plan") ){
			coveredProductCode = $target.parents(".cell").siblings(".cart-item-options").find(".product-option[data-name='covered-product-code']").data("value");

			// if its a product that has a clyde contract
		}else if ( typeof removeCoveredProduct !== "undefined" ){
			TEAK.Utils.storeData("clyde_delete", removeCoveredProduct.itemId);
			coveredProductCode = removeCoveredProduct.coveredProductCode;
		}


		let clydeObj = TEAK.Utils.getStoredData("clyde");

		if( clydeObj ){
			// find and remove this clyde item from storage
			for (const key in clydeObj) {
				if( clydeObj[key].coveredProductCode === coveredProductCode ){
					delete clydeObj[key];
				}
			}

			TEAK.Utils.storeData("clyde", clydeObj);
		}

		
	
		/**
		 * Remove Products
		 */

		utils.api.cart.itemRemove(itemId, (err, response) => {
			if (response.data.status === 'succeed') {
				refreshContent(this.callbacks.didUpdate, true);

				// update our cart model data for other apps and UI
				utils.api.cart.getCart({ includeOptions: true }, (err, response) => {
					window.TEAK.Utils.saveCartResponse(response);
					window.location.reload();
				});

			} else {
				this.cartAlerts.error(response.data.errors.join('\n'), true);

				this.callbacks.didUpdate();
			}
		});




	}
}
