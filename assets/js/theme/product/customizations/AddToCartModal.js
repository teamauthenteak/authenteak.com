import utils from '@bigcommerce/stencil-utils';

export default class AddToCartModal {
  constructor() {
    this.cartChangeRemoteHooks = [
      'cart-item-add-remote',
      'cart-item-update-remote',
      'cart-item-remove-remote',
    ];
    this.lastAddedProduct = false;

    this._bindEvents();
  }

  _bindEvents() {
    // Bind on add-to-cart click
    utils.hooks.on('cart-item-add', (e, form) => {
      this._captureAddedProduct(e, form);
    });

    // remote events: when the proper response is sent
    this.cartChangeRemoteHooks.forEach((hook) => {
      utils.hooks.on(hook, () => {
        this._reconcile();
      });
    });

    // Display cart modal on successful add to cart
    $(document).on('cart-item-add-success', () => {
      // this._reconcile();
    });

    // Close modal cart on click of 'X' or outside modal
    $(document).on('click', '.modal-cart__close, .modal-cart__underlay', (e) => {
      this._hide();
    });
  }

  _captureAddedProduct(e, form) {
    let $form = $(form);
    let formData = $form.serializeArray();
    let item = {options: []};

    for (var i in formData) {
      switch (formData[i].name) {
        
        case 'product_id':
          item[formData[i].name] = formData[i].value;
          break;
        
          case 'qty':
        case 'action':
          break; // Do nothing

        default:
          if (formData[i].name.match(/^attribute\[\d+\]$/)) {
            if (formData[i].value.match(/^\d+$/)) {
              let $input = $form.find(`[name="${formData[i].name}"]:checked`);
              if ($input.length == 1) {
                item.options.push($input.data('label'));
                continue;
              }
              $input = $form.find(`[name="${formData[i].name}"] option:selected`);
              if ($input.length == 1) {
                item.options.push($input.text().trim());
                continue;
              }
            }
            item.options.push(formData[i].value);
          }
          break;
      }
    }

    this.lastAddedProduct = item;

    // wait until we get get a resonse that the cart is updated before we show the modal
    // this is to avoid shwoing incorrect data
    $(window).on("cartDataStored", () => {
      this._update(this._display);
      $('.modal-cart__summary .button-cart').removeClass('button-disabled').off('click.update-cart');
    });
    
  }

  /**
   * Update the cart modal contents
   */
  _update(callback) {
    let self = this;
    let qty = $(document).find('input[name="qty[]"]').val();
    let price = $(document).find('.product-quantity-submit [data-product-price-wrapper="without-tax"] .price-value').text().trim().replace(',', '').replace(/\$(\d+)\.(\d\d)/, "$1$2");
    let unitPrice = price/qty;
    
    if(unitPrice > 0){
      if (unitPrice < 10) {
        unitPrice = `00${unitPrice}`;
      } else if (unitPrice < 100) {
        unitPrice = `0${unitPrice}`;
      }
    }
    
    unitPrice = `$${unitPrice}`.replace(/^(\$\d*)(\d\d)$/, "$1.$2").replace(/(\d)(\d\d\d)\./, "$1,$2.");

    $('.modal-cart .option-value-wrapper').each(function() {
      let value = $(document).find(`input[type="radio"][name="attribute[${$(this).attr('data-option-id')}]"]:checked`).attr('data-parsed-label');
      if (!value) {
        value = $(document).find(`select[name="attribute[${$(this).attr('data-option-id')}]"] option:selected`).text();
      }
      $(this).text(value);
    });

    // if the Request-a-Swatch free item was requested and consequentl atc modal opens to show the item added
    // if we understand that a Request-a-Swatch form was submitted then we need to update the qty and price
    if(window.TEAK.Modules.hasOwnProperty("requestASwatch") || window.TEAK.Modules.requestASwatch.itemAdded){
      qty = window.TEAK.Modules.requestASwatch.qty,
      unitPrice = window.TEAK.Modules.requestASwatch.unitPrice

      // clear out the module data 
      window.TEAK.Modules.requestASwatch = {};
    }

    $('.modal-cart [data-quantity]').text(qty);
    $('.modal-cart [data-price]').text(unitPrice);

    //$('.modal-cart__summary').addClass('is-loading');
    $('.modal-cart__summary .button-cart').addClass('button-disabled').on('click.update-cart', (e) => {
      e.preventDefault();
    });

    // get product data from cart rather than calcualte from the UI
    let pendingCartTotal = window.localStorage.getItem('cartData');
    pendingCartTotal = JSON.parse(pendingCartTotal);
    pendingCartTotal = pendingCartTotal[0].cartAmount;
    
    if (pendingCartTotal > 0){
      if (pendingCartTotal < 10) {
        pendingCartTotal = `00${pendingCartTotal}`;
  
      } else if (pendingCartTotal < 100) {
        pendingCartTotal = `0${pendingCartTotal}`;
      }
    }

    // pendingCartTotal = `$${pendingCartTotal}`.replace(/^(\$\d*)(\d\d)$/, "$1.$2").replace(/(\d)(\d\d\d)\./, "$1,$2.");
    pendingCartTotal = `$${pendingCartTotal}.00`.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

    // let pendingCartQuantity = Number.parseInt($('.modal-cart__count-value').attr('data-quantity')) + Number.parseInt(qty);
    let pendingCartQuantity = Number.parseInt($('.modal-cart__count-value').attr('data-quantity'));

    $('.modal-cart__subtotal-value').text(pendingCartTotal);
    $('.modal-cart__count-value').text(pendingCartQuantity);
    $('.modal-cart__count-unit').text(pendingCartQuantity === 1 ? ' item' : ' items');


    let config = this.getGlobalScriptConfig();

    if (config && config.marketing_content && config.marketing_content.add_to_cart_modal) {
      if (config.marketing_content.add_to_cart_modal.summary) {
        $('.modal-cart__marketing--summary').html(config.marketing_content.add_to_cart_modal.summary);
      }
      if (config.marketing_content.add_to_cart_modal.footer) {
        $('.modal-cart__marketing--footer').html(config.marketing_content.add_to_cart_modal.footer);
      }
    }

    if (callback) {
      callback();
    }
  }



