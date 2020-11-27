const { ipcRenderer } = window.require('electron');

class LEDuinoSerialConnection {
    constructor(path, options = {}) {
        this.path = path;
        this.options = {...options};
        this.connected = false;

        this.onConnect = null;
        this.onReceive = null;
        this.onDisconnect = null;

        ipcRenderer.on('SERIAL_CONNECTED', (event, data) => {
            this.connected = true;
            this.onConnect && this.onConnect();
        });

        ipcRenderer.on('SERIAL_DISCONNECTED', (event, data) => {
            this.connected = false;
            this.onDisconnect && this.onDisconnect();
        });

        ipcRenderer.on('SERIAL_LINE', (event, data) => {
            this.onReceive && this.onReceive(data);
        });

        ipcRenderer.send('SERIAL_CONNECT', JSON.stringify({
            path: this.path,
            ...this.options
        }));
    }

    static listPorts(cb) {
        ipcRenderer.on('SERIAL', (event, data) => {
            console.log({event, data});

            try {
                const list = JSON.parse(data);
                cb(list);
            } catch(e) {}
        });

        ipcRenderer.send('SERIAL', 'list');
    }

    write(msg) {
        ipcRenderer.send('SERIAL_WRITE', msg);
    }

    isConnected() {
        return this.connected;
    }
}

export default LEDuinoSerialConnection;