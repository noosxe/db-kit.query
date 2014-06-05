"use strict";

// expose mysql query builder as .mysql property
var exports = module.exports = {
	mysql: require('./dialects/mysql/index.js')
};