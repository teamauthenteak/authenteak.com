import PageManager from '../PageManager';
import ScrollLink from 'bc-scroll-link';
import FormValidator from './utils/FormValidator';
import Dropdown from './global/Dropdown';
import Header from './global/Header';
import './global/Footer';
// import MiniCart from './global/MiniCart';
import QuickShop from './product/QuickShop';
import wishlistDropdown from './product/wishlistDropdown';
// import MegaNav from './global/MegaNav';
// import MobileNav from './global/MobileNav';
// import MobileSearchToggle from './global/MobileSearchToggle';
import Footer from './global/Footer';
import './core/selectOption';

import GlobalCustomizations from './global/customizations/GlobalCustomizations';

export default class Global extends PageManager {
    constructor() {
      super();

      new Dropdown($('.dropdown'));
      new Header($('.site-header'));
      new ScrollLink({
        selector: '.button-top'
      });
      // new MegaNav($('.mega-nav-variant-container'));
      // new MobileNav();
      // new MiniCart();
      new wishlistDropdown();
      
      // new MobileSearchToggle($('header'));
      new Footer($('footer'));

      new GlobalCustomizations();

      this._toggleScrollLink();
      this._initAnchors();
    }

    /**
     * You can wrap the execution in this method with an asynchronous function map using the async library
     * if your global modules need async callback handling.
     * @param next
     */
    loaded(next) {
      // global form validation
      this.validator = new FormValidator(this.context);
      this.validator.initGlobal();

      // QuickShop
      if ($('[data-quick-shop]').length) {
        new QuickShop(this.context);
      }

      next();
    }

    _initAnchors() {
      const anchorSelector = '.cms-page [href^="#"]';

      $(anchorSelector).each((index, element) => {
        const targetId = $(element).attr('href');
        const target = targetId.substring(1);

        $(element).attr('data-scroll', targetId);
        $(`[name='${target}']`).attr('id', target);
      });

      new ScrollLink({
        selector: anchorSelector,
        offset: -150,
      });
    }

    _toggleScrollLink() {
      $(window).on('scroll', (e) => {
        const winScrollTop = $(e.currentTarget).scrollTop();
        const winHeight = $(window).height();

        if (winScrollTop > winHeight) {
          $('.button-top').addClass('show');
        } else {
          $('.button-top').removeClass('show');
        }
      });
    }
}

