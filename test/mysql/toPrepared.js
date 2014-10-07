"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#toPrepared()', function() {

		it('should return sql and values for "select *"', function() {
			expect(query('User').select().toPrepared())
				.to.be.deep.equal({ text: 'SELECT * FROM `User`', values: [] });
		});

		it('should return sql and values for "select *" with tableAlias', function() {
			expect(query('User', 'Alias').select().toPrepared())
					.to.be.deep.equal({ text: 'SELECT * FROM `User` AS `Alias`', values: [] });
		});

		it('should return sql for "select" with column names', function() {
			expect(query('User').select('id', 'email').toPrepared())
				.to.be.deep.equal({ text: 'SELECT `id` AS `id`,`email` AS `email` FROM `User`', values: [] });
		});

		it('should return sql for "select" with column name aliases', function() {
			expect(query('User').select({'id': 'id', 'email': 'e-mail'}).toPrepared())
				.to.be.deep.equal({ text: 'SELECT `id` AS `id`,`email` AS `e-mail` FROM `User`', values: [] });
		});

		it('should return sql for "select" with LIMIT and OFFSET', function() {
			expect(query('User').limit(5).offset(10).select({'id': 'id', 'email': 'e-mail'}).toPrepared())
				.to.be.deep.equal({ text: 'SELECT `id` AS `id`,`email` AS `e-mail` FROM `User` LIMIT ? OFFSET ?', values: [ 5, 10 ] });
		});

		it('should return sql for "select" with ORDER BY', function() {
			expect(query('User').desc('age').asc('weight').select('id', 'name').toPrepared())
				.to.be.deep.equal({ text: 'SELECT `id` AS `id`,`name` AS `name` FROM `User` ORDER BY `age` DESC,`weight` ASC', values: [] });
		});

		it('should return sql for "select" with WHERE', function() {
			expect(query('User').where('id', 1).select().toPrepared())
				.to.be.deep.equal({ text: 'SELECT * FROM `User` WHERE `id` = ?', values: [ 1 ] });
		});

		it('should return sql for "select" with complex WHERE', function() {
			expect(query('User').where({ age: { gt: 18, lt: 30 } }).select().toPrepared())
				.to.be.deep.equal({ text: 'SELECT * FROM `User` WHERE `age` > ? AND `age` < ?', values: [ 18, 30 ] });
		});

		it('should return sql for "select" with simple "join"', function() {
			expect(query('User', 'u').join('Project').on('u.id', 'Project.owner').select().toPrepared())
				.to.be.deep.equal({ text: 'SELECT * FROM (SELECT * FROM `User` AS `u`) AS `u` JOIN `Project` ON `u`.`id` = `Project`.`owner`', values: [] });
		});

		it('should return sql for "select" with simple "join" with where', function() {
			expect(query('User', 'u').join('Project').on('u.id', 'Project.owner').select().where('id', 1).toPrepared())
				.to.be.deep.equal({ text: 'SELECT * FROM (SELECT * FROM `User` AS `u` WHERE `id` = ?) AS `u` JOIN `Project` ON `u`.`id` = `Project`.`owner`', values: [1] });
		});

		it('should return sql for "delete"', function() {
			expect(query('User').delete().toPrepared())
				.to.be.deep.equal({ text: 'DELETE FROM `User`', values: [] });
		});

		it('should return sql for "delete" with LIMIT', function() {
			expect(query('User').limit(10).delete().toPrepared())
				.to.be.deep.equal({ text: 'DELETE FROM `User` LIMIT ?', values: [ 10 ] });
		});

		it('should return sql for "delete" with ORDER BY and LIMIT', function() {
			expect(query('User').desc('age').asc('weight').limit(10).delete().toPrepared())
				.to.be.deep.equal({ text: 'DELETE FROM `User` ORDER BY `age` DESC,`weight` ASC LIMIT ?', values: [ 10 ] });
		});

		it('should return sql for "delete" with WHERE', function() {
			expect(query('User').where('id', 1).delete().toPrepared())
				.to.be.deep.equal({ text: 'DELETE FROM `User` WHERE `id` = ?', values: [ 1 ] });
		});

		it('should return sql for "insert"', function() {
			expect(query('User').insert({ email: 'example@example.com' }).toPrepared())
				.to.be.deep.equal({ text: 'INSERT INTO `User` (`email`) VALUES(?)', values: [ 'example@example.com' ] });
		});

		it('should return sql for multi "insert"', function() {
			expect(query('User').insert(
				{ id: 1, email: 'example@example.com' },
				{ id: 2, email: 'second@example.com' }).toPrepared())
				.to.be.deep.equal({ text: 'INSERT INTO `User` (`id`,`email`) VALUES(?,?),(?,?)', values: [ 1, 'example@example.com', 2, 'second@example.com' ] });
		});

		it('should return sql for "update"', function() {
			expect(query('User').update({ email: 'example@example.com' }).toPrepared())
				.to.be.deep.equal({ text: 'UPDATE `User` SET `email` = ?', values: [ 'example@example.com' ]});
		});

		it('should return sql for "update" with LIMIT', function() {
			expect(query('User').limit(10).update({ email: 'example@example.com' }).toPrepared())
				.to.be.deep.equal({ text: 'UPDATE `User` SET `email` = ? LIMIT ?', values: [ 'example@example.com', 10 ] });
		});

		it('should return sql for "update" with ORDER BY and LIMIT', function() {
			expect(query('User').desc('age').asc('weight').limit(10).update({ email: 'example@example.com' }).toPrepared())
				.to.be.deep.equal({ text: 'UPDATE `User` SET `email` = ? ORDER BY `age` DESC,`weight` ASC LIMIT ?', values: [ 'example@example.com', 10 ] });
		});

		it('should return sql for "update" with WHERE', function() {
			expect(query('User').where('id', 1).update({ email: 'example@example.com' }).toPrepared())
				.to.be.deep.equal({ text: 'UPDATE `User` SET `email` = ? WHERE `id` = ?', values: [ 'example@example.com', 1 ] });
		});

		it('should return sql for "createTable"', function() {
			expect(query('User').addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}).createTable().toPrepared())
				.to.be.deep.equal({ text: 'CREATE TABLE `User` (`email` VARCHAR(100) NOT NULL) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB', values: [] });
		});

		it('should return sql for "createTable" with IF NOT EXISTS', function() {
			expect(query('User').addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}).ifNotExists().createTable().toPrepared())
				.to.be.deep.equal({ text: 'CREATE TABLE IF NOT EXISTS `User` (`email` VARCHAR(100) NOT NULL) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB', values: [] });
		});

		it('should return sql for "createTable" with multiple columns', function() {
			expect(query('User').addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}).addColumn({
				name: 'bio',
				type: 'text'
			}).createTable().toPrepared())
				.to.be.deep.equal({ text: 'CREATE TABLE `User` (`email` VARCHAR(100) NOT NULL,`bio` TEXT NOT NULL) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB', values: [] });
		});

		it('should return sql for "dropTable"', function() {
			expect(query('User').dropTable().toPrepared())
				.to.be.deep.equal({ text: 'DROP TABLE `User`', values: [] });
		});

		it('should return sql for "dropTable" with ifExists', function() {
			expect(query('User').ifExists().dropTable().toPrepared())
				.to.be.deep.equal({ text: 'DROP TABLE IF EXISTS `User`', values: [] });
		});

		it('should return sql for "truncate"', function() {
			expect(query('User').truncate().toPrepared())
				.to.be.deep.equal({ text: 'TRUNCATE TABLE `User`', values: [] });
		});

		it('should throw an exception when no query type is specified', function() {
			var q = query('User');
			expect(q.toPrepared.bind(q))
				.to.throw(Error);
		});
	});

});