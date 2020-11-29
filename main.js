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
        TwitchConnection.authenticate();
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

let port;

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
    TwitchConnection.authenticate(data);
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
