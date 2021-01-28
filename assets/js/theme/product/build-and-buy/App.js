import React from 'react';
import { Spring, animated } from 'react-spring/renderprops';
import Slider from 'react-slick';

import AppContext from '../react-components/context/AppContext';
import GraphQL from '../../graphql/GraphQL';
import ErrorBoundary from '../react-components/ErrorBoundary';
import { firebaseService } from '../react-components/services/Firebase/index';
import { generateID, replaceSize } from '../react-components/Utils';

import Tabs from '../react-components/Tabs';
import Swatch from '../react-components/Swatch';
import OptionDrawer from '../react-components/OptionDrawer';
import CollectionPod from '../react-components/Collection-Pod';
import CollectionPreloader from '../react-components/Collection-Preloader';
import StickyCart from '../react-components/StickyCart';
import RequestSwatch from '../react-components/RequestSwatch';
import LazyImg from '../react-components/LazyImg';
import SuggestedProductLayouts from '../react-components/SuggestedProductLayouts';
import PointOfPurchaseModal from '../react-components/Modal-PointOfPurchase';


class App extends React.Component{
    constructor(props){
        super(props);

        this.graphQL = new GraphQL();

        // get our initial firebase objects to use later in the app
        this.props.firebase.pdpInit();

        this.collection = [];
        this.description = "";

        props.context.custom_fields.forEach(element => {
            switch(element.name){
                case "collection_products":
                    this.collection = element.value.split(",");
                    break;

                case "configurator_description":
                    this.description = element.value;

                default: return;
            }
        })

        this.state = {
            product: props.context,
            customizeThis: [],
            showPointOfPurchase: false,
            collection: [],
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
            product_id: parseInt(props.context.id),
            setOption: (args) => {
                this.setState({
                    [args.displayName]: args.optionData
                });
            },
            locallyDrawerSelectedOptions: {},
            setLocalDrawerOption: (args) => {
                this.setState((state) => {
                    let newState = {...state};
                    newState.locallyDrawerSelectedOptions[args.product_id] = {
                        [args.displayName]: {...args}
                    };
                    return newState;
                });
            },
            suggestedLayout: {},
            displaySuggestedLayout: (data) => {
                this.setState({
                    suggestedLayout: data
                });
            }
        };

        this.sliderSettings = {
            ...TEAK.Globals.collections.pdpSlider,
            customPaging: (i) => {
                let img = props.context.images[i];
                let imgSrc = replaceSize(img.data, 100), lowQuality = replaceSize(img.data, 10);

                return  <a className="product__figSliderLink" href="#">
                            <LazyImg src={imgSrc} alt={img.alt} placeholder={lowQuality} className="product__figImg" />
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
                id: args.id,
                type: "global"
            }
        });
    }


    
    componentDidMount(){
        this.props.context.options.forEach(element => {
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
        this.requestedCollection = this.collection.map(element => parseInt(element));

        let requested = [...this.requestedCollection];
        requested = requested.slice(0, 7);

        const requestedQuery = this.graphQL.getProductDetailInfo({ arr: requested });

        this.getRequestedProducts(requestedQuery);
    }



    componentDidUpdate(prevProps, prevState){
        // set each collection with a tool tip flag if its available
        if( prevState.collection !== this.state.collection && this.props.firebase.state.brands.brandNames !== undefined ){

            this.state.collection.forEach((element) => {
                element.hasTips = this.props.firebase.state.brands.brandNames.findIndex(item => item.name === element.brand.name ) !== -1 
            });
        }
    }




    getRequestedProducts = (query) => {
        this.graphQL.get(query).then((response) => {
            let arr = [], orderedArr = [];

            if( response.site.products.edges.length ){

                response.site.products.edges.forEach((element) => {
                    arr.push(element.node);
                }); 

                // make sure our collection order matches the order in the backend
                this.requestedCollection.forEach((item) => {
                    let tempObj = arr.find(element => element.entityId === item);

                    if( tempObj ){ 
                        orderedArr.push(tempObj); 
                    }
                });

                this.setState((state) => { 
                    let newState = {...state};
                    newState.collection = [...this.state.collection, ...orderedArr];
                    return newState;

                }, () => {
                    const requestedLength = this.requestedCollection.length;
                    const currentLength = this.state.collection.length;

                    if( currentLength < requestedLength ){

                        let remaining = [...this.requestedCollection];                   
                        remaining = remaining.splice(currentLength, requestedLength -1);

                        const remainingQuery = this.graphQL.getProductDetailInfo({ arr: remaining });

                        this.getRequestedProducts(remainingQuery);
                    }
                });

            }
            
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
        const product = this.props.context;

        return(
            <AppContext.Provider value={this.state}>
                <ErrorBoundary>

                    <div className="product product__collections">
                        <div className="product__collections--sliderCntr">
                            <Slider {...this.sliderSettings} >
                                {product.images.map((item) => {
                                    let imgSrc = replaceSize(item.data, 500), lowQuality = replaceSize(item.data, 10);
                            
                                    return  <figure className="product__figure product__figure--full" key={generateID()}>
                                                <LazyImg src={imgSrc} className="product__figImg" placeholder={lowQuality} alt={item.alt} />
                                            </figure>
                                })}
                            </Slider>
                        </div>
                        <div className="product__collections--customizeCntr">
                            <strong className="product__title product__title--upperBadge">Step 1</strong>

                            <h1 className="product__title">Build Your Own {product.title}</h1>
                            <p className="product__desc product__desc--margin">{this.description}</p>
                                                    
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

                    <div className="product__layouts">
                        <SuggestedProductLayouts data={this.props.context.custom_fields} type="static"/>
                    </div>

                    <StickyCart cart={this.state.cart} cartStatus={this.cartUpdate} />
                    
                    <div className="product__collectionsCntr">
                        { this.state.collection ? 
                            this.state.collection.map((item) => {
                                return  <CollectionPod 
                                            key={item.entityId.toString()} 
                                            product={item} 
                                            suggested={this.state.suggestedLayout}
                                            localDrawerOptions={this.state.locallyDrawerSelectedOptions[item.entityId]}
                                        />
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

export default firebaseService(App);