var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var imageRouter = require('./routes/image');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tablesRouter = require('./routes/tables');
var menusRouter = require('./routes/menu');
var addonRouter = require('./routes/addon');
var cartRouter = require('./routes/cart');
var reserveRouter = require('./routes/reservation');



var restaurantsRouter = require('./routes/restaurants');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());  
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tables',tablesRouter);
app.use('/restaurants',restaurantsRouter);
app.use('/image',imageRouter);
app.use('/menus',menusRouter);
app.use('/addons',addonRouter);
app.use('/cart',cartRouter);
app.use('/reservation',reserveRouter);








const uri2 = "mongodb://127.0.0.1:27017/dragdrop";
const uri = "mongodb+srv://finalProject:EFpeUnSek3qtwsMf@cluster0.xoovbhu.mongodb.net/finalProject?retryWrites=true&w=majority" 
mongoose.connect(uri)
.then((result)=> app.listen(8080, () => {
  console.log('API is running on ports 8000 http://localhost:8080/');
}))
    .catch((err) => console.log(err))
app.use(function(req, res, next) {
  next(createError(404));
});
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




module.exports = app;
