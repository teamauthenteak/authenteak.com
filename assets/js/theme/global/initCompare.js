import _ from 'lodash';
import ProductCompare from 'bc-compare';
import svgIcon from './svgIcon';

const compare = new ProductCompare({
  maxItems: 4,
  itemTemplate: _.template(`
    <li class="compare-tab-item" data-compare-item>
      <div class="compare-tab-item-wrap">
        <a class="compare-tab-item-remove" data-compare-item-remove="<%= id %>">${svgIcon('close')}</a>
        <a href="<%= url %>">
          <div class="compare-tab-item-thumb" style="background-image: url(<%= thumbnail %>)"></div>
        </a>

        <div class="compare-tab-item-description">
          <a href="<%= url %>" class="compare-tab-item-title"><%= title %></a>
          <div class="compare-tab-item-price"><%= price %></div>
        </div>
      </div>
    </li>
  `),
});

export function initCompare() {
  compare.on('updated', () => {
    $('.compare-items-count').text(compare.compareList.size);

    if (compare.compareList.size > 0) {
      $('[data-compare-widget], .mobile-compare-link').addClass('compare-active');
    } else {
      $('[data-compare-widget], .mobile-compare-link').removeClass('compare-active');
    }
  }, true);

  $('[data-compare-remove-all]').on('click', (event) => {
    event.preventDefault();
    compare.removeAll();
  });
}

export function updateCompare() {
  compare.updateCheckboxes();
}
