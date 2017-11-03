const mongo = require('mongodb').MongoClient;
const ObjectId = mongo.ObjectId;

const state = {
  db: null
};

const connect = (url, done) => {
  if (state.db) {
    return done();
  }

  mongo.connect(url, (error, db) => {
    if (error) {
      return done(error);
    }
    state.db = db;
    done();
  });
};

const create = (collectionName, props) => {
  return new Promise((resolve, reject) => {
    state.db.collection(collectionName).insertOne(props, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
};

const getOne = (collectionName, filters) => {
  return new Promise((resolve, reject) => {
    state.db.collection(collectionName).findOne(filters, (error, result) => {
      if (error) {
        return reject(error);
      }

      return resolve(result);
    });
  });
};

const update = (collectionName, filters, doc) => {
  return new Promise((resolve, reject) => {
    state.db
      .collection(collectionName)
      .updateOne(filters, doc, (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
  });
};

const getAll = (collectionName, filter) => {
  return new Promise((resolve, reject) => {
    state.db
      .collection(collectionName)
      .find(filter)
      .toArray((error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
  });
};

const close = done => {
  if (state.db) {
    state.db.close((error, result) => {
      state.db = null;
      state.mode = null;

      if (error) {
        done(error);
      }
    });
  }
};

module.exports = {
  close,
  connect,
  create,
  getAll,
  getOne,
  update
};
