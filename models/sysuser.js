const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const Schema = mongoose.Schema;

const SysuserSchema = new Schema({
    first_name:{type:String, required:true, maxLength:100},
    last_name:{type:String, required:true, maxLength:100},
    date_of_birth:{type:Date, required:true},
    
    username:{type:String, required:true, maxLength:100},
    password:{type:String, required:true, maxLength:100},
});

SysuserSchema.virtual("birthday_client_format").get(function(){
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toFormat('yyyy-MM-dd') : '';
});

module.exports = mongoose.model("Sysuser", SysuserSchema);