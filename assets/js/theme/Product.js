import PageManager from '../PageManager';
import Alert from './components/Alert';
import ProductUtils from './product/ProductUtils';
import ProductImages from './product/ProductImages';
import ProductReviews from './product/ProductReviews';
import ColorSwatch from './product/ColorSwatch';
import productViewTemplates from './product/productViewTemplates';
import variationImgPreview from './product/variationImgPreview';
import Tabs from 'bc-tabs';
import fitVids from 'fitvids';
import ScrollLink from 'bc-scroll-link';

import ProductOptions from './product/customizations/ProductOptions';
import AddToCartModal from './product/customizations/AddToCartModal';
import PrintMode from './product/customizations/PrintMode';

export default class Product extends PageManager {
  constructor() {
    super();

    this.el = '[data-product-container]';
    this.$el = $(this.el);
    this.productImgs = '.product-slides-wrap';

    this.fitVidsInitialized = false;

    new Alert($('[data-alerts]'));

    new ScrollLink({
      selector: '.accordion-title a',
      offset: -117
    });

    new ScrollLink({
      selector: '.reviews-jumplink'
    });
  }

  loaded(next) {
    // Product Utils
    this.ProductUtils = new ProductUtils(this.el, {
      priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
      priceWithTaxTemplate: productViewTemplates.priceWithTax,
      priceSavedTemplate: productViewTemplates.priceSaved,
      variationPreviewImageTemplate: productViewTemplates.variationPreviewImage,
      callbacks: {
        switchImage: variationImgPreview
      }
    }).init(this.context);

    // Product Images
    new ProductImages(this.productImgs);

    // Product Swatches
    this.swatches = new ColorSwatch(); // Init our color swatches

    // Reviews
    new ProductReviews(this.context);

    // Custom Options
    new ProductOptions();
    // Custom Cart Modal
    new AddToCartModal();
    // Print Mode (Tear Sheet)
    new PrintMode();

    // Product UI
    this._bindEvents();
    this._initTabs();
    this._initSlick();

    next();
  }

  _bindEvents() {
    // Activate the reviews tab when we jump down to it
    $('.product-reviews-link').on('click', () => {
      this.tabs.displayTabContent('#product-reviews');
      $('.accordion-title').removeClass('is-open');
      $('[href="#product-reviews"]').parent('.accordion-title').addClass('is-open');
    });

    // Show all the reviews
    $('.reviews-show-more-link').on('click', (event) => {
      event.preventDefault();

      $('.review-item.hidden').each((index, el) => {
        setTimeout(() => {
          $(el).revealer('show');
        }, index * 250);
      });

      $(event.currentTarget).hide();
    });

    $('.accordion-title').on('click', (event) => {
      event.preventDefault();
      this._accordionTabToggle(event);
    });
  }

  _initTabs() {
    this.tabs = new Tabs({
      afterSetup: (tabId) => {
        this._initVids(tabId);
        $('.tab-content-panel.active').prev('.accordion-title').addClass('is-open');
      },
      afterChange: (tabId) => {
        this._initVids(tabId);
      }
    });
  }

  // Add accordion style buttons to toggle tab panels
  _accordionTabToggle(event) {
    const tab = $(event.currentTarget).find('a').attr('href');
    $(event.currentTarget).addClass('is-open').siblings('.accordion-title').removeClass('is-open');
    this.tabs.displayTabContent(tab);
  }

  // if page loads with tabs hidden, we need to wait until the proper tab is clicked before running fitVids.
  _initVids(tabId) {
    if (tabId == '#product-videos' && !this.fitVidsInitialized) {
      fitVids('.product-videos-list');
      this.fitVidsInitialized = true;
    }
  }

  _initSlick() {

    // Related Product carousels
    $('.product-carousel').slick({
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplaySpeed: 4000,
        appendDots: ".product-carousel",
        dots: true,
        speed: 800,
        prevArrow: '<span class="carousel-navigation-item previous"><svg class="icon icon-arrow-left"><use xlink:href="#icon-arrow-left" /></svg></span>',
        nextArrow: '<span class="carousel-navigation-item next"><svg class="icon icon-arrow-right"><use xlink:href="#icon-arrow-right" /></svg></span>',
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              autoplay: false
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
              autoplay: true
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              autoplay: true
            }
          }
        ]
    });
  }
}
