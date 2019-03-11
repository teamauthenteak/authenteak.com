import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import refreshContent from './refreshContent';

export default class ShippingCalculator {
  constructor(el, options) {
    this.$el = $(el);
    this.shippingAlerts = new Alert($('[data-alerts]'));

    this.options = $.extend({
      context: {},
      $scope: $('[data-cart-totals]'),
      visibleClass: 'visible',
    }, options);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
    }, options.callbacks);

    this._bindEvents();
  }

  _bindEvents() {
    this.options.$scope.on('click', '[data-shipping-calculator-toggle]', (event) => {
      event.preventDefault();
      this._toggle();
    });

    this.options.$scope.on('submit', '[data-shipping-calculator] form', (event) => {
      event.preventDefault();
      this._calculateShipping();
    });

    this.options.$scope.on('change', 'select[name="shipping-country"]', (event) => {
      this._updateStates(event);
      this.options.$scope.find('[name="shipping-zip"]').val('');
    });
  }

  _toggle() {
    $('[data-shipping-calculator]', this.options.$scope).toggleClass(this.options.visibleClass);
  }

  _updateStates(event) {
    const $target = $(event.currentTarget);
    const country = $target.val();
    const $stateElement = $('[name="shipping-state"]');

    utils.api.country.getByName(country, (err, response) => {
      if (response.data.states.length) {
        const stateArray = [];
        stateArray.push(`<option value="">${response.data.prefix}</option>`);
        $.each(response.data.states, (i, state) => {
          stateArray.push(`<option value="${state.id}">${state.name}</option>`);
        });
        $stateElement.parent().addClass('form-select-wrapper');
        $stateElement.replaceWith(`<select class="form-select form-input form-input-short" id="shipping-state" name="shipping-state" data-field-type="State">${stateArray.join(' ')}</select>`);
      } else {
        $stateElement.parent().removeClass('form-select-wrapper');
        $stateElement.replaceWith(`<input class="form-input form-input-short" type="text" id="shipping-state" name="shipping-state" data-field-type="State" placeholder="${this.options.context.shippingState}">`);
      }
    });
  }

  _calculateShipping() {
    this.callbacks.willUpdate();

    const params = {
      country_id: $('[name="shipping-country"]', this.$calculatorForm).val(),
      state_id: $('[name="shipping-state"]', this.$calculatorForm).val(),
      zip_code: $('[name="shipping-zip"]', this.$calculatorForm).val()
    };

    utils.api.cart.getShippingQuotes(params, 'cart/shipping-quotes', (err, response) => {
      const $shippingQuotes = $('[data-shipping-quotes]', this.options.$scope);
      if (response.data.quotes) {
        this.shippingAlerts.clear();
        $shippingQuotes.html(response.content);
      } else {
        this.shippingAlerts.error(response.data.errors.join('\n'), true);
      }

      this.callbacks.didUpdate();

      // bind the shipping method radios
      $shippingQuotes.find('.form').on('change', (event) => {
        event.preventDefault();

        this.callbacks.willUpdate();

        const quoteId = $('[data-shipping-quote]:checked').val();

        utils.api.cart.submitShippingQuote(quoteId, (response) => {
          refreshContent(this.callbacks.didUpdate);
        });
      });
    });
  }
}
