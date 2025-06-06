import dayjs from "dayjs";
const calculateRecentScore = (createdAt) => {
  const hourSinceUpload = dayjs().diff(dayjs(createdAt), "minutes");
  return hourSinceUpload;
};
export { calculateRecentScore };
