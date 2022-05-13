import { app } from "electron";
import * as path from "path";

import { ConfigKey } from "./config";
import { sendChannelToMainWindow, getMainWindow } from "./utils";

export const USER_CUSTOM_STYLE_PATH = path.join(
  app.getPath("userData"),
  "custom.css"
);

export function setCustomStyle(key: ConfigKey, enabled: boolean): void {
  sendChannelToMainWindow("set-custom-style", key, enabled);
}

function initFullScreenStyles(): void {
  const mainWindow = getMainWindow();

  if (mainWindow) {
    mainWindow.on("enter-full-screen", () => {
      sendChannelToMainWindow("set-full-screen", true);
    });

    mainWindow.on("leave-full-screen", () => {
      sendChannelToMainWindow("set-full-screen", false);
    });
  }
}

export function init(): void {
  initFullScreenStyles();
}
