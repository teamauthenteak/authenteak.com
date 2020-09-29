import React from 'react';
import ReactDOM from 'react-dom';
import PageManager from '../PageManager';
import App from './product/collection/App';


export default class PDPCollections extends PageManager {
    constructor(props){
        super(props);
        this.init(props);
    }

    init(props) {
        ReactDOM.render(
            <App context={props} />, document.getElementById("pdpCollectionsRoot")
        );
    }
}