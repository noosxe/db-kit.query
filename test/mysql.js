"use strict";

var expect = require('chai').expect;
var query = require('../lib/dialects/mysql/index.js');

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

	describe('#where()', function() {

		it('should accept column equality arguments', function() {
			expect(query('User').where('id', 1)._where)
			.to.be.deep.equal([
				{ type: 'operation', column: 'id', operator: '=', value: 1 }
			]);
		});

		it('should accept object as where describer', function() {
			expect(query('User').where({ id: 1, age: 13 })._where)
			.to.be.deep.equal([
				{ type: 'operation', column: 'id', operator: '=', value: 1 },
				{ type: 'connector', operator: 'AND' },
				{ type: 'operation', column: 'age', operator: '=', value: 13 }
			]);
		});

		it('should accept object as where describer with comparison', function() {
			expect(query('User').where({ id: { gt: 1 }, age: { lt: 13 }, name: { like: 'al%' } })._where)
				.to.be.deep.equal([
					{ type: 'operation', column: 'id', operator: '>', value: 1 },
					{ type: 'connector', operator: 'AND' },
					{ type: 'operation', column: 'age', operator: '<', value: 13 },
					{ type: 'connector', operator: 'AND' },
					{ type: 'operation', column: 'name', operator: 'LIKE', value: 'al%' },
				]);
		});

		it('should throw an error when unknown comparison operator is provided', function() {
			var q = query('User');

			expect(q.where.bind(q, { id: { gts: 1 }, age: { lt: 13 } }))
			.to.throw(Error);
		});

		it('should accept function for nested expressions', function() {
			expect(query('User').where(function() {
				this.where('id', 1);
			})._where)
			.to.be.deep.equal([
				{ type: 'openSub' },
				{ type: 'operation', column: 'id', operator: '=', value: 1 },
				{ type: 'closeSub' }
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.where('id', 1))
			.to.be.equal(q);
		});

	});

	describe('#andWhere()', function() {

		it('should accept column equality arguments', function() {
			expect(query('User').andWhere('id', 1)._where)
			.to.be.deep.equal([
				{ type: 'connector', operator: 'AND' },
				{ type: 'operation', column: 'id', operator: '=', value: 1 }
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.andWhere('id', 1))
			.to.be.equal(q);
		});

	});

	describe('#orWhere()', function() {

		it('should accept column equality arguments', function() {
			expect(query('User').orWhere('id', 1)._where)
			.to.be.deep.equal([
				{ type: 'connector', operator: 'OR' },
				{ type: 'operation', column: 'id', operator: '=', value: 1 }
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.orWhere('id', 1))
			.to.be.equal(q);
		});

	});

	describe('#_genWhere()', function() {

		it('should generate sql for single equality comparison', function() {
			expect(query('User').where('id', 1)._genWhere()).to.be.equal('WHERE `id` = 1');
		});

		it('should generate sql for LIKE operator', function() {
			expect(query('User').where({ name: { like: 'al%' } })._genWhere()).to.be.equal('WHERE `name` LIKE "al%"');
		});

		it('should generate sql for multiple', function() {
			expect(query('User').where({ id: 1, age: 20 })._genWhere()).to.be.equal('WHERE `id` = 1 AND `age` = 20');
		});

		it('should generate sql for multiple with inequality operators', function() {
			expect(query('User').where({ id: { gt:1 }, age: { lte:20 } })._genWhere()).to.be.equal('WHERE `id` > 1 AND `age` <= 20');
		});

		it('should generate sql for "where" + "andWhere"', function() {
			expect(query('User').where('id', 1).andWhere('age', 20)._genWhere()).to.be.equal('WHERE `id` = 1 AND `age` = 20');
		});

		it('should generate sql for "where" + "orWhere"', function() {
			expect(query('User').where('id', 1).orWhere({ age: 20, height: { gt: 30 }})._genWhere()).to.be.equal('WHERE `id` = 1 OR `age` = 20 AND `height` > 30');
		});

		it('should generate sql for "where" with parens', function() {
			expect(query('User').where(function() {
				this.where('id', 1).orWhere('id', 2);
			}).andWhere('age', 30)._genWhere())
			.to.be.equal('WHERE (`id` = 1 OR `id` = 2) AND `age` = 30');
		});
	});

	describe('#_typeFor()', function() {

		it('should parse "string" type with default length', function() {
			expect(query('User')._typeFor({
				type: 'string'
			}))
			.to.be.equal('VARCHAR(255) NOT NULL');
		});

		it('should parse "string" type with given length', function() {
			expect(query('User')._typeFor({
				type: 'string',
				length: 100
			}))
			.to.be.equal('VARCHAR(100) NOT NULL');
		});

		it('should parse "text" type', function() {
			expect(query('User')._typeFor({
				type: 'text'
			}))
			.to.be.equal('TEXT NOT NULL');
		});

		it('should parse "int" type', function() {
			expect(query('User')._typeFor({
				type: 'int'
			}))
			.to.be.equal('INT NOT NULL');
		});

		it('should parse "double" type', function() {
			expect(query('User')._typeFor({
				type: 'double'
			}))
			.to.be.equal('DOUBLE NOT NULL');
		});

		it('should parse "bool" type', function() {
			expect(query('User')._typeFor({
				type: 'bool'
			}))
			.to.be.equal('BOOL NOT NULL');
		});

		it('should parse "date" type', function() {
			expect(query('User')._typeFor({
				type: 'date'
			}))
			.to.be.equal('DATE NOT NULL');
		});

		it('should parse "timestamp" type', function() {
			expect(query('User')._typeFor({
				type: 'timestamp'
			}))
			.to.be.equal('TIMESTAMP NOT NULL');
		});

		it('should parse optional columns', function() {
			expect(query('User')._typeFor({
				type: 'int',
				optional: true
			}))
			.to.be.equal('INT');
		});

		it('should parse default values', function() {
			expect(query('User')._typeFor({
				type: 'int',
				default: 10
			}))
			.to.be.equal('INT NOT NULL DEFAULT 10');
		});

		it('should parse default values', function() {
			expect(query('User')._typeFor({
				type: 'text',
				default: 'hello, world!'
			}))
			.to.be.equal('TEXT NOT NULL DEFAULT "hello, world!"');
		});

		it('should parse autoincrement columns', function() {
			expect(query('User')._typeFor({
				type: 'int',
				autoIncrement: true
			}))
			.to.be.equal('INT NOT NULL AUTO_INCREMENT');
		});

	});

	describe('#dropTable()', function() {

		it('should set query type to "dropTable"', function() {
			expect(query('User').dropTable()._type)
			.to.be.equal('dropTable');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.dropTable())
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

	describe('#createTable()', function() {

		it('should set query type to "createTable"', function() {
			expect(query('User').createTable()._type)
			.to.be.equal('createTable');
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.createTable())
			.to.be.equal(q);
		});

	});

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

	describe('#join()', function() {

		it('should append a join to ._joins variable with "inner" type', function() {
			expect(query('User').join('Project')._joins)
			.to.be.deep.equal([
				{ type: 'inner', tableName: 'Project' }
			]);
		});

		it('should append a join to ._joins variable with "inner" type with alias', function() {
			expect(query('User').join('Project', 'p')._joins)
			.to.be.deep.equal([
				{ type: 'inner', tableName: 'Project', alias: 'p' }
			]);
		});

		it('should append existing "on" constraints from ._currentOn to ._on', function() {
			expect(query('User').join('Project').on('User.id', 'Project.owner')
													.join('Schedule').on('User.id', 'Schedule.userId')._on)
			.to.be.deep.equal([
				[{
					type: 'operation',
					column: 'User.id',
					operator: '=',
					value: 'Project.owner'
				}]
			]);

			expect(query('User').join('Project').on('User.id', 'Project.owner')
													.join('Schedule').on('User.id', 'Schedule.userId')._currentOn)
			.to.be.deep.equal([
				{
					type: 'operation',
					column: 'User.id',
					operator: '=',
					value: 'Schedule.userId'
				}
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.join())
			.to.be.equal(q);
		});

	});

	describe('#leftJoin()', function() {

		it('should append a join to ._joins variable with "left" type', function() {
			expect(query('User').leftJoin('Project')._joins)
			.to.be.deep.equal([
				{ type: 'left', tableName: 'Project' }
			]);
		});

		it('should append a join to ._joins variable with "left" type with alias', function() {
			expect(query('User').leftJoin('Project', 'p')._joins)
			.to.be.deep.equal([
				{ type: 'left', tableName: 'Project', alias: 'p' }
			]);
		});

		it('should append existing "on" constraints from ._currentOn to ._on', function() {
			expect(query('User').join('Project').on('User.id', 'Project.owner')
													.leftJoin('Schedule').on('User.id', 'Schedule.userId')._on)
			.to.be.deep.equal([
				[{
					type: 'operation',
					column: 'User.id',
					operator: '=',
					value: 'Project.owner'
				}]
			]);

			expect(query('User').join('Project').on('User.id', 'Project.owner')
													.leftJoin('Schedule').on('User.id', 'Schedule.userId')._currentOn)
			.to.be.deep.equal([
				{
					type: 'operation',
					column: 'User.id',
					operator: '=',
					value: 'Schedule.userId'
				}
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.leftJoin())
			.to.be.equal(q);
		});

	});

	describe('#rightJoin()', function() {

		it('should append a join to ._joins variable with "right" type', function() {
			expect(query('User').rightJoin('Project')._joins)
			.to.be.deep.equal([
				{ type: 'right', tableName: 'Project' }
			]);
		});

		it('should append a join to ._joins variable with "right" type with alias', function() {
			expect(query('User').rightJoin('Project', 'p')._joins)
			.to.be.deep.equal([
				{ type: 'right', tableName: 'Project', alias: 'p' }
			]);
		});

		it('should append existing "on" constraints from ._currentOn to ._on', function() {
			expect(query('User').join('Project').on('User.id', 'Project.owner')
													.rightJoin('Schedule').on('User.id', 'Schedule.userId')._on)
			.to.be.deep.equal([
				[{
					type: 'operation',
					column: 'User.id',
					operator: '=',
					value: 'Project.owner'
				}]
			]);

			expect(query('User').join('Project').on('User.id', 'Project.owner')
													.rightJoin('Schedule').on('User.id', 'Schedule.userId')._currentOn)
			.to.be.deep.equal([
				{
					type: 'operation',
					column: 'User.id',
					operator: '=',
					value: 'Schedule.userId'
				}
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.rightJoin())
			.to.be.equal(q);
		});

	});

	describe('#on()', function() {

		it('should append "on" constraint to ._on variable', function() {
			expect(query('User').on('User.id', 'Project.owner')._currentOn)
			.to.be.deep.equal([
				{
					type: 'operation',
					column: 'User.id',
					operator: '=',
					value: 'Project.owner'
				}
			]);
		});

		it('should accept object as "on" describer', function() {
			expect(query('User').on({ 'User.id': 'Project.owner', 'User.age': 18 })._currentOn)
			.to.be.deep.equal([
				{ type: 'operation', column: 'User.id', operator: '=', value: 'Project.owner' },
				{ type: 'connector', operator: 'AND' },
				{ type: 'operation', column: 'User.age', operator: '=', value: 18 }
			]);
		});

		it('should accept object as "on" describer with comparison', function() {
			expect(query('User').on({ id: { gt: 1 }, age: { lt: 13 } })._currentOn)
				.to.be.deep.equal([
					{ type: 'operation', column: 'id', operator: '>', value: 1 },
					{ type: 'connector', operator: 'AND' },
					{ type: 'operation', column: 'age', operator: '<', value: 13 }
				]);
		});

		it('should throw an error when unknown comparison operator is provided', function() {
			var q = query('User');

			expect(q.on.bind(q, { id: { gts: 1 }, age: { lt: 13 } }))
			.to.throw(Error);
		});

		it('should accept function for nested expressions', function() {
			expect(query('User').on(function() {
				this.on('id', 1);
			})._currentOn)
			.to.be.deep.equal([
				{ type: 'openSub' },
				{ type: 'operation', column: 'id', operator: '=', value: 1 },
				{ type: 'closeSub' }
			]);
		});

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.on())
			.to.be.equal(q);
		});

	});

	describe('#andOn()', function() {

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.andOn())
			.to.be.equal(q);
		});

	});

	describe('#orOn()', function() {

		it('should return chaining object', function() {
			var q = query('User');
			expect(q.orOn())
			.to.be.equal(q);
		});

	});

	describe('#_genJoin()', function() {

		it('should return empty string when no joins appended', function() {
			expect(query('User')._genJoin())
			.to.be.equal('');
		});

		it('should return sql for simple join', function() {
			expect(query('User').join('Project').on('User.id', 'Project.owner')._genJoin())
			.to.be.equal('JOIN `Project` ON `User`.`id` = `Project`.`owner`');
		});

		it('should return sql for join with multiple constraints', function() {
			expect(query('User').join('Project').on('User.id', 'Project.owner').andOn('User.id', 'Project.owner')._genJoin())
			.to.be.equal('JOIN `Project` ON `User`.`id` = `Project`.`owner` AND `User`.`id` = `Project`.`owner`');
		});

		it('should return sql for multiple joins', function() {
			expect(query('User').join('Project').on('User.id', 'Project.owner').leftJoin('Schedule').on('User.id', 'Schedule.userid')._genJoin())
			.to.be.equal('JOIN `Project` ON `User`.`id` = `Project`.`owner` LEFT JOIN `Schedule` ON `User`.`id` = `Schedule`.`userid`');
		});

	});

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
			expect(query('User').join('Project').on('User.id', 'Project.owner').select().toString())
			.to.be.equal('SELECT * FROM `User` JOIN `Project` ON `User`.`id` = `Project`.`owner`');
		});

		it('should return sql for "select" with simple "join" and alias', function() {
			expect(query('User').join('Project', 'P').on('User.id', 'P.owner').select().toString())
					.to.be.equal('SELECT * FROM `User` JOIN `Project` AS `P` ON `User`.`id` = `P`.`owner`');
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
			expect(query('User').join('Project').on('User.id', 'Project.owner').select().toPrepared())
					.to.be.deep.equal({ text: 'SELECT * FROM `User` JOIN `Project` ON `User`.`id` = `Project`.`owner`', values: [] });
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
