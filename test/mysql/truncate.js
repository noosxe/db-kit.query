"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {
	
	describe('#truncate()', function() {

		it('should set query type to "truncate"', function() {
			expect(query('User').truncate()._type)
			.to.be.equal('truncate');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.truncate())
			.to.be.equal(q);
		});

	});
	
});