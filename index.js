const robots = {
  input: require("./robots/input.js"),
  text: require("./robots/text.js"),
  state: require("./robots/state.js"),
  image: require("./robots/image.js"),
};

const start = async () => {
  robots.input();
  await robots.text();
  await robots.image();

  const content = robots.state.load();
};

start();
