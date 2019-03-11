import PageManager from '../PageManager';
import FacetedSearch from './global/FacetedSearch';
import {initCompare, updateCompare} from './global/initCompare';
import { lazyLoad } from './utils/lazyLoad';
import Loading from 'bc-loading';
import Tabs from 'bc-tabs';
import svgIcon from './global/svgIcon';
import fillFacetRatingStars from './global/fillFacetRatingStars';
import toggleFacet from './global/toggleFacet';

export default class Search extends PageManager {
  constructor() {
    super();

    this.$body = $(document.body);

    if ($('[data-product-compare]').length) {
      initCompare();
    }

    this._bindEvents();
    this._initTabs();

    fillFacetRatingStars();
  }

  loaded(next) {
    this._initializeFacetedSearch(this.context.listingProductCount);
    lazyLoad.revalidate();

    next();
  }

  _bindEvents() {
    this.$body.on('click', '[data-listing-view]', (event) => {
      this._toggleView(event);
    });

    this.$body.on('click', '[data-faceted-search-toggle]', (event) => {
      event.preventDefault();
      $(event.currentTarget).toggleClass('is-open').next().toggleClass('visible');
    });
  }

  _initTabs() {
    this.tabs = new Tabs({
      afterChange: () => {
        lazyLoad.revalidate();
      },
    });

    // Show the content tab if no product results
    if (!$('#product-results .product-block').length || (window.location.search.indexOf('section=content') > -1)) {
      this.tabs.displayTabContent('#content-results');
    }
  }

  _initializeFacetedSearch(productCount) {
    const loadingOptions = {
      loadingMarkup: `<div class="loading-overlay">${svgIcon('spinner')}</div>`,
    };

    const facetedSearchOverlay = new Loading(loadingOptions, false, '.product-listing');

    const facetedSearchOptions = {
      config: {
        product_results: {
          limit: productCount,
        },
      },
      template: {
        productListing: 'search/product-listing',
        sidebar: 'search/sidebar'
      },
      scope: {
        productListing: '[data-search]',
        sidebar: '[data-search-sidebar]',
      },
      toggleFacet: (event) => toggleFacet(event),
      showMore: 'search/show-more',
      callbacks: {
        willUpdate: () => {
          facetedSearchOverlay.show();
        },
        didUpdate: () => {
          facetedSearchOverlay.hide();
          lazyLoad.revalidate();

          if ($('[data-product-compare]').length) {
            updateCompare();
          }

          fillFacetRatingStars();
        },
      }
    };

    // Change teplate option if view mode theme setting is "list"
    if (this.context.listingViewMode === 'list') {
      facetedSearchOptions.template = {
        productListing: 'search/product-listing-list',
        sidebar: 'search/sidebar',
      }
    }

    this.FacetedSearch = new FacetedSearch(facetedSearchOptions);
  }

  _toggleView(event) {
    const $target = $(event.currentTarget);
    const template = $target.data('listing-view') === 'grid' ? 'search/product-listing' : 'search/product-listing-list';
    const options = {
      template: {
        productListing: template
      }
    };

    // re-init faceted search with new template option
    this.FacetedSearch.init(options);

    // toggle button classes
    $target.addClass('active').siblings().removeClass('active');
  }
}
