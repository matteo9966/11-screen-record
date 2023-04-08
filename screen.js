import fsProm from "fs/promises";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import screenshot from "screenshot-desktop";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import {
  readInputs,
  screenName,
  takeScreen,
  getScreensMeta,
  createDirectory,
  readStdInputs,
  removeFile,
  cropImage,
  fileExists,
  readAndParseJSONfile,
} from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input, output });

async function main() {
  const screenApp = await configScreenApp();
  screenApp.intervalScreens();
  // const cropPath = await screenApp.getScreenCrop(); // only one crop image
}

class ScreenApp {
  CONFIG = {
    interval: null,
    screenW: null,
    screenH: null,
    crop: {
      top: null,
      left: null,
      height: null,
      width: null,
    },
  };

  constructor() {}

  /**
   * @description get all the screen infos like screenH screenW and time interval
   */
  async configScreen() {
    //check if a screen.config.json file exists
    rl.clear;
    await this.parseScreenConfigFile();
    if (!this.CONFIG.interval) {
      const milliseconds = await readInputs();
      this.CONFIG.interval = milliseconds;
    }

    //TODO:refactor
    if (!(this.CONFIG.screenW && this.CONFIG.screenH)) {
      const screenResolution = await this.getScreenResolution();
      if (!screenResolution) {
        console.log("error while detecting screen resolution");
        if (!this.CONFIG.screenW) {
          const w = await readStdInputs(
            "inserisci larghezza dello schermo in px",
            (width) => {
              return +width && typeof +width === "number";
            }
          );
          this.CONFIG.screenH = w;
        }
        if (!this.CONFIG.screenH) {
          const h = await readStdInputs(
            "inserisci altezza dello schermo in px",
            (height) => {
              return +height && typeof +height === "number";
            }
          );
          this.CONFIG.screenW = h;
        }
      } else {
        this.CONFIG.screenW = screenResolution.width;
        this.CONFIG.screenH = screenResolution.height;
      }
    }

    if (!this.CONFIG.crop.top) {
      const offsetTop = await readStdInputs(
        "inserisci offset dal top in px",
        (offset) => {
          return +offset && typeof +offset === "number";
        }
      );

      this.CONFIG.crop.top = +offsetTop;
    }
    if (!this.CONFIG.crop.left) {
      const offsetLeft = await readStdInputs(
        "inserisci offset dalla sinistra in px",
        (offset) => {
          return +offset && typeof +offset === "number";
        }
      );
      this.CONFIG.crop.left = +offsetLeft;
    }
    if (!this.CONFIG.crop.width) {
      const cropWidth = await readStdInputs(
        "inserisci larghezza del crop in px",
        (width) => {
          return +width && typeof +width === "number";
        }
      );
      this.CONFIG.crop.width = +cropWidth;
    }
    if (!this.CONFIG.crop.height) {
      const cropHeight = await readStdInputs(
        "inserisci altezza del crop in px",
        (height) => {
          return +height && typeof +height === "number";
        }
      );

      this.CONFIG.crop.height = +cropHeight;
    }

    console.log(this.CONFIG);
    //take first screen
  }

  async getScreenResolution() {
    let pathFile;
    try {
      pathFile = await takeScreen();
      if (!pathFile) {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }

    const meta = await getScreensMeta(pathFile);
    const removed = await removeFile(pathFile);

    //delete file

    return { height: meta.imageSize.height, width: meta.imageSize.width };
  }

  //a function that takes the screen crops it deletes the original one and saves the cropped image

  async #getScreenCrop() {
    try {
      const pathFile = await takeScreen();
      const cropPath = await cropImage(
        pathFile,
        this.CONFIG.crop.top,
        this.CONFIG.crop.left,
        this.CONFIG.crop.width,
        this.CONFIG.crop.height
      );
      await removeFile(pathFile); //remove full screen screenshot after it has been cropped
      console.log(cropPath);
      return cropPath;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * @description uses getScreenCrop to
   */
  intervalScreens() {
    let running = false;
    setInterval(async () => {
      try {
        if (running) {
          return;
        }
        running = true;
        await this.#getScreenCrop();
      } finally {
        running = false;
      }
    }, this.CONFIG.interval);
  }

  /**
   *
   */
  async parseScreenConfigFile() {
    const configFilePath = path.join(__dirname, "./screen.config.json");
    if (!(await fileExists(configFilePath))) {
      return;
    }

    const screenConfig = await readAndParseJSONfile(configFilePath);
    //now i must map the object

    const {
      interval = null,
      cropW = null,
      cropH = null,
      cropOffsetLeft = null,
      cropOffsetTop = null,
      screenW = null,
      screenH = null,
    } = { ...screenConfig };

    //TODO: validate inputs
    this.CONFIG.crop = {
      top: cropOffsetTop,
      left: cropOffsetLeft,
      height: cropH,
      width: cropW,
    };

    this.CONFIG.interval = interval;
    this.CONFIG.screenH = screenH;
    this.CONFIG.screenW = screenW;
  }
}

async function configScreenApp() {
  const screenApp = new ScreenApp();

  await screenApp.configScreen();
  return screenApp;
}

main();
