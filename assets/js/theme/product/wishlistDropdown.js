export default class wishlistDropdown {
  constructor() {
    this.dropdown = '[data-wishlist-dropdown]';
    this.toggle = '[data-wishlist-toggle]';
    this.panel = '[data-wishlist-panel]';
    this._bindEvents();
  }

  _bindEvents() {
    $(document).on('click', this.toggle, (event) => {
      this._toggleDropdown(event);
    });
  }

  _toggleDropdown(event) {
    event.preventDefault();

    $(event.currentTarget)
      .closest(this.dropdown)
      .find(this.panel)
      .revealer('toggle');

    $(this.toggle)
      .filter($(this.toggle).not($(event.currentTarget)))
      .closest(this.dropdown)
      .find(this.panel)
      .revealer('hide');
  }
}
