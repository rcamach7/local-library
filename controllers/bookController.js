const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');

const async = require('async');

exports.index = (req, res) => {
  async.parallel(
    {
      book_count: (callback) => Book.countDocuments({}, callback),
      book_instance_count: (callback) =>
        BookInstance.countDocuments({}, callback),
      book_instance_available_count: (callback) =>
        BookInstance.countDocuments({ status: 'Available' }, callback),
      author_count: (callback) => Author.countDocuments({}, callback),
      genre_count: (callback) => Genre.countDocuments({}, callback),
    },
    (err, results) => {
      res.render('index', {
        title: 'Local Library Home',
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all books.
exports.book_list = function (req, res) {
  Book.find({}, 'title author')
    .sort({ title: 1 })
    .populate('author')
    .exec((err, list_books) => {
      if (err) next(err);

      res.render('book_list', { title: 'Books List', book_list: list_books });
    });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      book_instance: (callback) => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) next(err);

      if (results === null) {
        const err = new Error('Book Not Found');
        err.status = 404;
        return next(err);
      }

      res.render('book_detail', {
        title: results.book.title,
        book: results.book,
        book_instances: results.book_instance,
      });
    }
  );
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  async.parallel(
    {
      authors: (callback) => Author.find(callback),
      genres: (callback) => Genre.find(callback),
    },
    (err, results) => {
      if (err) next(err);

      res.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre into an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === undefined) {
        req.genre.body = undefined;
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('author', 'Author must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),
  (req, res, next) => {
    // Extract errors if any
    const errors = validationResult(req);

    // Create object from data
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    // Check if any errors are present. If not, process data.
    if (!errors.isEmpty()) {
      // Get all authors and genres to populate form again
      async.parallel(
        {
          authors: (callback) => Author.find(callback),
          genres: (callback) => Genre.find(callback),
        },
        (err, results) => {
          if (err) next(err);

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }

          res.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
          return;
        }
      );
    } else {
      // If nor errors, we can process the data.
      book.save((err) => {
        if (err) next(err);

        // Successfully added, we can now redirect user
        res.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update POST');
};
