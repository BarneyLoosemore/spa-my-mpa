import fsp from "fs/promises";
import express from "express";
import {
  header,
  templateFooter,
  home,
  templateArticle,
  templateArticleDetail,
} from "./lib/templates.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const app = express();

app.get("/", async (_, res) => {
  const footer = templateFooter();
  res.send(header + home + footer);
});

app.get("/articles", async (_, res) => {
  res.write(header);

  const articles = JSON.parse(
    await fsp.readFile("src/data/articles.json", "utf-8")
  );
  const articleList = `<ul class="article-list">${articles
    .map(templateArticle)
    .join("")}</ul>`;
  res.write(articleList);
  const footer = templateFooter();
  res.write(footer);
  res.end();
});

app.get("/articles/:id", async (req, res) => {
  await delay(250);
  res.write(header);
  await delay(500);

  try {
    const article = JSON.parse(
      await fsp.readFile("src/data/articles.json", "utf-8")
    ).find((article) => article.id === parseInt(req.params.id));

    const articleDetail = templateArticleDetail(article);
    res.write(articleDetail);
  } catch (error) {
    console.error(error);
    res.write("<p>Article not found</p>");
  }

  const footer = templateFooter();
  res.write(footer);
  res.end();
});

app.use(express.static("src/public"));

app.listen(3000, () => console.log("listening on 3000.."));
