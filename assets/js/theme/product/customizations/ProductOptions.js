import utils from '@bigcommerce/stencil-utils';

/**
 *  Attach functionality to PDP Swatches and Options
 *
 * Example: new ProductOptions()
 */
export default class ProductOptions {
  constructor() {
    this.$optionsJSON = $('[data-json="raw-options"]');
    this.$warrantyJSON = $('[data-json="warranty"]')
    this.$swatches = $('[data-swatch-selector]');
    this.$dropdowns = $('[data-product-attribute="set-select"]');
    this.$raqButtons = $('button.form-field-swatch__request-button');
    this.raqModalSelector = '#swatchpopuplist';
    this.$raqModal = $(this.raqModalSelector);
    this.$raqSwatches = this.$raqModal.find('.swatchinnerpopup ul');
    this.$raqSelections = this.$raqModal.find('.previewswatch ul');

    this.hoverDetailBlockClass = 'product-swatch-hover-detail';
    this.$hoverDetail = $(`.${this.hoverDetailBlockClass}`);

    this.largeImagePath = '/content/swatch/import6/';
    this.largeImageCDNPath = '//authenteak.s3.amazonaws.com/images/';

    this.swatchImageResults = {};

    // Build custom data needed for other features
    this.buildCustomDataObject();
    // Handle events that include on-hover
    this.bindSwatchEvents();
    // Handle events that require deliberate action (e.g. click)
    this.updateDropdownOptionLabels();
    this.bindDropdownEvents();
    this.bindRequestASwatchFeature();
    this.bindSwatchLabelData();
    // Handle functionality that occurs in background
    this.preloadImages();

    window.TEAK.Modules.requestASwatch = {};
  }

  // Build Product Custom Data Object ()
  buildCustomDataObject() {
    window.TEAK.currentSelections = {};
    window.TEAK.lastHiResSwatch = '';

    // Attempt to parse warranty field as JSON object (fallback to string)
    let warranty;

    try {
      warranty = JSON.parse(this.$warrantyJSON.text());
    } catch (e) {
      warranty = this.$warrantyJSON.text();
    }

    if (typeof warranty === "object") {
      // If warranty is object, assume PIP is in place and respect data structure
      window.TEAK.productCustomData = warranty;
    } else {
      // Assemble custom object from warranty and option JSON
      let customData = {
        warranty: warranty,
        options: {}
      };

      let rawOptions = JSON.parse(this.$optionsJSON.text());
      for (var i in rawOptions) {
        let raw = rawOptions[i];
        let optionData = {
          name: raw.display_name,
          values: {}
        };

        for (var j in raw.values) {
          let rawVal = raw.values[j];
          let value = this.parseOptionLabel(rawVal.label);
          value.label = value.text;
          if (rawVal.image) { value.swatch = this.getSwatchImages(rawVal.image.data); }
          optionData.values[value.label] = value;
        }

        customData.options[optionData.name] = optionData;
      }
      window.TEAK.productCustomData = customData;
    }
  }

  // Handle swatch hover and click events
  bindSwatchEvents() {
    let self = this;


    // on hover & touchend - show swatch color in main view
    function showSwatchColor(e){
      window.clearTimeout(self.hoverTimeout);

      let $el = $(e.currentTarget),
          $optionText = $el.closest('[data-swatch-selector]').find('.form-field-title-cntr'),
          $swatchText = $el.closest('[data-swatch-selector]').find('.swatch-value'),
          currentSelection = window.TEAK.currentSelections[$optionText.data('option-title')] || false,
          label = self.parseOptionLabel($el.data('swatch-value')),
          customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);

      
      if (customOptionData) {
        label = customOptionData;
        self.showHoverDetail(label);
      }

      $swatchText.text(self.formatLabelWithRelativePricing(label, currentSelection));
    }



    // on over off - hide the swatch color in the main view
    function hideSwatchColor(e){
      self.hoverTimeout = window.setTimeout(function() {
        let $el = $(e.currentTarget),
            $swatchText = $el.closest('[data-swatch-selector]').find('.swatch-value');

        $swatchText.text($swatchText.data('swatch-value'));
        self.hideHoverDetail();

      }, 50);
    }


    
    // on click of the selected watch - then on a consequantal hoveroff, reshow the initally selected swatch
    function showSelectedSwatchColor(e){  
      let $el = $(e.currentTarget),
          label = self.parseOptionLabel($el.data('swatch-value'));
          
      showSwatchColor({
        currentTarget: self.currentlySelectedSwatch,
        type: e.type
      });

      self.showHoverDetail(label);
    }



