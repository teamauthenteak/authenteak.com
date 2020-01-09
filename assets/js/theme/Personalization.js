import PageManager from '../PageManager';

/**
 * Personlaiation Module
 *  Cutom personalization dispay and data interaction
 * 
 * Personalization Types:
 *  recentlyViewed: saves product data to local storage for later display
 */

export default class Personalization extends PageManager {
    constructor(settings) {
        super();

        this.type = settings.type;
        this.savedLimit = 20;
    }


    /**
     * Saves the viewed product object to localstorage
     * @param {} product as parsed json 
     */
    saveViewed(product){
        if( window.localStorage ){
            let savedArray = this.getViewed(),
                isSaved = false;

            savedArray = savedArray === null ? [] : savedArray;
           
            // make sure we are not saving this again
            for (let i = 0; i < savedArray.length; i++) {
                if(savedArray[i].product_id === product.product_id){
                    isSaved = true;
                    break;
                }
            }

            // put the recently viewed product at the beginning of the array
            if( !isSaved ){
                savedArray.unshift(product);
            }
           
            // if its more than the limit we take off the last one saved
            if( savedArray.length > this.savedLimit ){ savedArray.pop(); }

            savedArray = JSON.stringify(savedArray);

            window.localStorage.setItem(this.type, savedArray);
        }
    }


    getViewed(){
        if( window.localStorage ){
            let saved = window.localStorage.getItem(this.type);
            saved = JSON.parse(saved);
            return saved;
        }
    }
}