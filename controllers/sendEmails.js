const express = require("express");
const router = express.Router();
const { getAccessToken } = require("../services/auth");
const { fetchEmails, checkIfReplied } = require("../services/fetchEmail");
const {
  addLabelToEmail,
  hasSpecifiedLabel,
} = require("../services/labelEmail");
const { sendReply } = require("../services/emailReply");
const { google } = require("googleapis");

//  After Proper Authentication we will be redirected to this endpoint
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const authClient = await getAccessToken(code);

    // Here we are setting interval of 120secs after which the Emails will be checked and replied
    setInterval(async () => {
      // Here we are fetching all the emails
      const emails = await fetchEmails(authClient);

      for (const email of emails) {
        // Here we are ignoring all the emails which are not @gmail.com type
        if (!email.from.includes("@gmail.com")) {
          continue;
        }

        // Here we are checking if the emails has replies
        const hasReplies = await checkIfReplied(authClient, email.threadId);

        const labelName = "labelemail";

        // Here we are checking if the emails has label
        const hasLabel = await hasSpecifiedLabel(
          authClient,
          email.id,
          labelName
        );

        //If it has not been labeled Here we are adding label to the emails
        if (!hasLabel) {
          await addLabelToEmail(authClient, email.id, labelName);
        }

        // If it has been labeled then no need to send reply
        if (hasLabel || hasReplies) {
          continue;
        }

        // If the email does not have replies, we are sending a reply
        const mailOptions = {
          to: email.from,
          subject: "Re: " + email.subject,
          text: "Thank you for your email. I will get back to you soon.",
        };
        await sendReply(authClient, email.id, mailOptions, labelName);
      }
    }, 120000);

    res.send("Sending replies to the Unreplied emails");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error retrieving profile information");
  }
});

module.exports = router;
