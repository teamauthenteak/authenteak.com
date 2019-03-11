import _ from 'lodash';

export default function truncate($textBlock) {
  const length = $textBlock.data('excerpt-length') || 200;
  const text = $textBlock.text();
  if (text.length > length) {
    const truncated =  _.trunc($textBlock.text(), { length: length, separator: ' ' });
    $textBlock.text(truncated).addClass('loaded truncated');
  } else {
    $textBlock.addClass('loaded');
  }
}
