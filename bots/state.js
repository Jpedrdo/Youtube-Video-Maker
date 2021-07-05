const fs = require("fs");
const contentFilePath = "./content.json";
const scriptFilePath = "./content/after-effects-script.js";

const save = (content) => {
  const cString = JSON.stringify(content);
  return fs.writeFileSync(contentFilePath, cString);
};

const saveScript = (content) => {
  const cString = JSON.stringify(content);
  const sString = `var content = ${cString}`;
  return fs.writeFileSync(scriptFilePath, sString);
};

const load = () => {
  const fileBuffer = fs.readFileSync(contentFilePath, "utf-8");
  return JSON.parse(fileBuffer);
};

module.exports = {
  save,
  saveScript,
  load,
};
