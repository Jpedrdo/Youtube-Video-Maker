const robots = {
  input: require("./robots/input.js"),
  text: require("./robots/text.js"),
  state: require("./robots/state.js"),
};

const start = async () => {
  robots.input();
  await robots.text();

  const content = robots.state.load();
};

start();
