import React, { useEffect, useRef } from 'react';

// stores a previous value for comparison in Hooks
// FYI... instantiates as undefined
export default function usePrevious(value){
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}