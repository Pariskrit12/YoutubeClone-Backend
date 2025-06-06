const calculateCommentPopularScore = ({ replies = 0, likes = 0 }) => {
  const score = likes * 0.4 + replies * 0.2;
  return score;
};

export { calculateCommentPopularScore };
