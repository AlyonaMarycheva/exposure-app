const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: String,
  description: String
});

positionSchema.set('toJSON', {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Position', positionSchema);