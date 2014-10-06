"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#select()', function() {

		it('should set column names when called with arguments list', function() {
			expect(query('User').select('id', 'email', 'firstName').columns)
			.to.be.deep.equal({
				id: 'id',
				email: 'email',
				firstName: 'firstName'
			});
		});

		it('should set column names when called with array as first argument', function() {
			expect(query('User').select(['id', 'email', 'firstName']).columns)
			.to.be.deep.equal({
				id: 'id',
				email: 'email',
				firstName: 'firstName'
			});
		});

		it('should set column names when called with object as first argument', function() {
			expect(query('User').select({ id: 'id', email: 'e-mail', firstName: 'first-name' }).columns)
			.to.be.deep.equal({
				id: 'id',
				email: 'e-mail',
				firstName: 'first-name'
			});
		});

		it('should set column name when called with single argument', function() {
			expect(query('User').select('id').columns)
			.to.be.deep.equal({
				id: 'id'
			});
		});

		it('should set "allColumns" flag when called without arguments', function() {
			expect(query('User').select().flags.allColumns)
			.to.be.true;
		});

		it('should set query type to "select"', function() {
			expect(query('User').select()._type)
			.to.be.equal('select');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.select())
			.to.be.equal(q);
		});

	});
	
});