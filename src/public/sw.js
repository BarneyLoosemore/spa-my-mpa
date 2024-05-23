import { Router } from "./shared/router.js";
import {
  cacheFirst,
  staleWhileRevalidate,
  mergePartials,
  populateCache,
  networkFirst,
} from "./shared/strategies.js";

const router = new Router();

router.get("/", (headers) => cacheFirst("/", headers));
router.get("/articles", (headers) => networkFirst("/articles", headers));
router.get("/articles/:id", (headers, { id }) =>
  staleWhileRevalidate(`/articles/${id}`, headers)
);

const handleNavigation = async (event) => {
  const headers = new Headers();
  const url = new URL(event.request.url);
  headers.append("X-Content-Mode", "partial");

  const dynamicPartial = router.handle({
    method: "GET",
    url: url.pathname,
    headers,
  });

  const parts = [
    cacheFirst("/header-partial"),
    dynamicPartial,
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
