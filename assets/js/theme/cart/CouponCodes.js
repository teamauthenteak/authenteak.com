import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import refreshContent from './refreshContent';

export default class CouponCodes {
	constructor(el, options) {
		this.$el = $(el);
		this.couponAlerts = new Alert($('[data-alerts]'));

		this.options = $.extend({
			context: {},
			$scope: $('[data-cart-totals]'),
			visibleClass: 'visible',
		}, options);

		this.callbacks = $.extend({
			willUpdate: () => console.log('Update requested.'),
			didUpdate: () => console.log('Update executed.'),
		}, options.callbacks);

		
		if( TEAK.User.isTradeCustomer ){
			this.applyTradeCode();

		}else{
			this._bindEvents();
		}
	}

	

	_bindEvents() {
		this.options.$scope.on('submit', '[data-coupon-code-form]', (event) => {
			event.preventDefault();
			this._addCode();
		});
	}


	_addCode() {
		const $input = $('[data-coupon-code-input]', this.options.$scope);
		const code = $input.val();

		this.couponAlerts.clear();
		this.callbacks.willUpdate();

		if (!code) {
			this.couponAlerts.error(this.options.context.couponCodeEmptyInput, true);
			return this.callbacks.didUpdate();
		}

		utils.api.cart.applyCode(code, (err, response) => {
			if(response === undefined){ return; }

			if (response.data.status === 'success') {
				refreshContent(this.callbacks.didUpdate);

				// update our cart model data for other apps and UI
				utils.api.cart.getCart({ includeOptions: true }, (err, response) => {
					window.TEAK.Utils.saveCartResponse(response);
				});

			} else {
				this.couponAlerts.error(response.data.errors.join('\n'), true);
				this.callbacks.didUpdate();
			}
		});
	}



	// applies custom trade code
	applyTradeCode(){
		let code = "TRADE";

		$("#couponcode").attr("readonly", true);
		$("#couponCodeForm").addClass("hide");

		utils.api.cart.applyCode(code, (err, response) => {
			if(response === undefined){ return; }
			
			if (response.data.status === 'success') {
				console.log(response)

				// update our cart model data for other apps and UI
				utils.api.cart.getCart({ includeOptions: true }, (err, response) => {
					window.TEAK.Utils.saveCartResponse(response);
				});

			}else {
				console.log(response)
			}
		});
	}


}
