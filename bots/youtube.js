const express = require("express");
const state = require("./state.js");
const google = require("googleapis").google;
const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube({ version: "v3" });
const fs = require("fs");

const bot = async () => {
  console.log("> [youtube-bot] Starting...");
  const content = state.load();

  const authenticateWithOAuth = async () => {
    const startWebServe = async () => {
      return new Promise((resolve, reject) => {
        const port = 5000;
        const app = express();

        const server = app.listen(port, () => {
          console.log(`> [youtube-bot]: Listening on http://localhost:${port}`);
          resolve({
            app,
            server,
          });
        });
      });
    };

    const createOAuthClient = async () => {
      const credentials = require("../credentials/google-youtube.json");

      const OAuthClient = new OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris[0]
      );

      return OAuthClient;
    };

    const requestUserConsent = (OAuthClient) => {
      const consentUrl = OAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube"],
      });

      console.log(`> [youtube-bot]: Please give your consent: ${consentUrl}`);
    };

    const waitForGoogleCallback = async (webServe) => {
      return new Promise((resolve, reject) => {
        console.log("> [youtube-bot]: Waiting for user consent...");

        webServe.app.get("/oauth2callback", (req, res) => {
          const authCode = req.query.code;
          console.log(`> [youtube-bot]: Consent given: ${authCode}`);

          res.send("<h1>Thank you!</h1><p>Now close this tab.</p>");
          resolve(authCode);
        });
      });
    };

    const requestGoogleForAcessTokens = async (
      OAuthClient,
      authorizationToken
    ) => {
      return new Promise((resolve, reject) => {
        OAuthClient.getToken(authorizationToken, (error, tokens) => {
          if (error) {
            return reject(error);
          }

          console.log(`> [youtube-bot]: Access tokens received!`);
          OAuthClient.setCredentials(tokens);
          resolve();
        });
      });
    };

    const setGlobalGoogleAuthentication = (OAuthClient) => {
      google.options({
        auth: OAuthClient,
      });
    };

    const stopWebServer = async (webServe) => {
      return new Promise((resolve, reject) => {
        webServe.server.close(() => {
          resolve();
        });
      });
    };

    const webServe = await startWebServe();
    const OAuthClient = await createOAuthClient();
    requestUserConsent(OAuthClient);
    const authorizationToken = await waitForGoogleCallback(webServe);
    await requestGoogleForAcessTokens(OAuthClient, authorizationToken);
    setGlobalGoogleAuthentication(OAuthClient);
    await stopWebServer(webServe);
  };

  const uploadVideo = async (content) => {
    const videoFilePath = "./content/output.mov";
    const videoFileSize = fs.statSync(videoFilePath).size;
    const videoTitle = `${content.prefix} ${content.searchTerm}`;
    const videoTags = [content.searchTerm, ...content.sentences[0].keywords];
    const videoDescription = content.sentences
      .map((s) => {
        return s.text;
      })
      .join("\n\n");

    const requestParameters = {
      part: "snippet, status",
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: videoTags,
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      media: {
        body: fs.createReadStream(videoFilePath),
      },
    };

    const onUploadProgress = (event) => {
      const progress = Math.round((event.bytesRead / videoFileSize) * 100);
      console.log(`> [youtube-bot]: ${progress}% completed`);
    };

    console.log("> [youtube-bot]: Starting to upload the video to YouTube...");
    const youtubeResponse = await youtube.videos.insert(requestParameters, {
      onUploadProgress: onUploadProgress,
    });

    console.log(
      `> [youtube-bot]: Video available at: https://youtu.be/${youtubeResponse.data.id}`
    );
    return youtubeResponse.data;
  };

  const uploadThumbnail = async (videoInformation) => {
    const videoId = videoInformation.id;
    const videoThumbnailFilePath = "./content/youtube-thumbnail.jpg";

    const requestParameters = {
      videoId: videoId,
      media: {
        mimeType: "image/jpeg",
        body: fs.createReadStream(videoThumbnailFilePath),
      },
    };

    await youtube.thumbnails.set(requestParameters);
    console.log(`> [youtube-bot]: Thumbnail uploaded!`);
  };

  await authenticateWithOAuth();
  const videoInformation = await uploadVideo(content);
  await uploadThumbnail(videoInformation);
};

module.exports = bot;
