const express = require("express");
const { generateAuthUrl } = require("../services/auth");
const router = express.Router();

// Here we making a get request to the /auth endpoint for user auth
router.get("/auth", (req, res) => {
  // Here we are generating the authentication url
  const authUrl = generateAuthUrl();

  // After getting the url we are redirecting to that auth  authUrl here
  res.redirect(authUrl);
});

module.exports = router;
