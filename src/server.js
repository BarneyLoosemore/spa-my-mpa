import http from "http";
import fsp from "fs/promises";
import { Readable } from "stream";
import { Router } from "./shared/router.js";
import { ReadableStream } from "stream/web";
import { templateArticle, templateArticleDetail } from "./lib/templates.js";
import { header, footer, home } from "./lib/partials.js";

const router = new Router();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getArticleList = async () => {
  await wait(1000);
  const articles = JSON.parse(
    await fsp.readFile("src/data/articles.json", "utf-8")
  );
  return `<ul class="article-list">${articles
    .map(templateArticle)
    .join("")}</ul>`;
};

const getArticleDetail = async (id) => {
  await wait(1000);
  const articles = JSON.parse(
    await fsp.readFile("src/data/articles.json", "utf-8")
  );
  const article = articles.find((article) => article.id === parseInt(id));
  return templateArticleDetail(article);
};

const mergePartials = async (partials) => {
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

router.get(
  "/",
  () =>
    new Response(header + home + footer, {
      headers: { "Content-Type": "text/html" },
    })
);
router.get("/articles", async () => {
  const articleListPromise = getArticleList();
  const res = await mergePartials([header, articleListPromise, footer]);
  return new Response(res, {
    headers: { "Content-Type": "text/html" },
  });
});
router.get("/articles/:id", async ({ id }) => {
  const articleDetailPromise = getArticleDetail(id);
  const res = await mergePartials([header, articleDetailPromise, footer]);
  return new Response(res, {
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

// TODO: refact?
router.get("/shared/router.js", async () => {
  const content = await fsp.readFile("src/shared/router.js");
  return new Response(content, {
    headers: { "Content-Type": "text/javascript" },
  });
});

function webStreamToNodeStream(webStream) {
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
}

const nodeAdapter = async (req, res) => {
  const { body, status, headers } = await router.handle(req.url, req.method);
  console.log(Object.fromEntries(headers.entries()));
  res.writeHead(status, Object.fromEntries(headers.entries()));
  const nodeStream = webStreamToNodeStream(body);
  nodeStream.pipe(res);
};

const listen = (port) => {
  http
    .createServer(nodeAdapter)
    .listen(port, () => console.log("listening on 3000.."));
};

listen(3000);
