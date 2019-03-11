import Blazy from 'blazy';

export const lazyLoad = new Blazy({
  selector: '.lazy-image',
  successClass: 'lazy-loaded',
  success: (element) => {
    $(element)
      .css({opacity: 0})
      .fadeTo(500, 1)
      .children('.spinner')
      .remove();
  },
});
