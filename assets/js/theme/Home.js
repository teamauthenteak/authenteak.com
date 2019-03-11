import PageManager from '../PageManager';
import { lazyLoad } from './utils/lazyLoad';
import ProductUtils from './product/ProductUtils';
import Tabs from 'bc-tabs';
import slick from 'slick-carousel';
import imagesLoaded from 'imagesloaded';

export default class Home extends PageManager {
  constructor() {
    super();
  }

  loaded(next) {
    this._initSlick();

    this._initTabs();

    lazyLoad.revalidate();

    next();
  }

  _initTabs() {
    this.tabs = new Tabs({
      afterSetup: () => {
        $('.product-carousel').slick('setPosition');
      },
      afterChange: () => {
        $('.product-carousel').slick('setPosition');
        lazyLoad.revalidate();
      }
    });
  }

  _initSlick() {
    // Hero carousel
    const $carousel = $('.carousel');
    const isNaturalAspectRatio = $carousel.hasClass('ratio-natural');
    const speed = $carousel.data('swap-frequency');

    $carousel
      .on('init', (event, slick) => {
        $('.slick-active .carousel-item-info:has(*)').addClass('show');
        // Fix misalignment because no scrollbar on load
        $(window).trigger('resize');
      })
      .slick({
        dots: true,
        fade: true,
        autoplay: true,
        autoplaySpeed: speed,
        lazyLoad: 'progressive',
        adaptiveHeight: true,
        prevArrow: '<span class="carousel-navigation-item previous"><svg class="icon icon-arrow-left"><use xlink:href="#icon-arrow-left" /></svg></span>',
        nextArrow: '<span class="carousel-navigation-item next"><svg class="icon icon-arrow-right"><use xlink:href="#icon-arrow-right" /></svg></span>'
      })
      .on('beforeChange', (event, slick, currentSlide, nextSlide) => {
        $('.slick-active .carousel-item-info:has(*)').removeClass('show');
      }).on('afterChange', (event, slick, currentSlide) => {
        $('.slick-active .carousel-item-info:has(*)').addClass('show');
      });

    // Product carousels
    $('.product-carousel').slick({
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplaySpeed: 4000,
        lazyLoad: 'progressive',
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
            settings: 'unslick'
          }
        ]
    });

  }
}
