const algorithmia = require("algorithmia");
const algorithimaApiKey = require("../credentials/algorithmia.json").apiKey;
const setenceBoundaryDetection = require("sbd");
const watsonApiKey = require("../credentials/watson-nlu.json").apikey;
const state = require("./state.js");
const NaturalLanguageUnderstandingV1 = require("watson-developer-cloud/natural-language-understanding/v1.js");

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: "2019-01-01",
  url: "https://api.us-south.natural-language-understanding.watson.cloud.ibm.com",
});

const robot = async () => {
  const content = state.load();

  const fetchContentFromWikipedio = async (content) => {
    try {
      const algorithmiaAuthenticated = algorithmia(algorithimaApiKey);
      const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
        "web/WikipediaParser/0.1.2"
      );
      const wikipediaResponse = await wikipediaAlgorithm.pipe(
        content.searchTerm.replace(/\s/g, "")
      );
      const wikipediaContent = wikipediaResponse.get();

      content.sourceContentOriginal = wikipediaContent.content;
    } catch (error) {
      return (content.sourceContentOriginal = error);
    }
  };

  const sanitizeContent = (content) => {
    const removeBlankLinesAndMarkdown = (t) => {
      const allLines = t.split("\n");
      const withoutBlankLinesAndMarks = allLines.filter((lines) => {
        if (lines.trim().length === 0 || lines.trim().startsWith("=")) {
          return false;
        }

        return true;
      });

      return withoutBlankLinesAndMarks.join(" ");
    };

    const removeDatesInParentheses = (t) => {
      return t.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /g, " ");
    };

    const withoutBlankLinesAndMarks = removeBlankLinesAndMarkdown(
      content.sourceContentOriginal
    );
    const withoutDatesInParentheses = removeDatesInParentheses(
      withoutBlankLinesAndMarks
    );

    content.sourceContentSanitized = withoutDatesInParentheses;
  };

  const breakContentIntoSentences = (content) => {
    content.sentences = [];
    const sentences = setenceBoundaryDetection.sentences(
      content.sourceContentSanitized
    );

    sentences.forEach((s) => {
      content.sentences.push({
        text: s,
        keywords: [],
        images: [],
      });
    });
  };

  const limitMaximumSentences = (content) => {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  };

  const fetchWatsonKeyWords = async (setence) => {
    return new Promise((resolve, reject) => {
      nlu.analyze(
        {
          text: setence,
          features: {
            keywords: {},
          },
        },
        (error, response) => {
          if (error) {
            throw error;
          }

          const keywords = response.keywords.map((k) => {
            return k.text;
          });

          resolve(keywords);
        }
      );
    });
  };

  const fetchWatsonKeyWordsAll = async (content) => {
    for (const s of content.sentences) {
      s.keywords = await fetchWatsonKeyWords(s.text);
    }
  };

  await fetchContentFromWikipedio(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);
  limitMaximumSentences(content);
  await fetchWatsonKeyWordsAll(content);

  state.save(content);
};

module.exports = robot;
