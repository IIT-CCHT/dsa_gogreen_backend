const fs = require('fs');
const path = require('path');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { ModelByEntity } = require('../utils/evals');

const pathToKey = path.join(__dirname, '..', '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options =
{
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256']
}

const strategy = new JwtStrategy(options, async (payload, done) => {
  const user = await ModelByEntity("users").findOne({ _id: payload.sub }) 
  // console.log('JwtStrategy user', user)
    if(user)
    {
      return done(null, user)
    } else
    {
      return done(null, false)
    }
});

module.exports = (passport) => {
  passport.use(strategy);
}