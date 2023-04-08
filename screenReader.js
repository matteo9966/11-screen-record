//node js will spawn another child process that reads the files
import {readTextFromFile} from './utils.js';
import { createWorker } from 'tesseract.js';
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const mockPath = path.join(__dirname,'./mock-data/table.jpg');
async function main(){
    const worker =await createWorker();
    const { data: { text } } = await readTextFromFile(worker,mockPath)
    console.log(text);
}

main();