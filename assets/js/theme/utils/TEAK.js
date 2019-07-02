// Global Namespace Object
window.TEAK = window.TEAK || {};

window.TEAK.Modules = {};
window.TEAK.Utils = {};


/* 
    Picks out the cart resonse if its a JSON object and if it has cart.php
    Saving this to local storage and emmiting an event with the data
    for anybody to pick up to use in the view
*/
TEAK.Modules.saveCartResponse = (response) => {
    let event, storedData = JSON.stringify(response);

    window.localStorage.setItem('cartData', storedData);

    if( typeof(Event) === 'function' ) {
        event = new Event('cartDataStored');
        
    }else{
        event = document.createEvent('cartDataStored');
        event.initEvent('submit', true, true);
    }

    window.dispatchEvent(event);
};