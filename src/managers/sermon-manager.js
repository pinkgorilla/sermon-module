'use strict'
require("mongodb-toolkit");

var ObjectId = require("mongodb").ObjectId;
var Model = require('sermon-model');
var map = Model.map;
var Sermon = Model.master.Sermon;
var BaseManager = require('./base-manager');

module.exports = class SermonManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Sermon);
    }

    _getQuery(paging) {
        var deletedFilter = {
            _deleted: false
        };

        var query = {
            '$and': [deletedFilter, paging.filter || {}]
        };

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterTitle = {
                'title': {
                    '$regex': regex
                }
            };
            var filterArtist = {
                'artist': {
                    '$regex': regex
                }
            };
            var keywordFilter = {
                '$or': [filterTitle, filterArtist]
            };

            query['$and'].push(keywordFilter);
        }
        return query;
    }

    _validate(sermon) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = sermon;
            // 1. begin: Declare promises. 

            if (!valid.title || valid.title == '')
                errors["title"] = "title is required";

            if (!valid.artist || valid.artist == '')
                errors["artist"] = "artist is required";

            if (Number.isInteger(parseInt(valid.duration, 10)) === false)
                errors["duration"] = "duration should be a number in seconds";

            if (Number.isInteger(parseInt(valid.year, 10)) === false)
                errors["year"] = "year should be a number representing year";

            if (Number.isInteger(parseInt(valid.month, 10)) === false)
                errors["month"] = "month should be a number representing month";

            if (!valid.uri || valid.uri == '')
                errors["uri"] = "uri is required";

            // 2c. begin: check if data has any error, reject if it has.
            if (Object.getOwnPropertyNames(errors).length > 0) {
                var ValidationError = require('../validation-error');
                reject(new ValidationError('data does not pass validation', errors));
            }

            valid = new Sermon(sermon);
            valid.stamp(this.user.username, 'manager');
            resolve(valid);
        });
    }
    _createIndexes() {

        var defaultIndex = {
            name: `ix_${map.master.collection.Sermon}_artist_title`,
            key: {
                artist: 1,
                title: 1,
            }
        };

        return this.collection.createIndexes([defaultIndex]);
    }
};
