import dayjs from "dayjs";
const calculateTrendingScore = ({ views, likes, comments, createdAt }) => {
  const hourSinceUpload = dayjs().diff(dayjs(createdAt), "hour");
  const score = views * 0.4 + likes * 0.4 + comments * 0.2;
  const decay = 1 / (hourSinceUpload + 2);

  const finalScore = score * decay;
  return finalScore;
};
export { calculateTrendingScore };
