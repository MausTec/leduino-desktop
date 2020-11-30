import React, { Component, createContext } from 'react'
import LEDuino from "../lib/LEDuino";

const device = new LEDuino();

const defaultState = {
    ch1Color: null,
    ch2Color: null,
    ch2Sync: false,
    connected: false,
}

const LEDuinoContext = createContext({
    ...defaultState,
})

class LEDuinoProvider extends Component {
    constructor(props) {
        super(props);

        device.onConnect = () => this.setState({ connected: true });
        device.onDisconnect = () => this.setState({ connected: false });
        device.onColorChange = this.handleColorChange.bind(this);

        this.state = {
            ...defaultState,
        }
    }

    connect(connection) {
        device.connect(connection);
    }

    handleColorChange(channel, color) {
        this.setState({ [`ch${channel}Color`]: color })
    }

    render() {
        return (
            <LEDuinoContext.Provider value={{ ...this.state, device }}>
                { this.props.children }
            </LEDuinoContext.Provider>
        )
    }
}

export default LEDuinoProvider;
export { LEDuinoContext };