    // on click - choose the swatch color selected
    function selectSwatchColor(e){
      let $el = $(e.currentTarget),
          $optionText = $el.closest('[data-swatch-selector]').find('.form-field-title-cntr'),
          $swatchText = $el.closest('[data-swatch-selector]').find('.swatch-value'),
          label = self.parseOptionLabel($el.data('swatch-value')),
          customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);

      $el.parents(".form-field-control").find("input:checked").prop("checked", false).attr("checked", false);

      // save the raw selection so we can use it later in other evenets
      self.currentlySelectedSwatch = e.currentTarget;

      if (customOptionData) {
        label = customOptionData;

        for (let i in label.swatch) {
          if (self.swatchImageResults[label.swatch[i]]) {
            window.TEAK.lastHiResSwatch = label.swatch[i];
          }
        }
      }


      // if you uncheck the swatch
      if ($el.attr('data-is-selected') && $el.find("input:radio").is(":checked")) {

        console.trace()
        console.log($el.data())

        $el.find('input:radio').prop('checked', false).attr('checked', false);
        
        e.preventDefault();

        delete window.TEAK.currentSelections[$optionText.data('option-title')];
        
        $swatchText.data('swatch-value', '');
        utils.hooks.emit('product-option-change', null, $el.find('input[type="radio"]')[0]);

        self.$swatches
          .off('mouseout')
          .on('mouseout', 'label', () => {
            hideSwatchColor({
              currentTarget: self.currentlySelectedSwatch
            });
          });

        if( window.TEAK.Utils.isHandheld ){
          hideSwatchColor({
            currentTarget: self.currentlySelectedSwatch
          });
        }

        $el.closest('.form-field-swatch').find('label[data-is-selected]').removeAttr('data-is-selected');

      } else {

        // console.trace()
        // console.log($el.data())

        // $el.closest('.form-field-swatch').find('label[data-is-selected]').removeAttr('data-is-selected');
        $el.attr('data-is-selected', true);
        $el.find('input:radio').prop('checked', true).attr('checked', true);

 
        window.TEAK.currentSelections[$optionText.data('option-title')] = label;

        $swatchText.data('swatch-value', label.text + (label.priceAdjust ? ` (${label.priceAdjust})` : ''));

        // prevent the swatch from switching back from the selected/clicked
        window.clearTimeout(self.hoverTimeout);

        self.$swatches
          .off('mouseout')
          .on('mouseout', 'label', showSelectedSwatchColor);

      }

