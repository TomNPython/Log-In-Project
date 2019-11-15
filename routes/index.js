const express = require('express');
const app = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport')


let users = []; //replace with database connection later

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
        console.log(err)
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

module.exports = app
module.exports.users = users