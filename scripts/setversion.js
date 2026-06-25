// @ts-check
const fs = require("fs");
const pkg = require("../package.json");
const { argv } = require("process");

const file = "src/index.ts";

const operation = argv[2] === "down" ? "down" : "up";

const content = fs.readFileSync(file).toString();

const searchValue = `export const version: string = "";`;
const replaceValue = `export const version: string = "${pkg.version}";`;

const fixedContent = (() => {
  switch (operation) {
    case "up":
      return content.replace(searchValue, replaceValue);
    case "down":
      return content.replace(replaceValue, searchValue);
  }
})();

fs.writeFileSync(file, fixedContent);
