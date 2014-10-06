"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {
	
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
	
});