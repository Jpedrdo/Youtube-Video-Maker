const fs = require("fs");
const contentFilePath = "./content.json";

const save = (content) => {
  const cString = JSON.stringify(content);
  return fs.writeFileSync(contentFilePath, cString);
};

const load = () => {
  const fileBuffer = fs.readFileSync(contentFilePath, "utf-8");
  return JSON.parse(fileBuffer);
};

module.exports = {
  save,
  load,
};
