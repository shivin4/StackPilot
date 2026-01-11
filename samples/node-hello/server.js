const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Hello from StackPilot sample Node app!",
    service: "node-hello",
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(port, () => console.log(`Listening on ${port}`));
