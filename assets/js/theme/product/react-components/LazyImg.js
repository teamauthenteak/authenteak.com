import React, { useEffect, useMemo } from 'react';
import LazyLoad from 'vanilla-lazyload';

if ( !document.lazyLoadInstance ) {
    document.lazyLoadInstance = new LazyLoad({
        elements_selector: ".lazy--img"
    });
}

export default function LazyImg(props){
    const { alt, src, srcset, sizes, width, height, className } = props;

    useEffect(() => {
        document.lazyLoadInstance.update();
    });

    return(
        <img 
            alt={alt}
            className={`${className} lazy--img`}
            data-src={src}
            data-srcset={srcset}
            data-sizes={sizes}
            width={width}
            height={height} 
        />
    );
}
