export default class MegaNav {
  constructor(el) {
    this.$el = $(el);
    this.$rootMenu = this.$el.find('.mega-nav-root-list');
    this.$childContainer = this.$el.find('.mega-nav-child-container');
    this.$dropdownToggle = this.$el.closest('.dropdown').find('.dropdown-toggle');

    this._bindEvents();
    this._hideAllChildren(true);
  }

  _bindEvents() {
    this.$el.on('click', '[data-mega-nav-root-item]', (e) => {
      e.preventDefault();
      this._findChildFromRoot(e);
      e.stopPropagation();
      console.log('hey!');
    });

    this.$el.on('click', '[data-mega-nav-find-child]', (e) => {
      e.preventDefault();
      this._findChild(e);
      e.stopPropagation();
    });

    this.$el.on('click', '[data-mega-nav-find-parent]', (e) => {
      e.preventDefault();
      this._findParent(e);
      e.stopPropagation();
    });

    this.$dropdownToggle.on('click', (e) => {
      this._hideAllChildren(true);
    })

    $(document).resize(() => {
      this._adjustMegaNavPanel();
    });
  }

  _findChildFromRoot(e) {
    this._hideAllChildren(true);

    const $rootItem = $(e.currentTarget);
    const categoryId = $rootItem.data('category-id');
    const $childList = this.$el.find('[data-root-category-id="' + categoryId + '"]');

    $rootItem.addClass('active');
    window.setTimeout(() => { $childList.revealer('show'); }, 500);
  }

  _findChild(e) {
    const $target = $(e.currentTarget);
    const childId = $target.data('mega-nav-child-id');
    const $childList = this.$childContainer.find('[data-root-category-id="' + childId + '"]');

    if ($childList.length > 0) {
      this._hideAllChildren();
      window.setTimeout(() => { $childList.revealer('show'); }, 500);
    }
  }

  _findParent(e) {
    const $minus = $(e.currentTarget);
    const parentId = $minus.closest('.mega-nav-child-list-container').data('root-category-id');
    const $parent = this.$childContainer.find('[data-mega-nav-child-id="' + parentId + '"]').closest('.mega-nav-child-list-container');

    if ($parent.length > 0) {
      this._hideAllChildren();
      window.setTimeout(() => { $parent.revealer('show'); }, 500);
    }
  }

  _hideAllChildren(removeActive = false) {
    if (removeActive) {
      this.$el.find('[data-mega-nav-root-item]').removeClass('active');
    }
    this.$el.find('.mega-nav-child-list-container').revealer('hide');
  }

  _adjustMegaNavPanel() {
    const $dropdown = this.$dropdownToggle.closest('.dropdown');
    const $megaNavPanel = $dropdownToggle.find('.mega-nav-panel');

    if ($dropdown.length > 0 && $megaNavPanel.length > 0) {
      const offset = $dropdown.offset().top + $dropdown.outerHeight();

      $megaNavPanel.css({ 'top' : offset + 'px' });
    }
  }
}
