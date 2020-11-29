import React, {useEffect, useState} from 'react';
import {Icon, Col, Row, Button, Select, TextInput} from "react-materialize";
import LEDuino from "./lib/LEDuino";
import LEDuinoSerialConnection from "./lib/LEDuino/LEDuinoSerialConnection";
import ConnectionForm from "./components/ConnectionForm";
import e from "./utils/e";

let device = new LEDuino();

const App = () => {
    const [path, setPath] = useState(null);
    const [connected, setConnected] = useState(false);
    const [color, setColor] = useState("#000000");
    const [live, setLive] = useState(true);

    useEffect(() => {
        device.onConnect = () => setConnected(true);
        device.onDisconnect =() => setConnected(false);
    }, [])

    useEffect(() => {
        if (!path) {
            device.disconnect();
        }

        const connection = new LEDuinoSerialConnection(path);
        device.connect(connection);
    }, [path])

    useEffect(() => {
        if (live) {
            device.setAll(color);
        }
    }, [color, live])

    return (
        <div className={'App'}>
            <div className={'full-splash'}>
                { !connected && <ConnectionForm onConnect={setPath} /> }

                { connected && <form onSubmit={e => {
                    e.preventDefault();
                    device.fadeAll(color, 1000);
                }}>
                    <Row>
                        <TextInput s={12} name={'cmd'} type={'color'} value={color} label={"Channel 1"} onChange={e => setColor(e.target.value)}/>
                        <Button type={'submit'} className={'block'}>Send</Button>
                        <a onClick={e(setPath)}>Disconnect</a>
                    </Row>
                </form> }
            </div>
        </div>
    )
}

export default App;