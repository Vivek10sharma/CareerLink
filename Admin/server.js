const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const moment = require('moment');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');

const app = express();

//  MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// ✅Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//  Session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000 
  }
}));

app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: (a, b) => a === b,
    inc: function (value) {
      return parseInt(value) + 1;
    },
    moment: (date, format) => {
      if (!date) return '';
      if (typeof format !== 'string') format = 'MMMM Do YYYY, h:mm:ss a';
      return moment(date).format(format);
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set('view engine', 'hbs');

// Routes
app.use('/', adminRoutes);

//  Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
