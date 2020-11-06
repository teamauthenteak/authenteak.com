import _ from "lodash";

/** -------------------------------
 * Utility Helper Methods
 * Call upon then when needed
---------------------------------- */


const replaceSize = (img, size) => {
    return img.replace('{:size}', `${size}x${size}`);
};

/**
 * Format USD Price
 * @param {Integer} price 
 */

const formatPrice = (price) => {
    return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};



/**
 * Full storage setting of storage
 * @param {String} key 
 * @param {Object} data 
 * @param {String} type - the type of storage operation
 */

const setStorage = (key, data, type) => {
    if( type === "local" ){
        if( window.localStorage ){
            window.localStorage.setItem(key, JSON.stringify(data));
        }

    }else{
        if( window.sessionStorage ){
            window.sessionStorage.setItem(key, JSON.stringify(data));
        }

    }    
};



/**
 * full service get storage
 * @param {String} key 
 */
const getStorage = (key) => {
    let stored = window.sessionStorage ? window.sessionStorage.getItem(key) : null;

    if(!stored){
        stored = window.localStorage ? window.localStorage.getItem(key) : {};
    }
           
    try{           
        return JSON.parse(stored);
    }
    catch(e){}
}



/**
 * Full service adding to existing storage
 * @param {String} key 
 * @param {Object} data 
 */

const addToStorage = (key, data) => {
    let storedItem = getStorage(key);

    if( Array.isArray(storedItem) ){
        storedItem.push(data);
        setStorage(key, storedItem, "local");

    }else{
        let arr = [];

        arr.push(data);
        setStorage(key, arr, "local");
    }
}



// generate "unique" alpha numeric id
const generateID = () => Math.random().toString(36).substring(7);



export { 
    replaceSize,
    addToStorage,
    generateID,
    setStorage,
    getStorage,
    formatPrice
};
