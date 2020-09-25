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
    lazyLoad.revalidate();

    next();
  }

  _initSlick() {
    // Hero carousel
    const $carousel = $('#homeHero').find(".landing__heroCarousel");
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

  }
}
