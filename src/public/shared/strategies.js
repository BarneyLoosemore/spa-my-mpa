const cacheName = "v1";
export const populateCache = async () => {
  const cache = await caches.open(cacheName);
  return cache.addAll([
    "/",
    "/index.css",
    "/header-partial",
    "/footer-partial",
    "/articles",
  ]);
};

export const mergePartials = async (responsePromises) => {
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

export const staleWhileRevalidate = async (pathname, headers) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(pathname);
  const fetchPromise = (async () => {
    const response = await fetch(pathname, { headers });
    cache.put(pathname, response.clone());
    return response;
  })();
  return cachedResponse || fetchPromise;
};

export const cacheFirst = async (pathname, headers) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(pathname);
  if (cachedResponse) return cachedResponse;
  console.log({ headers });
  const response = await fetch(pathname, { headers });
  cache.put(pathname, response.clone());
  return response;
};

export const networkFirst = async (pathname, headers) => {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(pathname, { headers });
    cache.put(pathname, response.clone());
    return response;
  } catch (error) {
    return cache.match(pathname);
  }
};

// export const checkForUpdatesInStream = async (pathname, headers) => {
//   const cache = await caches.open(cacheName);
//   const cachedResponse = await cache.match(pathname, headers);

//   if (!cachedResponse) {
//     const response = await fetch(pathname, { headers });
//     cache.put("/articles", response.clone());
//     return response;
//   }

//   console.log("checking..");

//   const { readable, writable } = new TransformStream();

//   (async () => {
//     await cachedResponse.body.pipeTo(writable, {
//       preventClose: true,
//     });

//     const networkResponse = await fetch(pathname, { headers });
//     const networkText = await networkResponse.text();
//     const cachedText = await (await cache.match(pathname)).text();

//     if (networkText !== cachedText) {
//       console.log("updating..");
//       cache.put(pathname, networkResponse.clone());
//       networkResponse.body.pipeTo(writable, { preventClose: true });
//     }
//   })();

//   return new Response(readable, {
//     headers: {
//       "Content-Type": "text/html",
//     },
//   });
// };
