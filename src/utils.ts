import { BrowserWindow } from "electron";

export function getMainWindow(): BrowserWindow | undefined {
  return BrowserWindow.getAllWindows()[0];
}

export function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void {
  const mainWindow = getMainWindow();

  if (mainWindow) {
    mainWindow.webContents.send(channel, ...args);
  }
}
