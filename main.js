const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

// Check if we're in an installer, and bail out after handling
// installer-y things.
if (handleSquirrelEvent()) {
    return;
}

// TODO: Evaluate if we need this. This is so SerialPort can access
// native bindings in the render process.
app.allowRendererProcessReuse = false;

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
    mainWindow.once('ready-to-show', () => mainWindow.show());
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
