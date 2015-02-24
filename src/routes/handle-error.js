var handleError = function(err, res) {
  res.status(500).json({
    status: 500,
    error: err
  });
};

module.exports = handleError;
