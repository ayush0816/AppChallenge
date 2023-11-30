const { google } = require("googleapis");

// Here we are adding label to the emails to which reply has been sent
const addLabelToEmail = async (auth, messageId, labelName) => {
  const gmail = google.gmail({ version: "v1", auth });
  const labelId = await getOrCreateLabel(auth, labelName);

  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: [labelId],
    },
  });
  console.log("Label added to email.");
};

// Here we are creating a label according to label provided
const getOrCreateLabel = async (auth, labelName) => {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.labels.list({ userId: "me" });
  const label = response.data.labels.find((l) => l.name === labelName);

  if (label) {
    return label.id;
  } else {
    const createdLabel = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    return createdLabel.data.id;
  }
};

// Here we are checking whether the email has any label or not
const hasSpecifiedLabel = async (auth, messageId, labelName) => {
  try {
    const gmail = google.gmail({ version: "v1", auth });
    const labelId = await getOrCreateLabel(auth, labelName);

    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const { labelIds } = response.data;

    return labelIds.includes(labelId);
  } catch (error) {
    console.error("Error checking label:", error);
    return false;
  }
};

module.exports = { addLabelToEmail, getOrCreateLabel, hasSpecifiedLabel };
