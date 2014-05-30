"use strict";

var expect = require('chai').expect;
var query = require('../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#()', function() {

		it('should return instance of query.mysql', function() {
			expect(query('User')).to.be.an.instanceof(query);
		});

		describe('#tableName', function() {

			it('should be equal to User', function() {
				expect(query('User').tableName).to.be.equal('User');
			});

		});

	});

	describe('#_setType()', function() {

		it('should return chaining object', function() {
			var q = query('User');
			expect(q._setType('select')).to.be.equal(q);
		});

		it('should set internal _type variable to "select"', function() {
			var q = query('User')._setType('select');
			expect(q._type).to.be.equal('select');
		});

	});

});