// Load jQuery globally, and plugins
import './theme/global/jquery';
import 'jquery-trend';
import 'jquery-revealer';
import 'validetta';
import './DoubleTapToGo/jquery.doubletaptogo';

import async from 'async';
import stencilUtils from '@bigcommerce/stencil-utils';
import GlobalNamespace from './theme/utils/TEAK';
import cart from './theme/Cart';
import global from './theme/Global';
import orderComplete from './theme/OrderComplete';


let PageClasses = {
  mapping: {
    'pages/cart': cart,
    'global': global,
    'pages/order-complete': orderComplete
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
