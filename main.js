const { app, BrowserWindow, Menu } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { ipcMain } = require('electron');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

const TwitchConnection = require('./src/server/TwitchConnection');

// Check if we're in an installer, and bail out after handling
// installer-y things.
if (handleSquirrelEvent()) {
    return;
}

// Menu.setApplicationMenu(null);

let mainWindow;
let port;


const AudioConnection = require('./src/server/AudioConnection');
let ac;

const mapv = (ampl, max) => {
    return Math.max(0, Math.min(max, (ampl/AudioConnection.SAMPLE_MAX) * max))
}

const gain = 1.0;
let hueStart = 0;
const hueEnd = 360 ;// 30;
const rotate = true;

let dotL, dotR, hue, lhue, value;


const onAmplSample = (ampl, raAvg) => {
    dotL = mapv(raAvg, AudioConnection.SCALE_MAX);
    hue  = Math.floor(mapv(raAvg, 360));
    value = Math.floor(mapv(raAvg, 100));

    console.log(
        `${raAvg}\t` +
        "=".repeat(dotL) + "#"
    )

    const Color = require('color')

    if (port && hue !== lhue) {
        hue *= gain;
        if (rotate) {
            hueStart += 1;
        }
        let str = `set all ` + Color.hsv((hueStart + hue) % hueEnd,100,value).hex() + "\n";
        port.write(str);
        lhue = hue;
    }
}


const onRedeem = (message) => {
    console.log(port);

    if (port) {
        switch (message.rewardName) {
            case "Lights go Red":
                port.write("set all #FF0000\n");
                break;
            case "Lights go Blu":
                port.write("set all #0000FF\n");
                break;
            case "Lights custom hex":
                port.write(`set all ${message.message}\n`)
                break;
        }
    } else {
        console.warn("Write to empty port!");
    }
}

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });

    const startURL = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, 'build/index.html')}`;

    mainWindow.loadURL(startURL);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        TwitchConnection.authenticate({}, onRedeem);
        ac = new AudioConnection(mainWindow);
        ac.onAmplitudeSample = onAmplSample;
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on('SERIAL', (event, data) => {
    SerialPort.list().then(ports => {
        event.reply('SERIAL', JSON.stringify(ports));
    });
})

ipcMain.on('SERIAL_CONNECT', (event, data) => {
    const { path, baudRate = 115200 } = JSON.parse(data);
    const doConnect = () => {
        if (!path) {
            return;
        }

        port = new SerialPort(path, { baudRate });
        const parser = new Readline();
        port.pipe(parser);
        parser.on('data', line => {
            console.log(port.path + " < " + line);
            event.reply('SERIAL_LINE', line);
        });
        event.reply('SERIAL_CONNECTED', '');
    }
    if (port) port.close(doConnect);
    else doConnect();
})

ipcMain.on('SERIAL_DISCONNECT', (event, data) => {
    if (port) port.close(() => {
        event.reply('SERIAL_DISCONNECTED', '');
    });
})

ipcMain.on('SERIAL_WRITE', (event, line) => {
    if (port) {
        console.log(port.path + " > " + line);
        port.write(line + "\n");
    } else {
        console.warn("Write to empty port.");
    }
})

ipcMain.on('TWITCH_AUTH', (event, json) => {
    const data = JSON.parse(json);
    TwitchConnection.authenticate(data, onRedeem, mainWindow);
});

/**
 * Handle Squirrel installer events for Windows.
 */
function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (e) {}

        return spawnedProcess;
    }

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    }

    const squirrelEvent = process.argv[1];
    switch(squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Here you do things like:
            // Update PATH
            // Write to registry for file assoc *.led etc

            // Create desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo everything done above

            // Remove desktop and start shortcuts
            spawnUpdate(['--removeShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // Anything to be done before the old version of
            // an app is retired?

            app.quit();
            return true;
    }
}
