import { app, BrowserWindow, nativeTheme } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import config, { ConfigKey } from './config';
import { USER_CUSTOM_STYLE_PATH } from './custonStyles';
import { platform } from './helpers';

let mainWindow: BrowserWindow;

function createWindow(): void {
  const lastWindowState = config.get(ConfigKey.LastWindowState);

  mainWindow = new BrowserWindow({
    title: app.name,
    minWidth: 780,
    width: lastWindowState.bounds.width,
    minHeight: 200,
    height: lastWindowState.bounds.height,
    x: lastWindowState.bounds.x,
    y: lastWindowState.bounds.y,
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload'),
    },
    darkTheme: nativeTheme.shouldUseDarkColors,
  });

  if (lastWindowState.fullscreen && !mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(lastWindowState.fullscreen);
  }

  if (lastWindowState.maximized && !mainWindow.isMaximized()) {
    mainWindow.maximize();
  }

  mainWindow.loadURL('https://custom-url'); // use desired URL

  mainWindow.on('app-command', (_event, command) => {
    if (command === 'browser-backward' && mainWindow.webContents.canGoBack()) {
      mainWindow.webContents.goBack();
    } else if (
      command === 'browser-forward' &&
      mainWindow.webContents.canGoForward()
    ) {
      mainWindow.webContents.goForward();
    }
  });

  mainWindow.webContents.on('dom-ready', () => {
    addCustomCSS(mainWindow);
  });

  function addCustomCSS(windowElement: BrowserWindow): void {
    windowElement.webContents.insertCSS(
      fs.readFileSync(path.join(__dirname, '..', 'styles', 'style.css'), 'utf8')
    );

    if (fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
      windowElement.webContents.insertCSS(
        fs.readFileSync(USER_CUSTOM_STYLE_PATH, 'utf8')
      );
    }

    const platformCSSFile = path.join(
      __dirname,
      '..',
      'styles',
      `style.${platform}.css`
    );
    if (fs.existsSync(platformCSSFile)) {
      windowElement.webContents.insertCSS(
        fs.readFileSync(platformCSSFile, 'utf8')
      );
    }
  }
}

app.whenReady().then(() => {
  app.on('activate', function () {
    if (mainWindow) mainWindow.show();
  });

  app.on('before-quit', () => {
    if (mainWindow) {
      config.set(ConfigKey.LastWindowState, {
        bounds: mainWindow.getBounds(),
        fullscreen: mainWindow.isFullScreen(),
        maximized: mainWindow.isMaximized(),
      });
    }
  });

  const customUserAgent = config.get(ConfigKey.CustomUserAgent);

  if (customUserAgent) {
    app.userAgentFallback = customUserAgent;
  }

  createWindow();
});
