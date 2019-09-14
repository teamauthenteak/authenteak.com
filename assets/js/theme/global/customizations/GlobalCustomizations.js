/**
 *  Attach global JavaScript customizations to page
 *
 * Example: new GlobalCustomizations()
 */
export default class GlobalCustomizations {
  constructor() {
    this.megaMenuSelector = '.mega-nav-panel';
    this.$megaMenus = $(this.megaMenuSelector);
    this.mobileMenuSelector = '.nav-mobile-container';
    this.$mobileMenu = $(this.mobileMenuSelector);
    this.$mobileRefinementsToggle = $('.listing-sidebar__mobile-toggle');
    this.$mobileRefinementsContainer = $('.listing-sidebar__mobile-collapse');

    this.prepareHistoryPolyfill();
    this.prepareMegaMenus();
    // this.prepareMobileMenu();
    this.prepareMobileRefinements();
  }

  prepareHistoryPolyfill() {
    $(window).on('load', function() {
      window.setTimeout(function() {
        if ($('.form-field--nxt-pagination').length == 0) {
          window.History.init();
        }
      }, 500);
    });
  }

  // Complete mega menu DOM created by handlebars
  prepareMegaMenus() {

    // Add DoubleTapToGo element bindings
    $('.navigation ul li.hover-dropdown.mega-nav').doubleTapToGo();

    let config = this.getGlobalScriptConfig();

    // if (config && config.menu_extras) {
    //   for (var i in config.menu_extras) {
    //     let $menu = $(`a.top-level-nav-link[href$="/${i}"] + ${this.megaMenuSelector}, a.top-level-nav-link[href$="/${i}/"] + ${this.megaMenuSelector}`);
    //     if ($menu.length !== 1) { continue; }

    //     // Add landing image
    //     this.addMegaMenuImage($menu, config.menu_extras[i].landing_image || false);

    //     // Add Shop All -- Append to extra links
    //     let $topLink = $menu.closest('li.mega-nav');
    //     if ($topLink.length === 1) {
    //       $topLink = $topLink.find('a').first();
    //     }
    //     this.appendShopAllToLinks(config.menu_extras[i], $topLink);

    //     // Add extra links
    //     this.addMenuLinks($menu, config.menu_extras[i].links || [], 'parent');

    //     // Descend children
    //     this.prepareMegaMenuChildren($menu, config.menu_extras[i].children || []);
    //   }
    // }

    // Add collapse modifiers for parent items that can be collapsed
    this.$megaMenus.find('.mega-nav-list .parent:not(.has-children)').each(function() {
      let $list = $(this);
      if ($list.next().is('.parent:not(.has-children)')) {
        $list.addClass('parent--collapse');
      }
    });
  }

  prepareMegaMenuChildren($parentMenu, children) {
    children = children || {};

    for (var i in children) {
      let $childLink = $parentMenu.find(`li > a[href$="/${i}"], li > a[href$="/${i}/"]`);
      if ($childLink.length !== 1) {
        continue;
      }
      let $childMenu = $childLink.parent();

      if ($childMenu.children('ul').length === 1 && $childMenu.children('ul').children('li').length > 0) {
        // Add Shop All -- Append to extra links
        this.appendShopAllToLinks(children[i], $childLink);

        // Add extra links
        this.addMenuLinks($childMenu, children[i].links || []);

        // Descend children
        this.prepareMegaMenuChildren($childMenu, children[i].children || []);
      }
    }

  }

  addMegaMenuImage($menu, image) {
    if (image) {
      if (image.category) {
        let $imageSourceCategory = $menu.find(`a[href$="/${image.category}"], a[href$="/${image.category}/"]`);
        if ($imageSourceCategory.length === 1) {
          image.link = image.link || $imageSourceCategory.attr('href');
          image.src = image.src || $imageSourceCategory.data('category-image');
          image.label = image.label || $imageSourceCategory.text();
        }
      }

      if (image.link && image.src && image.label) {
        $menu.find('.mega-nav-landing-wrapper').prepend(
          $('<div></div>').addClass('mega-nav-landing').append(
            $('<a></a>').attr('href', image.link).append(
              $('<span></span>').addClass('landing__caption').html(image.label)
            ).append(
              $('<img>').addClass('landing__image').attr('src', image.src)
            )
          )
        );
      }
    }
  }

  appendShopAllToLinks(configNode, $link) {
    let addShopAll = configNode.shop_all || false;
    if (!addShopAll) { return; }

    if (typeof addShopAll === 'string') {
      addShopAll = {label: addShopAll};
    } else if (typeof addShopAll !== 'object') {
      addShopAll = {};
    }

    let defaults = {
      link: $link.attr('href'),
      label: `Shop All ${$link.text().trim()}`,
      class: 'shop-all'
    };
    configNode.links = configNode.links || [];
    configNode.links.push(Object.assign({}, defaults, addShopAll));
  }

