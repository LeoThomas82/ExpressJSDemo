const mongoose = require('mongoose');
const {DateTime} = require('luxon');

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
    book:{type:Schema.Types.ObjectId, ref:'Book', required:true},
    imprint:{type:String, required:true},
    status:{
        type:String,
        required:true,
        enum:['Available', 'Maintenance', 'Loaned', 'Reserved'],
        default:'Maintenance',
    },
    due_back:{type:Date, default:Date.now}
});

BookInstanceSchema.virtual('url').get(function(){
    return `/catalog/bookinstance/${this._id}`;
});

BookInstanceSchema.virtual('due_back_formatted').get(function(){
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATETIME_MED);
});

BookInstanceSchema.virtual('due_back_simple_date').get(function(){
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATETIME_SHORT);
});

BookInstanceSchema.virtual('due_back_client_format').get(function(){
    return this.due_back ? DateTime.fromJSDate(this.due_back).toFormat('yyyy-MM-dd') : '';
})

module.exports = mongoose.model('BookInstance', BookInstanceSchema);
