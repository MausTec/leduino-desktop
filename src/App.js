import React, {useEffect, useState} from 'react';
import {Button, Select, TextInput} from "react-materialize";

const { ipcRenderer } = window.require('electron');

const App = () => {
    const [loading, setLoading] = useState(true);
    const [ports, setPorts] = useState([]);
    const [path, setPath] = useState(null);
    const [cmd, setCmd] = useState("");
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        ipcRenderer.on('SERIAL', (event, data) => {
            console.log({event, data});

            try {
                const list = JSON.parse(data);
                setPorts(list);
                setLoading(false);
            } catch(e) {}
        });

        ipcRenderer.send('SERIAL', 'list');

        // const serialport = require('serialport')
        // serialport.list().then((ports) => {
        //     console.log('ports', ports);
        //
        //     setPorts(ports);
        //     setLoading(false);
        // }).catch((err) => {
        //     document.getElementById('error').textContent = err.message
        // })
    }, [])

    useEffect(() => {
        if (!path) return;

        ipcRenderer.on('SERIAL_CONNECTED', (event, write) => {
            ipcRenderer.send('SERIAL_WRITE', "set all #00FF00");
            setConnected(true);
        });

        ipcRenderer.on('SERIAL_LINE', (event, data) => {
            // alert(data);
        });

        ipcRenderer.send('SERIAL_CONNECT', JSON.stringify({ path }));
    }, [path])

    return (
        <div>
            { loading && <div>Loading...</div> }
            { JSON.stringify(ports) }
            { !loading && <Select id={'port'} name={'Serial Port'} onChange={e => setPath(e.target.value)}>
                { ports.map((p, i) => <option key={i} value={p.path}>{p.path}: {p.manufacturer}</option>) }
            </Select> }
            { connected && <form onSubmit={e => {
                e.preventDefault();
                ipcRenderer.send('SERIAL_WRITE', cmd);
            }}>
                <TextInput name={'cmd'} value={cmd} onChange={e => setCmd(e.target.value)}></TextInput>
                <Button type={'submit'}>Send</Button>
            </form> }
        </div>
    )
}

export default App;