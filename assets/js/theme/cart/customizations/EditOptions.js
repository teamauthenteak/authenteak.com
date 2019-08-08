import utils from '@bigcommerce/stencil-utils';

/**
 *  Attach product option edit functionality to cart
 *
 * Example: new EditOptions()
 */
export default class EditOptions {
  constructor() {
    this.editButtonsSelector = 'button.cart-item-edit[data-cart-item-edit]';
    this.$editButtons = $(this.editButtonsSelector);
    this.editModalSelector = 'aside.modal-cart';
    this.$editModal = $(this.editModalSelector);
    this.swatchesSelector = '[data-swatch-selector]';
    this.dropdownsSelector = '[data-product-attribute="set-select"]';

    this.preloadedContent = {};

    window.TEAK = window.TEAK || {};
    window.TEAK.currentSelections = {};

    // Handle events that require deliberate action (e.g. click)
    this.bindEditFunctionality();
    this.bindSwatchEvents();
    this.bindDropdownEvents();
    // Handle navigation directly into edit
    this.handleLocationEditQueryParam();
  }

  // Bind product edit functionality
  bindEditFunctionality() {
    let self = this;

    this.$editButtons.each(function(i, btn) {
      $.ajax({
        url: $(this).attr('data-href'),
        success: (data) => {
          self.preloadedContent[$(btn).attr('data-edit-id')] = $(data).find('form.add-to-cart-form .product-options-container').html();
        }
      });
    });

    $(document).on('click', this.editButtonsSelector, (e) => {
      e.preventDefault();

      if (typeof self.preloadedContent[$(e.currentTarget).attr('data-edit-id')] === 'undefined') {
        window.setTimeout(() => {
          $(e.target).trigger('click');
        }, 250);
        return;
      }


      let optionsContent = self.preloadedContent[$(e.currentTarget).attr('data-edit-id')];

      window.TEAK.currentSelections = {};
      self.updateDropdownOptionLabels();

      $(e.currentTarget).blur();
      self.$editModal.addClass('is-open');
      history.replaceState({}, document.title, `${location.origin}${location.pathname}?edit=${$(e.currentTarget).attr('data-edit-id')}`);

      let options = [];
      $(e.currentTarget).find('input[data-option-name]').each(function() {
        options.push({name: $(this).attr('data-option-name'), value: $(this).attr('data-option-value')});
      });

      let $editModalOptions = self.$editModal.find('.modal-cart__edit-product');
      $editModalOptions.html(optionsContent);
      $editModalOptions.append($('<input />').attr({
        type:  'hidden',
        name:  'product_id',
        value: $(e.currentTarget).attr('data-product-id')
      })).append($('<input />').attr({
        type:  'hidden',
        name:  'qty[]',
        value: $(e.currentTarget).closest('.cart-item').find('input.quantity-input').val()
      }));
      self.$editModal.find('form').attr('data-delete-id', $(e.currentTarget).attr('data-edit-id'));

      for (var i in options) {
        $editModalOptions.find(`[data-option-title='${options[i].name}'] + div label[data-swatch-value='${options[i].value}'] input`).trigger('click').trigger('mouseover').trigger('mouseout');
        $editModalOptions.find(`[data-option-title='${options[i].name}'] + span select option[data-product-attribute-value]`).each(function() {
          if ($(this).text().trim() === options[i].value) {
            $(this).prop('selected', true);
            $(this).closest('select').trigger('click').trigger('change');
          }
        });
      }

      window.setTimeout(() => {
        $('body').on('mousedown.closeEditModal', (e) => {
          if ($(e.target).closest(self.editModalSelector).length == 0) {
            self.$editModal.removeClass('is-open');
            $('body').off('mousedown.closeEditModal');
          }
        });
      }, 100);
    });

    this.$editModal.on('click', '.modal-cart__close', (e) => {
      self.$editModal.removeClass('is-open');
      history.replaceState({}, document.title, `${location.origin}${location.pathname}`);
      $('body').off('click.closeRASModal');
    });

    this.$editModal.on('click', '.button-cart', (e) => {
      this.$editModal.find('form').trigger('submit');
    });

    $(document).on('modal-cart-display', (e) => {
      self.$editModal.removeClass('is-open');
      history.replaceState({}, document.title, `${location.origin}${location.pathname}`);
      $('body').off('click.closeRASModal');
    });

    this.$editModal.on('submit', 'form', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      utils.api.cart.itemAdd(formData, () => {
        utils.api.cart.itemRemove($(e.target).attr('data-delete-id'), () => {
          history.replaceState({}, document.title, `${location.origin}${location.pathname}`);
          location.reload();
        });
      });
    });
  }

  // Handle swatch hover and click events
  bindSwatchEvents() {
    let self = this;

    this.$editModal.on('mouseover', `${self.swatchesSelector} label`, (e) => {
      window.clearTimeout(this.hoverTimeout); // Clear hover-off timeout to avoid flicker
      let $el = $(e.currentTarget);
      let $optionText = $el.closest(self.swatchesSelector).find('.form-field-title');
      let $swatchText = $el.closest(self.swatchesSelector).find('.swatch-value');
      let currentSelection = window.TEAK.currentSelections[$optionText.data('option-title')] || false;
      let label = self.parseOptionLabel($el.data('swatch-value'));
      // let customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);
      // if (customOptionData) {
      //   label = customOptionData;
      //   // self.showHoverDetail(label);
      // }

      $swatchText.text(self.formatLabelWithRelativePricing(label, currentSelection));

      // $swatchText.text(
      //   (label.grade ? `Grade ${label.grade}: ${label.text}` : label.text)
      //   + (label.priceAdjust ? ` (${label.priceAdjust})` : '')
      // );
    });

    this.$editModal.on('mouseout', `${self.swatchesSelector} label`, (e) => {
      this.hoverTimeout = window.setTimeout(function() {
        let $el = $(e.currentTarget);
        let $swatchText = $el.closest('[data-swatch-selector]').find('.swatch-value');

        $swatchText.text($swatchText.data('swatch-value'));
        // self.hideHoverDetail();
      }, 50);
    });

    this.$editModal.on('click', `${self.swatchesSelector} label`, (e) => {
      let $el = $(e.currentTarget);
      let $optionText = $el.closest('[data-swatch-selector]').find('.form-field-title');
      let $swatchText = $el.closest('[data-swatch-selector]').find('.swatch-value');
      let label = self.parseOptionLabel($el.data('swatch-value'));
      // let customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);
      // if (customOptionData) {
      //   label = customOptionData;
      // }

      if ($el.attr('data-is-selected')) {
        $el.find('input[type="radio"]').prop('checked', false);
        e.preventDefault();

        $el.closest('.form-field-swatch').find('label[data-is-selected]').removeAttr('data-is-selected').trigger('mouseout');
        delete window.TEAK.currentSelections[$optionText.data('option-title')];
        $swatchText.data('swatch-value', '');
        utils.hooks.emit('product-option-change', null, $el.find('input[type="radio"]')[0]);

      } else {
        $el.closest('.form-field-swatch').find('label[data-is-selected]').removeAttr('data-is-selected');
        $el.attr('data-is-selected', true);

        window.TEAK.currentSelections[$optionText.data('option-title')] = label;

        $swatchText.data('swatch-value', label.text + (label.priceAdjust ? ` (${label.priceAdjust})` : ''));
      }

      // self.updateLeadTime();
    });
  }

  // Bind dropdown events
  bindDropdownEvents() {
    let self = this;
    this.$editModal.on('change', `${self.dropdownsSelector} select`, (e) => {
      let $el = $(e.currentTarget);
      let $optionText = $el.closest('[data-product-attribute="set-select"]').find('.form-field-title');
      let $opt = $el.find('option:selected');
      let label = self.parseOptionLabel($opt.text().trim());
      // let customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);
      // if (customOptionData) {
      //   label = customOptionData;
      // }

      window.TEAK.currentSelections[$optionText.data('option-title')] = label;

      // self.updateLeadTime();
      self.updateDropdownOptionLabels();
    });
  }

  // Update and clean-up dropdown option labels
  updateDropdownOptionLabels() {
    let self = this;
    this.$editModal.find(self.dropdownsSelector).each(function() {
      let $el = $(this);
      let $optionText = $el.closest('[data-product-attribute="set-select"]').find('.form-field-title');
      let currentSelection = window.TEAK.currentSelections[$optionText.data('option-title')] || false;
      $el.find('option').each(function() {
        let $opt = $(this);
        if (!$opt.data('originalValue')) {
          $opt.data('originalValue', $opt.text());
        }
        let label = self.parseOptionLabel($opt.text().trim());
        // let customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);
        // if (customOptionData) {
        //   label = customOptionData;
        // }

        if ($opt.val() && $opt.val().length > 0) {
          $opt.text(self.formatLabelWithRelativePricing(label, currentSelection));
        }
      });
    });
  }

  // Parse the option label to extract data
  parseOptionLabel(label) {
    let data = {}, additional = [];
    let parts = label.split('--');
    for (var i in parts) {
      let part = parts[i].trim();
      if (i == 0) {
        let grade = part.match(/Grade ([^ ]+)/i);
        if (grade) { data.grade = grade[1].toUpperCase(); }
        let priceAdjust = part.match(/\((\+\$[\d.]+)\)/);
        if (priceAdjust) { data.priceAdjust = priceAdjust[1]; }
        let priceAdjustNumeric = part.match(/\(([+-])\$([\d.]+)\)/);
        if (priceAdjustNumeric) {
          data.priceAdjustNumeric =
            Math.round(Number.parseFloat(priceAdjustNumeric[1]+priceAdjustNumeric[2])*100)/100;
        }
        data.text = part.replace(/Grade [^ ]+ /ig, '').replace(/\([+-][^ ]+/g, '').trim();
      } else if (part.match(/^LEAD:/)) {
        let match = part.match(/^LEAD:(\d+)([W|D])/);
        data.leadtime_from = {
          value: Number.parseInt(match[1]),
          unit: match[2].match(/^d$/i) ? 'day' : 'week'
        };
        data.leadtime_weeks_from = data.leadtime_from.unit == 'week'
          ? data.leadtime_from.value
          : data.leadtime_from.value / 5;
        match = part.match(/^LEAD:(\d+)([W|D])(?:-(\d+)([W|D])|)$/);
        if (match && match[3]) {
          data.leadtime_to = {
            value: Number.parseInt(match[3]),
            unit: match[4].match(/^d$/i) ? 'day' : 'week'
          };
          data.leadtime_weeks_to = data.leadtime_to.unit == 'week'
            ? data.leadtime_to.value
            : data.leadtime_to.value / 5;
        } else {
          data.leadtime_to = data.leadtime_from;
          data.leadtime_weeks_to = data.leadtime_weeks_from;
        }
      } else {
        additional.push(part);
      }
    }

    if (additional.length > 0) {
      data.additional = additional;
    }
    data.raw = label;

    return data;
  }

  // Format a numeric price as +$1234.56
  formatPriceDiff(price) {
    let priceInCents = (price * 100) + '';
    let priceParsed = priceInCents.match(/^[+-]?(\d+)(\d\d)$/);
    return (price > 0 ? '+' : '-') + '$' + priceParsed[1] + '.' + priceParsed[2];
  }

  // Format label text with relative pricing
  formatLabelWithRelativePricing(option, currentOption) {
    var labelText = option.grade ? `Grade ${option.grade}: ${option.text}` : option.text;

    var priceDiff = option.priceAdjustNumeric || 0;
    if (currentOption && typeof currentOption.priceAdjustNumeric !== 'undefined') {
      priceDiff = priceDiff - currentOption.priceAdjustNumeric;
    }
    if (priceDiff !== 0) {
      labelText += ' (' + this.formatPriceDiff(priceDiff) + ')';
    }

    return labelText;
  }

  // Handle navigation directly into edit via query param
  handleLocationEditQueryParam() {
    let match = location.search.match(/\s?edit=(.+)/);
    if (match) {
      this.$editButtons.filter(`[data-edit-id="${match[1]}"]`).trigger('click');
    }
  }
}
