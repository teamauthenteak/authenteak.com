import React from 'react';
import Slider from 'react-slick';
import GraphQL from '../../graphql/GraphQL';
import ProductSwatchModal from '../ProductSwatchModal';
import Tabs from '../component/Tabs';
import Swatch from '../component/Swatch';
import Select from '../component/Select';


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

        this.state = {};

        this.sliderSettings = {
            ...settings.slider,
            customPaging: (i) => {
                let imgSrc = replaceSize(props.context.product.images[i].data, 100);
                return  <a className="product__figSliderLink">
                            <img src={imgSrc} alt={props.context.product.images[i].alt} />
                        </a>;
            }
        };

    }

    render(){
        return(
            <>
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
                        <h1 className="product__title">{this.props.context.product.title}</h1>
                        <p className="product__desc product__desc--margin">{this.props.context.product.meta_description}</p>
                                                
                        <h4 className="product__title product__title--noMargin product__title--customizePDP">Customize Your Collection</h4>
                        <div className="product__swatchCol">
                            <ul className="product__swatchList">
                                {this.props.context.product.options.map((item, index) => {
                                    return item.partial === "swatch" ? <Swatch key={index} displayName={item.display_name} id={item.id} values={item.values} /> : <Select key={index} displayName={item.display_name} id={item.id} values={item.values} />;
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="product__row" id="productMetaTabs">
                    <div className="product__col-1-1">
                        <Tabs data={this.props.context.product.description} warrantyTab={this.props.context.product.warranty} />
                    </div>
                </div>
            </>
        )
    }
}

export default App;