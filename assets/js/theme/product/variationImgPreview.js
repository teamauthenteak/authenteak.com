import slick from 'slick-carousel';
import productViewTemplates from './productViewTemplates';
import ProductImages from './ProductImages';
import baguetteBox from 'baguettebox.js';
import ImageZoom from './ImageZoom';
import imagesLoaded from 'imagesLoaded';

function scrollToTop() {
  $('html, body').animate({
    scrollTop: $('.site-canvas').offset().top
  });
}

export default function variationImgPreview(productImageUrl, zoomImageUrl, alt, imageId) {
  const productImgs = '.product-slides-wrap';

  // Only append if image doesn't already exist.
  // Otherwise, scroll to it.
  if (!$(`img[src="${productImageUrl}"]`).length) {
    const numSlides = $('[data-product-image]').length;
    baguetteBox.destroy();

    // Add carousel image
    $(productImgs).slick('slickAdd', productViewTemplates.variationImage({
      productImageSrc: productImageUrl,
      zoomImageSrc: zoomImageUrl,
      alt: alt
    }));

    // Add carousel nav item
    $('.product-images-pagination').slick('slickAdd', productViewTemplates.variationImageNav({
      productImageSrc: productImageUrl,
      id: imageId
    }));

    imagesLoaded(productImgs, { background: true }, () => {
      baguetteBox.run('.product-slides-wrap', {});


      $(productImgs).slick('slickGoTo', numSlides + 1);
      scrollToTop();

      // Image zoom for newly added image
      $(productImgs).find('[data-product-image]').each((i, el) => {
        new ImageZoom(el);
      });
    });

  } else {
    const $changedOption = $(`[data-variant-id="${imageId}"]`);

    const targetIndex = $changedOption.data('slick-index');
    const currentIndex = $(productImgs).slick('slickCurrentSlide');

    // if the variant image exists and isn't the currently selected slide,
    // switch to it and scroll to the top
    if ($changedOption.length && targetIndex !== currentIndex) {
      $(productImgs).slick('slickGoTo', targetIndex);
      scrollToTop();
    }
  }
};
