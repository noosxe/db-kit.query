"use strict";

var expect = require('chai').expect;
var query = require('../index.js');

describe('query', function() {

	it('should have "mysql" as property', function() {
		expect(query).to.have.ownProperty('mysql');
	});

	describe('query.mysql', function() {

		it('should be function', function() {
			expect(typeof query.mysql).to.be.equal('function');
		});

	});

});