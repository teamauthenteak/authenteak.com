import React, { useContext } from 'react';
import { useSpring, animated } from 'react-spring';
import { useMeasure } from 'react-use'

import DrawerContext from './context/DrawerContext';
import OptionDisplayButton from './OptionDrawer-DisplayBtn';
// import OptionSearch from './OptionDrawer-Search';
import OptionFilterControls from './OptionDrawer-FilterOptionControls';
import OptionFilterBtn from './OptionDrawer-FilterOptionBtn';
import Swatch from './Swatch';

export default function OptionDrawerFilters(props){
    const drawerHook = useContext(DrawerContext);

    const [ bind, { height } ] = useMeasure();

    const changeSwatch = (swatchData) => {
        drawerHook.setOption({
            displayName: props.for.displayName,
            optionData: {
                attribute: parseInt(props.for.id),
                attributeValue: parseInt(swatchData.id),
                swatch: {
                    label: swatchData.label,
                    image: swatchData.pattern
                }
            }
        });
    }

    const slideHeightToggle = useSpring({ 
        height: drawerHook.filterOptionControlState ? height : 0
    });

    return(
        <form className="drawer__filtersForm">
            <div className="drawer__topCntr">
                <ul className="drawer__displayList">
                    {/* <li className="drawer__displayItem drawer__displayItem--search">
                        <OptionSearch />
                    </li> */}
                    <li className="drawer__displayItem drawer__displayItem--filters">
                        <OptionFilterBtn />
                    </li>
                    <li className="drawer__displayItem">
                        <OptionDisplayButton type="grid" />
                    </li>
                    <li className="drawer__displayItem">
                        <OptionDisplayButton type="list" />
                    </li>
                </ul>
                
                <animated.div className="drawer__filterControlCntr show" style={slideHeightToggle}>
                    <div ref={bind}>
                        <OptionFilterControls for={props.for.displayName} />
                    </div>
                </animated.div>
                
            </div>
            <div className="drawer__contentCntr">
                <div className="drawer__swatchControls">
                    <div className={`form-field-control drawer__controls--${drawerHook.listType}`}>
                        {props.options.length > 0 ? 
                            props.options.map((item) => {
                                return  <Swatch 
                                            id={item.id}
                                            img={item.pattern}
                                            label={item.label}
                                            option={item}
                                            drawerType={props.for.type}
                                            type="select" 
                                            isChecked={drawerHook[props.for.displayName].attributeValue === item.id}
                                            for={props.for.displayName} 
                                            key={item.id.toString()} 
                                            selected={changeSwatch} 
                                        />
                            })
                        :
                            <h3 className='drawer__sorryMessage'>Sorry, but it looks like we don't have any swatches that match your filters.</h3>
                        }
                    </div>
                </div>
            </div>
        </form>
    );
}


