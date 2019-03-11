export default class Dropdown {
  constructor(el) {
    this.$el = $(el);

    this._bindEvents();
  }

  _bindEvents() {
    // Toggle Main dropdown on click
    this.$el.find('.dropdown-toggle').on('click', (e) => {
      this._toggleMainDropdown(e);

      // return false so click anywhere to close will work
      return false;
    });

    // Toggle tier dropdown on click
    this.$el.find('.tier-toggle').on('click', (e) => {
      this._toggleTierDropdown(e);

      // return false so click anywhere to close will work
      return false;
    });

    // Close when clicking elsewhere, except in open dropdown
    $(document).on('click', (event) => {
      if ($(event.target).closest('.dropdown').hasClass('dropdown-open') || $(event.target).hasClass('override-dropdown') || $(event.target).parents().hasClass('override-dropdown')) {
        return;
      }

      if (this.$el.hasClass('dropdown-open')) {
        this._toggleMainDropdown(event, false);
      }
    });
  }

  _toggleMainDropdown(event, open) {
    const $target = $(event.currentTarget).closest('.dropdown');
    const $dropdown = $('.dropdown');

    // Close any open ones first
    $dropdown
      .not($target)
      .removeClass('dropdown-open')
      .find('.dropdown-panel')
      .revealer('hide');

    // Close any open tiers and remove tier active class when dropdown closes
    $dropdown
      .find('.tier-panel')
      .revealer('hide');

    $dropdown
      .find('.tier-dropdown')
      .removeClass('tier-open');

    // Toggle panel
    $target
      .toggleClass('dropdown-open', open)
      .find('.dropdown-panel')
      .revealer('toggle');
  }

  _toggleTierDropdown(event, open) {
    const $tierTarget = $(event.currentTarget).closest('.tier-dropdown');

    // Toggle panel for direct child
    $tierTarget
      .toggleClass('tier-open', open)
      .children('.tier-panel')
      .revealer('toggle');
  }
}
