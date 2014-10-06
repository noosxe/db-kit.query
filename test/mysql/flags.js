"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#from()', function() {

		it('should set tableName', function() {
			expect(query().from('User').tableName)
			.to.be.equal('User');
		});

		it('should return chaining object', function() {
			var q = query();
			expect(q.from('User'))
			.to.be.equal(q);
		});

	});

	describe('#_setType()', function() {

		it('should return chaining object', function() {
			var q = query('User');
			expect(q._setType('select'))
			.to.be.equal(q);
		});

		it('should set internal _type variable to "select"', function() {
			var q = query('User')._setType('select');
			expect(q._type)
			.to.be.equal('select');
		});

	});

	describe('#offset()', function() {

		it('should set .offset variable', function() {
			expect(query('User').offset(10)._offset)
				.to.be.equal(10);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.offset(10))
				.to.be.equal(q);
		});

	});

	describe('#limit()', function() {

		it('should set .limit variable', function() {
			expect(query('User').limit(10)._limit)
				.to.be.equal(10);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.limit(10))
				.to.be.equal(q);
		});

	});

	describe('#ifExists()', function() {

		it('should set ._ifExists to true', function() {
			expect(query('User').ifExists()._ifExists)
				.to.be.true;
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.ifExists())
				.to.be.equal(q);
		});

	});

	describe('#ifNotExists()', function() {

		it('should set ._ifNotExists to true', function() {
			expect(query('User').ifNotExists()._ifNotExists)
				.to.be.true;
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.ifNotExists())
				.to.be.equal(q);
		});

	});

	describe('#asc()', function() {

		it('should append ASC by [column] to ordering list', function() {
			expect(query('User').asc('age')._orderBy)
			.to.be.deep.equal([
				{ column: 'age', order: 'ASC' }
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.asc('age'))
			.to.be.equal(q);
		});

	});

	describe('#desc()', function() {

		it('should append DESC by [column] to ordering list', function() {
			expect(query('User').desc('age')._orderBy)
			.to.be.deep.equal([
				{ column: 'age', order: 'DESC' }
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.desc('age'))
			.to.be.equal(q);
		});

	});

	describe('#addColumn()', function() {

		it('should add column object to columns list', function() {
			expect(query('User').addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}).tableColumns)
			.to.be.deep.equal({
				email: { type: 'string', length: 100 }
			});
		});

		it('should throw an error if no column name is specified', function() {
			var q = query('User');
			expect(q.addColumn.bind(q, {
				type: 'string'
			}))
			.to.throw(Error);
		});

		it('should throw an error if no column type is specified', function() {
			var q = query('User');
			expect(q.addColumn.bind(q, {
				name: 'email'
			}))
			.to.throw(Error);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}))
			.to.be.equal(q);
		});

	});

});