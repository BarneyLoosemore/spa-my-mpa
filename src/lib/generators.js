import fsp from "fs/promises";

const getRandomDate = () => {
  const date = new Date();
  date.setHours(Math.floor(Math.random() * 24));
  return date.getTime();
};

const WORDS = [
  "Lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipisicing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
];

const CATEGORIES = [
  "Technology",
  "Science",
  "Politics",
  "Sports",
  "Entertainment",
  "Fashion",
  "Music",
  "Travel",
  "Food",
];

const IMAGES = (await fsp.readdir("src/public/images")).map(
  (file) => `/images/${file}`
);

const generateArticles = (count) =>
  Array.from(
    {
      length: count,
    },
    (_, index) => {
      const title =
        WORDS[Math.floor(Math.random() * WORDS.length)] +
        " " +
        WORDS[Math.floor(Math.random() * WORDS.length)];
      const content = Array.from(
        {
          length: 10 + Math.floor(Math.random() * 25),
        },
        () => WORDS[Math.floor(Math.random() * WORDS.length)]
      ).join(" ");

      return {
        id: index + 1,
        title,
        content,
        image: IMAGES[Math.floor(Math.random() * IMAGES.length)],
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        published: getRandomDate(),
      };
    }
  );

const articles = generateArticles(50);

fsp.writeFile("src/data/articles.json", JSON.stringify(articles, null, 2));
