const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});

// * Return URL
GenreSchema.virtual('url').get(() => {
  return '/catalog/book' + this._id;
});

module.exports = mongoose.model('Genre', GenreSchema);
