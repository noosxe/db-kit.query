"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {
	
	describe('#dropTable()', function() {

		it('should set query type to "dropTable"', function() {
			expect(query('User').dropTable()._type)
			.to.be.equal('dropTable');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.dropTable())
			.to.be.equal(q);
		});

	});
	
});