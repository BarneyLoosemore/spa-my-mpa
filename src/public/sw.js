const cacheName = "v1";

const populateCache = async () => {
  const cache = await caches.open(cacheName);
  return cache.addAll(["/", "/articles"]);
};

const cacheFirst = async (request) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;
  const response = await fetch(request);
  await cache.put(request, response.clone());
  return response;
};

const handleFetch = async (event) => {
  const isNavigation = event.request.mode === "navigate";

  // if (isNavigation) {
  // handle templating w/ partials
  // }

  return cacheFirst(event.request);
};

addEventListener("install", (event) => event.waitUntil(populateCache()));
addEventListener("fetch", (event) => event.respondWith(handleFetch(event)));
