const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt')


function initialise(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (user == null) {
            return done(null, false, { message: 'No User With This Email Found' })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            }
            else {
                return done(null, false, { message: 'Incorrect Password' })
            }
        } 
        catch(err) {
            return done(err)
        }
    }
    passport.use(new LocalStrategy({
        usernameField: 'email' //password is done by default
    }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))})
};

module.exports = initialise