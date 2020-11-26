const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

app.allowRendererProcessReuse = false;

let win;

function createWindow () {
    win = new BrowserWindow({
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

    win.loadURL(startURL);
    win.once('ready-to-show', () => win.show());
    win.on('closed', () => {
        win = null;
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