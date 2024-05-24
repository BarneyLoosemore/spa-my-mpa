import http from "http";
import fsp from "fs/promises";
import { ReadableStream } from "stream/web";
import { Readable } from "stream";
import { Router } from "./router.js";
import {
  header,
  footer,
  home,
  templateArticle,
  templateArticleDetail,
} from "./templates.js";
import { generateArticle } from "../generateArticles.js";

const router = new Router();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getArticleList = async () => {
  const articles = JSON.parse(
    await fsp.readFile("src/data/articles.json", "utf-8")
  );
  return `<ul class="article-list">${articles
    .sort((a, b) => new Date(b.published) - new Date(a.published))
    .map(templateArticle)
    .join("")}</ul>`;
};

const getArticleDetail = async (id) => {
  const articles = JSON.parse(
    await fsp.readFile("src/data/articles.json", "utf-8")
  );
  const article = articles.find((article) => article.id === id);
  return templateArticleDetail(article);
};

const mergePartials = (partials) => {
  const partialsPromises = partials.map((partial) => Promise.resolve(partial));
  return new ReadableStream({
    async start(controller) {
      for (const partial of partialsPromises) {
        controller.enqueue(await partial);
      }
      controller.close();
    },
  });
};

router.get("/", async (headers) => {
  const isPartialReq = headers["x-content-mode"] === "partial";
  if (isPartialReq) {
    return new Response(home, {
      headers: { "Content-Type": "text/html" },
    });
  }
  return new Response(mergePartials([header, home, footer]), {
    headers: { "Content-Type": "text/html" },
  });
});
router.get("/articles", async (headers) => {
  const isPartialReq = headers["x-content-mode"] === "partial";
  const articleListPromise = getArticleList();

  if (isPartialReq)
    return new Response(await articleListPromise, {
      headers: { "Content-Type": "text/html" },
    });

  return new Response(mergePartials([header, articleListPromise, footer]), {
    headers: { "Content-Type": "text/html" },
  });
});
router.get("/articles/:id", async (headers, { id }) => {
  const isPartialReq = headers["x-content-mode"] === "partial";
  const articleDetailPromise = getArticleDetail(id);

  if (isPartialReq) {
    return new Response(await articleDetailPromise, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return new Response(mergePartials([header, articleDetailPromise, footer]), {
    headers: { "Content-Type": "text/html" },
  });
});
router.get(
  "/header-partial",
  () =>
    new Response(header, {
      headers: { "Content-Type": "text/html" },
    })
);
router.get(
  "/footer-partial",
  () =>
    new Response(footer, {
      headers: { "Content-Type": "text/html" },
    })
);
// router.get("/articles-updated", async () => {

const contentTypeMap = {
  css: "text/css",
  js: "text/javascript",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const assets = await fsp.readdir("src/public", {
  recursive: true,
});

for (const file of assets) {
  router.get(`/${file}`, async () => {
    const contentType = file.split(".").pop();
    const content = await fsp.readFile(`src/public/${file}`);
    return new Response(content, {
      headers: { "Content-Type": contentTypeMap[contentType] },
    });
  });
}

const webStreamToNodeStream = (webStream) => {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
  });
};

const nodeAdapter = async (req, res) => {
  const { body, status, headers } = await router.handle(req);
  res.writeHead(status, Object.fromEntries(headers.entries()));
  const nodeStream = webStreamToNodeStream(body);
  nodeStream.pipe(res);
};

const listen = (port) => {
  http
    .createServer(nodeAdapter)
    .listen(port, () => console.log("listening on 3000.."));
};

const scheduleArticlesUpdate = () => {
  setInterval(async () => {
    const articles = JSON.parse(
      await fsp.readFile("src/data/articles.json", "utf-8")
    );
    const lastId = articles[articles.length - 1].id;
    console.log({ lastId });
    const newArticle = generateArticle(lastId + 1, new Date());
    articles.push(newArticle);
    await fsp.writeFile(
      "src/data/articles.json",
      JSON.stringify(articles, null, 2)
    );
  }, 30000);
};

// scheduleArticlesUpdate();

listen(3000);
