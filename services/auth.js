const fs = require("fs");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];
const TOKEN_PATH = "token.json";

// In this function we are getting the Auth Client for generating the AuthUrl
const getOAuthClient = () => {
  const { client_secret, client_id, redirect_uris } = JSON.parse(
    fs.readFileSync("credentials.json")
  ).web;
  return new OAuth2Client(client_id, client_secret, redirect_uris[0]);
};

// Here we are generating AuthUrl
const generateAuthUrl = () => {
  const oAuth2Client = getOAuthClient();
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
};

// Here we are generating the ACCESS TOKEN AND REFRESH TOKEN
const getAccessToken = async (code) => {
  return new Promise((resolve, reject) => {
    const oAuth2Client = getOAuthClient();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        reject("Error retrieving access token");
      } else {
        oAuth2Client.setCredentials(token);
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) {
            reject("Error storing token");
          } else {
            resolve(oAuth2Client);
          }
        });
      }
    });
  });
};

module.exports = { generateAuthUrl, getAccessToken };
