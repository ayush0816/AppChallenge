const express = require("express");
const app = express();
const port = 3000;


app.use("/", require("./controllers/auth"));
app.use("/", require("./controllers/sendEmails"));

app.listen(port, () => {
  console.log("App listening on port :", port);
});
