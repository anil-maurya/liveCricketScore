import fs from "fs";
import path from "path";
import { IMAGE_DIR } from "./config.js";

const __dirname = path.resolve(path.dirname(""));
const imgDir = path.join(__dirname, IMAGE_DIR);

console.log(imgDir);

const files = fs.readdirSync(imgDir);

files.forEach((fileName) => {
  const cleanName = fileName.trim();
  const names = cleanName.split(" ");
  let name = "";
  names.forEach((word) => {
    const cl = word.charAt(0).toUpperCase();
    name = name + cl + word.slice(1);
  });

  if (fileName !== name) {
    console.log("Updating..", fileName);
    const source = `${imgDir}/${fileName}`;
    const dest = `${imgDir}/${name}`;
    fs.renameSync(source, dest);
  }
});
