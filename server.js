"use strict";

const path = require("node:path");
const express = require("express");

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.resolve(__dirname, "public");

app.disable("x-powered-by");
app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
  );
  next();
});

app.get("/health", (request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use(express.static(publicDirectory, {
  dotfiles: "deny",
  index: "index.html",
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));

app.use((request, response) => {
  response.status(404).type("text/plain").send("Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`VolleyDesk listening on port ${port}`);
});
