"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#()', function() {

		it('should return instance of query.mysql', function() {
			expect(query('User'))
				.to.be.an.instanceof(query);
		});

		describe('#tableName', function() {

			it('should be equal to User if #() called with table name', function() {
				expect(query('User').tableName)
					.to.be.equal('User');
			});

			it('should be equal to null if #() called without arguments', function() {
				expect(query().tableName)
					.to.be.null;
			});

		});

		describe('#tableAlias', function() {

			it('should be equal Alias if #() called with second parameter', function() {
				expect(query('User', 'Alias').tableAlias)
					.to.be.equal('Alias');
			});

			it('should be equal to null if #() called without second argument', function() {
				expect(query('User').tableAlias)
					.to.be.null;
			});

		});

	});

});