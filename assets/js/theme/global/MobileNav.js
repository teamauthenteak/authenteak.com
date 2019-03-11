import _ from 'lodash';

export default class MobileNav {
  constructor() {
    this.$body = $('body');
    this.navToggle = $('.button-mobile-nav-toggle');
    this.pageCover = $('.site-wrapper');
    this.$menu = $('.navigation');
    this.$navBackButton = $('.button-mobile-nav-back');
    this.getMenus = (targetMenu) => {
      return $(`[data-mobile-menu="${targetMenu}"]`);
    };

    this.navPanel = '.nav-mobile-panel';
    this.classes = {
      active: 'is-active',
      left: 'is-left',
      right: 'is-right',
      forceState: 'force-state',
    };

    this.menuState = [];

    this._initMobile();
    this._bindMobileEvents();
  }

  _initMobile() {
    $('.nav-mobile-item-parent').each((index, element) => {
      let $children = $(element).children('.nav-mobile-panel');
      let counter = 1;

      while ($children.length) {
        $children.attr('data-panel-depth', counter).insertAfter($('.nav-mobile-panel-parent'));
        $children = $children.children().children('.nav-mobile-panel');
        counter += 1;
      }
    });
  }

  _bindMobileEvents() {
    $('.nav-mobile-item.has-children').on('click', (event) => {
      event.preventDefault();
      this._traverseDown(event);
    });

    this.$navBackButton.on('click', (event) => {
      this._traverseBack();
    });
  }

  _traverseDown(event) {
    const targetMenu = $(event.currentTarget).children().data('toggle-mobile');
    this.$body.addClass('mobile-nav-open');

    // Move previous active to the left
    $(event.currentTarget)
      .closest(this.navPanel)
      .addClass(this.classes.left)
      .removeClass(this.classes.active);

    // Active new menu and move into place from right
    this.getMenus(targetMenu)
      .removeClass(this.classes.right)
      .addClass(this.classes.active);

    // Update the back button id
    const prevMenu = $(event.currentTarget).parents('.nav-mobile-panel').data('mobile-menu');
    this.menuState.push(prevMenu);

  }

  _traverseBack() {
    // Move previous active to the right
    $(this.navPanel)
      .filter(`.${this.classes.active}`)
      .removeClass(this.classes.active)
      .addClass(this.classes.right);

    // Position new active menu from the left
    const targetMenu = this.menuState.pop();

    this.getMenus(targetMenu)
      .removeClass(this.classes.left)
      .addClass(this.classes.active);

    if (targetMenu === 'all') {
      this.$body.removeClass('mobile-nav-open');
    }
  }
}
