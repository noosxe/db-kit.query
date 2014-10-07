"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {

	describe('#toString()', function() {

		it('should return sql for "select *"', function() {
			expect(query('User').select().toString())
				.to.be.equal('SELECT * FROM `User`');
		});

		it('should return sql for "select *" with tableAlias', function() {
			expect(query('User', 'Alias').select().toString())
				.to.be.equal('SELECT * FROM `User` AS `Alias`');
		});

		it('should return sql for "select" with column names', function() {
			expect(query('User').select('id', 'email').toString())
				.to.be.equal('SELECT `id` AS `id`,`email` AS `email` FROM `User`');
		});

		it('should return sql for "select" with column name paths', function() {
			expect(query('User').select('User.id', 'email').toString())
				.to.be.equal('SELECT `User`.`id` AS `User.id`,`email` AS `email` FROM `User`');
		});

		it('should return sql for "select" with column name aliases', function() {
			expect(query('User').select({'id': 'id', 'email': 'e-mail'}).toString())
				.to.be.equal('SELECT `id` AS `id`,`email` AS `e-mail` FROM `User`');
		});

		it('should return sql for "select" with LIMIT and OFFSET', function() {
			expect(query('User').limit(10).offset(10).select({'id': 'id', 'email': 'e-mail'}).toString())
				.to.be.equal('SELECT `id` AS `id`,`email` AS `e-mail` FROM `User` LIMIT 10 OFFSET 10');
		});

		it('should return sql for "select" with ORDER BY', function() {
			expect(query('User').desc('age').asc('weight').select('id', 'name').toString())
				.to.be.equal('SELECT `id` AS `id`,`name` AS `name` FROM `User` ORDER BY `age` DESC,`weight` ASC');
		});

		it('should return sql for "select" with WHERE', function() {
			expect(query('User').where('id', 1).select().toString())
				.to.be.equal('SELECT * FROM `User` WHERE `id` = 1');
		});

		it('should return sql for "select" with complex WHERE', function() {
			expect(query('User').where({ age: { gt: 18, lt: 30 } }).select().toString())
				.to.be.equal('SELECT * FROM `User` WHERE `age` > 18 AND `age` < 30');
		});

		it('should return sql for "select" with simple "join"', function() {
			expect(query('User', 'u').join('Project').on('u.id', 'Project.owner').select().toString())
				.to.be.equal('SELECT * FROM (SELECT * FROM `User` AS `u`) AS `u` JOIN `Project` ON `u`.`id` = `Project`.`owner`');
		});

		it('should return sql for "select" with simple "join" with limit and offset', function() {
			expect(query('User', 'u').join('Project').on('u.id', 'Project.owner').select().offset(10).limit(10).toString())
				.to.be.equal('SELECT * FROM (SELECT * FROM `User` AS `u` LIMIT 10 OFFSET 10) AS `u` JOIN `Project` ON `u`.`id` = `Project`.`owner`');
		});

		it('should return sql for "select" with simple "join" and alias', function() {
			expect(query('User', 'u').join('Project', 'P').on('u.id', 'P.owner').select().toString())
				.to.be.equal('SELECT * FROM (SELECT * FROM `User` AS `u`) AS `u` JOIN `Project` AS `P` ON `u`.`id` = `P`.`owner`');
		});

		it('should return sql for "select" with simple "join" with where', function() {
			expect(query('User', 'u').join('Project').on('u.id', 'Project.owner').select().where('id', 1).toString())
				.to.be.equal('SELECT * FROM (SELECT * FROM `User` AS `u` WHERE `id` = 1) AS `u` JOIN `Project` ON `u`.`id` = `Project`.`owner`');
		});

		it('should return sql for "delete"', function() {
			expect(query('User').delete().toString())
				.to.be.equal('DELETE FROM `User`');
		});

		it('should return sql for "delete" with LIMIT', function() {
			expect(query('User').limit(10).delete().toString())
				.to.be.equal('DELETE FROM `User` LIMIT 10');
		});

		it('should return sql for "delete" with ORDER BY and LIMIT', function() {
			expect(query('User').desc('age').asc('weight').limit(10).delete().toString())
				.to.be.equal('DELETE FROM `User` ORDER BY `age` DESC,`weight` ASC LIMIT 10');
		});

		it('should return sql for "delete" with WHERE', function() {
			expect(query('User').where('id', 1).delete().toString())
				.to.be.equal('DELETE FROM `User` WHERE `id` = 1');
		});

		it('should return sql for "insert"', function() {
			expect(query('User').insert({ email: 'example@example.com' }).toString())
				.to.be.equal('INSERT INTO `User` (`email`) VALUES("example@example.com")');
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

		it('should return sql for "update" with ORDER BY and LIMIT', function() {
			expect(query('User').desc('age').asc('weight').limit(10).update({ email: 'example@example.com' }).toString())
				.to.be.equal('UPDATE `User` SET `email` = "example@example.com" ORDER BY `age` DESC,`weight` ASC LIMIT 10');
		});

		it('should return sql for "update" with WHERE', function() {
			expect(query('User').where('id', 1).update({ email: 'example@example.com' }).toString())
				.to.be.equal('UPDATE `User` SET `email` = "example@example.com" WHERE `id` = 1');
		});

		it('should return sql for "createTable"', function() {
			expect(query('User').addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}).createTable().toString())
				.to.be.equal('CREATE TABLE `User` (`email` VARCHAR(100) NOT NULL) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB');
		});

		it('should return sql for "createTable" with primary field', function() {
			expect(query('User').addColumn({
				name: 'id',
				type: 'int',
				primary: true,
				autoIncrement: true
			}).createTable().toString())
				.to.be.equal('CREATE TABLE `User` (`id` INT NOT NULL AUTO_INCREMENT,PRIMARY KEY (`id`)) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB');
		});

		it('should return sql for "createTable" with unique field', function() {
			expect(query('User').addColumn({
				name: 'id',
				type: 'int',
				unique: true
			}).createTable().toString())
				.to.be.equal('CREATE TABLE `User` (`id` INT NOT NULL,UNIQUE KEY `u_id` (`id`)) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB');
		});

		it('should return sql for "createTable" with index field', function() {
			expect(query('User').addColumn({
				name: 'id',
				type: 'int',
				index: true
			}).createTable().toString())
				.to.be.equal('CREATE TABLE `User` (`id` INT NOT NULL,KEY `k_id` (`id`)) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB');
		});

		it('should return sql for "createTable" with reference field', function() {
			expect(query('User').addColumn({
				name: 'layout',
				type: 'int'
			}).addReference({
				column: 'layout',
				table: 'layout',
				field: 'id'
			}).createTable().toString())
				.to.be.equal('CREATE TABLE `User` (`layout` INT NOT NULL,KEY `k_layout` (`layout`),CONSTRAINT `User_fk_layout` FOREIGN KEY (`layout`) REFERENCES `layout` (`id`)) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB');
		});

		it('should return sql for "createTable" with IF NOT EXISTS', function() {
			expect(query('User').addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}).ifNotExists().createTable().toString())
				.to.be.equal('CREATE TABLE IF NOT EXISTS `User` (`email` VARCHAR(100) NOT NULL) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB');
		});

		it('should return sql for "createTable" with multiple columns', function() {
			expect(query('User').addColumn({
				name: 'email',
				type: 'string',
				length: 100
			}).addColumn({
				name: 'bio',
				type: 'text'
			}).createTable().toString())
				.to.be.equal('CREATE TABLE `User` (`email` VARCHAR(100) NOT NULL,`bio` TEXT NOT NULL) CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB');
		});

		it('should return sql for "dropTable"', function() {
			expect(query('User').dropTable().toString())
				.to.be.equal('DROP TABLE `User`');
		});

		it('should return sql for "dropTable" with ifExists', function() {
			expect(query('User').ifExists().dropTable().toString())
				.to.be.equal('DROP TABLE IF EXISTS `User`');
		});

		it('should return sql for "truncate"', function() {
			expect(query('User').truncate().toString())
				.to.be.equal('TRUNCATE TABLE `User`');
		});

		it('should throw an exception when no query type is specified', function() {
			var q = query('User');
			expect(q.toString.bind(q))
				.to.throw(Error);
		});

	});

});