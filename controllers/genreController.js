var Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
  Genre.find().exec((err, list_genres) => {
    if (err) next(err);

    res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
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
exports.genre_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST');
};
