"use strict";

var _ = require('lodash');
var quote = require('../../utils.js').myQuote;
var quotev = require('../../utils.js').myQuoteValue;

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

Query.prototype._genSelect = function() {
	var $this = this;
	var q = 'SELECT ';
	if ($this.flags.allColumns) {
		q += '* ';
	} else {
		var cols = [];
		_.forEach($this.columns, function(as, column) {
			if (as === column) {
				cols.push(quote(column));
			} else {
				cols.push(quote(column) + ' AS ' + quote(as));
			}
		});

		q += cols.join(',') + ' ';
	}

	q += 'FROM ' + quote($this.tableName);

	if (this._limit !== null) {
		q += ' LIMIT ' + this._limit;
	}

	if (this._offset !== null) {
		q += ' OFFSET ' + this._offset;
	}

	return q;
};

Query.prototype._genInsert = function() {
	var $this = this;
	var q = 'INSERT INTO ' + quote($this.tableName);
	var cols = [];
	var values = [];

	_.forEach($this.insertValues, function(vals, col) {
		cols.push(quote(col));

		_.forEach(vals, function(val, i) {
			if (!_.isArray(values[i])) {
				values[i] = [];
			}

			if (_.isString(val)) {
				val = quotev(val);
			}

			values[i].push(val);
		});
	});

	q += ' (' + cols.join(',') + ') VALUES';

	q += _.map(values, function(row) {
		return '(' + row.join(',') + ')';
	}).join(',');

	return q;
};

Query.prototype._genUpdate = function() {
	var $this = this;
	var q = 'UPDATE ' + quote($this.tableName) + ' SET ';
	var values = [];

	_.forEach($this.updateValues, function(val, col) {
		if (_.isString(val)) {
			val = quotev(val);
		}

		values.push(quote(col) + ' = ' + val);
	});

	q += values.join(',');

	if (this._limit !== null) {
		q += ' LIMIT ' + this._limit;
	}

	return q;
};

Query.prototype._genDelete = function() {
	var q = 'DELETE FROM ' + quote(this.tableName);

	if (this._limit !== null) {
		q += ' LIMIT ' + this._limit;
	}

	return q;
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

Query.prototype.toString = function() {
	var result;

	switch(this._type) {
		case 'select': {
			result = this._genSelect();
		}
		break;
		case 'insert': {
			result = this._genInsert();
		}
		break;
		case 'update': {
			result = this._genUpdate();
		}
		break;
		case 'delete': {
			result = this._genDelete();
		}
		break;
		default: {
			throw new Error('No query type was specified!');
		}
		break;
	}

	return result;
};

module.exports = Query;