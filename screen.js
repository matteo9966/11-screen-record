import fsProm from "fs/promises";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import screenshot from "screenshot-desktop";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rl = readline.createInterface({ input, output });
const directorypath = path.join(__dirname);

/**
 *
 * @param {string} directory
 */
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

function main() {
  //   createDirectory("./screens");

  //   takeScreen();
  readInputs();
}


/**
 * @description take screen shots of the whole screen
 */
async function takeScreen() {
  const name = screenName("png");
  const filename = path.join(__dirname, name);
  const screenPath = await screenshot({ format: "png", filename: name });
  console.log("created");
  console.log(screenPath);
  let cout = 0;
  let Tid = setTimeout(() => {
    cout++;
    console.log(name);
    if (cout > 10) {
      clearTimeout(Tid);
    }
  }, 1000);
}

/**
 *
 * @param {string} format png or jpg
 */
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
        "inserisci intervallo di cattura in ms (es: 500) min 1000 max 100000\r\n",
        (answer) => {
          res(answer);
        }
      );
    });
    if (!timeInmilliseconds) {
      let result = await getTimeoutInterval();
      return result;
    }
    return timeInmilliseconds;
  }
  const timeInmilliseconds = await getTimeoutInterval();

  console.log(timeInmilliseconds, "milliseconds");
}

async function configScreenApp() {}

main();
