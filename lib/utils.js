"use strict";

var _ = require('lodash');

exports = module.exports = {};

/**
 * Quotes a table or column name
 * @param value
 * @param strict
 * @returns {string}
 */
exports.myQuote = function(value, strict) {
	return strict ? ('`' + value + '`') : (_.isString(value) ? _.map(value.split('.'), function(colPart) {
		return '`' + colPart + '`';
	}).join('.') : value);
};

/**
 * Quotes a value
 * @param value
 * @returns {string}
 */
exports.myQuoteValue = function(value) {
	return _.isString(value) ? '"' + value + '"' : value;
};