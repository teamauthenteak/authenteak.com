import React from 'react';
import { Spring, animated } from 'react-spring/renderprops';
import Slider from 'react-slick';

import AppContext from './AppContext';
import GraphQL from '../../graphql/GraphQL';

import Tabs from '../react-components/Tabs';
import Swatch from '../react-components/Swatch';
import OptionDrawer from '../react-components/OptionDrawer';
import CollectionPod from '../react-components/Collection-Pod';
import CollectionPreloader from '../react-components/Collection-Preloader';
import ErrorBoundary from '../react-components/ErrorBoundary';
import StickyCart from '../react-components/StickyCart';
import RequestSwatch from '../react-components/RequestSwatch';
import LazyImg from '../react-components/LazyImg';
import { generateID, replaceSize } from '../react-components/Utils';
import SuggestedProductLayouts from '../react-components/SuggestedProductLayouts';
import PointOfPurchaseModal from '../react-components/Modal-PointOfPurchase';


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

        this.collection = props.context.product.custom_fields.find(element => element.name === "collection_products").value.split(",");

        this.state = {
            product: props.context.product,
            customizeThis: [],
            showPointOfPurchase: false,
            cart: {},
            addToCart: (data) => {
                this.setState((state) => {
                    let newState = {...state};
                    newState.cart[data.product_id] = (data);
                    return newState;
                })
            },
            drawerState: "close",
            toggleDrawer: (position) => {
                this.setState({ 
                    drawerState: position 
                })
            },
            setDrawer: (args) => {
                this.setState({
                    drawerOptions: args.drawerOptions,
                    drawerControl: args.drawerControl
                });
            },
            requestSwatchesState: "close",
            toggleRequestSwatch: (position) => {
                this.setState({ requestSwatchesState: position })
            },
            drawerOptions: [],
            drawerControl: {},
            product_id: parseInt(props.context.product.id),
            setOption: (args) => {
                this.setState({
                    [args.displayName]: args.optionData
                });
            },
            suggestedLayout: {},
            displaySuggestedLayout: (data) => {
                this.setState({
                    suggestedLayout: data
                })
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
    }



    toggleDrawer = (args) => {
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
            this.setState((state) => {
                let newState = {...state};

                if( !element.display_name.toLowerCase().includes("protective cover") ){
                    newState[element.display_name] = {
                        attribute: parseInt(element.id),
                        attributeValue: null
                    };
                }
               
                if(element.partial === "swatch"){
                    newState.customizeThis.push(element.display_name.split("Select ")[1]);
                }

                return newState;
            });
        });



        // Fetch the collection's products
        // test: "7965, 2848, 2881, 2879, 2883, 2877, 2847"
        let collection = this.collection.map(element => parseInt(element) );
        let collectionProducts = this.graphQL.getProductDetailInfo(collection);

        this.graphQL.get(collectionProducts).then((response) => {
            let arr = [], orderedArr = [];

            response.site.products.edges.forEach(element => arr.push(element.node)); 

            // make sure our collection order matches the order in the backend
            collection.forEach((item) => {
                let tempObj = arr.find(element => element.entityId === item);
                orderedArr.push(tempObj);
            });

            this.setState({ collection: orderedArr });
        });

    }



    cartUpdate = (status) => {
        if( status === 202 ){
            this.setState({ 
                cart: {},
                showPointOfPurchase: true
            });
        }
    }



    render(){
        const product = this.props.context.product;

        return(
            <AppContext.Provider value={this.state}>
                <ErrorBoundary>

                    <div className="product product__collections">
                        <div className="product__collections--sliderCntr">
                            <Slider {...this.sliderSettings} >
                                {product.images.map((item) => {
                                    let imgSrc = replaceSize(item.data, 500);

                                    return  <figure className="product__figure product__figure--full" key={generateID()}>
                                                <LazyImg src={imgSrc} className="product__figImg" alt={item.alt} />
                                            </figure>
                                })}
                            </Slider>
                        </div>
                        <div className="product__collections--customizeCntr">
                            <h1 className="product__title">Build Your Own {product.title}</h1>
                            <p className="product__desc product__desc--margin">{product.meta_description}</p>
                                                    
                            <h4 className="product__title product__title--noMargin product__title--customizePDP">
                                Customize {this.state.customizeThis.join("/")} Color
                            </h4>
                            <div className="product__swatchCol">
                                <ul className="product__swatchList" id="customize">
                                    {product.options.map((item) => {
                                        if(item.partial === "swatch") {
                                            return <Swatch 
                                                    key={item.id} 
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
                            <button type="button" className="product__swatchRequestBtn--collections" onClick={() => this.state.toggleRequestSwatch("open")}>
                                <svg className="product__swatchRequestIcon--collections"><use xlinkHref="#icon-style" /></svg>
                                <p className="product__swatchRequestText--collections">
                                    <span>Order Free Swatches <svg className="icon"><use xlinkHref="#icon-long-arrow-right" /></svg></span>
                                    <small>Free Ground Shipping on All Swatches</small>
                                </p>
                            </button>
                        </div>
                    </div>

                    <SuggestedProductLayouts data={this.props.context.product.custom_fields} />

                    <StickyCart cart={this.state.cart} cartStatus={this.cartUpdate} />
                    
                    <div className="product__collectionsCntr">
                        { this.state.collection ? 
                            this.state.collection.map((item) => {
                                return <CollectionPod key={item.entityId.toString()} product={item} suggested={this.state.suggestedLayout} />
                            })
                            :
                            <CollectionPreloader />
                        }
                    </div>

                    <div className="product__row">
                        <div className="product__col-1-1">
                            <Tabs data={product.description} warrantyTab={product.warranty} />
                        </div>
                    </div>

                    <Spring native to={{ right: this.state.drawerState === "open" ? "0vw" : "-110vw" }}>
                        { props =>  (<animated.aside className="drawer drawer--options" style={props}>
                                        {this.state.drawerState === "open" ? 
                                            <OptionDrawer 
                                                mainImg={replaceSize(product.main_image.data, 200)} 
                                                drawerState={this.state.drawerState}
                                                toggle={this.state.toggleDrawer} 
                                                options={this.state.drawerOptions} 
                                                for={this.state.drawerControl} 
                                            />
                                        :null}
                                    </animated.aside>)
                        }
                    </Spring>
                    <div className={`drawer__overlay drawer__overlay--${this.state.drawerState}`} onClick={() => this.state.toggleDrawer("close")}></div>


                    {this.state.requestSwatchesState === "open" ? 
                        <RequestSwatch /> 
                    :null }

                    {this.state.showPointOfPurchase ? <PointOfPurchaseModal /> : null}
                
                </ErrorBoundary>
            </AppContext.Provider>
        );
    }
}

export default App;