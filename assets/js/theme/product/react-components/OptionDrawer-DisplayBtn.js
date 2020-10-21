import React, { useContext } from 'react';
import DrawerContext from '../collection/DrawerContext';

export default function OptionDisplayButton(props){
    const drawerHook = useContext(DrawerContext);

    return(
        <button type="button" name={`${props.type} button`} className={`drawer__displayType ${drawerHook.listType === props.type ? "drawer__displayType--active" : "" }`} onClick={() => drawerHook.changeList(props.type)}>
            <svg className={`icon icon-${props.type}`}><use xlinkHref={`#icon-${props.type}`} /></svg>
        </button>
    )
}