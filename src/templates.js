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

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display" rel="stylesheet">


    <title>MPA-cum-SPA</title>
    <script type="module" src="/index.js"></script>
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
    <h2>Home</h2>
    <a href="/articles">Articles</a>
  </article>
`;

const categoryCardClassMap = {
  Fashion: "large-card",
  Technology: "xl-card",
};

export const templateArticle = (
  { id, title, standFirst, published, category, image },
  index
) => {
  const articleRenderPriority =
    index === 0 ? "immediate" : index <= 5 ? "eager" : "moderate";
  const hoursSincePublished = Math.floor(
    (Date.now() - new Date(published).getTime()) / 3600000
  );
  const cardClass = categoryCardClassMap[category] ?? "small-card";

  return `
    <li class="${cardClass}" id="${id}">
      <article>
        <a href="/articles/${id}" class="${articleRenderPriority}">
          <img src="${image}" />
          <h2>${title}<span>${hoursSincePublished}h ago</span></h2>
          <p>${standFirst}</p>
        </a>
      </article>
    </li>
  `;
};

export const templateArticleDetail = ({ id, title, image, content }) => `
 <section class="article-detail" id="${id}">
    <h2 style="view-transition-name: article-title">${title}</h2>
    <img src="${image}" style="view-transition-name: article-image" />
    <p>${content}</p>
  </section>
`;
