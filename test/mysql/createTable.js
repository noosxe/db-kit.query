"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {
	
	describe('#createTable()', function() {

		it('should set query type to "createTable"', function() {
			expect(query('User').createTable()._type)
			.to.be.equal('createTable');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.createTable())
			.to.be.equal(q);
		});

	});
	
});