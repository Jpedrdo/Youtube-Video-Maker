const bots = {
  input: require("./bots/input.js"),
  text: require("./bots/text.js"),
  state: require("./bots/state.js"),
  image: require("./bots/image.js"),
};

const start = async () => {
  bots.input();
  await bots.text();
  await bots.image();

  const content = bots.state.load();
  console.dir(content, { depth: null });
};

start();
