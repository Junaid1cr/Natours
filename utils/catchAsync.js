module.exports = (fn) => {
  const x = 10;
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
