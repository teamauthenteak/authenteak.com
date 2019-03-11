import svgIcon from './svgIcon';

export default function (event) {
  const $target = $(event.currentTarget);
  const $trigger = $target.find('.facet-list-toggle');

  $target
    .parents('[data-facet-filter]')
    .children('[data-facet-filter-wrapper]')
    .toggleClass('is-open');

  if ($target.hasClass('is-open')) {
    $trigger.html(svgIcon('minus'));
  } else {
    $trigger.html(svgIcon('plus'));
  }

  $target.toggleClass('is-open');
}
