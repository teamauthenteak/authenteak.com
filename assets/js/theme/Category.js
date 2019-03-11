import PageManager from '../PageManager';
import FacetedSearch from './global/FacetedSearch';
import {initCompare, updateCompare} from './global/initCompare';
import { lazyLoad } from './utils/lazyLoad';
import Loading from 'bc-loading';
import svgIcon from './global/svgIcon';
import fillFacetRatingStars from './global/fillFacetRatingStars';
import toggleFacet from './global/toggleFacet';

export default class Category extends PageManager {
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
        category: {
          shop_by_price: true,
          products: {
            limit: productCount,
          },
        },
      },
      toggleFacet: (event) => toggleFacet(event),
      showMore: 'category/show-more',
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

    // Add teplate option if view mode theme setting is "list"
    if (this.context.listingViewMode === 'list') {
      facetedSearchOptions.template = {
        productListing: 'category/product-listing-list',
        sidebar: 'category/sidebar',
      }
    }

    this.FacetedSearch = new FacetedSearch(facetedSearchOptions);
  }

  _toggleView(event) {
    const $target = $(event.currentTarget);
    const template = $target.data('listing-view') === 'grid' ? 'category/product-listing' : 'category/product-listing-list';
    const options = {
      template: {
        productListing: template
      }
    };

    // re-init faceted search with new template option
    this.FacetedSearch.init(options);

    // toggle button classes
    $target.addClass('active').siblings().removeClass('active');

    // TODO - possibly add this back after testing in live environ
    // if (typeof(Storage) !== 'undefined') {
    //   localStorage.setItem('listingView', $target.data('listing-view'));
    // }
  }
}
