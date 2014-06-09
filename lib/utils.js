"use strict";

exports = module.exports = {};

/**
 * Quotes a table or column name
 * @param value
 * @returns {string}
 */
exports.myQuote = function(value) {
	return '`' + value + '`';
};

/**
 * Quotes a value
 * @param value
 * @returns {string}
 */
exports.myQuoteValue = function(value) {
	return '"' + value + '"';
};