  addMenuLinks($menu, links, listItem) {
    if (typeof listItem === 'undefined') {
      listItem = true;
    }

    for (var i in links) {
      let link = links[i];
      if (link.link && link.label) {
        let $a = $('<a></a>').attr('href', link.link).html(link.label);
        let $li;
        if (typeof listItem === 'object') {
          $li = listItem;
          $li.append($a);
        } else if (listItem) {
          $li = $('<li></li>').append($a);
          if (typeof listItem === 'string') {
            $li.addClass(listItem);
          }
        } else {
          $li = $a;
        }
        if (link.class) {
          $a.addClass(link.class);
        }
        if (link.after && typeof link.after == 'string' && !link.after.match(/^([*]|all)$/)) {
          let $sibling = $menu.find(`a[href$="/${link.after}"], a[href$="/${link.after}/"]`);
          if ($sibling.length === 1) {
            if (listItem) {
              $sibling.closest('li').after($li);
            } else {
              $sibling.after($li);
            }
            continue;
          }
        }
        if (link.before && typeof link.before == 'string' && !link.before.match(/^([*]|all)$/)) {
          let $sibling = $menu.find(`a[href$="/${link.before}"], a[href$="/${link.before}/"]`);
          if ($sibling.length === 1) {
            if (listItem) {
              $sibling.closest('li').before($li);
            } else {
              $sibling.before($li);
            }
            continue;
          }
        }
        if (!$menu.is('ul')) {
          $menu = $menu.find('ul').first();
        }
        if (link.before) {
          $menu.prepend($li);
        } else {
          $menu.append($li)
        }
      }
    }
  }

  // Complete mobile menu DOM created by handlebars
  prepareMobileMenu() {

    let config = this.getGlobalScriptConfig();

    if (config && config.menu_extras) {
      for (var i in config.menu_extras) {
        let $menu = $(`ul.nav-mobile-panel[data-mobile-menu$="/${i}"], ul.nav-mobile-panel[data-mobile-menu$="/${i}/"]`);
        if ($menu.length !== 1) { continue; }

        // Add Shop All -- Append to extra links
        let $topLink = $menu.closest('li.mega-nav');
        if ($topLink.length === 1) {
          $topLink = $topLink.find('a').first();
        }
        this.appendShopAllToLinks(config.menu_extras[i], $topLink);

        // Add extra links
        this.addMenuLinks($menu, config.menu_extras[i].links || [], 'nav-mobile-item');

        // Descend children
        this.prepareMobileMenuChildren($menu, config.menu_extras[i].children || []);
      }
    }
  }

  prepareMobileMenuChildren($parentMenu, children) {
    children = children || {};

    for (var i in children) {
      let $childMenu = $(`ul.nav-mobile-panel[data-mobile-menu$="/${i}"], ul.nav-mobile-panel[data-mobile-menu$="/${i}/"]`);
      if ($childMenu.length !== 1) { continue; }

      let $childLink = $parentMenu.find(`li > a[href$="/${i}"], li > a[href$="/${i}/"]`);
      if ($childLink.length !== 1) { continue; }

      if ($childMenu.children('li').length > 0) {
        // Add Shop All -- Append to extra links
        this.appendShopAllToLinks(children[i], $childLink);

        // Add extra links
        this.addMenuLinks($childMenu, children[i].links || [], 'nav-mobile-item');

        // Descend children
        this.prepareMobileMenuChildren($childMenu, children[i].children || []);
      }
    }

  }

  getGlobalScriptConfig() {
    let config = {};
    let $configTag = $('script[data-theme-config="global"]');
    if ($configTag.length === 1) {
      try {
        config = JSON.parse($configTag.text());
      } catch (e) {
        config = {};
      }
    } else if (location.port >= 3000) {

      config = {
        "menu_extras": {
          "example-top-level-link": {
            "links": [
              {
                "link": "http://www.example.com",
                "label": "This is the link text <b>with HTML</b>",
                "class": "optional-class-name examples-include highlight-red shop-all",
                "after": "example-top-level-link/child-link-which-this-should-appear-after"
              }
            ],
            "shop_all": true,
            "children": {
              "example-top-level-link/example-second-level-link": {
                "links": [
                  {
                    "link": "http://www.google.com",
                    "label": "Search on Google",
                    "before": "example-top-level-link/example-second-level-link/child-link-which-this-should-appear-before"
                  }
                ],
                "shop_all": "Shop All Category with Custom Text and <b>HTML</b>"
              }
            }
          },
          "outdoor-furniture": {
            "links": [
              {
                "link": "/outdoor-furniture/",
                "label": "### Shop All Outdoor Furniture",
                "class": "shop-all"
              },
              {
                "link": "https://authenteak.com/authenteak-atlanta-showroom-specials/",
                "label": "### Showroom Clearance",
                "class": "highlight-red",
                "before": "outdoor-furniture/quick-ship-furniture"
              }
            ]
          },
          "patio-umbrellas": {
            "landing_image": {
              "category": "accessories-parts-frames/replacement-canopies",
              "label": "Update your shade! <b>Shop Replacement Canopies</b>"
            },
            "links": [],
            "children": {
              "patio-umbrellas/shop-by-shape": {
                "shop_all": "### Shop All Shapes"
              }
            },
            "shop_all": '### Shop All Patio Umbrellas &amp; Accessories'
          }
        }
      };

    }
    return config;
  }

  prepareMobileRefinements() {
    this.$mobileRefinementsToggle.on('click', () => {
      this.$mobileRefinementsContainer.slideToggle();
    })
  }
}
