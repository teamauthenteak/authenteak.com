export default class ImageZoom {
  constructor(el) {
    this.$el = $(el);

    // create empty image
    const defaultImg = new Image();
    // set src so we can access the other attribute data
    defaultImg.src = this.$el.find('img').attr('src');

    this.image = {
      offset: this.$el.offset(),
      width: this.$el.width(),
      height: this.$el.height(),
    }

    // Only init if image is wide/tall enough to zoom
    if ((defaultImg.width / this.image.width) > 1.4 || (defaultImg.height / this.image.height) > 1.4) {
      this._bindEvents();
    } else {
      this.$el.addClass('no-zoom').height(this.$el.parent().height());
    }
  }

  _bindEvents() {
    this.$el.on('mousemove', (event) => {
      this._zoomImage(event);
    });
  }

  _zoomImage(event) {
    const $wrapper = $('.product-slides-wrap').offset()
    const topOffset = $wrapper.top
    const leftOffset = $wrapper.left

    const top = (event.pageY - topOffset) / this.image.height * 100;
    const left = (event.pageX - leftOffset) / this.image.width * 100;

    this.$el.css('background-position', `${left}% ${top}%`)
  }
}


