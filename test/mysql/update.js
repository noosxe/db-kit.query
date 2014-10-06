"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#update()', function() {

		it('should set update values ', function() {
			expect(query('User').update({ email: 'example@example.com' }).updateValues)
			.to.be.deep.equal({
				email: 'example@example.com'
			});
		});

		it('should set query type to "update"', function() {
			expect(query('User').update({ email: 'example@example.com' })._type)
			.to.be.equal('update');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.update({ email: 'example@example.com' }))
			.to.be.equal(q);
		});

	});

});