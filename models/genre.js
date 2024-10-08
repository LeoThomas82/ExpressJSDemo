const mongoose = require('mongoose');
const Schema = mongoose.Schema;

GenreSchema = new Schema({
    name:{type:String, require:true,  minLength:3, maxLength:100  },
});

GenreSchema.virtual('url').get(function(){
    return `/catalog/genre/${this._id}`;
});

module.exports = mongoose.model('Genre', GenreSchema);
