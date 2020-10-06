import React, { Component } from 'react';
import AppContext from './AppContext';
import GraphQL from '../../graphql/GraphQL';

import Slider from 'react-slick';
import Tabs from '../react-components/Tabs';
import Swatch from '../react-components/Swatch';
import Select from '../react-components/Select';
import OptionDrawer from '../react-components/OptionDrawer';
import CollectionPod from '../react-components/Collection_Pod';
import CollectionPreloader from '../react-components/Collection__Preloader';
import ErrorBoundary from '../react-components/ErrorBoundary';

const replaceSize = (img, size) => {
    return img.replace('{:size}', `${size}x${size}`);
};

const settings = {
    slider: {
        className: "product__figSlider",
        dots: true,
        arrows: false,
        dotsClass: "product__figSliderThumbs",
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        lazyLoad: true   
    }
};


class App extends React.Component{
    constructor(props){
        super(props);

        this.graphQL = new GraphQL();

        this.collection = props.context.product.custom_fields.find(element => element.name === "collection").value.split(",");

        this.state = {
            customizeThis: [],
            drawerState: "close",
            drawerOptions: [],
            drawerControl: {},
            product_id: parseInt(props.context.product.id),
            toggleDrawer: (position) => {
                this.setState({ drawerState: position })
            },
            setOption: (args) => {
                this.setState({
                    [args.displayName]: args.optionData
                });
            },
            setDrawer: (args) => {
                this.setState({
                    drawerOptions: args.drawerOptions,
                    drawerControl: args.drawerControl
                });
            }
        };

        this.sliderSettings = {
            ...settings.slider,
            customPaging: (i) => {
                let img = props.context.product.images[i];
                let imgSrc = replaceSize(img.data, 100);

                return  <a className="product__figSliderLink">
                            <img src={imgSrc} alt={img.alt} />
                        </a>;
            }
        };

        this.toggleDrawer = this.toggleDrawer.bind(this);
    }


    /*  
        On option change send to BC string - utils.api.productAttributes.optionChange
        "action=add&product_id=2864&attribute[82102]=2519353&attribute[82103]=2519358&attribute[82104]=2519487&qty[]=1"

        action: add
        attribute[82102]: 2519353
        attribute[82103]: 2519358
        attribute[82104]: 2519487
        product_id: 2864
        qty[]: 1

        utils.api.productAttributes.optionChange() = optionChange(productId, params, template = null, callback)
    */

    optionChange(){

    }


    toggleDrawer(args){
        this.setState({
            drawerState: "open",
            drawerOptions: args.values,
            drawerControl: {
                displayName: args.displayName,
                id: args.id
            }
        });
    }


    componentDidMount(){
        this.props.context.product.options.forEach(element => {
            console.log(element.partial)
            this.setState((state) => {
                let newState = {...state};

                newState[element.display_name] = {
                    attribute: parseInt(element.id),
                    attributeValue: null
                };

                newState.customizeThis.push(element.partial === "swatch" ? element.display_name.split("Select ")[1] : "");

                return newState;
            });
        });


        // Fetch the collection's products
        // test: 7965, 2881, 2879, 2883, 2877
        this.collection = this.collection.map(element => parseInt(element) );
        let collectionProducts = this.graphQL.getProductDetailInfo(this.collection);

        this.graphQL.get(collectionProducts).then((response) => {
            let arr = [];

            response.site.products.edges.forEach(element => arr.push(element.node)); 
            this.setState({ collection: arr });
        });
        
    }


    render(){
        return(
        <AppContext.Provider value={this.state}>
            <ErrorBoundary>
                <div className="product">
                    <div className="product__col-2-3">
                        <Slider {...this.sliderSettings} >
                            {this.props.context.product.images.map((item, index) => {
                                let imgSrc = replaceSize(item.data, 500);
                                return <figure className="product__figure product__figure--full" key={index}>
                                            <img src={imgSrc} className="product__figImg" alt={item.alt} />
                                        </figure>
                            })}
                        </Slider>
                    </div>
                    <div className="product__col-1-3">
                        <h1 className="product__title">Build Your {this.props.context.product.title}</h1>
                        <p className="product__desc product__desc--margin">{this.props.context.product.meta_description}</p>
                                                
                        <h4 className="product__title product__title--noMargin product__title--customizePDP">
                            Customize {this.state.customizeThis.join("/")}
                        </h4>
                        <div className="product__swatchCol">
                            <ul className="product__swatchList" id="customize">
                                {this.props.context.product.options.map((item, index) => {
                                    if(item.partial === "swatch") {
                                        return <Swatch 
                                                key={index} 
                                                toggle={this.toggleDrawer} 
                                                displayName={item.display_name} 
                                                id={item.id} 
                                                values={item.values} 
                                                type="global"
                                            /> 
                                    }
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="product__row no-pad">
                    <div className="product__col-1-1 pad-left">
                        <h2 className="product__title no-margin">Build Your Custom {this.props.context.product.title}</h2>
                    </div>
                </div>

                <div className="product__col-1-1 no-pad" id="collectionsCntr">
                    { this.state.collection ? 
                        this.state.collection.map((item, index) => {
                            return <CollectionPod product={item} key={index} />
                        })
                        :
                        <CollectionPreloader />
                    }
                </div>


                <div className="product__row" id="productMetaTabs">
                    <div className="product__col-1-1">
                        <Tabs data={this.props.context.product.description} warrantyTab={this.props.context.product.warranty} />
                    </div>
                </div>

                <OptionDrawer toggle={this.state.toggleDrawer} options={this.state.drawerOptions} for={this.state.drawerControl} />
            
            </ErrorBoundary>
        </AppContext.Provider>
        )
    }
}

export default App;