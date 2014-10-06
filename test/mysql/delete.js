"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {
	
	describe('#delete()', function() {

		it('should set query type to "delete"', function() {
			expect(query('User').delete()._type)
			.to.be.equal('delete');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.delete())
			.to.be.equal(q);
		});

	});
	
});