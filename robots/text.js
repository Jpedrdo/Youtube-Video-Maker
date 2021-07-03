const algorithmia = require("algorithmia");
const algorithimaApiKey = require("../credentials/algorithmia.json").apiKey;
const setenceBoundaryDetection = require("sbd");

const robot = async (content) => {
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
      content.sourceContentOriginal = error;
      return error;
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

  await fetchContentFromWikipedio(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);
};

module.exports = robot;
