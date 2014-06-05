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
	this._ifExists = false;
	this._ifNotExists = false;
	this._orderBy = [];
	this._where = [];
	this._joins = [];
	this._on = [];
	this._currentOn = [];
	this.flags = {};
	this.columns = {};
	this.tableColumns = {};
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

	if ($this._where.length > 0) {
		q += ' ' + $this._genWhere();
	}

	if (this._orderBy.length > 0) {
		var order = [];
		_.forEach(this._orderBy, function(o) {
			order.push(quote(o.column) + ' ' + o.order);
		});
		q += ' ORDER BY ' + order.join(',');
	}

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

	if (this._where.length > 0) {
		q += ' ' + this._genWhere();
	}

	if (this._orderBy.length > 0) {
		var order = [];
		_.forEach(this._orderBy, function(o) {
			order.push(quote(o.column) + ' ' + o.order);
		});
		q += ' ORDER BY ' + order.join(',');
	}

	if (this._limit !== null) {
		q += ' LIMIT ' + this._limit;
	}

	return q;
};

Query.prototype._genDelete = function() {
	var q = 'DELETE FROM ' + quote(this.tableName);

	if (this._where.length > 0) {
		q += ' ' + this._genWhere();
	}

	if (this._orderBy.length > 0) {
		var order = [];
		_.forEach(this._orderBy, function(o) {
			order.push(quote(o.column) + ' ' + o.order);
		});
		q += ' ORDER BY ' + order.join(',');
	}

	if (this._limit !== null) {
		q += ' LIMIT ' + this._limit;
	}

	return q;
};

Query.prototype._genCreateTable = function() {
	var $this = this;
	var q = 'CREATE TABLE ';

	if ($this._ifNotExists) {
		q += 'IF NOT EXISTS ';
	}

	q += quote($this.tableName);

	var cols = [];

	_.forEach($this.tableColumns, function(columnDescription, name) {
		cols.push(quote(name) + ' ' + $this._typeFor(columnDescription));
	});

	q += ' (' + cols.join(',') + ')';

	q+= ' CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB'

	return q;
};

Query.prototype._genDropTable = function() {
	var q = 'DROP TABLE ';

	if (this._ifExists) {
		q += 'IF EXISTS ';
	}

	q += quote(this.tableName);

	return q;
};

Query.prototype._genTruncate = function() {
	var q = 'TRUNCATE TABLE ' + quote(this.tableName);
	return q;
};

Query.prototype._genWhere = function() {
	var $this = this;
	var q = 'WHERE ';

	_.forEach($this._where, function(op) {
		switch(op.type) {
			case 'operation':
				q += quote(op.column) + ' ' + op.operator + ' ' + (_.isString() ? quotev(op.value) : op.value);
				break;
			case 'connector':
				q += ' ' + op.operator + ' ';
				break;
			case 'openSub':
				q += '(';
				break;
			case 'closeSub':
				q += ')';
				break;
		}
	});

	return q;
}

