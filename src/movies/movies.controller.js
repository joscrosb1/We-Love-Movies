const service = require("./movies.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const { is_showing } = req.query;
  const data = await service.list(is_showing);
  res.json({ data });
}

async function ifMovieExists(req, res, next) {
  const { movieId } = req.params;
  const foundMovie = await service.read(movieId);
  
  if (foundMovie) {
    res.locals.foundMovie = foundMovie;
    return next();
  } else {
    return res.status(404).json({ error: "Movie not found" });
  }
}

async function read(req, res) {
  const { movieId } = req.params;
  const movie = await service.read(movieId);

  if (movie) {
    return res.json({ data: movie });
  }
}

async function getMovieTheaters(req, res, next) {
  const { movieId } = req.params;
  const theaters = await service.getMovieTheaters(Number(movieId));
  res.json({ data: theaters });
}

async function getMovieReviews(req, res, next) {
  const { movieId } = req.params;
  const reviews = await service.getMovieReviews(movieId);
  const allReviews = [];

  await Promise.all(
    reviews.map(async (review) => {
      const critic = await service.getCritic(review.critic_id);
      review.critic = critic[0];
      allReviews.push(review);
    })
  );

  res.status(200).json({ data: allReviews });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [ifMovieExists, asyncErrorBoundary(read)],
  getMovieTheaters: [ifMovieExists, asyncErrorBoundary(getMovieTheaters)],
  getMovieReviews: [ifMovieExists, asyncErrorBoundary(getMovieReviews)],
};
