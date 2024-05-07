const mergeResponses = async (responsePromises, headers) => {
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
      headers: headers || (await responsePromises[0]).headers,
    }),
  };
};

const cacheName = "v1";
const populateCache = async () => {
  const cache = await caches.open(cacheName);
  return cache.addAll([
    "/index.css",
    "/",
    "/header-partial",
    "/footer-partial",
  ]);
};

const cacheFirst = async (pathname) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(pathname);
  if (cachedResponse) return cachedResponse;

  const response = await fetch(pathname);
  await cache.put(pathname, response.clone());
  return response;
};

const handleFetch = async (event) => {
  const isNavigation = event.request.mode === "navigate";

  if (isNavigation) {
    const headers = new Headers();
    const url = new URL(event.request.url);
    headers.append("X-Content-Mode", "partial");

    console.log(url.pathname);

    const parts = [
      cacheFirst("/header-partial"),
      fetch(url.pathname, {
        method: "GET",
        headers,
      }),
      cacheFirst("/footer-partial"),
    ];

    const { done, response } = await mergeResponses(parts);

    event.waitUntil(done);
    return response;
  }

  return cacheFirst(event.request);
};

addEventListener("install", (event) => event.waitUntil(populateCache()));
addEventListener("fetch", (event) => event.respondWith(handleFetch(event)));
