import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';

import 'materialize-css';
import LEDuinoProvider from "./components/LEDuinoProvider";

ReactDOM.render(
    <React.StrictMode>
        <LEDuinoProvider>
            <App />
        </LEDuinoProvider>
    </React.StrictMode>,
    document.getElementById('root')
);