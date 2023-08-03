const { app, BrowserWindow, ipcMain, session} = require('electron');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 380,
    height: 580,
    frame: false,
    transparent: true,
    title: "GOH_GetLike",
    resizable: false,
    webPreferences: {
	    webSecurity: false,
      nodeIntegration: true,
	    allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
	  }
  })

  ipcMain.on('set-cookie', (event, data) => {
    data = data.split('; ');
    for (var i = 0; i < data.length; i++) {
      cookie = {url: 'https://getlike.io', name: data[i].split('=')[0], value: data[i].split('=')[1], sameSite: 'no_restriction', secure: true}
      session.defaultSession.cookies.set(cookie, (error) => {});
    }
  });

  ipcMain.on('dev', (event, data) => {
    win.webContents.openDevTools();
    win.setFullScreen(true);
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow()
});

