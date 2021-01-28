import React from 'react';
import ReactDOM from 'react-dom';
import PageManager from '../PageManager';
import App from './product/build-and-buy/App';
import Firebase, { FirebaseContext } from './product/react-components/services/Firebase';

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

        next();
    }



    initAnalytics(){
		TEAK.ThirdParty.heap.init({
			method: 'track',
			event: 'pdp_build_n_buy_view',
			location: 'pdp_collections'
		});
    }
    
}