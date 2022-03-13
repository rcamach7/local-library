var Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
  Genre.find().exec((err, list_genres) => {
    if (err) next(err);

    res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      books: (callback) =>
        Book.find({ genre: req.params.id })
          .populate('author')
          .populate('genre')
          .exec(callback),
    },
    (err, results) => {
      if (err) next(err);

      if (results === null) {
        const err = new Error('Book Not Found');
        err.status = 404;
        return next(err);
      }

      // Found all needed information about the genre so we can render the page and pass in relevant information
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre_books: results.books,
        genre: results.genre,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  res.render('genre_form', { title: 'Create Genre' });
};

// * Instead of being a single middleware function the controller specifies an array of middleware functions.
// Handle Genre create on POST
exports.genre_create_post = [
  // Validate nd sanitize the name field
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
  // Once validation passes, process post request
  (req, res, next) => {
    // Extract validation errors
    const errors = validationResult(req);

    // Create a genre object with sanitized data
    const genre = new Genre({ name: req.body.name });

    // If errors existed in the validation, return data. If not, process data.
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // First check if genre already exists.
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) next(err);

        // Genre Exists, redirect to it's page. If not, process data.
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) next(err);
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
// This gets the data if the user presses delete while in the genre detail page
exports.genre_delete_get = function (req, res) {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) next(err);

      if (results.genre_books.length > 0) {
        // Books still exists with genre user is trying to delete, which is not allowed
        res.render('genre_delete', {
          title: 'Delete Genre',
          genre: results.genre,
          genre_books: results.genre_books,
        });
        return;
      } else {
        Genre.findByIdAndDelete(req.params.id, (err) => {
          if (err) next(err);

          res.redirect('/catalog/genres');
        });
      }
    }
  );
};

// Handle Genre delete on POST.
// User requested delete page so we obtain the genre information and provide it to the delete page before deletion gets done.
exports.genre_delete_post = function (req, res) {
  async.parallel(
    {
      genre: (callback) => Genre.findById(req.params.id).exec(callback),
      genre_books: (callback) =>
        Book.find({ genre: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) next(err);

      if (results.genre === null) {
        // No genre with given ID found
        res.redirect('/catalog/genres');
      }

      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
  Genre.findById(req.params.id).exec((err, genre) => {
    if (err) next(err);

    res.render('genre_form', { title: 'Update Form', genre: genre });
  });
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const updatedGenre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Genre.findById(req.params.id, (err, genre) => {
        if (err) next(err);

        res.render('genre_form', {
          title: 'Update Genre',
          genre: genre,
          errors: errors.array(),
        });
      });
    } else {
      // Process update request

      Genre.findByIdAndUpdate(req.params.id, updatedGenre, {}, (err, genre) => {
        if (err) next(err);

        res.redirect(genre.url);
      });
    }
  },
];
