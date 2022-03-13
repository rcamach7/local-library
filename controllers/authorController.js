const Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');
const { body, validationResult } = require('express-validator');
const author = require('../models/author');

// Displays list of all authors
exports.author_list = (req, res, next) => {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec((err, list_authors) => {
      if (err) next(err);
      res.render('author_list', { title: 'Author', author_list: list_authors });
    });
};

// Display detail page for a specific Author.
exports.author_detail = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => Author.findById(req.params.id).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.params.id }, 'title summary').exec(callback),
    },
    (err, results) => {
      if (err) next(err);
      if (results.author == null) {
        var err = new Error('Author not found');
        err.status = 404;
        return next(err);
      }

      res.render('author_detail', {
        title: 'Author Detail',
        author: results.author,
        author_books: results.author_books,
      });
    }
  );
};

// Display Author create form on GET.
exports.author_create_get = function (req, res) {
  res.render('author_form', { title: 'Create New Author' });
};

// Handle Author create on POST.
exports.author_create_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    // Extract all possible errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create author',
        author: req.body,
        errors: errors.array(),
      });
    } else {
      // Form data is valid, we can now process the request
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });
      author.save((err) => {
        if (err) next(err);
        res.redirect(author.url);
      });
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => Author.findById(req.params.id).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) next(err);

      // No author found
      if (results.author === null) {
        res.redirect('catalog/authors');
      }

      res.render('author_delete', {
        title: 'Delete author',
        author: results.author,
        author_books: results.author_books,
      });
    }
  );
};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res, next) {
  async.parallel(
    {
      author: (callback) => Author.findById(req.params.id).exec(callback),
      author_books: (callback) =>
        Book.find({ author: req.params.id }).exec(callback),
    },
    (err, result) => {
      if (err) next(err);

      // Checks to see if any books are linked to the author that user is trying to delete.
      if (results.author_books > 0) {
        res.render('author_delete', {
          title: 'Delete author',
          author: results.author,
          author_books: results.author_books,
        });
        return;
      } else {
        // Author has no books, so we can proceed to delete the author document.
        Author.findByIdAndDelete(req.body.authorid, (err) => {
          if (err) next(err);

          // Deletion successful, redirect user.
          res.redirect('/catalog/authors');
        });
      }
    }
  );
};

// Display Author update form on GET.
exports.author_update_get = function (req, res) {
  Author.findById(req.params.id).exec((err, author) => {
    if (err) next(err);

    if (author === null) {
      const error = new Error('Author not found');
      error.status = 404;

      return next(err);
    }

    res.render('author_form', {
      title: 'Update Author Information',
      author: author,
    });
  });
};

// Handle Author update on POST.
exports.author_update_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const updatedAuthor = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });

    if (errors.isEmpty()) {
      // Errors exist in the data provided
      // We need to query the data again, and re provide it to the form page
      Author.findById(req.params.id, (err, authorFound) => {
        res.render('author_form', {
          title: 'Update Author',
          author: authorFound,
          errors: errors.array(),
        });
      });
    } else {
      // Process updated data
      Author.findByIdAndUpdate(
        req.params.id,
        updatedAuthor,
        {},
        (err, authorUpdated) => {
          if (err) next(err);

          res.redirect(authorUpdated.url);
        }
      );
    }
  },
];
