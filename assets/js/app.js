import 'babel-polyfill';

// Load jQuery globally, and plugins
import './theme/global/jquery';
import 'jquery-trend';
import 'jquery-revealer';
import 'validetta';
import './simplebar/simplebar';
import './DoubleTapToGo/jquery.doubletaptogo';

import stencilUtils from '@bigcommerce/stencil-utils';
import async from 'async';
import account from './theme/core/Account';
import auth from './theme/Auth';
import blog from './theme/Blog';
import brand from './theme/Brand';
import brands from './theme/Brands';
import cart from './theme/Cart';
import Category from './theme/Category';
import compare from './theme/Compare';
import contactUs from './theme/ContactUs';
import errors from './theme/Errors';
import errors404 from './theme/404-error';
import giftCertificate from './theme/core/GiftCertificate';
import global from './theme/Global';
import home from './theme/Home';
import orderComplete from './theme/OrderComplete';
import page from './theme/Page';
import product from './theme/Product';
import AmpProduct from './theme/AmpProduct';
import search from './theme/Search';
import sitemap from './theme/Sitemap';
import subscribe from './theme/Subscribe';
import wishlist from './theme/Wishlist';

let PageClasses = {
  mapping: {
    'pages/account/orders/all': account,
    'pages/account/orders/details': account,
    'pages/account/addresses': account,
    'pages/account/add-address': account,
    'pages/account/add-return': account,
    'pages/account/add-wishlist': wishlist,
    'pages/account/recent-items': account,
    'pages/account/download-item': account,
    'pages/account/edit': account,
    'pages/account/inbox': account,
    'pages/account/return-saved': account,
    'pages/account/returns': account,
    'pages/auth/login': auth,
    'pages/auth/account-created': auth,
    'pages/auth/create-account': auth,
    'pages/auth/new-password': auth,
    'pages/auth/forgot-password': auth,
    'pages/blog': blog,
    'pages/blog-post': blog,
    'pages/brand': brand,
    'pages/brands': brand,
    'pages/cart': cart,
    'pages/category': Category,
    'pages/compare': compare,
    'pages/contact-us': contactUs,
    'pages/errors': errors,
    'pages/errors/404': errors404,
    'pages/gift-certificate/purchase': giftCertificate,
    'pages/gift-certificate/balance': giftCertificate,
    'pages/gift-certificate/redeem': giftCertificate,
    'global': global,
    'pages/home': home,
    'pages/order-complete': orderComplete,
    'pages/page': page,
    'pages/product': product,
    'pages/search': search,
    'pages/sitemap': sitemap,
    'pages/subscribed': subscribe,
    'pages/account/wishlist-details': wishlist,
    'pages/account/wishlists': wishlist,
    'pages/amp/product-options': AmpProduct
  },
  /**
   * Getter method to ensure a good page type is accessed.
   * @param page
   * @returns {*}
   */
  get: function(page) {
    if (this.mapping[page]) {
      return this.mapping[page];
    }
    return false;
  }
};

/**
 *
 * @param {Object} pageObj
 */
function series(pageObj) {
  async.series([
    pageObj.before.bind(pageObj), // Executed first after constructor()
    pageObj.loaded.bind(pageObj), // Main module logic
    pageObj.after.bind(pageObj) // Clean up method that can be overridden for cleanup.
  ], function(err) {
    if (err) {
      throw new Error(err);
    }
  });
}

/**
 * Loads the global module that gets executed on every page load.
 * Code that you want to run on every page goes in the global module.
 * @param {object} pages
 * @returns {*}
 */
function loadGlobal(pages) {
  let Global = pages.get('global');

  return new Global;
}

/**
 *
 * @param {function} pageFunc
 * @param {} pages
 */
function loader(pageFunc, pages) {
  if (pages.get('global')) {
    let globalPageManager = loadGlobal(pages);
    globalPageManager.context = pageFunc.context;

    series(globalPageManager);
  }
  series(pageFunc);
}

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param templateFile String
 * @param context
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(templateFile, context) {
  let pages = PageClasses;

  context = context || '{}';
  context = JSON.parse(context);

  return {
    load() {
      $(() => {
        let PageTypeFn = pages.get(templateFile); // Finds the appropriate module from the pageType object and store the result as a function.

        if (PageTypeFn) {
          let pageType = new PageTypeFn();

          pageType.context = context;

          return loader(pageType, pages);
        }

        throw new Error(templateFile + ' Module not found');
      });
    }
  };
};
