import PageManager from '../PageManager';
import FacetedSearch from './global/FacetedSearch';
import {initCompare, updateCompare} from './global/initCompare';
import { lazyLoad } from './utils/lazyLoad';
import Loading from 'bc-loading';
import svgIcon from './global/svgIcon';
import fillFacetRatingStars from './global/fillFacetRatingStars';
import toggleFacet from './global/toggleFacet';

export default class Brand extends PageManager {
  constructor() {
    super();

    this.$body = $(document.body);

    if ($('[data-product-compare]').length) {
      initCompare();
    }

    this._bindEvents();

    fillFacetRatingStars();
  }

  loaded(next) {
    this._initializeFacetedSearch(this.context.listingProductCount);

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

  _initializeFacetedSearch(productCount) {
    const loadingOptions = {
      loadingMarkup: `<div class="loading-overlay">${svgIcon('spinner')}</div>`,
    };

    const facetedSearchOverlay = new Loading(loadingOptions, false, '.product-listing');

    const facetedSearchOptions = {
      config: {
        brand: {
          shop_by_price: true,
          products: {
            limit: productCount,
          },
        },
      },
      template: {
        productListing: 'brand/product-listing',
        sidebar: 'brand/sidebar'
      },
      scope: {
        productListing: '[data-brand]',
        sidebar: '[data-brand-sidebar]',
      },
      showMore: 'brand/show-more',
      toggleFacet: (event) => toggleFacet(event),
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
        productListing: 'brand/product-listing-list',
        sidebar: 'brand/sidebar',
      }
    }

    this.FacetedSearch = new FacetedSearch(facetedSearchOptions);
  }

  _toggleView(event) {
    const $target = $(event.currentTarget);
    const template = $target.data('listing-view') === 'grid' ? 'brand/product-listing' : 'brand/product-listing-list';
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
