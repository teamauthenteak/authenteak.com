import PageManager from '../PageManager';
import ProductImages from './product/ProductImages';
import Personalization from './Personalization';

export default class Collection extends PageManager {
    constructor() {
        super();

        this.initAnalytics();

        // add Personalization engine
        this.recentlyViewed = new Personalization({
            type: "recentlyViewed"
        });
        this._initRecentlyViewed();
    }


    initAnalytics(){
		TEAK.ThirdParty.heap.init({
            method: 'track',
            event: 'plp_collections_view',
            location: 'collections'
        });
    }
    

    _initRecentlyViewed(){
		let $rv = $("#recentlyViewedProducts"),
			recentProducts = this.recentlyViewed.getViewed();

		if (recentProducts) {
			recentProducts.forEach((element) => {
                let tpl = this.recentlyViewed.buildPersonalizationSlider(element);
                
                if(document.querySelector(".product-grid")){
                    $(tpl).appendTo(".product-rv-carousel", $rv);
                }
			});

            $rv.addClass("show");
            
            this.recentlyViewed.initProductSlider({
                dotObj: {appendDots: '.product-rv-carousel'},
                selector: '.product-rv-carousel',
                context: '#recentlyViewedProducts'
            });
		}
    }
    


}