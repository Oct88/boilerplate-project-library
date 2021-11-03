const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai 
          .request(server)
          .post('/api/books')
          .send({'title': 'title'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.property(res.body, 'title');
            assert.property(res.body, '_id');
            assert.equal(res.body.title, 'title');

            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai
          .request(server)
          .post('/api/books')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');   
            assert.equal(res.text, 'missing required field title');

            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai
          .request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isArray(res.body)
            assert.property(res.body[0], 'commentcount');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');

            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai
          .request(server)
          .get('/api/books/6182a94ef6b06b7f185ba2e7')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists');

            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai
          .request(server)
          .get('/api/books/6182d96227de4481c2fdc413')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.property(res.body, 'title');
            assert.property(res.body, '_id');
            assert.property(res.body, 'commentcount');
            assert.equal(res.body._id, '6182d96227de4481c2fdc413');

            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai
          .request(server)
          .post('/api/books/6182d96227de4481c2fdc413')
          .send({comment: 'good comm'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.property(res.body, 'title');
            assert.property(res.body, '_id');
            assert.property(res.body, 'commentcount');
            assert.property(res.body, 'comments');
            assert.equal(res.body.comments[res.body.comments.length - 1], 'good comm');

            done();
          })
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai
          .request(server)
          .post('/api/books/6182d96227de4481c2fdc413')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'missing required field comment');

            done();
          })
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai
          .request(server)
          .post('/api/books/6182d96227de4481c0fdc403')
          .send({'comment': 'comm'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists');

            done();
          })
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai
          .request(server)
          .delete('/api/books/6182d81f60b214a75bcf7819')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'delete successful');

            done();
          })
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai
          .request(server)
          .delete('/api/books/6182d81f60b214a75bcf7810')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists');

            done();
          })
      });

    });

  });

});
