import imagesLoaded from 'imagesloaded';
import utils from '@bigcommerce/stencil-utils';

import ProductUtils from './ProductUtils';
import ProductImages from './ProductImages';
import productViewTemplates from './productViewTemplates';
import variationImgPreview from './variationImgPreview';
import ColorSwatch from '../product/ColorSwatch';
import Modal from 'bc-modal';

export default class QuickShop {
  constructor(context) {
    this.context = context;
    this.product;
    this.id = null;

    this.el = '[data-product-container]';
    this.$el = $(this.el);

    // Set up the modal options
    this.QuickShopModal = new Modal({
      modalClass: 'modal-quick-shop',
      centerVertically: false,
      afterShow: ($modal) => {
        this._fetchProduct($modal, this.id);
      },
      afterHide: () => {
        this.product.destroy();
      },
    });

    this._bindEvents();
  }

  /**
   * Launch quickshop modal on click and set up id variable
   */
  _bindEvents() {
    $('body').on('click', '[data-quick-shop]', (event) => {
      event.preventDefault();

      this.id = $(event.currentTarget).data('product-id');

      if (!this.id) { return; }

      this.QuickShopModal.open();

      $('.modal-content').prepend('<svg class="icon icon-spinner"><use xlink:href="#icon-spinner" /></svg>');
    });

    // Hide quickshop on successful add
    $(document).on('cart-item-add-success', () => {
      if ($('.modal').length) {
        this.QuickShopModal.close();
      }
    });
  }

  /**
   * Run ajax fetch of product and add to modal. Bind product functionality and show the modal
   * @param {jQuery} $modal - the root (appended) modal element.
   * @param {integer} id - product id
   */
  _fetchProduct($modal, id) {
    utils.api.product.getById(id, { template: 'quick-shop/quick-shop-modal' }, (err, response) => {
      $modal.find('.modal-content').append(response);

      // Init FB like if necessary
      if ($modal.find('.facebook-like').length) {
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      }

      // set up product utils (adding to cart, options)
      this.product = new ProductUtils(this.el, {
        priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
        priceWithTaxTemplate: productViewTemplates.priceWithTax,
        priceSavedTemplate: productViewTemplates.priceSaved,
        variationPreviewImageTemplate: productViewTemplates.variationPreviewImage,
        callbacks: {
          switchImage: variationImgPreview
        }
      })

      this.product.init(this.context);

      // set up simple image slideshow
      new ProductImages('.modal-quick-shop .product-slides-wrap');

      this.swatches = new ColorSwatch(); // Init our color swatches

      // reposition modal with content
      this.QuickShopModal.position();

      $modal.addClass('loaded');

      $('.modal-content').children('.icon-spinner').remove();
    });
  }
}
