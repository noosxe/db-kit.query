"use strict";

// MySQL query builder
var Query = function(tableName) {
	if (!(this instanceof Query)) {
		return new Query(tableName);
	}

	this.tableName = tableName;
	this._type = '';
};

// sets internal type of the query
Query.prototype._setType = function(type) {
	this._type = type;
	return this;
};

module.exports = Query;