  /**
   * Update the (reconciled) cart modal contents
   */
  _reconcile(callback) {
    $('.modal-cart__summary .button-cart').removeClass('button-disabled').off('click.update-cart');

    // Reconcile cart data
    utils.api.cart.getContent({ template: 'mini-cart/mini-cart-json' }, (err, response) => {
      let cartJson = {};

      try {
        cartJson = JSON.parse(response.trim().split('\n')[0].trim());

        // update our cart model data for other apps and UI
        utils.api.cart.getCart({includeOptions: true}, (err, response) => {
          window.TEAK.Utils.saveCartResponse(response);
        });
        
      } catch (e) {
        cartJson = {};
      }

      // $('.modal-cart__subtotal-value').text(cartJson.grand_total.formatted).attr('data-value', cartJson.grand_total.value);
      $('.modal-cart__count-value').text(cartJson.quantity).attr('data-quantity', cartJson.quantity);
      $('.modal-cart__count-unit').text(cartJson.quantity === 1 ? ' item' : ' items');
      //$('.modal-cart__summary').removeClass('is-loading');

      // Additional Checkout Buttons
      if (cartJson.additional_checkout_buttons.length == 1) {
        let $additionalCheckoutWrapper = $('.modal-cart__additional-checkout-buttons');
        $additionalCheckoutWrapper.html('');

        for (var i in cartJson.additional_checkout_buttons) {
          $additionalCheckoutWrapper.append(
            $('<span></span>').html(cartJson.additional_checkout_buttons[i])
          );
        }
      }

      if (callback) {
        callback();
      }

      
    });
  }

  _display() {
    $('.modal-cart').addClass('is-open');
    $.event.trigger({
      type: 'modal-cart-display',
      data: {}
    });
  }

  _hide() {
    $('.modal-cart').removeClass('is-open');
  }

  getGlobalScriptConfig() {
    let config = {};
    let $configTag = $('script[data-theme-config="global"]');
    if ($configTag.length === 1) {
      try {
        config = JSON.parse($configTag.text());
      } catch (e) {
        config = {};
      }
    } else if (location.port >= 3000) {

      config = {
        "marketing_content": {
          "add_to_cart_modal": {
            "summary": "This is <b>custom</b> marketing content.",
            "footer": "This is space for more marketing content <i>with HTML</i>."
          }
        }
      };

    }
    return config;
  }
}
