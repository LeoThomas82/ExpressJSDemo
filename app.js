var createError = require('http-errors');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = "mongodb://localhost:27017/local_library";
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:'keyboard cat', resave:false, saveUninitialized:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  if ( !req.session.userinfo) {
    console.log("session setting");
    req.session.userinfo = {username:''};
  }
  next();
});

app.use(function(req, res, next){
  console.log("locals setting");
  res.locals.session = req.session;
  res.locals.logined = req.session.userinfo.username !='';
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

main().catch((err)=>console.log(err));
async function main(){
  await mongoose.connect(mongoDB);
}

module.exports = app;
