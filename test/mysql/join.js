"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {
	
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
	
});