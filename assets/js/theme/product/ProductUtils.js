import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import FormValidator from '../utils/FormValidator';

import ProgressButton from '../utils/ProgressButton';

export default class ProductUtils {
  constructor(el, options) {
    this.$el = $(el);
    this.options = $.extend({
      onImageSwitch: () => {},
    }, options);
    this.productId = this.$el.find('input[data-product-id][value]').val();
    this.pageAlerts = new Alert($('[data-alerts]'));
    this.productAlerts = new Alert($('[data-product-alerts]'));
    this.productTitle = $(el).data('product-title');
    this.$productContainer = $('[data-product-container]');

    this.progressButton = new ProgressButton();

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
      switchImage: (url) => console.log(`Image switch attempted for ${url}`),
    }, options.callbacks);

    this._bindEvents();

    if (this.$el.hasClass('product-single')) {
      this._updateAttributes(window.BCData.product_attributes);
    }
  }

  _bindEvents() {
    this.$el.find('.product-quantity-toggle').on('click', (event) => {
      this._updateQuantity(event);
      //call the function that updates the price here!
    });

    this.$el.find('.product-quantity').on('focusout', (event) => {
      this._checkQuantity(event.currentTarget);
    });
  }

  init(context) {
    this.context = context;

    this._bindProductOptionChange();
    this._bindAddWishlist();

    this.Validator = new FormValidator(this.context);
    this.Validator.initSingle(
      this.$el.find('form[data-cart-item-add]'),
      {
        onError: (e) => {
          let $firstError = $(e.target).find('.form-field-invalid').first();
          if ('scrollBehavior' in document.documentElement.style) {
            window.scroll({
              top: $firstError.offset().top - 112,
              left: 0,
              behavior: 'smooth'
            });
          } else {
            window.scroll(0, $firstError.offset().top - 200);
          }
        }
      }
    );

    this.boundCartCallback = this._bindAddToCart.bind(this);
    utils.hooks.on('cart-item-add', this.boundCartCallback);

    // Trigger a change event so the values are correct for pre-selected options
    $('[data-cart-item-add]').find('input[type="radio"], input[type="checkbox"], select').first().change();

    // Trigger initial attribute update on quickshop
    if (!this.$el.hasClass('product-single')) {
      utils.hooks.emit('product-option-change');
    }
  }

  /**
   *
   * Cleanup - useful for closing quickshop modals
   *
   */
   destroy() {
     utils.hooks.off('cart-item-add', this.boundCartCallback);
   }

  /**
   * Cache an object of jQuery elements for DOM updating
   * @param  jQuery $el - a wrapping element of the scoped product
   * @return {object} - buncha jQuery elements which may or may not exist on the page
   */
  _getViewModel($el) {
    return {
      $price: $('[data-product-price-wrapper="without-tax"]', $el),
      $testBit: $('[data-test-bit]', $el),
      $freeShip: $('[data-pricing-free-shipping]', $el),
      $priceWithTax: $('[data-product-price-wrapper="with-tax"]', $el),
      $saved: $('[data-product-price-saved]', $el),
      $sku: $('[data-product-sku]', $el),
      $weight: $('[data-product-weight]', $el),
      $addToCart: $('[data-button-purchase]', $el),
      $imagePreview: $('[data-variation-preview]', $el),
      stock: {
        $selector: $('[data-product-stock]', $el),
        $level: $('[data-product-stock-level]', $el),
      },
    };
  }

  /**
  * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
  * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
  * @param formData: FormData object
  * @returns FormData object
  */
  filterEmptyFilesFromForm(formData) {
    try {
      for (const [key, val] of formData) {
        if (val instanceof File && !val.name && !val.size) {
          formData.delete(key);
        }
      }
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
    return formData;
  }

  /**
   * Bind product options changes.
   */
  _bindProductOptionChange() {
    utils.hooks.on('product-option-change', (event, changedOption) => {
      const $changedOption = $(changedOption);
      const $form = $changedOption.parents('form');
      let showMessage = true;

      if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
        showMessage = false;
      }

      // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
      if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
        return;
      }

      this.pageAlerts.clear();
      this.productAlerts.clear();

      utils.api.productAttributes.optionChange(this.productId, $form.serialize(), (err, response) => {
        const viewModel = this._getViewModel(this.$el);
        const data = response ? response.data : {};

        // If our form data doesn't include the product-options-count with a positive value, return
        if (this.$el.find('[data-product-options-count]').val < 1) {
          return;
        }

        this._updateAttributes(data);

        // Apply quantity changes
        let qty = Number.parseInt($('.product-quantity').val());
        if (qty > 1) {
          for (var i in data.price) {
            if (data.price[i].value) {
              data.price[i].value *= qty;
              if (data.price[i].formatted) {
                data.price[i].formatted = data.price[i].value.toLocaleString('en-us', {style: 'currency', currency: 'USD'});
              }
            }
          }
        }

        // Extrapolate and test for base price
        if (data.base || (typeof data.variantID == 'undefined' && typeof data.v3_variant_id == 'undefined')) {
          viewModel.$price.data('base-price', data.price.without_tax);
        }
        if (data.price.without_tax !== viewModel.$price.data('base-price')) {
          delete data.price.rrp_without_tax;
          delete data.price.rrp_with_tax;
          delete data.price.saved;
        }

        // updating price (Update price based on quantity HERE!)
        if (viewModel.$price.length) {
          const priceStrings = {
            price: data.price,
            excludingTax: this.context.productExcludingTax,
          };
          viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
          // console.log('updating!');
          // console.log(this);
          // console.log(priceStrings);
          // console.log(data.price);
        }

        if (viewModel.$priceWithTax.length) {
          const priceStrings = {
            price: data.price,
            includingTax: this.context.productIncludingTax,
          };
          viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
        }

        if (viewModel.$saved.length) {
          const priceStrings = {
            price: data.price,
            savedString: this.context.productYouSave,
          };
          viewModel.$saved.html(this.options.priceSavedTemplate(priceStrings));
        }

        // stock
        if (data.stock) {
          viewModel.stock.$selector.removeClass('product-details-hidden');
          viewModel.stock.$level.text(data.stock);
        } else {
          viewModel.stock.$level.text('0');
        }

        // update sku if exists
        if (viewModel.$sku.length) {
          viewModel.$sku.html(data.sku);
        }

        // update testBit if exists
        if (viewModel.$testBit.length) {
          viewModel.$testBit.html("-----");
        }

        // update free shipping if exists
        if (viewModel.$freeShip.length) {
          viewModel.$testBit.html("Free Shipping");
        }

        // update weight if exists
        if (data.weight && viewModel.$weight.length) {
          viewModel.$weight.html(data.weight.formatted);
        }

        // handle product variant image if exists
        if (data.image) {
          const productImageUrl = utils.tools.image.getSrc(
            data.image.data,
            this.context.themeImageSizes.zoom
          );
          const zoomImageUrl = utils.tools.image.getSrc(
            data.image.data,
            this.context.themeImageSizes.product
          );

          // to maintain a reference between option images, pull out the
          // filename from the image URL and use it as an ID
          const imageId = data.image.data.replace(/^.*[\\\/]/, '');

          this.callbacks.switchImage(productImageUrl, zoomImageUrl, data.image.alt, imageId);
        }

        // update submit button state
        if (!data.purchasable || !data.instock) {
          if (data.purchasing_message && showMessage) {
            if ($('.modal-quick-shop').length) {
              this.productAlerts.error(data.purchasing_message, true);
            } else {
              setTimeout(() => {
                this.pageAlerts.error(data.purchasing_message, true);
              }, 50);
            }
          }

          viewModel.$addToCart
            .addClass(this.buttonDisabledClass)
            .prop('disabled', true);
        } else {
          viewModel.$addToCart
            .removeClass(this.buttonDisabledClass)
            .prop('disabled', false);
        }
      });
    });
  }

  _updateQuantity(event) {
    const $target = $(event.currentTarget);
    const $quantity = $target.closest('.product-quantity-container').find('.product-quantity');
    const min = parseInt($quantity.prop('min'), 10);
    const max = parseInt($quantity.prop('max'), 10);
    let newQuantity = parseInt($quantity.val(), 10);

    if (isNaN(newQuantity)) {
      newQuantity = min;
    }

    if ($target.hasClass('product-quantity-increment') && (!max || newQuantity < max)) {
      newQuantity++;
    } else if ($target.hasClass('product-quantity-decrement') && newQuantity - 1 > min) {
      newQuantity--;
    }

    $quantity.val(newQuantity);
    utils.hooks.emit('product-option-change', null, $quantity[0]);
  }

  _updateAttributes(data) {
    if (data === undefined) { return; }

    const behavior = data.out_of_stock_behavior;
    const inStockIds = data.in_stock_attributes;
    const outOfStockMessage = ` (${data.out_of_stock_message})`;

    if (behavior !== 'hide_option' && behavior !== 'label_option') {
      return;
    }

    $('[data-product-attribute-value]', this.$el).each((i, attribute) => {
      const $attribute = $(attribute);
      const attrId = parseInt($attribute.data('product-attribute-value'), 10);

      if (inStockIds.indexOf(attrId) !== -1) {
        this._enableAttribute($attribute, behavior, outOfStockMessage);
      } else {
        this._disableAttribute($attribute, behavior, outOfStockMessage);
      }
    });
  }

  _disableAttribute($attribute, behavior, outOfStockMessage) {
    if (this._getAttributeType($attribute) === 'set-select') {
      return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
    }

    if (behavior === 'hide_option') {
      $attribute.hide();
    } else {
      $attribute.addClass('option-unavailable');
    }
  }

  disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.toggleOption(false);
    } else {
      $attribute.attr('disabled', 'disabled');
      $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
    }
  }

  _enableAttribute($attribute, behavior, outOfStockMessage) {
    if (this._getAttributeType($attribute) === 'set-select') {
      return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
    }
    if (behavior === 'hide_option') {
      $attribute.show();
    } else {
      $attribute.removeClass('option-unavailable');
    }
  }

  enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.toggleOption(true);
    } else {
      $attribute.removeAttr('disabled');
      $attribute.html($attribute.html().replace(outOfStockMessage, ''));
    }
  }

  _getAttributeType($attribute) {
    const $parent = $attribute.closest('[data-product-attribute]');
    return $parent ? $parent.data('product-attribute') : null;
  }

  /**
   * Add to cart
   */
  _bindAddToCart(event, form) {
    event.preventDefault();

    // Bail out if browser doesn't support FormData
    if (window.FormData === undefined) {
      return;
    }

    const $button = $(event.currentTarget).find('.add-to-cart');
    const quantity = this.$el.find('input.product-quantity').val();
    const formData = new FormData(form);

    // Update the button state
    this.progressButton.progress($button);

    // Remove old alerts
    this.pageAlerts.clear();
    this.productAlerts.clear();

    // Ajax add item to cart
    utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(formData), (err, response) => {
      // Parse the ajax response so we can pass it to the message.
      response = this._parseResponse(err, response, this.productTitle, quantity);

      if ($('.modal-quick-shop').length) {
        if (response.status === 'success') {
          setTimeout(() => {
            this.pageAlerts.message(response.message, response.status, true);
          }, 50);
        } else {
          this.productAlerts.message(response.message, response.status, true);
        }
      } else {
        // setTimeout(() => {
        //   this.pageAlerts.message(response.message, response.status, true);
        // }, 50);
      }

    
      // Update the mini cart & clear inputs if success
      if (response.status === 'success') {

         // Custom success event to close the quick shop and open the mini cart
        $.event.trigger({
          type: 'cart-item-add-success',
          data: {}
        });

        setTimeout(() => {  
          // Reset the button state
          this.progressButton.complete($button);
        }, 10000);

        setTimeout(() => {
          this.pageAlerts.clear();
        }, 100);

      }

      
      // if fail
      if (response.status === 'error') {
        // Reset the button state
        this.progressButton.complete($button);
      }

    });
  }

  /**
   * Build our error/success messages based on response.
   * @param {object} err - the (potential) returned error object.
   * @param {object} response - the ajax response from the add-to-cart action.
   * @param {string} title - The name of the added product.
   * @param {number} quantity - The added quantity.
   */
  _parseResponse(err, response, title, quantity) {
    let message = '';
    let status = '';

    if (err || response.data.error) {
      status = 'error';

      if (response.data.error) {
        message = response.data.error;
      } else {
        message = this.context.messagesProductGeneral;
      }

    } else {
      status = 'success';
      if (this.$productContainer.hasClass('bag-icon')) {
        message = this.context.messagesProductAddSuccessBag;

        message = message
                   .replace('*product*', `"${title}"`)
                   .replace('*bag_link*', `<a href=${this.context.urlsCart}>${this.context.bagLink}</a>`)
                   .replace('*checkout_link*', `<a href=${this.context.urlsCheckout}>${this.context.checkoutLink}</a>`);
      } else {
        message = this.context.messagesProductAddSuccessCart;

        message = message
                   .replace('*product*', `"${title}"`)
                   .replace('*cart_link*', `<a href=${this.context.urlsCart}>${this.context.cartLink}</a>`)
                   .replace('*checkout_link*', `<a href=${this.context.urlsCheckout}>${this.context.checkoutLink}</a>`);
      }
    }

    return {
      status: status,
      message: message
    }
  }

  /**
   * Show feedback on cart button click.
   * @param {jQuery} $el - empty alert element awaiting our markup.
   * @param {string} message - Our message string, already localized.
   * @param {string} messageType - The type of response, 'success' or 'error'.
   */
  _showMessage($el, message, errorType) {
    const $dismiss = $('<a class="alert-dismiss">&times;</a>');

    // Bind click to dismiss message
    $dismiss.on('click', (event) => {
      event.preventDefault();
      this._clearMessage($el);
    });

    // Update message content
    $el.html(message).append($dismiss);

    // Show alert message
    $el.revealer('show').removeClass('dismissed error success').addClass(errorType);
  }

  /**
   * Hide alert message
   *
   */
  _clearMessage($el) {
    $el
      .revealer('hide')
      .addClass('dismissed')
      .removeClass('error success');
  }

  _checkQuantity(el) {
    const $el = $(el);
    const quantity = parseInt($el.val(), 10);
    const min = parseInt($el.prop('min'))

    if (isNaN(quantity) || quantity < min) {
      $el.val(min);
    }
  }

  /**
   * Ajax add to wishlist
   *
   */
  _bindAddWishlist() {
    $('[data-wishlist]').on('click', (event) => {
      const $button = $(event.currentTarget);
      const addUrl = $button.attr('href');
      const viewUrl = $button.data('wishlist');
      const title = $('[data-product-title]').data('product-title');

      if ($('[data-is-customer]').length) {
        event.preventDefault();

        this.progressButton.progress($button);

        $.ajax({
          type: 'POST',
          url: addUrl,
          success: () => {
            this.cartAddAlert.success(this.context.messagesWishlistAddSuccess.replace('*product*', title).replace('*url*', viewUrl), true);
          },
          error: () => {
            this.cartAddAlert.error(this.context.messagesWishlistAddError.replace('*product*', title), true);
          },
          complete: () => {
            this.progressButton.complete($button);

            $button
              .closest('[data-wishlist-dropdown]')
              .find('[data-wishlist-toggle]')
              .trigger('click');
          },
        });
      }
    });
  }
}
