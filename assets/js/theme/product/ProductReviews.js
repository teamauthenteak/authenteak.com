export default class ProductReviews {
  constructor(context) {
    this.context = context;

    this._bindRating();
  }

  _bindRating() {
    $('#rating-stars').on('change', (event) => {
      const rating = $(event.currentTarget).val();
      const ratingLabel = $(event.currentTarget).find('option:selected').text();

      $('.review-form')
        .find('.icon-star-wrap')
        .removeClass('full')
        .each((index, el) => {
          if ((index + 1) <= rating) {
            $(el).addClass('full');
          }
      });

      $('.review-form')
        .find('.rating-stars-label')
        .html(ratingLabel);
    });
  }
}
