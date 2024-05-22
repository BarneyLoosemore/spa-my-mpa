const DEFAULT_SPECULATION_RULES = {
  prerender: ["conservative", "moderate", "eager", "immediate"].map(
    (eagerness) => ({
      where: {
        selector_matches: `.${eagerness}`,
      },
      eagerness,
    })
  ),
};

export const header = `
<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/index.css" />
    <title>MPA-cum-SPA</title>
    <script type="module">
      window.addEventListener('pageswap', (event) => {
        console.log(event)
      });
    </script>
  </head>
  <body>
    <header>
      <h1>MPA-cum-SPA</h1>
    </header>
    <main>
`;

export const footer = `
    </main>
    <footer>
      <p>Footer</p>
    </footer>
  </body>
  <script type="speculationrules">${JSON.stringify(
    DEFAULT_SPECULATION_RULES
  )}</script>
  <script type="module">navigator.serviceWorker.register("/sw.js", {
    type: "module"
  })</script>
</html>
  `;

export const home = `
  <article>
    <h1>Home</h1>
    <a href="/articles">Articles</a>
  </article>
`;

export const templateArticle = ({ id, title, published, image }, index) => {
  const articleRenderPriority =
    index === 0 ? "immediate" : index <= 5 ? "eager" : "moderate";
  const hoursSincePublished = Math.floor(
    (Date.now() - new Date(published).getTime()) / 3600000
  );
  return `
    <li>
      <article>
      <a href="/articles/${id}" class="${articleRenderPriority}">
          <img src="${image}" style="view-transition-name: image-${id}" />
          <h1>${title}</h1>
          <p>${hoursSincePublished}h ago</p>
        </a>
      </article>
    </li>
  `;
};

export const templateArticleDetail = ({ id, title, image, content }) => `
 <section class="article-detail">
    <h1>${title}</h1>
    <img src="${image}" style="view-transition-name: image-${id}" />
    <p style="view-transition-name: content">${content}</p>
  </section>
`;
