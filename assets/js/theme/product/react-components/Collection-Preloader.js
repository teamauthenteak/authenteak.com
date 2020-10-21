import React from 'react';

export default function CollectionPreloader(){
    return(
        <ul className="preloader preloader--tall preloader--background">
            <li className="preloader__collectionImage"></li>
            <li className="preloader__imgSpace"></li>
            <li className="preloader__topTitle"></li>
            <li className="preloader__topTitleRight"></li>
            <li className="preloader__bottomTitle"></li>
            <li className="preloader__titleSpace"></li>
            <li className="preloader__titleSpaceRight"></li>
            <li className="preloader__list">
                <div className="preloader__listRow">
                    <span className="preloader__listBullet"></span>
                    <span className="preloader__listItem"></span>
                </div>
                <div className="preloader__listRow">
                    <span className="preloader__listBullet"></span>
                    <span className="preloader__listItem"></span>
                </div>
                <div className="preloader__listRow">
                    <span className="preloader__listBullet"></span>
                    <span className="preloader__listItem"></span>
                </div>
            </li>
            <li className="preloader__listRight"></li>
            <li className="preloader__listBottom"></li>
            <li className="preloader__lastLine"></li>
            <li className="preloader__bottomLine"></li>
            <li className="preloader__bottomRight"></li>
        </ul>
    );
}