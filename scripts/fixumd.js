// @ts-check
const fs = require("fs");
const pkg = require("../package.json");
const { argv } = require("process");
const capitalizeFirst = (str = "") => {
  return str[0].toUpperCase() + str.slice(1);
};

const umdfile = argv[2];
const umdname = capitalizeFirst(pkg.name.split("/").pop());

const script = fs.readFileSync(umdfile).toString();

const searchLine = `})(function (require, exports) {`;
const replaceValue = `    else { factory(null, globalThis.${umdname} = {}); }\n${searchLine}`;
const fixedScript = script.replace(searchLine, replaceValue);

fs.writeFileSync(umdfile, fixedScript);
