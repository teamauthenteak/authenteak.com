/**
 *  Attach functionality to Color Swatches
 *
 * Example: new ColorSwatch('.color-swatch-item')
 *          (defaults to [data-swatch-selector])
 */
export default class ColorSwatch {
  constructor(el = `[data-swatch-selector]`) {
    this.$el = $(el);

    //this.bindSwatchEvent();
  }

  // Update Swatch text when color is selected
  bindSwatchEvent() {

    this.$el.on('click', 'label', (e) => {
      const $target = $(e.currentTarget);
      const $swatchText = $target.closest('[data-swatch-selector]').find('.swatch-value');
      const $swatchValue = $target.data('swatch-value');

      $swatchText.text($swatchValue.slice(0, $swatchValue.indexOf('-')));
    });
  }

}


