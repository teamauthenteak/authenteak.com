/**
 *  Attach functionality to PDP for configurable print mode (tear sheet)
 *
 * Example: new PrintMode()
 */
export default class PrintMode {
  constructor() {
    this.$swatches = $('[data-swatch-selector]');
    this.$printButton = $('.social-link.print a.print');
    this.$topBar = $('.top-bar .container');
    this.printSections = [
      {
        'name': 'Print Description',
        'short_name': 'Description',
        'target': $('[data-tabval="descTab"], .descContent'),
      },
      {
        'name': 'Print Specifications',
        'short_name': 'Specs',
        'target': $('[data-tabval="specsTab"], .specsContent'),
      },
      {
        'name': 'Print PDF List',
        'short_name': 'PDFs',
        'target': $('[data-tabval="pdfTab"], .pdfContent'),
      },
      {
        'name': 'Print Shipping Info',
        'short_name': 'Shipping',
        'target': $('[data-tabval="shipTab"], .shipContent'),
      },
      {
        'name': 'Print Care',
        'short_name': 'Care',
        'target': $('[data-tabval="careTab"], .careContent'),
      },
      {
        'name': 'Print Warranty',
        'short_name': 'Warranty',
        'target': $('[data-tabval="warrantyTab"], .warrantyContent'),
      },
      {
        'name': 'Print Price',
        'short_name': 'Price',
        'target': $('.product-price-line, .price-you-save'),
      },
      {
        'name': 'Product Videos',
        'short_name': 'Videos',
        'target': $('[data-tabval="videoTab"], .videoContent'),
      }
    ];

    // Bind events
    this.bindEvents();
  }

  // Bind print-mode toggle and related events
  bindEvents() {
    let self = this;

    this.$printButton.on('click', (e) => {
      $('body').addClass('is-printmode');
      this.enablePrintMode();
    });

    $(window).on('beforeprint', (e) => {
      if (!$('body').hasClass('is-printmode')) {
        $('body').addClass('is-printmode is-printmode--no-dialog');
        this.enablePrintMode();
      }
    });

    $(window).on('afterprint', (e) => {
      if ($('body').hasClass('is-printmode--no-dialog')) {
        self.disablePrintMode();
      }
    });
  }

  enablePrintMode() {
    this.buildControls();
    this.buildPrintSwatches();
  }

  disablePrintMode() {
    $('body').find('.print-mode-controls, .print-mode-swatches').remove();
    $('body').removeClass('is-printmode is-printmode--no-dialog');
    $('.is-print-hidden').removeClass('is-print-hidden');
  }

  buildControls() {
    let $controls = $('<div></div>').addClass('print-mode-controls');
    let $sections = $('<div></div>').addClass('print-mode-controls__sections');
    $controls.append(
      $('<div></div>').addClass('print-mode-controls__actions').append(
        $('<button></button>').text('Back').addClass('button').on('click', (e) => {
          this.disablePrintMode();
        })
      ).append(
        $('<button></button>').addClass('button').on('click', (e) => {
          window.print();
        }).append(
          $('<span></span>').addClass('print-mode-controls__label--full-name').text('Print Page')
        ).append(
          $('<span></span>').addClass('print-mode-controls__label--short-name').text('Print')
        )
      )
    );
    for (var i in this.printSections) {
      let section = this.printSections[i];
      $sections.append(
        $('<label></label>').append(
          $('<input type="checkbox">').prop('checked', true).on('click', (e) => {
            section.target.toggleClass('is-print-hidden');
          })
        ).append(
          $('<span></span>').addClass('print-mode-controls__label--full-name').text(section.name)
        ).append(
          $('<span></span>').addClass('print-mode-controls__label--short-name').text(section.short_name)
        )
      );
    }
    $controls.append($sections);
    this.$topBar.append($controls);
  }

  buildPrintSwatches() {
    let $printSwatches = $('<div></div>').addClass('print-mode-swatches');
    $printSwatches.append(this.$swatches.clone());
    $printSwatches.find('.form-field-title').each(function() {
      $(this).append(
        $('<label></label>').addClass('print-mode-option-control').append(
          $('<input type="checkbox">').prop('checked', true).on('click', (e) => {
            $(this).closest('.form-field-swatch').toggleClass('is-print-option-hidden');
          })
        ).append(
          $('<span></span>').text('Print this option')
        )
      )
    });
    $printSwatches.find('label[data-swatch-value]').each(function() {
      $(this).find('.form-label-text').text($(this).data('swatch-text'));
    });
    $printSwatches.insertBefore('.mobile-tab-wrapper');
  }
}


