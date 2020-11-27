import React, {useEffect, useState} from 'react';
import {Button, Select, TextInput} from "react-materialize";
import LEDuino from "./lib/LEDuino";
import LEDuinoSerialConnection from "./lib/LEDuino/LEDuinoSerialConnection";

let device = new LEDuino();

const App = () => {
    const [loading, setLoading] = useState(true);
    const [ports, setPorts] = useState([]);
    const [path, setPath] = useState(null);
    const [connected, setConnected] = useState(false);
    const [color, setColor] = useState("#000000");
    const [live, setLive] = useState(true);

    useEffect(() => {
        LEDuinoSerialConnection.listPorts((list) => {
            setPorts(list);
            setLoading(false);
        })

        device.onConnect = () => setConnected(true);
        device.onDisconnect =() => setConnected(false);
    }, [])

    useEffect(() => {
        if (!path) return;
        const connection = new LEDuinoSerialConnection(path);
        device.connect(connection);
    }, [path])

    useEffect(() => {
        if (live) {
            device.setAll(color);
        }
    }, [color])

    return (
        <div>
            { loading && <div>Loading...</div> }
            { !loading && <Select id={'port'} label={'Serial Port'} onChange={e => setPath(e.target.value)}>
                { ports.map((p, i) => <option key={i} value={p.path}>{p.path}: {p.manufacturer}</option>) }
            </Select> }
            { connected && <form onSubmit={e => {
                e.preventDefault();
                device.setAll(color);
            }}>
                <TextInput name={'cmd'} type={'color'} value={color} label={"Channel 1"} onChange={e => setColor(e.target.value)}/>
                <Button type={'submit'}>Send</Button>
            </form> }
        </div>
    )
}

export default App;