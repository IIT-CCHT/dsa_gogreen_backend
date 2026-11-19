const express = require('express');
const app = express();
const morgan = require('morgan')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { checkSystem, migrateDb } = require('./api/utils')
var passport = require('passport');
// var JwtStrategy = require('passport-jwt').Strategy;
// var ExtractJwt = require('passport-jwt').ExtractJwt;
// var session = require('express-session');
// var Account = require('./api/models/entities/accounts');

//Coors
const allowedOrigins = [
  'https://gogreen-dsa.eu',
  'https://gogreen.iit.local',
  'https://gogreen.staging.iit.local',
  'http://localhost:3333'
];

console.log('START BACKEND 1')

app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: allowedOrigins
}))

console.log('START BACKEND 2')

app.use((req, res, next) => 
{
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if(req.method === 'OPTIONS') 
  {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
 next();
})

console.log('START BACKEND 3')

// Connect Database
const url = process.env.DB_URL + process.env.DB_NAME;
console.log('url', url)
result = mongoose.connect(url)
  .then(result => {
    console.log("Connected");
  })
  .catch(err => {
    console.log("Error: "+err);
  });
mongoose.Promise = global.Promise;
console.log('START BACKEND 4')
checkSystem()
console.log('START BACKEND 5')

// Extensions
// ----------------------------------------------------------------------
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(express.json());

require('./api/config/passport')(passport);
app.use(passport.initialize());

// passport config
// var Account = require('./api/models/entities/accounts');
// passport.use(new JwtStrategy({
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.PASSPORT_JWT_SECRET_KEY
//   },
//   async (jwtPayload, done) => {
//     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!")
//     try {
//       const user = await Account.findById(jwtPayload.userId);
//       console.log('user', user)
//       if (!user) {
//         return done(null, false);
//       }
//       return done(null, user);
//     } catch (error) {
//       return done(error, false);
//     }
//   }
// ));
// passport.serializeUser(Account.serializeUser());
// passport.deserializeUser(Account.deserializeUser());

// Routes & Middlewares
// ----------------------------------------------------------------------
const auth = require('./api/routes/auth') 
app.use('/auth',auth);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

const db_migrations = require('./api/routes/db_migrations') 
app.use('/migrate',db_migrations);

// Questa è invocata subito dopo la login con IIT nel layout Default onMount
// const login_check_token = require('./api/routes/login_check_token')
// app.use('/api/check-token',login_check_token);

// Questa è invocata ad ogni chiamata POST, GET, PUT, ecc
// const middleware_check_token = require('./api/routes/middleware_check_token')
// app.use('/api',middleware_check_token);

const frontend_environment = require('./api/routes/frontendenvironment')
app.use('/api/frontend-environment', frontend_environment);

const menu = require('./api/routes/menu')
app.use('/api/menu',menu);

const crud = require('./api/routes/crud')
app.use('/api/crud',crud);

const pickers = require('./api/routes/pickers')
app.use('/api/pickers',pickers);

const entity_columns = require('./api/routes/entity_columns')
app.use('/api/entity-columns',entity_columns);

const action = require('./api/routes/action')
app.use('/api/action',action);

const workbench = require('./api/routes/workbench')
app.use('/api/workbench',workbench);

const texts = require('./api/routes/texts')
app.use('/api/texts',texts);

const files = require('./api/routes/files')
app.use('/api/files',files);

const useful_links = require('./api/routes/useful_links')
app.use('/api/useful-links',useful_links);

const materials = require('./api/routes/materials')
app.use('/api/materials',materials);

const treatments = require('./api/routes/treatments')
app.use('/api/treatments',treatments);

const comparison = require('./api/routes/comparison')
app.use('/api/comparison',comparison);

const distance_calculator = require('./api/routes/distance_calculator')
app.use('/api/distance-calculator',distance_calculator);

// Root route (API status)
app.get('/', (req, res) => {
  res.json({ status: 'API running' });
});

// Avoid favicon errors
app.get('/favicon.ico', (req, res) => res.status(204));

console.log('START BACKEND END')

// Internal Errors
// ----------------------------------------------------------------------
app.use((req, res, next) => {
  const error = new Error('Entity not found!');
  error.status = 440;
  next(error);
});


// Errors unhandled
// ----------------------------------------------------------------------
app.use((error, req, res, next) => {
  res
    .status(error.status || 500)
    .json({
      error: {
        message: error.message || 'Oh my god!'
      }
    })
});

module.exports = app;