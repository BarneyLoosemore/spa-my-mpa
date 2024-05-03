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
