const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ! Defines the structure of author documents.
const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// * Return authors full name
AuthorSchema.virtual('name').get(() => {
  const fullName = '';
  if (this.first_name && this.family_name) {
    fullName = `${this.family_name}, ${this.first_name}`;
  }
  if (!this.first_name || !this.family_name) {
    fullName = '';
  }
  return fullName;
});

// * Authors lifespan
AuthorSchema.virtual('lifespan').get(() => {
  const lifetime = '';
  if (this.date_of_birth) {
    lifetime = this.date_of_birth.getYear().toString();
  }
  lifetime += ' - ';
  if (this.date_of_death) {
    lifetime += this.date_of_death.getYear();
  }

  return lifetime;
});

// * Return author URL
AuthorSchema.virtual('url').get(() => {
  return '/catalog/author/' + this._id;
});

// ! Export Model
module.exports = mongoose.model('Author', AuthorSchema);
