"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#insert()', function() {

		it('should set insert values when called with object as first argument', function() {
			expect(query('User').insert({ email: 'example@example.com' }).insertValues)
			.to.be.deep.equal({
				email: ['example@example.com']
			});
		});

		it('should set insert values when called with array of objects', function() {
			expect(query('User').insert([
				{ email: 'example@example.com' },
				{ email: 'second@example.com' }]).insertValues)
			.to.be.deep.equal({
				email: ['example@example.com', 'second@example.com']
			});
		});

		it('should set insert values when called with with list of object arguments', function() {
			expect(query('User').insert(
				{ email: 'example@example.com' },
				{ email: 'second@example.com' }).insertValues)
			.to.be.deep.equal({
				email: ['example@example.com', 'second@example.com']
			});
		});

		it('should set query type to "insert"', function() {
			expect(query('User').insert({ email: 'example@example.com' })._type)
			.to.be.equal('insert');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.insert({ email: 'example@example.com' }))
			.to.be.equal(q);
		});

	});
	
});