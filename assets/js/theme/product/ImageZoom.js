export default class ImageZoom {
	constructor(el) {
        this.$el = $(this.el);
        
        this.zoomedImg = $("a.product-image", "#productImgWrapper");

		this.image = {
			width: this.zoomedImg.find("img")[0].naturalWidth,
			height: this.zoomedImg.find("img")[0].naturalHeight
		};

		// Only init if image is wide/tall enough to zoom
		if ( this.image.width > 800 || this.image.height > 800 && !TEAK.Utils.isHandheld ) {
			this._bindEvents();
		}
	}


	_bindEvents(){
		this.zoomedImg.on('mousemove', (e) => { this._zoomImage(e); });
	}


	_zoomImage(e) {
		let zoomed = e.currentTarget,
			offsetX = e.offsetX ? e.offsetX : e.touches[0].pageX,
			offsetY = e.offsetY ? e.offsetY : e.touches[0].pageY,
			x = offsetX / zoomed.offsetWidth * 100,
			y = offsetY / zoomed.offsetHeight * 100;

		this.zoomedImg.css({"backgroundPosition": `${x}% ${y}%`});
	}
}



