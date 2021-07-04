const imageDownloader = require("image-downloader");
const gm = require("gm").subClass({ imageMagick: true });
const google = require("googleapis").google;
const customSearch = google.customsearch("v1");
const state = require("./state.js");
const googleSearchCredentials = require("../credentials/google-search.json");

const bot = async () => {
  const content = state.load();

  const fetchGoogleImagesLinks = async (query) => {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      searchType: "image",
      num: 2,
    });

    const imgUrl = response.data.items.map((i) => {
      return i.link;
    });

    return imgUrl;
  };

  const fetchImagesAllSentences = async (content) => {
    for (const s of content.sentences) {
      const query = `${content.searchTerm} ${s.keywords[0]}`;
      s.images = await fetchGoogleImagesLinks(query);

      s.googleSearchQuery = query;
      console.log(
        `> [image-bot]: Start querying Google Images with: "${query}"`
      );
    }
  };

  const downloadAndSaveImage = (url, fileName) => {
    return imageDownloader.image({
      url: url,
      dest: `./content/${fileName}`,
    });
  };

  const downloadAllImages = async (content) => {
    console.log(`> [image-bot]: Starting to download images`);
    content.downloadedImages = [];

    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const images = content.sentences[sentenceIndex].images;

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex];

        try {
          if (content.downloadedImages.includes(imageUrl)) {
            throw new Error("Image already downloaded");
          }

          await downloadAndSaveImage(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);
          console.log(
            `> [image-bot]: Successfully downloaded image: ${imageUrl}`
          );
          break;
        } catch (error) {
          console.log(
            `> [image-bot]: Error downloading the image: ${imageUrl}: ${error}`
          );
        }
      }
    }
    console.log("> [image-bot]: Images downloaded successfully");
  };

  const convertImage = async (sentenceIndex) => {
    return new Promise((resolve, reject) => {
      const inputFile = `./content/${sentenceIndex}-original.png[0]`;
      const outputFile = `./content/${sentenceIndex}-converted.png`;
      const width = 1920;
      const height = 1080;

      gm()
        .in(inputFile)
        .out("(")
        .out("-clone")
        .out("0")
        .out("-background", "white")
        .out("-blur", "0x9")
        .out("-resize", `${width}x${height}^`)
        .out(")")
        .out("(")
        .out("-clone")
        .out("0")
        .out("-background", "white")
        .out("-resize", `${width}x${height}`)
        .out(")")
        .out("-delete", "0")
        .out("-gravity", "center")
        .out("-compose", "over")
        .out("-composite")
        .out("-extent", `${width}x${height}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }

          console.log(`> [image-bot]: Image converted: ${outputFile}`);
          resolve();
        });
    });
  };

  const convertAllImages = async (content) => {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await convertImage(sentenceIndex);
    }
  };

  const createSentenceImages = async (sentenceIndex, sentenceText) => {
    return new Promise((resolve, reject) => {
      const outputFile = `./content/${sentenceIndex}-sentence.png`;

      const templateSettings = {
        0: {
          size: "1920x400",
          gravity: "center",
        },
        1: {
          size: "1920x1080",
          gravity: "center",
        },
        2: {
          size: "800x1080",
          gravity: "west",
        },
        3: {
          size: "1920x400",
          gravity: "center",
        },
        4: {
          size: "1920x1080",
          gravity: "center",
        },
        5: {
          size: "800x1080",
          gravity: "west",
        },
        6: {
          size: "1920x400",
          gravity: "center",
        },
      };

      gm()
        .out("-size", templateSettings[sentenceIndex].size)
        .out("-gravity", templateSettings[sentenceIndex].gravity)
        .out("-background", "transparent")
        .out("-fill", "white")
        .out("-kerning", "-1")
        .out(`caption:${sentenceText}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }

          console.log(`> [image-bot]: Sentence created: ${outputFile}`);
          resolve();
        });
    });
  };

  const createAllSentenceImages = async (content) => {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await createSentenceImages(
        sentenceIndex,
        content.sentences[sentenceIndex].text
      );
    }
  };

  const createYoutubeThumbnail = async () => {
    return new Promise((resolve, reject) => {
      gm()
        .in("./content/0-converted.png")
        .write("./content/youtube-thumbnail.jpg", (error) => {
          if (error) {
            return reject(error);
          }

          console.log("> [image-bot]: YouTube thumbnail created");
          resolve();
        });
    });
  };

  await fetchImagesAllSentences(content);
  await downloadAllImages(content);
  await convertAllImages(content);
  await createAllSentenceImages(content);
  await createYoutubeThumbnail();
  state.save(content);
};

module.exports = bot;
