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
  cropImage
} from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input, output });

async function main() {
 const screenApp =  await configScreenApp();
 const cropPath = await screenApp.getScreenCrop(); // only one crop image
}

class ScreenApp {
  CONFIG = {
    interval: null,
    screenW: null,
    screenH: null,
    crop:{
        top:null,
        left:null,
        height:null,
        width:null,
    }
  };

  constructor() {}

  /**
   * @description get all the screen infos like screenH screenW and time interval
   */
  async configScreen() {
    const milliseconds = await readInputs();
    this.CONFIG.interval = milliseconds;
    const screenResolution = await this.getScreenResolution();
    if (!screenResolution) {
      console.log("error while detecting screen resolution");
      const w = await readStdInputs(
        "inserisci larghezza dello schermo in px",
        (width) => {
          return +width && typeof +width === "number";
        }
      );
      const h = await readStdInputs(
        "inserisci altezza dello schermo in px",
        (height) => {
          return +height && typeof +height === "number";
        }
      );

      this.CONFIG.screenH = h;
      this.CONFIG.screenW = w;
    } else {
      this.CONFIG.screenW = screenResolution.width;
      this.CONFIG.screenH = screenResolution.height;
    }

    const offsetTop =  await readStdInputs(
        "inserisci offset dal top in px",
        (offset) => {
          return +offset && typeof +offset === "number";
        }
      );
    
    const offsetLeft =  await readStdInputs(
        "inserisci offset dalla sinistra in px",
        (offset) => {
          return +offset && typeof +offset === "number";
        }
      );

    
    const cropWidth  =  await readStdInputs(
        "inserisci larghezza del crop in px",
        (width) => {
          return +width && typeof +width === "number";
        }
      );

    const cropHeight =  await readStdInputs(
        "inserisci altezza del crop in px",
        (height) => {
          return +height && typeof +height === "number";
        }
      );

    this.CONFIG.crop.height = +cropHeight
    this.CONFIG.crop.width = +cropWidth
    this.CONFIG.crop.top = +offsetTop
    this.CONFIG.crop.left = +offsetLeft



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

  async getScreenCrop(){
    try {
        const pathFile = await takeScreen();
        const cropPath = await cropImage(pathFile,this.CONFIG.crop.top,this.CONFIG.crop.left,this.CONFIG.crop.width,this.CONFIG.crop.height);
        console.log(cropPath);
         return cropPath;
    } catch (error) {
        console.log(error)
        return null;
    }
  }

}

async function configScreenApp() {
  const screenApp = new ScreenApp();
  await screenApp.configScreen();
  return screenApp;
}

main();
