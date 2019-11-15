if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const hbs = require('express-handlebars');
const express = require('express');
const path = require('path')
const publicPath = path.join(__dirname, '/public');
const router = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const override = require('method-override');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

const indexRouter = require('./routes/index');

let users = indexRouter.users;

const initialisePassport = require('./passport-config')
initialisePassport(
    passport, 
    email => users.find(user => user.email == email),
    id => users.find(user => user.id == id)  
    );

router.engine('hbs', hbs({ defaultLayout: 'layout', extname: '.hbs'}))
router.set('view-engine', '.hbs');


router.use(express.urlencoded({ extended: false}));
router.use('/', express.static(publicPath));
router.use(flash());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());
router.use(override('_method'))

router.use('/', indexRouter)

router.listen(3000)

module.exports = router