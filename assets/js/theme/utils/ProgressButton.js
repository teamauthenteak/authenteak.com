import svgIcon from '../global/svgIcon';

/**
 * Toggle a progress button state with alternate text
 * the button needs a class of button-progress
 * the button text needs to be wrapped in an extra .button-text element within the button element itself
 * the button should probably have a data-progress-text attribute
 */

export default class ProgressButton {
  progress($button) {
    // cache the current button text
    $button.data('defaultText', $button.text());

    const progressText = $button.attr('data-progress-text') || $button.text();
    const spinner = $button.hasClass('spinner') ? svgIcon('spinner') : '';

    $button
      .addClass('progress')
      .attr('disabled', 'disabled')
      .append(spinner)
      .find('.button-text')
      .html(progressText);
  }

  complete($button) {
    const defaultText = $button.data('defaultText');

    $button
      .removeClass('progress')
      .attr('disabled', false)
      .find('.button-text')
      .html(defaultText)
      .next('.icon-spinner')
      .remove();
  }
}
