const BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec((err, list_bookinstances) => {
      if (err) next(err);

      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) next(err);

      if (bookinstance === null) {
        const err = new Error('Book Instance copy not found');
        err.status = 404;
        return next(err);
      }

      res.render('bookinstance_detail', {
        title: 'Copy: ' + bookinstance.book.title,
        bookinstance: bookinstance,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
  Book.find().exec((err, books) => {
    if (err) next(err);

    res.render('bookinstance_form', {
      title: 'Create Book Instance',
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // Errors exist
      Book.find().exec((err, books) => {
        if (err) next(err);

        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
        return;
      });
    } else {
      bookinstance.save((err) => {
        if (err) next(err);

        res.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
// Passes in ID - and we only provide bookinstance information to the delete page
exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) next(err);

      if (bookinstance === null) {
        const error = new Error('Book Instance not found');
        error.status = 404;

        return next(err);
      }

      res.render('bookinstance_delete', {
        title: 'Delete Book-Instance',
        bookinstance: bookinstance,
      });
    });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
  BookInstance.findByIdAndDelete(req.params.id, (err) => {
    if (err) next(err);

    res.redirect('/catalog/bookinstances');
  });
};

// Display BookInstance update form on GET.
// Produce the BookInstance update page with the populated inputs based on the id passed in
exports.bookinstance_update_get = function (req, res, next) {
  async.parallel(
    {
      bookinstance: (callback) =>
        BookInstance.findById(req.params.id).exec(callback),
      book_list: (callback) => Book.find().exec(callback),
    },
    (err, results) => {
      if (err) next(err);

      res.render('bookinstance_form', {
        title: 'Edit BookInstance',
        bookinstance: results.bookinstance,
        book_list: results.book_list,
      });
    }
  );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // Errors exist in the data provided
      // We need to query the data again, and re provide it to the form page
      async.parallel(
        {
          bookinstance: (callback) =>
            BookInstance.findById(req.params.id).exec(callback),
          book_list: (callback) => Book.find().exec(callback),
        },
        (err, results) => {
          if (err) next(err);

          res.render('bookinstance_form', {
            title: 'Update BookInstance',
            bookinstance: bookinstance,
            book_list: results.book_list,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data passed validation, so process request
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        (err, bookinstanceFound) => {
          if (err) next(err);

          res.redirect(bookinstanceFound.url);
        }
      );
    }
  },
];
