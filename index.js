const readline = require("readline-sync");
const robots = {
  text: require("./robots/text.js"),
};

const start = async () => {
  const content = {};

  const askAndReturnSearchTerm = () => {
    return readline.question("Type a Wikipedia search term: ");
  };

  const askAndRetrnPrefix = () => {
    const prefixes = ["Who is", "What is", "The history of"];
    const selectedPrefixIndex = readline.keyInSelect(
      prefixes,
      "Choose one option: "
    );
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  };

  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndRetrnPrefix();
  await robots.text(content);
};

start();
