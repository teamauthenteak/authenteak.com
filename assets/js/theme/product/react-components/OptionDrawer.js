import React from 'react';
import { Spring, animated } from 'react-spring/renderprops';

import AppContext from '../collection/AppContext';
import OptionDrawerFilters from './OptionDrawer-Filters';
import DrawerContext from '../collection/DrawerContext';


export default class OptionDrawer extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            for: "",
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
        let filteredOpts = _.uniq(isIncluded);


        // check and output the final results
        const results = ( key === "" && filteredOpts.length === 0 ) ? this.props.options.map(item => item) : filteredOpts.filter((item) => {
            let shouldInclude = [];


            // does this option match all of my choices
            for (let i = 0; i < this.state.filterBy.length; i++) {
                let keyValue = this.state.filterBy[i].split("=");
                shouldInclude.push( item[keyValue[0]] === keyValue[1] );
            }

            // and does it have my searched keyword
            if( key !== "" ){
                shouldInclude.push( item.label.toLowerCase().includes(key) )
            }

            // if the whole object passes the test add it to the filtered array
            return shouldInclude.every(testOpt => testOpt === true);
        });

    
        return(
            <DrawerContext.Provider value={this.state}>
                { Object.keys(this.props.for).length > 0 ?
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
                                        backgroundImage: `url("${appHook[this.props.for.displayName].attributeValue ? appHook[this.props.for.displayName].swatch.image : this.props.mainImg}")`,
                                        backgroundRepeat: `${appHook[this.props.for.displayName].attributeValue ? "repeat" : "no-repeat"}` 
                                    }}>
                                    <span className="drawer__imgCntr">
                                        <img src={appHook[this.props.for.displayName].attributeValue ? appHook[this.props.for.displayName].swatch.image : this.props.mainImg } className="drawer__img" />
                                    </span>
                                    <figcaption className="drawer__selectedSwatchText">
                                        {appHook[this.props.for.displayName].attributeValue ? appHook[this.props.for.displayName].swatch.label : "" }
                                    </figcaption>
                                </figure>

                                <OptionDrawerFilters options={results} for={this.props.for} />
                            </div>
                        </div>

                        <Spring native to={{ bottom: appHook[this.props.for.displayName].attributeValue ? 0 : -90 }} config={{ duration: 150, mass: 5, tension: 500, friction: 0 }}>
                            {props => (<animated.footer className="drawer__footer drawer__footer--show" style={props}>
                                            <button type="button" className="drawer__saveBtn" onClick={() => appHook.toggleDrawer("close")}>
                                                <svg className="icon icon-long-arrow-left"><use xlinkHref="#icon-long-arrow-left" /></svg>
                                                <span>Save &amp; Back</span>
                                            </button>
                                        </animated.footer>

                            )}
                        </Spring>
                        
                    </>
                :null}
            </DrawerContext.Provider>
        );
    }

}