Query.prototype._typeFor = function(columnDescription) {
	var type = columnDescription.type.toLowerCase();
	var resultType = '';

	switch(type) {
		case 'string': {
			resultType = 'VARCHAR(' + (columnDescription.length || 255) + ')';
		}
		break;
		case 'text': {
			resultType = 'TEXT';
		}
		break;
		case 'int': {
			resultType = 'INT';
		}
		break;
		case 'double': {
			resultType = 'DOUBLE';
		}
		break;
		case 'bool': {
			resultType = 'BOOL';
		}
		break;
		case 'date': {
			resultType = 'DATE';
		}
		break;
		case 'timestamp': {
			resultType = 'TIMESTAMP';
		}
		break;
	}

	if (!columnDescription.optional) {
		resultType += ' NOT NULL';
	}

	if (columnDescription.default !== undefined) {
		resultType += ' DEFAULT '
		+ (_.isString(columnDescription.default) ? quotev(columnDescription.default) : columnDescription.default );
	}

	if (columnDescription.autoIncrement) {
		resultType += ' AUTO_INCREMENT';
	}

	if (columnDescription.unique) {
		resultType += ' UNIQUE';
	}

	if (columnDescription.primary) {
		resultType += ' PRIMARY KEY';
	}

	return resultType;
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

Query.prototype.asc = function(column) {
	this._orderBy.push({ column: column, order: 'ASC' });
	return this;
};

Query.prototype.desc = function(column) {
	this._orderBy.push({ column: column, order: 'DESC' });
	return this;
};

Query.prototype.ifExists = function() {
	this._ifExists = true;
	return this;
};

Query.prototype.ifNotExists = function() {
	this._ifNotExists = true;
	return this;
};

Query.prototype.where = function() {
	var $this = this;

	if (arguments.length === 1) {

		if (_.isFunction(arguments[0])) {
			$this._where.push({
				type: 'openSub'
			});
			arguments[0].apply($this);
			$this._where.push({
				type: 'closeSub'
			});
			return $this;
		}

		if (_.isObject(arguments[0])) {

			_.forEach(arguments[0], function(d, column) {
				if (_.isObject(d)) {
					_.forEach(d, function(val, op) {
						var op_s = '';

						switch (op) {
							case 'gt': {
								op_s = '>';
							}
								break;
							case 'lt': {
								op_s = '<';
							}
								break;
							case 'gte': {
								op_s = '>=';
							}
								break;
							case 'lte': {
								op_s = '<=';
							}
								break;
							case 'ne': {
								op_s = '<>';
							}
								break;
							case 'eq': {
								op_s = '=';
							}
								break;
							default :
								throw new Error('Unknown comparison operator ' + op);
						}

						$this._where.push({
							type: 'operation',
							column: column,
							operator: op_s,
							value: val
						});

						$this._where.push({
							type: 'connector',
							operator: 'AND'
						});
					});

					$this._where.pop();
				} else {
					$this._where.push({
						type: 'operation',
						column: column,
						operator: '=',
						value: d
					});
				}

				$this._where.push({
					type: 'connector',
					operator: 'AND'
				});
			});

			$this._where.pop();

			return $this;
		}

		return $this;
	}

	if (arguments.length === 2) {
		$this._where.push({
			type: 'operation',
			column: arguments[0],
			operator: '=',
			value: arguments[1]
		});
	}

	return $this;
};

Query.prototype.andWhere = function() {
	this._where.push({
		type: 'connector',
		operator: 'AND'
	});

	return this.where.apply(this, arguments);
};

Query.prototype.orWhere = function() {
	this._where.push({
		type: 'connector',
		operator: 'OR'
	});

	return this.where.apply(this, arguments);
};

Query.prototype.addColumn = function(columnDescription) {
	if (!_.has(columnDescription, 'name')) {
		throw new Error('No column name was specified');
	}

	if (!_.has(columnDescription, 'type')) {
		throw new Error('No column type was specified');
	}

	var name = columnDescription.name;
	delete columnDescription['name'];

	this.tableColumns[name] = columnDescription;

	return this;
};

Query.prototype.createTable = function() {
	this._setType('createTable');
	return this;
};

Query.prototype.dropTable = function() {
	this._setType('dropTable');
	return this;
};

Query.prototype.truncate = function() {
	this._setType('truncate');
	return this;
};

Query.prototype.join = function(tableName, alias) {
	var join = {
		type: 'inner',
		tableName: tableName
	}

	if (alias !== undefined) {
		join.alias = alias;
	}

	this._joins.push(join);

	if (this._currentOn.length > 0) {
		this._on.push(this._currentOn);
		this._currentOn = [];
	}

	return this;
};

Query.prototype.leftJoin = function(tableName, alias) {
	var join = {
		type: 'left',
		tableName: tableName
	};

	if (alias !== undefined) {
		join.alias = alias;
	}

	this._joins.push(join);

	if (this._currentOn.length > 0) {
		this._on.push(this._currentOn);
		this._currentOn = [];
	}

	return this;
};

Query.prototype.rightJoin = function(tableName, alias) {
	var join = {
		type: 'right',
		tableName: tableName
	}

	if (alias !== undefined) {
		join.alias = alias;
	}

	this._joins.push(join);

	if (this._currentOn.length > 0) {
		this._on.push(this._currentOn);
		this._currentOn = [];
	}

	return this;
};

Query.prototype.on = function() {
	var $this = this;

	if (arguments.length === 1) {
		if (_.isFunction(arguments[0])) {
			$this._currentOn.push({
				type: 'openSub'
			});
			arguments[0].apply($this);
			$this._currentOn.push({
				type: 'closeSub'
			});
			return $this;
		}

		if (_.isObject(arguments[0])) {

			_.forEach(arguments[0], function(d, column) {
				if (_.isObject(d)) {
					_.forEach(d, function(val, op) {
						var op_s = '';

						switch (op) {
							case 'gt': {
								op_s = '>';
							}
								break;
							case 'lt': {
								op_s = '<';
							}
								break;
							case 'gte': {
								op_s = '>=';
							}
								break;
							case 'lte': {
								op_s = '<=';
							}
								break;
							case 'ne': {
								op_s = '<>';
							}
								break;
							case 'eq': {
								op_s = '=';
							}
								break;
							default :
								throw new Error('Unknown comparison operator ' + op);
						}

						$this._currentOn.push({
							type: 'operation',
							column: column,
							operator: op_s,
							value: val
						});

						$this._currentOn.push({
							type: 'connector',
							operator: 'AND'
						});
					});

					$this._currentOn.pop();
				} else {
					$this._currentOn.push({
						type: 'operation',
						column: column,
						operator: '=',
						value: d
					});
				}

				$this._currentOn.push({
					type: 'connector',
					operator: 'AND'
				});
			});

			$this._currentOn.pop();

			return $this;
		}

		return $this;
	}

	if (arguments.length === 2) {
		$this._currentOn.push({
			type: 'operation',
			column: arguments[0],
			operator: '=',
			value: arguments[1]
		});
	}

	return $this;
};

Query.prototype.andOn = function() {
	return this;
};

Query.prototype.orOn = function() {
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
		case 'createTable': {
			result = this._genCreateTable();
		}
		break;
		case 'dropTable': {
			result = this._genDropTable();
		}
		break;
		case 'truncate': {
			result = this._genTruncate();
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
