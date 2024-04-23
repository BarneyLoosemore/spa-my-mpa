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

const generateArticles = (count) =>
  Array.from(
    {
      length: count,
    },
    (_, index) => {
      const title = WORDS[Math.floor(Math.random() * WORDS.length)];
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
        image: `https://picsum.photos/id/${index + 1}/500/500`,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        published: getRandomDate(),
      };
    }
  );
