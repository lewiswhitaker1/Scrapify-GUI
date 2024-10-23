const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let folderPath = '';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 935,
        height: 625,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    Menu.setApplicationMenu(null);
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('run-exe', (event, arg) => {
    const exePath = path.join(require('os').homedir(), 'Desktop', 'scrapify.exe');
    const child = spawn(exePath, [arg]);

    child.stdout.on('data', (data) => {
        event.reply('exe-output', data.toString());
    });

    child.stderr.on('data', (data) => {
        event.reply('exe-output', `Error: ${data}`);
    });

    child.on('close', (code) => {
        if (code !== 0) {
            event.reply('exe-output', `Process exited with code ${code}`);
        }
    });
});

ipcMain.on('open-folder', (event) => {
    if (folderPath) {
        shell.openPath(folderPath);
    } else {
        event.reply('exe-output', 'No folder path available to open.');
    }
});

ipcMain.on('set-folder-path', (event, path) => {
    folderPath = path;
});
