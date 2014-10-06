"use strict";

var expect = require('chai').expect;
var query = require('../../lib/dialects/mysql/index.js');

describe('query.mysql', function() {
	
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
	
});