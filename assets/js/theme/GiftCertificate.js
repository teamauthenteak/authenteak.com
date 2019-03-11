import PageManager from '../PageManager';
import FormValidator from './utils/FormValidator';

export default class GiftCertificate extends PageManager {
  constructor() {
    super();
    this.$purchaseForm = $('[data-giftcard-purchase-form]');
    this.validatorOptions = {
      onValid: (event) => {
        this._handlePreview(event);
      },
    };
  }

  loaded() {
    if (this.$purchaseForm.length) {
      this.Validator = new FormValidator(this.context);
      this.Validator.initSingle(this.$purchaseForm, this.validatorOptions);
    }
  }

  /* If the form is valid and the 'preview theme' button was clicked,
   * cancel the submit and fetch/open the preview url instead
   *
   * @param {object} event - form submit event
   */
  _handlePreview(event) {
    const $buttonClicked = $(document.activeElement);
    if ($buttonClicked.data('preview-url')) {
      event.preventDefault();
      const previewUrl = `${$buttonClicked.data('preview-url')}&${this.$purchaseForm.serialize()}`;
      window.open(previewUrl);
    }
  }
}
