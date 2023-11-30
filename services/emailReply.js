const { google } = require("googleapis");

// Here we are sending a reply to all the emails
const sendReply = async (auth, messageId, mailOptions) => {
  const gmail = google.gmail({ version: "v1", auth });

  // Here we are creating the message according to MIME format
  const raw = await createMessage(mailOptions);
  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: messageId,
    },
  });

  console.log("Auto-reply sent.", mailOptions.subject);
};

// Here we are creating the message according to MIME format
const createMessage = (email) => {
  const mail = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    "MIME-Version: 1.0\n",
    `To: ${email.to}\n`,
    `Subject: ${email.subject}\n\n`,
    `${email.text}\n`,
  ].join("");

  const encodedMail = Buffer.from(mail)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return encodedMail;
};

module.exports = { sendReply };
