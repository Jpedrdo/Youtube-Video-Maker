const bots = {
  input: require("./bots/input.js"),
  text: require("./bots/text.js"),
  state: require("./bots/state.js"),
  image: require("./bots/image.js"),
  video: require("./bots/video.js"),
};

const start = async () => {
  bots.input();
  await bots.text();
  await bots.image();
  await bots.video()
};

start();
