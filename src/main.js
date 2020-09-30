'use strict'
/**
 * Main script
 */
const path = require('path')
const mode = 'start'
const { app, BrowserWindow, dialog, Menu, protocol } = require('electron');
const url = require('url')
const fs = require('fs');
const { ipcMain } = require('electron')

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})

let mainWindow, callback;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function createWindow () {
  mainWindow = new BrowserWindow({
	width: 900,
	height: 880,
    webPreferences: {
        nodeIntegration: true
    } 
	})
  mainWindow.loadURL('http://localhost:4340/')
  mainWindow.webContents.openDevTools()
  const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Server Manager',
        accelerator: 'FrankerZ',
	      click: () => mainWindow.webContents.send('asynchronous-reply', 'FrankerZ'),
	  },
    {
        label: 'About',
        accelerator: '',
        click: () => mainWindow.webContents.send('asynchronous-reply', 'About'),
      },
      {
        label: 'Paste',
        accelerator: 'CommandOrControl+V',
        role: 'paste',
      },
    ]
  }
];
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	  
  Error.stackTraceLimit = Infinity

  if (mode === 'start') {
    require(path.join(__dirname, 'routes'))
    require(path.join(__dirname, 'websocketmgr'))
    require(path.join(__dirname, 'config'))
  }
  
  createWindow()


  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})