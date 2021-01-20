'use strict'

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 880,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadURL(path.join(__dirname, '../public/index.html'))
    mainWindow.webContents.openDevTools()
    function windowSend(a, b) { mainWindow.webContents.send(a, b) }
    const menuJ = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Server Manager',
                    accelerator: '',
                    click: () => windowSend('asynchronous-reply', 'servermanage'),
                },
                {
                    label: 'About',
                    accelerator: '',
                    click: () => windowSend('asynchronous-reply', 'about'),
                },
                {
                    label: 'Settings',
                    accelerator: '',
                    click: () => windowSend('asynchronous-reply', 'settings'),
                },
                {
                    label: 'Exit',
                    accelerator: '',
                    click: () => app.quit(),
                }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuJ))
}

app.on('ready', () => {

    require(path.join(__dirname, 'websocketmgr'))
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})