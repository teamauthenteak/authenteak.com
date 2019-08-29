/**
 *  Global Namespace Object { TEAK }
 *  Usage: 
 *      - Primarly used to share data between the View & Model
 *      and other third party modules outside of the application 
 *      scope of app.js and its compilation
 */
window.TEAK = window.TEAK || {};


/** -----------------------------------------
 * TEAK Data
 * Store Model View data for interactions
 * ------------------------------------------ */
window.TEAK.Data = {};


/** -----------------------------------------
 * TEAK Modules
 * Module Controllers for external scripts
 * ------------------------------------------ */
window.TEAK.Modules = {};


/** -----------------------------------------
 * TEAK Utility Methods
 * Global helper mehtods for any application
 * ------------------------------------------ */
window.TEAK.Utils = {

    isHandheld: window.matchMedia("only screen and (max-width: 900px)").matches,


    getProductTipData: function(){
        let data = this.getTagData("productTipsJSON");
        return data ? data : this.getJsonData("/assets/js/theme/product.json");
    },

    
    getMenuData: function(){
        let data = this.getTagData("megaMenuEnhancement");
        return data ? data : this.getJsonData("/assets/js/theme/header.json");
    },


    getTagData: (id) => {
        var data;

        if(document.getElementById(id) && window.location.hostname !== "localhost"){
            data = document.getElementById(id).innerHTML;
            data = data ? JSON.parse(data) : {};

        }else{
            return false;
        }

        return data;
    },


    getJsonData: (path) => {
        let responseData;

        // run it on on our local
        $.ajax({
            dataType: "json",
            url: path,
            async: false,
            success: (res) => { responseData = res; }
        });

        return responseData;
    },






    /**
     * Picks out the cart resonse if its a JSON object and if it has cart.php
     * Saving this to local storage and emmiting an event with the data
     * for anybody to pick up to use in the view
     */
    saveCartResponse: (response) => {
        var event, storedData = JSON.stringify(response);
    
        window.localStorage.setItem('cartData', storedData);
    
        if( typeof(Event) === 'function' ) {
            event = new Event('cartDataStored');
            
        }else{
            event = document.createEvent('cartDataStored');
            event.initEvent('submit', true, true);
        }
    
        window.dispatchEvent(event);
    
        return this;
    }

};
