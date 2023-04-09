import cv from "@techstark/opencv-js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url));
const mockPath = path.join(__dirname,'./mock-data/notab.jpg');
const image = cv.imread(mockPath)