      self.updateLeadTime();
    }
    
  

    this.$swatches
      .on('mouseover', 'label', showSwatchColor)
      .on('mouseout', 'label', hideSwatchColor)
      .on('click', 'label', selectSwatchColor);

  }


  // Bind dropdown events
  bindDropdownEvents() {
    let self = this;

    this.$dropdowns.on('change', 'select', (e) => {
      let $el = $(e.currentTarget);
      let $optionText = $el.closest('[data-product-attribute="set-select"]').find('.form-field-title-cntr');
      let $opt = $el.find('option:selected');
      let label = self.parseOptionLabel($opt.text().trim());
      let customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);

      if (customOptionData) {
        label = customOptionData;
      }

      window.TEAK.currentSelections[$optionText.data('option-title')] = label;

      self.updateLeadTime();
      self.updateDropdownOptionLabels();
    });
  }

  // Show the hover detail pane and populate all data
  showHoverDetail(option) {

    let $hoverDetail = this.$hoverDetail;
    let $image = $hoverDetail.find(`.${this.hoverDetailBlockClass}__image`);
    let $label = $hoverDetail.find(`.${this.hoverDetailBlockClass}__label`);
    let $grade = $hoverDetail.find(`.${this.hoverDetailBlockClass}__grade`);
    let $leadtime = $hoverDetail.find(`.${this.hoverDetailBlockClass}__leadtime`);

    /* if (option.swatch && !option.label.match(/No Thanks/i)) {*/
    if (option.swatch) {
      // Only display if selected option has real images
      $label.text(option.label); // Set swatch label
      $grade.text(option.grade ? `Grade ${option.grade}` : ''); // Set/reset grade
      $leadtime.text(option.leadtime_from ? this.formatLeadTime(option.leadtime_from.value, option.leadtime_from.unit, option.leadtime_to.value, option.leadtime_to.unit) : '' );
      $image.css('background-image', `url("${option.swatch.thumb}")`); // Default image to thumbnail
      $image.attr('data-swatch-size', 'thumb'); // Set default swatch size
      $image.data('thumbnail-url', option.swatch.thumb); // Set thumbnail URL as quasi-unique key
      $image.removeAttr('data-loading'); // Reset data-loading attribute

      // Iterate through swatch sizes to find a larger size if available
      this.trySwatchImages($image, option.swatch);

      // Toggle detail pane visible state
      $hoverDetail.addClass('is-visible');
    } else {
      $hoverDetail.removeClass('is-visible');
    }
  }

  // Hide the hover detail pane
  hideHoverDetail() {
    this.$hoverDetail.removeClass('is-visible');
  }

  // Update and clean-up dropdown option labels
  updateDropdownOptionLabels() {
    let self = this;
    this.$dropdowns.each(function() {
      let $el = $(this);
      let $optionText = $el.closest('[data-product-attribute="set-select"]').find('.form-field-title-cntr');
      let currentSelection = window.TEAK.currentSelections[$optionText.data('option-title')] || false;
      $el.find('option').each(function() {
        let $opt = $(this);
        if (!$opt.data('originalValue')) {
          $opt.data('originalValue', $opt.text());
        }
        let label = self.parseOptionLabel($opt.text().trim());
        let customOptionData = self.findCustomOptionData($optionText.data('option-title'), label.text);
        if (customOptionData) {
          label = customOptionData;
        }

        if ($opt.val() && $opt.val().length > 0) {
          $opt.text(self.formatLabelWithRelativePricing(label, currentSelection));
        }
      });
    });
  }

  // Bind Request-a-Swatch modal features
  bindRequestASwatchFeature() {
    let self = this;

    this.$raqButtons.on('click', (e) => {
      e.preventDefault();
      $(e.currentTarget).blur();
      self.$raqModal.addClass('is-open');

      window.setTimeout(() => {
        $('body').on('mousedown.closeRASModal', (e) => {
          if ($(e.target).closest(self.raqModalSelector).length == 0) {
            self.$raqModal.removeClass('is-open');
            $('body').off('mousedown.closeRASModal');
          }
        });
      }, 100);
    });

    this.$raqSwatches.on('click', 'li[data-request-swatch]', (e) => {
      let $el = $(e.currentTarget);
      if (!$el.hasClass('is-selected') && self.$raqSwatches.find('li.is-selected').length >= 5) {
        return false; // Don't add swatches if five are already selected
      }
      $el.toggleClass('is-selected');
      if ($el.hasClass('is-selected')) {
        self.$raqSelections.append(
          $el.clone().append($('<span class="deselect"></span>').html('&times;'))
        );
      } else {
        self.$raqSelections.find(`li[data-swatch-title="${$el.data('swatch-title')}"]`).remove();
      }
      self.updateRequestASwatchForm();
    });

    this.$raqSelections.on('click', 'li[data-request-swatch] .deselect', (e) => {
      let $el = $(e.currentTarget).closest('li[data-request-swatch]');
      self.$raqSwatches.find(`li[data-swatch-title="${$el.data('swatch-title')}"]`).removeClass('is-selected');
      $el.remove();
      self.updateRequestASwatchForm();
    });

    // Request-a-Swatch form close
    this.$raqModal.on('click', '.closepopup', (e) => {
      self.$raqModal.removeClass('is-open');
      $('body').off('click.closeRASModal');
    });

    
    // Request-a-Swatch form close to show modal
    $(document).on('modal-cart-display', (e) => {
      self.$raqModal.removeClass('is-open');
      $('body').off('click.closeRASModal');
    });


    // Request-a-Swatch form Submit
    this.$raqModal.on('submit', 'form', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      utils.hooks.emit('cart-item-add', e, e.target);

      // once we get a success add to cart then update our module data
      utils.api.cart.itemAdd(formData, (err, response) => {
        if(response){
          window.TEAK.Modules.requestASwatch = { itemAdded: true, ...window.TEAK.Modules.requestASwatch};
        }
      });

    });
  }

  // Update Request-a-Swatch form and related DOM based on current selections
  updateRequestASwatchForm() {
    let swatches = [];
    let productName = this.$raqModal.find('[data-product-name]').first().data('product-name');
    let productSKU = this.$raqModal.find('[data-product-sku]').first().data('product-sku');

    this.$raqSwatches.find('li.is-selected').each(function() {
      swatches.push($(this).data('swatch-title'));
    });

    this.$raqModal.find('form input[data-request-swatch-values-input]').val(
      `${productName} SKU: ${productSKU}, ${swatches.join(',')}`
    );

    if (swatches.length >= 5) {
      this.$raqSwatches.addClass('has-max-selected');
    } else {
      this.$raqSwatches.removeClass('has-max-selected');
    }
    if (swatches.length > 0) {
      this.$raqModal.find('.previewswatch, form').addClass('has-selections');
      this.$raqModal.find('button').prop('disabled', false);
    } else {
      this.$raqModal.find('.previewswatch, form').removeClass('has-selections');
      this.$raqModal.find('button').prop('disabled', true);
    }

    // save this object data to use in other places on the site
    window.TEAK.Modules.requestASwatch = {
      qty: swatches.length,
      unitPrice: "$0.00"
    }

  }

  // Bind parsed label data to swatch labels
  bindSwatchLabelData() {
    let self = this;
    this.$swatches.find('label[data-swatch-value]').each(function() {
      let data = self.parseOptionLabel($(this).data('swatch-value'));
      for (var i in data) {
        $(this).attr(`data-swatch-${i}`, data[i]);
      }
    });
  }

  // Update lead time information
  updateLeadTime() {
    if (typeof window.TEAK.optionsWithLeadTimes === 'undefined') {
      // Look at all product options to determine which have lead times
      // Do this once and store globally
      let optionsWithLeadTimes = [];
      for (var i in window.TEAK.productCustomData.options) {
        let opt = window.TEAK.productCustomData.options[i];
        for (var j in opt.values) {
          if (typeof opt.values[j].leadtime_from !== 'undefined') {
            optionsWithLeadTimes.push(i);
            break;
          }
        }
      }
      window.TEAK.optionsWithLeadTimes = optionsWithLeadTimes;
    }

    // If there are no options with lead times, go no further
    if (window.TEAK.optionsWithLeadTimes.length === 0) {
      return;
    }

    // Get shipping range elements (and capture initial value for reset)
    let $rangeLabel = $('p.shipping-range--dynamic');
    if (!$rangeLabel.data('originalValue')) {
      $rangeLabel.data('originalValue', $rangeLabel.first().text().trim());
    }

    // Iterate through options to determine if any with lead times are still unset
    let unselectedLeadTimeOpts = window.TEAK.optionsWithLeadTimes.slice(0);
    for (var i in window.TEAK.currentSelections) {
      let opt = window.TEAK.currentSelections[i];
      if (typeof opt.leadtime_from !== 'undefined') {
        // If an option has a lead time value, remove it from the array of unset options
        let indexOfOpt = unselectedLeadTimeOpts.indexOf(i);
        if (indexOfOpt > -1) {
          unselectedLeadTimeOpts.splice(indexOfOpt, 1);
        }
      }
    }

    if (unselectedLeadTimeOpts.length > 0) {
      // If there is an option missing a lead time, fall back to default
      $rangeLabel.text($rangeLabel.data('originalValue'));
    } else {
      // Otherwise, find the longest lead time among all selected options
      let maxLeadTimeFrom = 0;
      let longestLeadFrom = null;
      let maxLeadTimeTo = 0;
      let longestLeadTo = null;
      for (var i in window.TEAK.currentSelections) {
        let opt = window.TEAK.currentSelections[i];
        if (opt.leadtime_weeks_from > maxLeadTimeFrom) {
          maxLeadTimeFrom = opt.leadtime_weeks_from;
          longestLeadFrom = opt;
        }
        if (opt.leadtime_weeks_to > maxLeadTimeTo) {
          maxLeadTimeTo = opt.leadtime_weeks_to;
          longestLeadTo = opt;
        }
      }

      // Display the longest lead time based on all selected options
      $rangeLabel.text(this.formatLeadTime(longestLeadFrom.leadtime_from.value, longestLeadFrom.leadtime_from.unit, longestLeadTo.leadtime_to.value, longestLeadTo.leadtime_to.unit));
    }
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

  // Convert a swatch thumbnail URL to an object of multiple sizes
  getSwatchImages(thumb) {
    let basename = thumb.replace(/^.+\//g, '');
    return {
      thumb: thumb.replace('{:size}', '256x256'),
      large: this.largeImagePath + basename,
      cdn:   this.largeImageCDNPath + basename
    };
  }

  // Search through product custom data for a specified option name and value
  findCustomOptionData(option, value) {
    let result = {};
    try {
      result = window.TEAK.productCustomData.options[option].values[value];
    } catch (e) {
      return false;
    }
    return result;
  }

  // Try loading higher-res swatch images (with caching of results)
  trySwatchImages($image, swatch, size) {
    let sizes = [ 'cdn', 'large' ];
    size = size || sizes[0];

    if (this.swatchImageResults.hasOwnProperty(swatch[size])) {
      // If image has already been tested, use results
      if (this.swatchImageResults[swatch[size]]) {
        // If image was successfully preloaded, inject into preview
        if ($image.data('thumbnail-url') == swatch.thumb) { // Only if swatch is still hovered
          $image.css('background-image', `url("${swatch[size]}"), url("${swatch.thumb}")`);
          $image.attr('data-swatch-size', size);
        }
      } else if (sizes.indexOf(size) < sizes.length - 1) {
        // Else iterate through the next size
        let nextSize = sizes[sizes.indexOf(size) + 1];
        if (this.swatchImageResults.hasOwnProperty(swatch[nextSize])) {
          $image.removeAttr('data-loading');
        }
        this.trySwatchImages($image, swatch, nextSize);
      }
    } else {
      // If image has not been tested, test now
      $image.attr('data-loading', 'true');
      let self = this;
      let $preload = $('<img>');
      $preload.on('load', function() {
        // If image loads successfully, save result and re-run
        self.swatchImageResults[swatch[size]] = true;
        self.trySwatchImages($image, swatch, size);
      }).on('error', function() {
        // If image failed to load, save result and continue iterating
        self.swatchImageResults[swatch[size]] = false;
        self.trySwatchImages($image, swatch, size);
      }).attr('src', swatch[size]);

      // Attach preload image to DOM for resource persistence
      this.$hoverDetail.find(`.${this.hoverDetailBlockClass}__preload`).append($preload);
    }
  }

  // Preload all images (before hover event)
  preloadImages() {
    if (('ontouchstart' in window) || navigator.msMaxTouchPoints) { return false; }

    let delay = 0, self = this;
    $(window).on('load', () => {
      for (var i in window.TEAK.productCustomData.options) {
        let opt = window.TEAK.productCustomData.options[i];
        for (var j in opt.values) {
          let val = opt.values[j];
          if (val.swatch) {
            window.setTimeout(function() {
              self.trySwatchImages($('<div></div>'), val.swatch);
            }, delay);
            delay += 75;
          }
        }
      }
    });
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

  // Format lead time verbiage
  formatLeadTime(fromValue, fromUnit, toValue, toUnit) {
    if (fromUnit == toUnit) {
      if (fromValue == toValue) {
        return `Ships in ${fromValue} ${(fromValue === 1 ? fromUnit : `${fromUnit}s`)}`;
      } else {
        return `Ships in ${fromValue} - ${toValue} ${toUnit}s`
      }
    } else {
      return `Ships in ${fromValue} ${(fromValue === 1 ? fromUnit : `${fromUnit}s`)} - ${toValue} ${(toValue === 1 ? toUnit : `${toUnit}s`)}`;
    }
  }
}
