"use strict";

var expect = require('chai').expect;
var query = require('../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#()', function() {

		it('should return instance of query.mysql', function() {
			expect(query('User')).to.be.an.instanceof(query);
		});

		describe('#tableName', function() {

			it('should be equal to User if #() called with table name', function() {
				expect(query('User').tableName).to.be.equal('User');
			});

			it('should be equal to null if #() called without arguments', function() {
				expect(query().tableName).to.be.null;
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

	describe('#from()', function() {

		it('should set tableName', function() {
			expect(query().from('User').tableName).to.be.equal('User');
		});

		it('should return chaining object', function() {
			var q = query();
			expect(q.from('User')).to.be.equal(q);
		});

	});

	describe('#select()', function() {

		it('should set column names when called with arguments list', function() {
			expect(query('User').select('id', 'email', 'firstName').columns).to.be.deep.equal({
				id: 'id',
				email: 'email',
				firstName: 'firstName'
			});
		});

		it('should set column names when called with array as first argument', function() {
			expect(query('User').select(['id', 'email', 'firstName']).columns).to.be.deep.equal({
				id: 'id',
				email: 'email',
				firstName: 'firstName'
			});
		});

		it('should set column names when called with object as first argument', function() {
			expect(query('User').select({ id: 'id', email: 'e-mail', firstName: 'first-name' }).columns).to.be.deep.equal({
				id: 'id',
				email: 'e-mail',
				firstName: 'first-name'
			});
		});

		it('should set column name when called with single argument', function() {
			expect(query('User').select('id').columns).to.be.deep.equal({
				id: 'id'
			});
		});

		it('should set "allColumns" flag when called without arguments', function() {
			expect(query('User').select().flags.allColumns).to.be.true;
		});

		it('should set query type to "select"', function() {
			expect(query('User').select()._type).to.be.equal('select');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.select()).to.be.equal(q);
		});

	});

	describe('#insert()', function() {

		it('should set insert values when called with object as first argument', function() {
			expect(query('User').insert({ email: 'example@example.com' }).insertValues).to.be.deep.equal({
				email: ['example@example.com']
			});
		});

		it('should set insert values when called with array of objects', function() {
			expect(query('User').insert([
				{ email: 'example@example.com' },
				{ email: 'second@example.com' }]).insertValues).to.be.deep.equal({
				email: ['example@example.com', 'second@example.com']
			});
		});

		it('should set insert values when called with with list of object arguments', function() {
			expect(query('User').insert(
				{ email: 'example@example.com' },
				{ email: 'second@example.com' }).insertValues).to.be.deep.equal({
				email: ['example@example.com', 'second@example.com']
			});
		});

		it('should set query type to "insert"', function() {
			expect(query('User').insert({ email: 'example@example.com' })._type).to.be.equal('insert');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.insert({ email: 'example@example.com' })).to.be.equal(q);
		});

	});

	describe('#update()', function() {

		it('should set update values ', function() {
			expect(query('User').update({ email: 'example@example.com' }).updateValues).to.be.deep.equal({
				email: 'example@example.com'
			});
		});

		it('should set query type to "update"', function() {
			expect(query('User').update({ email: 'example@example.com' })._type).to.be.equal('update');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.update({ email: 'example@example.com' })).to.be.equal(q);
		});

	});

	describe('#delete()', function() {

		it('should set query type to "delete"', function() {
			expect(query('User').delete()._type).to.be.equal('delete');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.delete()).to.be.equal(q);
		});

	});

	describe('#offset()', function() {

		it('should set .offset variable', function() {
			expect(query('User').offset(10)._offset).to.be.equal(10);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.offset(10)).to.be.equal(q);
		});

	});

	describe('#limit()', function() {

		it('should set .limit variable', function() {
			expect(query('User').limit(10)._limit).to.be.equal(10);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.limit(10)).to.be.equal(q);
		});

	});

	describe('#toString()', function() {

		it('should return sql for "select *"', function() {
			expect(query('User').select().toString()).to.be.equal('SELECT * FROM `User`');
		});

		it('should return sql for "select" with column names', function() {
			expect(query('User').select('id', 'email').toString()).to.be.equal('SELECT `id`,`email` FROM `User`');
		});

		it('should return sql for "select" with column name aliases', function() {
			expect(query('User').select({'id': 'id', 'email': 'e-mail'}).toString()).to.be.equal('SELECT `id`,`email` AS `e-mail` FROM `User`');
		});

		it('should return sql for "delete"', function() {
			expect(query('User').delete().toString()).to.be.equal('DELETE FROM `User`');
		});

		it('should return sql for "delete" with LIMIT', function() {
			expect(query('User').limit(10).delete().toString()).to.be.equal('DELETE FROM `User` LIMIT 10');
		});

		it('should return sql for "insert"', function() {
			expect(query('User').insert({ email: 'example@example.com' }).toString()).to.be.equal('INSERT INTO `User` (`email`) VALUES("example@example.com")');
		});

		it('should return sql for multi "insert"', function() {
			expect(query('User').insert(
				{ id: 1, email: 'example@example.com' },
				{ id: 2, email: 'second@example.com'}).toString())
			.to.be.equal('INSERT INTO `User` (`id`,`email`) VALUES(1,"example@example.com"),(2,"second@example.com")');
		});

		it('should return sql for "update"', function() {
			expect(query('User').update({ email: 'example@example.com' }).toString())
			.to.be.equal('UPDATE `User` SET `email` = "example@example.com"');
		});

		it('should return sql for "update" with LIMIT', function() {
			expect(query('User').limit(10).update({ email: 'example@example.com' }).toString())
			.to.be.equal('UPDATE `User` SET `email` = "example@example.com" LIMIT 10');
		});

		it('should throw an exception when no query type is specified', function() {
			var q = query('User');
			expect(q.toString.bind(q)).to.throw(Error);
		});

	});

});