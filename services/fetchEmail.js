const { google } = require("googleapis");

// Here we are fetching all the emails
const fetchEmails = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.messages.list({
    userId: "me",
    q: "is:inbox",
  });

  const messages = response.data.messages || [];
  const emails = [];

  for (const message of messages) {
    const email = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    const { from, subject } = extractEmailDetails(email.data); 

    emails.push({
      id: email.data.id,
      threadId: email.data.threadId,
      from,
      subject,
    });
  }

  return emails;
};

// Here we are extracting sender and the subject of the email
const extractEmailDetails = (emailData) => {
  const headers = emailData.payload.headers;
  let from = "";
  let subject = "";

  for (const header of headers) {
    if (header.name === "From") {
      from = header.value;
    } else if (header.name === "Subject") {
      subject = header.value;
    }
 
    if (from !== "" && subject !== "") {
      break;
    }
  }

  return { from, subject };
};

// Here we are checking if a reply has been already sent to the email or not
const checkIfReplied = async (auth, threadId) => {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.messages.list({
    userId: "me",
    q: `thread:${threadId} from:me`,
  });

  const messages = response.data.messages;

  if (!messages || messages.length === 0) { 
    return false;
  }
 
  return true;
};

module.exports = { fetchEmails, checkIfReplied };
