"use strict";

var _ = require('lodash');

// MySQL query builder
var Query = function(tableName) {
	if (!(this instanceof Query)) {
		return new Query(tableName);
	}

	this.tableName = tableName || null;
	this._type = '';
	this._offset = null;
	this._limit = null;
	this.flags = {};
	this.columns = {};
	this.insertValues = {};
	this.updateValues = {};
};

// sets internal type of the query
Query.prototype._setType = function(type) {
	this._type = type;
	return this;
};

// sets the table name for the query
Query.prototype.from = function(tableName) {
	this.tableName = tableName;
	return this;
};

// sets select fields
Query.prototype.select = function() {
	var $this = this;

	$this._setType('select');

	if (arguments.length === 0) {
		$this.flags.allColumns = true;
		return $this;
	}

	if (arguments.length === 1) {

		if (_.isString(arguments[0])) {
			$this.columns[arguments[0]] = arguments[0];
			return $this;
		}

		if (_.isArray(arguments[0])) {
			_.forEach(arguments[0], function(column) {
				$this.columns[column] = column;
			});
			return $this;
		}

		if (_.isObject(arguments[0])) {
			_.forEach(arguments[0], function(as, column) {
				$this.columns[column] = as;
			});
			return $this;
		}

	}

	_.forEach(arguments, function(column) {
		$this.columns[column] = column;
	});

	return $this;
};

Query.prototype.insert = function() {
	var $this = this;

	$this._setType('insert');

	if (arguments.length === 1) {
		if (_.isArray(arguments[0])) {
			_.forEach(arguments[0], function(row) {
				_.forEach(row, function(value, column) {
					if (!$this.insertValues[column]) {
						$this.insertValues[column] = [];
					}

					$this.insertValues[column].push(value);
				});
			});

			return $this;
		}
	}

	_.forEach(arguments, function(row) {
		_.forEach(row, function(value, column) {
			if (!$this.insertValues[column]) {
				$this.insertValues[column] = [];
			}

			$this.insertValues[column].push(value);
		});
	});

	return $this;
};

Query.prototype.update = function() {
	var $this = this;

	$this._setType('update');

	$this.updateValues = arguments[0];

	return $this;
};

Query.prototype.delete = function() {
	var $this = this;

	$this._setType('delete');
	return $this;
};

Query.prototype.offset = function(offset) {
	this._offset = offset;
	return this;
};

Query.prototype.limit = function(limit) {
	this._limit = limit;
	return this;
};

module.exports = Query;