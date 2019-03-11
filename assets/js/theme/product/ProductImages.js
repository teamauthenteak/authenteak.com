import slick from 'slick-carousel';
import imagesLoaded from 'imagesloaded';
import ImageZoom from './ImageZoom';
import baguetteBox from 'baguettebox.js';

export default class ProductImages {
  constructor(el) {
    this.$el = $(el);
    this.maxSlidesBeforeArrows = 5;

    this.classes = {
      container: '.product-images-container',
      slidesWrap: '.product-slides-wrap',
      pagination: '.product-images-pagination',
      paginationItem: '.pagination-item',
      loader: '.product-images-loader',
    };

    this.$pagination = this.$el
      .closest(this.classes.container)
      .find(this.classes.pagination);

    this._init();
  }

  _init() {
    imagesLoaded(this.$el[0], () => {
      // Hide loader
      this.$el
        .parents(this.classes.container)
        .find(this.classes.loader)
        .addClass('initialized');

      // Image zoom
      this.$el.on('init', () => {
        this.$el.find('[data-product-image]').each((i, el) => {
          new ImageZoom(el);
        });
      });

      // Init carousel
      this.$el.slick({
        infinite: false,
        arrows: false,
        dots: false,
        adaptiveHeight: true,
        asNavFor: this.classes.pagination,
      });

      this.imageCount = this.$pagination
        .find(this.classes.paginationItem)
        .length;

      if (this.imageCount > this.maxSlidesBeforeArrows) {
        this.$pagination.addClass('pagination-has-arrows');
      }

      this.$pagination.on('setPosition', (event, slick) => {
        if (slick.$slides.length > this.maxSlidesBeforeArrows) {
          this.$pagination.addClass('pagination-has-arrows');
        } else {
          this.$pagination.removeClass('pagination-has-arrows');
        }
      });

      this.$pagination
        .slick({
          infinite: false,
          centerMode: false,
          dots: false,
          arrows: true,
          prevArrow: '<div class="product-images-pagination-icon pagination-prev"><svg><use xlink:href="#icon-arrow-left" /></svg></div>',
          nextArrow: '<div class="product-images-pagination-icon pagination-next"><svg><use xlink:href="#icon-arrow-right" /></svg></div>',
          slidesToShow: 5,
          slidesToScroll: 1,
          variableWidth: false,
          rows: 0,
          asNavFor: this.classes.slidesWrap,
          focusOnSelect: true,
        });

      baguetteBox.run(this.classes.slidesWrap, {});
    });
  }
}
