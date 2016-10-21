var helper = require("../helper");
var SermonManager = require("../../src/managers/sermon-manager");
var instanceManager = null;
require("should");

function getData() {
    var Sermon = require('sermon-model').master.Sermon;
    var sermon = new Sermon();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    sermon.title = code;
    sermon.artist = `name[${code}]`;
    sermon.duration = 0;
    sermon.year = 0;
    sermon.month = 0;
    sermon.description = `description [${code}]`;
    sermon.uri = `uri [${code}]`;
    return sermon;
}


before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            instanceManager = new SermonManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#01. should success when read data', function(done) {
    instanceManager.read()
        .then(documents => {
            //process documents
            documents.data.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#02. should success when create new data', function(done) {
    var data = getData();
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdData;
it(`#03. should success when get created data with id`, function(done) {
    instanceManager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            // validate.product(data);
            data.should.instanceof(Object);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});


it(`#03. should success when update created data`, function(done) { 
    
    createdData.title += '[updated]';
    createdData.artist += '[updated]';
    createdData.description += '[updated]';
    createdData.uri += '[updated]'; 

    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#04. should success when get updated data with id`, function(done) {
    instanceManager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            data.title.should.equal(createdData.title);
            data.artist.should.equal(createdData.artist);
            data.description.should.equal(createdData.description);
            data.uri.should.equal(createdData.uri);
            done();
        })
        .catch(e => {
            done(e);
        });
});
  
it('#06. try create empty data, should error with property artist, title, uri ', function(done) {
    instanceManager.create({})
        .then(id => {
            done("should error with property artist, title, uri");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('artist');
                e.errors.should.have.property('title');
                e.errors.should.have.property('uri');
                done();
            }
            catch (ex) {
                done(ex);
            }
        })
});

it(`#07. should success when delete data`, function(done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#08. should _deleted=true`, function(done) {
    instanceManager.getSingleByQuery({
            _id: createdId
        })
        .then(data => {
            // validate.product(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});
