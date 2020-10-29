import React from 'react';
import ReactDOM from 'react-dom';
import PageManager from '../PageManager';
import App from './product/collection/App';
import Firebase, { FirebaseContext } from './product/react-components/services/Firebase';


export default class PDPCollections extends PageManager {
    constructor(props){
        super(props);
        this.init(props);
    }

    init(props) {
        ReactDOM.render(
            <FirebaseContext.Provider value={new Firebase()}>
                <App context={props} />
            </FirebaseContext.Provider>,
            document.getElementById("pdpCollectionsRoot")
        );
    }
}