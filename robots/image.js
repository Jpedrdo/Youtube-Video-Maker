const google = require("googleapis").google;
const customSearch = google.customsearch("v1");
const state = require("./state.js");
const googleSearchCredentials = require("../credentials/google-search.json");

const robot = async () => {
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
    }
  };

  await fetchImagesAllSentences(content);
  state.save(content);
};

module.exports = robot;
