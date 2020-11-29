import Color from 'color'

const CHANNEL_ALL = 'all';
const CHANNEL_1 = '1';
const CHANNEL_2 = '2';

class LEDuino {
    initialize(connection) {
        this.onConnect = null;
        this.onDisconnect = null;
        this.connect(connection);
    }

    connect(connection) {
        this.connection = connection;
        connection.onReceive = this.recv.bind(this);
        connection.onConnect = this.onConnect;
        connection.onDisconnect = this.onDisconnect;
    }

    disconnect() {
        if (!this.connection) return;
        this.connection.disconnect().then(() => {
            this.connection = null;
        })
    }

    set(channel, color) {
        const c = Color(color);
        this.send(`set ${channel} ${c.hex()}`)
    }

    setAll(color) {
        this.set(CHANNEL_ALL, color);
    }

    fade(channel, color, duration) {
        const c = Color(color);
        this.send(`fade ${channel} ${c.hex()} ${duration}`)
    }

    fadeAll(channel, color, duration) {
        this.fade(CHANNEL_ALL, color, duration);
    }

    send(msg) {
        if (!this.connection || !this.connection.isConnected()) {
            return;
        }

        this.connection.write(msg);
    }

    recv(msg) {
        console.log(msg);
    }
}

export {
    CHANNEL_ALL,
    CHANNEL_1,
    CHANNEL_2
}

export default LEDuino;