import React from 'react';
import { Spring, animated } from 'react-spring/renderprops';

import AppContext from '../react-components/context/AppContext';
import GraphQL from '../../graphql/GraphQL';
import ErrorBoundary from '../react-components/ErrorBoundary';
import { firebaseService } from '../react-components/services/Firebase/index';

class App extends React.Component{}

export default firebaseService(App);