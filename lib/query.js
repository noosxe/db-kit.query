"use strict";

/**
 * Interface for different dialect query builders
 * @type {{mysql: (Query|exports)}}
 */
var exports = module.exports = {
	mysql: require('./dialects/mysql/index.js')
};