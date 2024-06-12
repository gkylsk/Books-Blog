// contains all dependencies and main server

//store database details
require('dotenv').config();

const express = require('express');
const expressLayout  = require('express-ejs-layouts'); // to create layouts for different scenarios through bootstrap
const methodOveride = require('method-override'); //to use put
const cookieParser = require('cookie-parser'); // grap,save cookies. don't have to login all the time
const MongoStore = require('connect-mongo')

const connectDB = require('./server/config/db');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express(); //creates express application
const PORT = 3000 || process.env.PORT; // port number

// connect to DB
connectDB();

// middleware
// pass data
app.use(express.urlencoded({extended:true})); // pass url encoded bodies
app.use(express.json());
app.use(cookieParser());
app.use(methodOveride('_method'));

app.use(session({
    secret: 'BookBlog',
    resave: false,
    saveUninitialized:true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),   
}));

app.use(fileUpload());
app.use(express.static('public')); // everytime we require scripts the path will be created automatically

// Template Engine
app.use(expressLayout);
app.set('layout','./layouts/main'); //set layout folder
app.set('view engine','ejs'); //set the view engine

app.locals.isActiveRoute = isActiveRoute; // global variable to use

app.use('/',require('./server/routes/main')); //route for main page
app.use('/',require('./server/routes/admin')); //route for admin page

app.listen(PORT, ()=>{
    console.log(`App listenning on port ${PORT}`)
});