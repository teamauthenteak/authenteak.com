import React, { useEffect, useState } from 'react';
import Yotpo from '../../thirdparty/Yotpo';


export default function ReviewStars(props){
    const yotpo = new Yotpo();

    const [ rating, setRating ] = useState({});

    useEffect(() => {
        yotpo.fetchBulk([props.id]).then((response) => {
            setRating(response[0].result);
        });
    }, []);

    return(
        <>
        { rating && 
            <>
                <span className="yotpo-stars-rating" style={{"--rating": rating.average_score}} aria-label={`Rating of ${rating.average_score} out of 5.`}></span>
                (<span className="yotpo-reviews-num">{rating.total}</span>)
            </>
        }
        </>
    );
}