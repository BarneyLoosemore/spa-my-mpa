// TODO: make a pageReveal & pageSwap router library!
const setTemporaryViewTransitionNames = async (elements, viewTransitonDone) => {
  for (let [element, name] of elements) {
    element.style.viewTransitionName = name;
  }
  await viewTransitonDone;
  for (let [element] of elements) {
    element.style.viewTransitionName = "none";
  }
};

const getArticleId = (url) => url.pathname.split("/")[2];

const getPageSwapUrls = (event) => {
  const currentUrl = new URL(event.activation.from.url);
  const toUrl = new URL(event.activation.entry.url);
  return { currentUrl, toUrl };
};

const getPageRevealUrls = () => {
  const fromUrl = new URL(navigation.activation.from.url);
  const currentUrl = new URL(navigation.activation.entry.url);
  return { fromUrl, currentUrl };
};

const saveCoords = (image) => {
  sessionStorage.setItem(
    "articleImageCoords",
    JSON.stringify(image.getBoundingClientRect())
  );
};

const distanceBetweenCoords = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const isNewImageTooFar = (image) => {
  const oldCoords = JSON.parse(sessionStorage.getItem("articleImageCoords"));
  const newCoords = image.getBoundingClientRect();
  const distance = distanceBetweenCoords(oldCoords, newCoords);

  const MAX_DISTANCE = 400;
  return distance > MAX_DISTANCE;
};

const patternToRegexp = (pattern) => {
  const escapedPattern = pattern.replace(/\//g, "\\/");
  const parameterizedPattern = escapedPattern.replace(/:\w+/g, "([^/]+)");
  const wildcardPattern = parameterizedPattern.replace(/\*/g, "([^/]+)");
  const regexPattern = `^${wildcardPattern}(?:\\/?)$`;
  return new RegExp(regexPattern);
};

const urlPatterns = ["/", "/articles", "/articles/:id"];
const getPatternFromPath = (pathname) =>
  urlPatterns.find((pattern) => patternToRegexp(pattern).test(pathname));

const pageSwapNavHandlerMap = {
  "/ -> /articles": () => {},
  "/articles -> /articles/:id": async (event, { toUrl }) => {
    const id = getArticleId(toUrl);
    const articleImage = document.querySelector(`#${id} img`);
    saveCoords(articleImage);

    await setTemporaryViewTransitionNames(
      [[articleImage, "article-image"]],
      event.viewTransition.finished
    );
  },
  "/articles/:id -> /articles": () => {},
  default: () => {},
};

const pageRevealNavHandlerMap = {
  "/ -> /articles": () => {},
  "/articles -> /articles/:id": async (_, { currentUrl }) => {
    const id = getArticleId(currentUrl);
    const articleImage = document.querySelector(`#${id} img`);

    if (isNewImageTooFar(articleImage)) {
      articleImage.style.viewTransitionName = "article-image-reveal";
    }
  },
  "/articles/:id -> /articles": async (event, { fromUrl }) => {
    const id = getArticleId(fromUrl);
    const articleImage = document.querySelector(`#${id} img`);
    await setTemporaryViewTransitionNames(
      [[articleImage, "article-image"]],
      event.viewTransition.ready
    );
  },
  default: () => {},
};

const getPageSwapHandler = (currentUrl, toUrl) => {
  const fromPattern = getPatternFromPath(currentUrl.pathname);
  const toPattern = getPatternFromPath(toUrl.pathname);
  const navigation = `${fromPattern} -> ${toPattern}`;
  return pageSwapNavHandlerMap[navigation] || pageSwapNavHandlerMap.default;
};

const getPageRevealHandler = (fromUrl, currentUrl) => {
  const fromPattern = getPatternFromPath(fromUrl.pathname);
  const currentPattern = getPatternFromPath(currentUrl.pathname);
  const navigation = `${fromPattern} -> ${currentPattern}`;
  return pageRevealNavHandlerMap[navigation] || pageRevealNavHandlerMap.default;
};

window.addEventListener("pageswap", (event) => {
  if (!event.viewTransition) return;
  const { currentUrl, toUrl } = getPageSwapUrls(event);
  const handlerFn = getPageSwapHandler(currentUrl, toUrl);
  handlerFn(event, { currentUrl, toUrl });
});

window.addEventListener("pagereveal", async (event) => {
  if (!event.viewTransition) return;
  const { fromUrl, currentUrl } = getPageRevealUrls();
  const handlerFn = getPageRevealHandler(fromUrl, currentUrl);
  handlerFn(event, { fromUrl, currentUrl });
});
