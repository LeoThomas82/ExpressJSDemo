const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name:{type:String, required:true, maxLength:100},
    family_name:{type:String, required:true, maxLength:100},
    date_of_birth:{type:Date},
    date_of_death:{type:Date},
});

AuthorSchema.virtual('name').get(function(){
    let fullname = '';
    if ( this.first_name && this.family_name ) {
        fullname = `${this.family_name}, ${this.first_name}`;
    }
    return fullname;
});

AuthorSchema.virtual('url').get(function(){

    return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('lifespan').get(function(){
    var v1 = this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : ''; 
    var v2 = this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
    return `(${v1} - ${v2})`;
})

AuthorSchema.virtual('birthday_formatted').get(function(){
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : ''; 
});

AuthorSchema.virtual('deathday_formatted').get(function(){
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
});

AuthorSchema.virtual('birthday_client_format').get(function(){
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toFormat('yyyy-MM-dd') : '';
});

AuthorSchema.virtual('deathday_client_format').get(function(){
    return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toFormat('yyyy-MM-dd') : '';
});

module.exports = mongoose.model("Author", AuthorSchema);