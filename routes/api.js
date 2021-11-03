'use strict';

const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

const URI = process.env.MONGO_URI;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(URI)
        .then(client => {
          let db = client.db('library');
          db.collection('books').find({}).toArray()
            .then(doc => res.json(doc));
        }).catch(err => res.send(`db error: ${err}`));
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title) {
        let insertObj = {'title': title, 'commentcount': 0, 'comments': []};
        MongoClient.connect(URI)
          .then(client => {
            let db = client.db('library');
            db.collection('books').insertOne(insertObj)
            .then(result => {
              if (result.acknowledged) {
                res.json({title: title, _id: result.insertedId})
              } else {
                console.log('Pending');
              }
              client.close();
            });
          }).catch(err => res.send(`db error: ${err}`))
      } else {
        res.send('missing required field title');
      }

    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(URI)
        .then(client => {
          let db = client.db('library');
          db.collection('books').deleteMany({})
            .then(result => {
              if (result.acknowledged) {
                res.send('complete delete successful');
              }
            });
        }).catch(err => res.send(`db err: ${err}`));
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(URI)
        .then(client => {
          let db = client.db('library');
          db.collection('books').findOne({_id: new ObjectId(bookid)})
            .then(doc => {
              if (doc) {
                res.json(doc);
              } else {
                res.send('no book exists');
              }
              client.close();
            })
        })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        res.send('missing required field comment');
      } else {
        MongoClient.connect(URI)
          .then(client => {
            let db = client.db('library');
            db.collection('books').findOneAndUpdate(
              {_id: new ObjectId(bookid)},
              {
                $push: {comments: comment},
                $inc: {commentcount: 1}
              },
              {returnDocument: 'after'}
            )
              .then(doc => {
                if (doc.value) {
                  res.redirect('/api/books/' + bookid);
                } else {
                  res.send('no book exists');
                }
                client.close();
              });
          })
            .catch(err => res.send(`db error: ${err}`));
      }
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(URI)
        .then(client => {
          let db = client.db('library');
          db.collection('books').findOneAndDelete({_id: new ObjectId(bookid)})
            .then(doc => {
              if (doc.value) {
                res.send('delete successful');
              } else {
                res.send('no book exists');
              }
              client.close();
            });
        }).catch(err => res.send(`db error: ${err}`));
    });
  
};
