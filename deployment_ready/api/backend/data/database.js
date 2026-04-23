const Datastore = require('nedb-promises');
const path = require('path');

const db = Datastore.create({
  filename: path.join(__dirname, '..', 'news.db'),
  autoload: true
});

module.exports = db;
