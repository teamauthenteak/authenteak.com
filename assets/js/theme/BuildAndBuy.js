import React from 'react';
import ReactDOM from 'react-dom';
import PageManager from '../PageManager';
import Personalization from './Personalization';
import App from './product/build-and-buy/App';
import Firebase, { FirebaseContext } from './product/react-components/services/Firebase';
import { replaceSize } from './product/react-components/Utils';


export default class BuildAndBuy extends PageManager {
    constructor(){
        super();
        this.initAnalytics();
    }


    loaded(next){

        ReactDOM.render(
            <FirebaseContext.Provider value={new Firebase()}>
                <App context={this.context.product} />
            </FirebaseContext.Provider>,
            document.getElementById("buildAndBuyRoot")
        );


        // Recently Viewed Module
        const recentlyViewed = new Personalization({ 
                selector: "#recentlyViewedProducts",
                carousel_selector: ".product-rv-carousel",
                type: "recentlyViewed",
                product: {
                    url: this.context.product.url,
                    title: this.context.product.title,
                    product_id: this.context.product.id,
                    brand: this.context.product.brand.name,
                    price: this.context.product.price.without_tax.value,
                    availability: "in stock",
                    image: replaceSize(this.context.product.main_image.data, 200),
                    sku: this.context.product.sku
                }
            });

        recentlyViewed.init()

        next()
    }



    initAnalytics(){
		TEAK.ThirdParty.heap.init({
			method: 'track',
			event: 'pdp_build_n_buy_view',
			location: 'pdp_collections'
		});
    }
    
}