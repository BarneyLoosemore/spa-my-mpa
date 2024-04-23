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
    <meta name="view-transition" content="same-origin" />
    <link rel="stylesheet" href="/index.css" />
    <title>MPA-cum-SPA</title>
  </head>
  <body>
    <header>
      <h1>MPA-cum-SPA</h1>
    </header>
    <main>
`;

export const templateFooter = (
  speculationRules = DEFAULT_SPECULATION_RULES
) => `
    </main>
    <footer>
      <p>Footer</p>
    </footer>
  </body>
  <script type="speculationrules">${JSON.stringify(speculationRules)}</script>
  </html>
  `;

// <script type="module">navigator.serviceWorker.register("/sw.js")</script>
export const home = `
  <article>
    <h1>Home</h1>
    <a href="/articles">Articles</a>
  </article>
`;

export const templateArticle = ({ id, title, image }, index) => `
  <li>
    <article>
      <a href="/articles/${id}" class="${
  index <= 5 ? "eager" : "conservative"
}">
        <h1>${title}</h1>
      </a>
      <img src="${image}" style="view-transition-name: image-${id}" />
    </article>
  </li>
`;

export const templateArticleDetail = ({ id, title, image, content }) => `
 <section class="article-detail">
    <h1>${title}</h1>
    <img src="${image}" style="view-transition-name: image-${id}" />
    <p>${content}</p>
  </section>
`;
