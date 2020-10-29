import React, { useContext, useMemo, useReducer } from 'react';
import DrawerContext from '../collection/DrawerContext';
import AppContext from '../collection/AppContext';
import { generateID } from './Utils';

const filter = {
        brandName: {
            name: "Brand",
            key: "brandName",
            items: []
        },
        grade: {
            name: "Grade",
            key: "grade",
            items: []
        },
        ships: {
            name: "Shipping",
            key: "ships",
            items: []
        },
        features: {
            name: "Feature",
            key: "customFilter",
            items: []
        }
    };

export default function FilterOptionControls(props){
    const drawerHook = useContext(DrawerContext);


    const [ filtered, dispatch ] = useReducer((state, action) => {
        switch(action.type){
            case"add":
                return [...state, action.data.value ];

            case "remove":
                return state.filter(item => item !== action.data.value);

            default: return;
        }
    }, []);


    // plucks out the items to be filtered from the products options
    const getFilteredItem = (optionItem) => {
        for (const obj in filter) {
            if( optionItem[filter[obj].key] && !isInFilterArray( filter[obj].items, optionItem[filter[obj].key] ) ){
                
                if( Array.isArray(optionItem[filter[obj].key]) ){
                    optionItem[filter[obj].key].forEach((element) => {
                        if( !isInFilterArray(filter[obj].items, element) ){
                            this.filter[obj].items.push(element);
                        }
                    });

                }else{
                    filter[obj].items.push( optionItem[filter[obj].key] );
                }
            }
        }

        function isInFilterArray(filterArray, filterItem){
            return filterArray.some(ArrVal => filterItem === ArrVal);
        }
    }


    useMemo(() => {
        for (const key in filter) { filter[key].items = []; }

        // set our filterable items in order to determine the controls to build
        if( props.for !== "" ){
            drawerHook[props.for].values.forEach((element) => {
                let labelObj = TEAK.Utils.parseOptionLabel(element.label);
                getFilteredItem(labelObj);
            });
        }

    }, [props.for]);



    const filterBy = (key, e) => {

        if( !filtered.includes(e.currentTarget.name) ){
            dispatch({
                type: "add",
                data: {
                    key: key,
                    value: e.currentTarget.name
                }
            });

        }else{
            dispatch({
                type: "remove",
                data: {
                    key: key,
                    value: e.currentTarget.name
                }
            });
        }

        drawerHook.setFilterable(e.currentTarget.name);
    };


    return(
        <>
        {
            Object.keys(filter).map((item) => {
                if( filter[item].items.length !== 0 ){
                    return  <React.Fragment key={filter[item].key}>
                                <h6 className="drawer__filterHeading">Filter by {filter[item].name}:</h6>
                                <ul className="drawer__filterList">

                        {filter[item].items.map((itemValue) => {
                            let filterText = filter[item].name === "Grade" ? `Grade ${itemValue}` : itemValue;

                            return  <li className="drawer__filterListItem" key={generateID()}>
                                        <label className="drawer__filterLabel">
                                            <input 
                                                type="checkbox"
                                                checked={filtered.includes(`${filter[item].key}=${itemValue}`)} 
                                                className="drawer__filterControl" 
                                                name={`${filter[item].key}=${itemValue}`}
                                                onChange={(e) => filterBy(filter[item].key, e )}
                                            />
                                            <span className="drawer__filterLabelText">
                                                {filterText}
                                            </span>
                                        </label>
                                    </li>
                        })}
                        
                                </ul>
                            </React.Fragment>

                }
            })
        }
        </>
    );
}
