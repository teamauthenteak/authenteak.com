import firebase from 'firebase/app';
import 'firebase/firestore';

export default class Firebase{
    constructor(){        
        if( !firebase.apps.length ) {
            firebase.initializeApp(TEAK.Globals.firebase.config);   
        }

        this.db = firebase.firestore();

        this.productSections = this.db.collection("site").doc("product").collection("section");
        this.productTips = this.db.collection("site").doc("product").collection("tool_tips");

        this.state = {
            brands: {},
            elements: {}
        }
    }


    pdpInit = () => {
        this.getOptionBrands().then((response) => { this.state.brands =response });
        this.getElementTips().then((response) => { this.state.elements = response });
    }


    // get all brands with options
    getOptionBrands = () => {
        return this.productTips.doc("brands").get().then((doc) => {
            if( doc.exists ){
                return doc.data();
            }
        }).catch(this.failure);
    };



    // get a specific brand with option tips
    getBrandOptionTips = (collection) => {
        return this.productTips.doc("brands").collection(collection).get()
            .then((querySnapshot) => querySnapshot)
            .catch(this.failure);
    };



    // get all tool tips for pdp page elements
    getElementTips = () => {
        return this.productTips.doc("elements").get().then((doc) => {
            if( doc.exists ){
                return doc.data();
            }
        }).catch(this.failure);
    };



    // get custom PDP Sections (Tabs)
    getProductSections = (sectionName) => {
        return this.productSections.doc(sectionName).get().then((doc) => {
            if( doc.exists ){
                return doc.data();
            }
        }).catch((error) => {
            return error;
        });
    };

}


