import fsProm from "fs/promises";
import fs from 'fs';
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import screenshot from "screenshot-desktop";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import ExifParser from "exif-parser";
import sharp from 'sharp';
import { createWorker } from "tesseract.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input, output });


const FORMAT = "jpg";

function screenName(format) {
  const date = new Date();
  const fullOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };
  const formatFull = new Intl.DateTimeFormat("it-IT", fullOptions);

  const formattedDate = formatFull.formatToParts(date);
  let map = {};
  for (let portion of formattedDate) {
    map[portion.type] = portion.value;
  }

  const name = `${map.year}-${map.month}-${map.day}-${map.hour}-${map.minute}-${
    map.second
  }-${Date.now()}.${format}`;

  return name;
}

async function readInputs() {
  async function getTimeoutInterval() {
    const timeInmilliseconds = await new Promise((res, _rej) => {
      rl.question(
        "inserisci intervallo di cattura in ms (es: 500) min 1000\r\n",
        (answer) => {
          res(answer);
        }
      );
    });
    console.log();
    if (!timeInmilliseconds || !(typeof +timeInmilliseconds === "number")) {
      let result = await getTimeoutInterval();
      return result;
    }
    return timeInmilliseconds;
  }
  const timeInmilliseconds = await getTimeoutInterval();
  return +timeInmilliseconds;
}

/**
 *
 * @param {string} question
 * @param {(...args:any[])=>boolean} validator
 */
async function readStdInputs(question, validator) {
  async function getAnswer() {
    const answer = await new Promise((res, _rej) => {
      rl.question(`${question}\r\n`, (answer) => {
        res(answer);
      });
    });

    if (!validator(answer)) {
      const resp = await getAnswer();
      return resp;
    }
    return answer;
  }

  const answer = await getAnswer();
  return answer;
}

/**
 * @description take screen shots of the whole screen
 */
async function takeScreen() {
  const name = screenName(FORMAT);
  try {
    const screenPath = await screenshot({ format: FORMAT, filename: name });
    console.log("created");
    console.log(screenPath);
    return screenPath;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 *
 * @param {string} location
 */
async function getScreensMeta(location) {
  try {
    const img = await fsProm.readFile(location);
    const parser = ExifParser.create(img);
    parser.enableBinaryFields(true);
    parser.enableImageSize(true);
    parser.enableReturnTags(true);
    parser.enableBinaryFields(true);
    return parser.parse();
  } catch (error) {
    console.log(error);
    console.log("error while parsing the image");
    return null;
  }
}

async function createDirectory(directory) {
  const location = path.join(__dirname, directory);
  try {
    await fsProm.mkdir(location);
    console.log(`${location} created`);
    return true;
  } catch (error) {
    console.log(error);
    if (
      typeof error === "object" &&
      error.hasOwnProperty("code") &&
      error.code === "EEXIST"
    ) {
      console.log("folder already exists");
    } else {
      console.log("error while creating the folder");
    }
    return false;
  }
}

/**
 * @param {string} path
 */
async function removeFile(path) {
  try {
    await fsProm.unlink(path);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


/**
 * 
 * @param {string} path : path of the created image
 * @param {number} top : offset from the top edge of the image
 * @param {number} left : offset from the left edge of the image
 * @param {number} width : width of the extracted image
 * @param {number} height : height of the extracted image
 */
async function cropImage(path,top,left,width,height){
    const croppath = path.split('.')[0] + ".crop." + FORMAT
    try {
        const result = await sharp(path).extract({width,top,left,height}).toFile(croppath)
        console.log(result);
        return croppath
    } catch (error) {
        console.log(error)
        return null
    }
}


/**
 * 
 * @param {string} filepath 
 * @returns 
 */
async function fileExists(filepath){
  try {
    await fsProm.access(filepath, fs.F_OK)
    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

async function readAndParseJSONfile(path){
  try {
    const file = await fsProm.readFile(path,{encoding:'utf-8'});
    /**@type {Record<string,any>} */const data = JSON.parse(file);
    return data
    
  } catch (error) {
    console.log(error);
    return null;
  }
}
/**
 * 
 * @param {Awaited<ReturnType<createWorker>>} worker 
 * @param {string} imagepath 
 */
async function readTextFromFile(w,imagepath){
  let file;
  let worker = w || await createWorker()
  if(!worker){
    return null
  }

  if(!fileExists(imagepath)){
    return null
  }

  try {
    file = await fsProm.readFile(imagepath);     
    const imageBuff = await sharp(imagepath).resize(1000).grayscale().toBuffer();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const transformed = await worker.recognize(imageBuff);
    worker.terminate();
    return transformed

  } catch (error) {
    console.log(error)
    return null
  }
  


}



export {
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
  readTextFromFile
};
