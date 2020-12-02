const { ipcMain } = require('electron');
const coreAudio = require("node-core-audio");

class AudioConnection {
    static SAMPLE_MAX = Math.pow(2, 31)
    static SCALE_MAX = 128

    constructor(window) {
        this.engine = coreAudio.createNewAudioEngine();
        this.window = window;

        this.engine.setOptions({
            inputChannels: 1,
            outputChannels: 1,
            // framesPerBuffer: 256,
            // sampleRate: 8000,
            sampleFormat: 0x02,
            // inputDevice
        })

        this.onAmplitudeSample = (a) => {};
        this.lastAmplitude = 0;

        this.engine.addAudioCallback(this.processAudio.bind(this));

        ipcMain.on('AUDIO_LIST', this.onAudioList.bind(this));
        ipcMain.on('AUDIO_CONNECT', this.onAudioConnect.bind(this));
    }

    onAudioList(event, json) {
        const list = []
        for (let id = 0; id < this.engine.getNumDevices(); id++) {
            const name = this.engine.getDeviceName(id);
            list.push({ id, name });
        }

        event.reply('AUDIO_LIST', JSON.stringify(list));
    }

    onAudioConnect(event, json) {
        const data = JSON.parse(json);
        this.engine.setOptions({
            inputDevice: data.id
        })

        const resp = {
            deviceId: data.id,
            deviceName: this.engine.getDeviceName(data.id),

        }

        event.reply('AUDIO_CONNECT', JSON.stringify(resp))
    }

    processAudio(inputBuffer) {
        let valL = inputBuffer[0] || [0];
        let valR = inputBuffer[1] || [0];

        // valL = valL.map((v, x) => {
        //     for (i = 0; i < 32; i++)
        //         lpLast += valL[x - i] || 0;
        //     return v + lpLast;
        // });

        const ampl = Math.max(...valL.map(i => Math.abs(i)));
        const ampl8 = Math.floor(this.mapv(ampl, 255));

        if (ampl8 !== this.lastAmplitude) {
            this.onAmplitudeSample && this.onAmplitudeSample(ampl);
            this.window && this.window.webContents.send("AUDIO_SAMPLE", JSON.stringify({ampl}));
            this.lastAmplitude = ampl8;
        }

        for(let i = 0; i < valL.length; i++) {
            // Empty the buffer to prevent replay:
            inputBuffer[0][i] = 0;
            if (inputBuffer[1]) {
                inputBuffer[1][i] = 0;
            }
        }

        return inputBuffer;
    }

    mapv(ampl, max) {
        return Math.max(0, Math.min(max, (ampl/AudioConnection.SAMPLE_MAX) * max))
    }
}

module.exports = AudioConnection;