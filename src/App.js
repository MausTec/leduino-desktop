import React, {useContext, useEffect, useState} from 'react';
import {Icon, Col, Row, Button, Select, TextInput} from "react-materialize";
import LEDuino from "./lib/LEDuino";
import LEDuinoSerialConnection from "./lib/LEDuino/LEDuinoSerialConnection";
import ConnectionForm from "./components/ConnectionForm";
import e from "./utils/e";
import {LEDuinoContext} from "./components/LEDuinoProvider";
import VUMeter from "./components/VUMeter";

const App = () => {
    const { device } = useContext(LEDuinoContext);
    const connected = device && device.isConnected();

    const [path, setPath] = useState(null);
    const [color, setColor] = useState("#000000");
    const [live, setLive] = useState(true);

    useEffect(() => {
        if (!device) {
            return;
        }

        if (!path) {
            device.disconnect();
        }

        const connection = new LEDuinoSerialConnection(path);
        device.connect(connection);
    }, [path, device])

    useEffect(() => {
        if (!device) {
            return;
        }

        if (live) {
            device.setAll(color);
        }
    }, [color, live, device])

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
                        <br/>
                        <br/>
                        <VUMeter />
                    </Row>
                </form> }
            </div>
        </div>
    )
}

export default App;