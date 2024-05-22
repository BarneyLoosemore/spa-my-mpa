import { Router } from "./shared/router.js";

const router = new Router();

const mergePartials = async (responsePromises) => {
  const { readable, writable } = new TransformStream();

  const done = (async () => {
    for await (const response of responsePromises) {
      await response.body.pipeTo(writable, { preventClose: true });
    }
    writable.getWriter().close();
  })();

  return {
    done,
    response: new Response(readable, {
      headers: {
        "Content-Type": "text/html",
      },
    }),
  };
};

const cacheName = "v1";
const populateCache = async () => {
  const cache = await caches.open(cacheName);
  return cache.addAll([
    "/",
    "/index.css",
    "/header-partial",
    "/footer-partial",
  ]);
};

const staleWhileRevalidate = async (pathname, headers) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(pathname);
  const fetchPromise = (async () => {
    const response = await fetch(pathname, { headers });
    cache.put(pathname, response.clone());
    return response;
  })();
  return cachedResponse || fetchPromise;
};

const cacheFirst = async (pathname, headers) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(pathname);
  if (cachedResponse) return cachedResponse;
  const response = await fetch(pathname, { headers });
  cache.put(pathname, response.clone());
  return response;
};

const networkFirst = async (pathname, headers) => {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(pathname, { headers });
    cache.put(pathname, response.clone());
    return response;
  } catch (error) {
    return cache.match(pathname);
  }
};

router.get("/", async (headers) => cacheFirst("/", headers));
router.get("/articles", async (headers) => networkFirst("/articles", headers));
router.get("/articles/:id", async (headers, { id }) =>
  staleWhileRevalidate(`/articles/${id}`, headers)
);

const handleNavigation = async (event) => {
  const headers = new Headers();
  const url = new URL(event.request.url);
  headers.append("X-Content-Mode", "partial");

  const parts = [
    cacheFirst("/header-partial"),
    router.handle({
      method: "GET",
      url: url.pathname,
      headers,
    }),
    cacheFirst("/footer-partial"),
  ];

  const { done, response } = await mergePartials(parts);

  event.waitUntil(done);
  return response;
};

const handleFetch = async (event) => {
  const isNavigation = event.request.mode === "navigate";
  if (isNavigation) return handleNavigation(event);
  return cacheFirst(event.request.url, event.request.headers);
};

addEventListener("install", (event) => event.waitUntil(populateCache()));
addEventListener("fetch", (event) => event.respondWith(handleFetch(event)));
