const imageDownloader = require("image-downloader");
const google = require("googleapis").google;
const customSearch = google.customsearch("v1");
const state = require("./state.js");
const googleSearchCredentials = require("../credentials/google-search.json");

const bot = async () => {
  console.log("> [image-bot] Starting...");
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
  };

  await fetchImagesAllSentences(content);
  await downloadAllImages(content);
  state.save(content);
};

module.exports = bot;
