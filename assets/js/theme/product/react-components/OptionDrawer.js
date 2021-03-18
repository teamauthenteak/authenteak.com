import React from 'react';
import { Spring, animated } from 'react-spring/renderprops';

import AppContext from './context/AppContext';
import OptionDrawerFilters from './OptionDrawer-Filters';
import DrawerContext from './context/DrawerContext';
import uniq from 'lodash/uniq';

export default class OptionDrawer extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            for: "",
            setOption: (args) => {
                this.setState({
                    [args.displayName]: args.optionData
                });
            },
            listType: "list",
            changeList: (type) => {
                this.setState({ listType: type });
            },
            searchKey: "",
            searchOptions: (e) => {
                this.setState({ searchKey: e.currentTarget.value })
            },
            filterOptionControlState: false,
            toggleFilterOptionControls: () => {
                this.setState({ filterOptionControlState: !this.state.filterOptionControlState });
            },
            filterBy: [],
            setFilterable: (chosen) => {
                this.setState((state) => {
                    let newState = {...state};

                    if( newState.filterBy.includes(chosen) ){
                        newState.filterBy = newState.filterBy.filter(item => item !== chosen);
                        return newState;

                    }else{
                        return newState.filterBy.push(chosen)
                    }

                });
            }
        };
    }

    static contextType = AppContext;


    componentDidUpdate(prevProps, prevState){
        if( prevProps.for.displayName !== this.props.for.displayName ){
            this.setState({ for: this.props.for.displayName });
        }

        if( prevProps.drawerState !== this.props.drawerState ){
            if( prevState.filterOptionControlState ){
                this.setState({ filterOptionControlState: false });
            }
        }

        if( prevState[this.props.for.displayName] !== this.state[this.props.for.displayName] ){
            let swatchData = this.state[this.props.for.displayName];

            if( swatchData.swatch !== undefined ){

                // for our global swatch controls
                if( this.props.for.type === "global" ){
                    this.context.setOption({
                        displayName: this.props.for.displayName,
                        optionData: {
                            attribute: swatchData.attribute,
                            attributeValue: swatchData.attributeValue,
                            swatch: {
                                label: swatchData.swatch.label,
                                image: swatchData.swatch.image
                            }
                        } 
                    });
                }

                // for a local swatch in a collection pod that has no global ties 
                if( this.props.for.type === "local" ){
                    this.context.setLocalDrawerOption({
                        product_id: this.props.for.product_id,
                        displayName: this.props.for.displayName,
                        optionData: {
                            attribute: swatchData.attribute,
                            attributeValue: swatchData.attributeValue,
                            swatch: {
                                label: swatchData.swatch.label,
                                image: swatchData.swatch.image
                            }
                        } 
                    });
                }
            }
        }  
    }


    componentDidMount(){
        this.setState((state) => {
            let newState = {...state};

            newState[this.props.for.displayName] = {
                attribute: parseInt(this.props.for.id),
                attributeValue: null,
                values: this.props.options
            };
        
            return newState;
        });
    }



    render(){
        const appHook = this.context;
        const key = this.state.searchKey.toLowerCase();
        const isIncluded = [];

        /* 
            Build our initial filtered list of potential objects that 
            match one or more options or searched keywords
        */

        // by keyword
        if( key !== "" ){
            this.props.options.forEach((element) => {
                let label = element.label.toLowerCase();
    
                if( label.includes(key) ){
                    isIncluded.push(element);
                }
            });
        }
        

        // by option value
        if ( this.state.filterBy.length !== 0 ){
            for (let i = 0; i < this.state.filterBy.length; i++) {
                let keyValue = this.state.filterBy[i].split("=");
                
                this.props.options.forEach((element) => {
                    if( element[keyValue[0]] === keyValue[1] ){
                        isIncluded.push(element);
                    }
                });
            }
        }


        // dup check and reduce
        let filteredOpts = uniq(isIncluded);


        // check and output the final results
        const results = ( key === "" && filteredOpts.length === 0 ) ? this.props.options.map(item => item) : filteredOpts.filter((item) => {
            let shouldInclude = [];


            // so...does this option match all of my choices?
            for (let i = 0; i < this.state.filterBy.length; i++) {
                let keyValue = this.state.filterBy[i].split("=");

                shouldInclude.push( item[keyValue[0]] === keyValue[1] );
            }

            // ...and does it have my searched keyword?
            if( key !== "" ){
                shouldInclude.push( item.label.toLowerCase().includes(key) )
            }

            // Thus, if the whole object passes the test add it to the filtered array!
            return shouldInclude.every(testOpt => testOpt === true);
        });


        const hasChosenSwatch = this.state[this.props.for.displayName] && this.state[this.props.for.displayName].swatch !== undefined;
    

        return(
            <DrawerContext.Provider value={this.state}>
                { Object.keys(this.props.for).length > 0 &&
                    <>
                        <div className="drawer__content">
                            <div className={`drawer__main drawer__main--${appHook.drawerState}`}>
                                <button type="button" className="drawer__close" drawer--close="true" onClick={() => appHook.toggleDrawer("close")}>
                                    <svg className="drawer__closeIcon"><use xlinkHref="#icon-close" /></svg>
                                </button>

                                <h2 className="drawer__contentHeading">
                                    {this.props.for.displayName}
                                </h2>

                                <figure className="drawer__figCntr" 
                                    style={{ 
                                        backgroundImage: `url("${hasChosenSwatch ? this.state[this.props.for.displayName].swatch.image : this.props.mainImg}")`,
                                        backgroundRepeat: `${hasChosenSwatch ? "repeat" : "no-repeat"}` 
                                    }}>
                                    <span className="drawer__imgCntr">
                                        <img src={hasChosenSwatch ? this.state[this.props.for.displayName].swatch.image : this.props.mainImg } className="drawer__img" />
                                    </span>
                                    <figcaption className="drawer__selectedSwatchText">
                                        {hasChosenSwatch ? this.state[this.props.for.displayName].swatch.label : "" }
                                    </figcaption>
                                </figure>

                                { this.state[this.props.for.displayName] !== undefined ? 
                                    <OptionDrawerFilters options={results} for={this.props.for} /> 
                                : null }
                               
                            </div>
                        </div>

                        <Spring native to={{ bottom: hasChosenSwatch ? 0 : -90 }} config={{ duration: 150, mass: 5, tension: 500, friction: 0 }}>
                            {props =>   (<animated.footer className="drawer__footer drawer__footer--show" style={props}>
                                            <button type="button" className="drawer__saveBtn" onClick={() => appHook.toggleDrawer("close")}>
                                                <svg className="icon icon-long-arrow-left"><use xlinkHref="#icon-long-arrow-left" /></svg>
                                                <span>Save &amp; Back</span>
                                            </button>
                                        </animated.footer>)}
                        </Spring>
                        
                    </>
                }
            </DrawerContext.Provider>
        );
    }

}