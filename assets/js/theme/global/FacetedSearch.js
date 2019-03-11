import { hooks, api } from '@bigcommerce/stencil-utils';
import Url from 'url';
import Loading from 'bc-loading';
import 'history.js/scripts/bundled-uncompressed/html4+html5/jquery.history';
import svgIcon from './svgIcon';

export default class FacetedSearch {
  constructor(options, callback) {
    this.callback = callback;
    this.$body = $(document.body);

    this.options = $.extend({
      config: {
        category: {
          shop_by_price: true
        }
      },
      template: {
        productListing: 'category/product-listing',
        sidebar: 'category/sidebar'
      },
      scope: {
        productListing: '[data-category]',
        sidebar: '[data-category-sidebar]',
      },
      facetToggle: '[data-facet-toggle]',
      moreToggle: '[data-facet-more]',
      moreFacets: '[data-show-more-facets]',
      toggleFacet: () => console.log('Facet toggled.'),
    }, options);

    this.loadingOptions = {
      loadingMarkup: `<div class="loading-overlay">${svgIcon('spinner')}</div>`,
    };

    this.facetedSearchOverlay = new Loading(this.loadingOptions, false, '.listing-sidebar');

    this.callbacks = $.extend({
      willUpdate: () => this.facetedSearchOverlay.show(),
      didUpdate: () => this.facetedSearchOverlay.hide(),
    }, options.callbacks);

    this._bindEvents();
    this._sanitizeFacets();
  }

  init(options) {
    this.options.template = $.extend({
      productListing: this.options.template.productListing,
      sidebar: this.options.template.sidebar,
    }, options.template);

    this._onStateChange();
  }

  _bindEvents() {
    this.$body.on('click', this.options.facetToggle, (event) => {
      this._toggleFacet(event);
    });

    this.$body.on('click', this.options.moreToggle, (event) => {
      this._showAdditionalFilters(event);
    });

    this.$body.on('click', this.options.moreFacets, (event) => {
      this._showMoreFacets(event);
    });

    $(window).on('statechange', this._onStateChange.bind(this));
    hooks.on('facetedSearch-facet-clicked', this._onFacetClick.bind(this));
    hooks.on('facetedSearch-range-submitted', this._onRangeSubmit.bind(this));
    hooks.on('sortBy-submitted', this._onSortBySubmit.bind(this));
  }

  // clean up user defined facet ids / show more links for special characters
  _sanitizeFacets() {
    $('.facet-list-items').each((index, element) => {
      const oldTargetId = $(element).attr('id');
      const newTargetId = oldTargetId.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
      $(element).attr('id', newTargetId);
    });

    $('.facet-toggle-more').each((index, element) => {
      const oldHref = $(element).attr('href');
      const newHref = oldHref.toLowerCase().replace(/[^a-z0-9\-#]+/g, '-');
      $(element).attr('href', newHref);
    })
  }

  _showMoreFacets(event) {
    // Show/hide extra facets based on settings for product filtering
    event.preventDefault();
    this.callbacks.willUpdate();

    const $toggle = $(event.currentTarget);
    const $navList = $($toggle.attr('href'));
    const facet = $navList.data('facet');
    const facetUrl = History.getState().url;

    if ($toggle.siblings('.faceted-search-option-columns').length == 0) {
      if (this.options.showMore) {
        api.getPage(facetUrl, {
          template: this.options.showMore,
          params: {
            list_all: facet,
          },
        }, (err, response) => {
          if (err) {
            throw new Error(err);
          }
          $(response).insertAfter($navList);
          $toggle.siblings('.faceted-search-option-columns').addClass('visible');
          this.callbacks.didUpdate();
        });
      }
    } else {
      $toggle.siblings('.faceted-search-option-columns').toggle();
      this.callbacks.didUpdate();
    }

    $navList.toggle();

    // toggle more/less link
    $toggle.children().toggle();

    return false;
  }

  _showAdditionalFilters(event) {
    event.preventDefault();

    $(event.currentTarget)
      .addClass('hidden')
      .parent('li')
      .siblings('li')
      .removeClass('hidden');
  }

  _toggleFacet(event) {
    this.options.toggleFacet(event);
  }

  _onFacetClick(event) {
    event.preventDefault();

    const $target = $(event.currentTarget);
    const url = $target.attr('href');

    this._goToUrl(url);
  }

  _onRangeSubmit(event) {
    event.preventDefault();

    const url = Url.parse(window.location.href);
    let queryParams = $(event.currentTarget).serialize();

    if (this.$body.hasClass('search')) {
      const currentSearch = `search_query=${$('[data-faceted-search]').data('search-query')}` || '';
      queryParams = `${currentSearch}&${queryParams}`;
    }

    this._goToUrl(Url.format({ pathname: url.pathname, search: '?' + queryParams }));
  }

  _onSortBySubmit(event) {
    event.preventDefault();

    const url = Url.parse(location.href, true);
    const queryParams = $(event.currentTarget).serialize().split('=');

    url.query[queryParams[0]] = queryParams[1];
    delete url.query['page'];

    this._goToUrl(Url.format({ pathname: url.pathname, query: url.query }));
  }

  _onStateChange(event) {
    this.callbacks.willUpdate();

    api.getPage(History.getState().url, this.options, (err, content) => {
      if (err) {
        throw new Error(err);
        this.callbacks.didUpdate();
        return;
      }

      if (content) {
        $(this.options.scope.productListing).html(content.productListing);
        $(this.options.scope.sidebar).html(content.sidebar);
        this.callbacks.didUpdate();
        this._sanitizeFacets();
      }
    });
  }

  _goToUrl(url) {
    History.pushState({}, document.title, url);
  }
}
