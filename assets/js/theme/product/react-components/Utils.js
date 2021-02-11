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





/**
 * Validates that all required options are selected before adding to cart on a Collections page
 * @param {array} args.options - all available option types to be selected
 * @param {array} args.swatches  - all selected swatches
 * @param {array} args.dropdown - all user selected dropdown
 * @param {array} args.invalidSwatch - all bad swatches
 * @param {array} args.invalidDropdown - all bad dropdown
 * @param {function} args.setInvalidSwatch - callback to notify of any invalid swatches
 * @param {function} args.setInvalidDropdown - callback to notify of any invalid swatches
 */

const areSelectionsValid = (args) => {
    let arr = [];

    args.options.forEach(element => {
        switch(element.node.displayStyle){
            case "Swatch":
                let isSwatchValid = Object.keys(args.swatches).length !== 0 && args.swatches.hasOwnProperty(element.node.displayName);

                if( !isSwatchValid ){ 
                    if( !args.invalidSwatch.includes(element.node.entityId) ){
                        args.setInvalidSwatch(invalidSwatch => [...invalidSwatch, element.node.entityId]);
                    }

                }else{
                    args.setInvalidSwatch(invalidSwatch => {
                        return invalidSwatch.filter(item => item !== element.node.entityId);;
                    });
                }
                
                arr.push(isSwatchValid);
                break;

            case "DropdownList":
                let isDropdownValid = Object.keys(args.dropdown).length !== 0 && args.dropdown.hasOwnProperty(element.node.displayName);

                // exclude "protective cover" validation
                if( element.node.displayName.toLowerCase().includes("protective cover") ){
                    arr.push(true);
                    break;
                }

                if( !isDropdownValid ){ 
                    if( !args.invalidDropdown.includes(element.node.entityId) ){
                        args.setInvalidDropdown(invalidDropdown => [...invalidDropdown, element.node.entityId]) 
                    }

                }else{
                    args.setInvalidDropdown(invalidDropdown => {
                        return invalidDropdown.filter(item => item !== element.node.entityId);
                    });
                }

                arr.push(isDropdownValid);
                break;

            default: 
                arr.push(true);
                break;
        }
    });

    return !arr.includes(false);
};



    // Legacy: makes sure all required options are selected before adding to cart
    // const areSelectionsValid = () => {
    //     let arr = [];

    //     options.forEach(element => {
    //         switch(element.node.displayStyle){
    //             case "Swatch":
    //                 let isSwatchValid = Object.keys(swatches).length !== 0 && swatches.hasOwnProperty(element.node.displayName);
                    
    //                 if( !isSwatchValid ){ 
    //                     if( !invalidSwatch.includes(element.node.entityId) ){
    //                         setInvalidSwatch(invalidSwatch => [...invalidSwatch, element.node.entityId]);
    //                     }

    //                 }else{
    //                     setInvalidSwatch(invalidSwatch => {
    //                         return invalidSwatch.filter(item => item !== element.node.entityId);;
    //                     });
    //                 }
                    
    //                 arr.push(isSwatchValid);
    //                 break;

    //             case "DropdownList":
    //                 let isDropdownValid = Object.keys(dropdown).length !== 0 && dropdown.hasOwnProperty(element.node.displayName);

    //                 // exclude "protective cover" validation
    //                 if( element.node.displayName.toLowerCase().includes("protective cover") ){
    //                     arr.push(true);
    //                     break;
    //                 }

    //                 if( !isDropdownValid ){ 
    //                     if( !invalidDropdown.includes(element.node.entityId) ){
    //                         setInvalidDropdown(invalidDropdown => [...invalidDropdown, element.node.entityId]) 
    //                     }

    //                 }else{
    //                     setInvalidDropdown(invalidDropdown => {
    //                         return invalidDropdown.filter(item => item !== element.node.entityId);
    //                     });
    //                 }

    //                 arr.push(isDropdownValid);
    //                 break;

    //             default: 
    //                 arr.push(true);
    //                 break;
    //         }
    //     });
    
    //     return arr;
    // };




export { 
    areSelectionsValid,
    replaceSize,
    addToStorage,
    generateID,
    setStorage,
    getStorage,
    formatPrice
};
