const calculatePopularScore = ({ views, likes, comments }) => {
  const finalScore = views * 0.4 + likes * 0.4 + comments * 0.2;
  return finalScore;
};

export { calculatePopularScore };
