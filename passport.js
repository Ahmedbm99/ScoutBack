const passport = require('passport')
const config = require('./config/config')
const {Leader} = require('./models')

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

passport.use(
    new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.authentication.jwtSecret
    }, async function (jwtPayload, done) {
        try {
            const user = await Leader.findOne({
                where: {
                    id: jwtPayload.id
                }
            })
            if(!user){
                return done(new Error(), false)
            }
            return done(null, user)
        } catch(err){
            console.error('Error in JWT strategy:', err);
            return done(err, false);
        }
    })
)

module.exports = null