# Schema Interface (document blueprint)

- The Schema allows you to define the fields stored in each document along with their validation requirements and default values.
  - Schemas are then "compiled" into models using the mongoose.model() method. Once you have a model you can use it to find, create, update, and delete objects of the given type.
  - Note: Each model maps to a collection of documents in the MongoDB database. The documents will contain the fields/schema types defined in the model Schema.

Here are the different field types you can assign in a schema

```js
var schema = new Schema({
  name: String,
  binary: Buffer,
  living: Boolean,
  updated: { type: Date, default: Date.now() },
  age: { type: Number, min: 18, max: 65, required: true },
  mixed: Schema.Types.Mixed,
  _someId: Schema.Types.ObjectId,
  array: [],
  ofString: [String], // You can also have an array of each of the other types too.
  nested: { stuff: { type: String, lowercase: true, trim: true } },
});
```

# Model are collections in a mongoDB databases

- Models use schemas (as in a pattern a document should follow), which are then represented as collections inside a mongoDB database.
- Once you've created a schema you can use it to create models. The model represents a collection of documents in the database that you can search, while the model's instances represent individual documents that you can save and retrieve.

`const ModelName = mongoose.model('ModelName', SomeModelSchema );`

## Creating and modifying documents

```js
// Create an instance of model SomeModel
var awesome_instance = new SomeModel({ name: 'awesome' });

// Save the new model instance, passing a callback
awesome_instance.save(function (err) {
  if (err) return handleError(err);
  // saved!
});
```

### Virtuals

- Think of them as running functions on a documents data to extract specific information generated from the documents data.
- Virtual properties are document properties that you can get and set but that do not get persisted to MongoDB. The getters are useful for formatting or combining fields, while setters are useful for de-composing a single value into multiple values for storage.

### MVC Architecture

- M: Models
  - Document data that represents some sort of information.
  - If you were to request bank information, the model would be a document that contains bank balances, payment dates, types of accounts, user information.
  - Different models would represent different types of information based on the application.
- V: Views
  - Basically the layout, or HTML file structured in a way to display specific data.
  - You would have different views for home page, products page, product page, etc..
- C: Controllers
  - Basically will determine based on user requests, which models to access and which views to use to display data, then send to the user as a response.

#### Credentials

username: rcamach7
ps: locallibrary
