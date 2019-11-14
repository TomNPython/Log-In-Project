if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const hbs = require('express-handlebars');
const express = require('express');
const path = require('path')
const publicPath = path.join(__dirname, '/public');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const override = require('method-override');

const initialisePassport = require('./passport-config')
initialisePassport(
    passport, 
    email => users.find(user => user.email == email),
    id => users.find(user => user.id == id)  
    );

let users = []; //replace with database connection later

app.engine('hbs', hbs({ defaultLayout: 'layout', extname: '.hbs'}))
app.set('view-engine', '.hbs');


app.use(express.urlencoded({ extended: false}));
app.use('/', express.static(publicPath));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(override('_method'))

app.get('/', isLoggedIn, (req, res) => {
    res.render('index.hbs', {title: 'Authenticator', name: req.user.name})
});

app.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('signin.hbs')
});

app.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('signup.hbs')
});

app.post('/signup', isNotLoggedIn, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(), // can remove when connect database
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/signin')
    } 
    catch (err) {
        res.redirect('/signup')
    }
    console.log(users)
})

app.post('/signin', isNotLoggedIn, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}))

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/signin')
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
        res.redirect('/signin')
}

function isNotLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
        next()
}

app.listen(3000)