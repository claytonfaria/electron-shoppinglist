const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// Sent ENV
process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin';

// Avoid Display compositor  - GL Error
// eslint-disable-next-line no-unused-expressions
process.stderr.fd;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function() {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true }
  });
  // Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));

  // Quit app whn closed
  mainWindow.on('closed', function() {
    app.quit();
  });
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
const createAddWindow = function createAddWindow() {
// Create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shipping List Item',
    webPreferences: { nodeIntegration: true }
  });

  // Load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Garbage collection handle
  addWindow.on('close', function() {
    addWindow = null;
  });
};

// Catch item:add
ipcMain.on('item:add', function(e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create meny template
const mainMenuTemplate = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
];

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      { role: 'toggleDevTools' },
      { role: 'reload' }
    ]
  });
}
