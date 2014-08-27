"use strict";

var _ = require('lodash');
var quote = require('../../utils.js').myQuote;
var quotev = require('../../utils.js').myQuoteValue;

/**
 * MySQL query builder class
 * @param tableName
 * @returns {Query}
 * @constructor
 */
var Query = function(tableName, tableAlias) {
	if (!(this instanceof Query)) {
		return new Query(tableName, tableAlias);
	}

	this.tableName = tableName || null;
	this.tableAlias = tableAlias || null;
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

/**
 * Sets internal query type variable
 * @param type
 * @returns {Query}
 * @private
 */
Query.prototype._setType = function(type) {
	this._type = type;
	return this;
};

/**
 * Internal "select" query generator
 * @param prepared
 * @returns {*}
 * @private
 */
Query.prototype._genSelect = function(prepared) {
	prepared = prepared || false;

	var $this = this;
	var q = 'SELECT ';
	var values = [];

	if ($this.flags.allColumns) {
		q += '* ';
	} else {
		var cols = [];
		_.forEach($this.columns, function(as, column) {
			cols.push(quote(column) + ' AS ' + quote(as, true));
		});

		q += cols.join(',') + ' ';
	}

	q += 'FROM ' + quote($this.tableName);

	if ($this.tableAlias) {
		q += ' AS ' + quote($this.tableAlias, true);
	}

	if (this._joins.length > 0) {
		q += ' ' + this._genJoin();
	}

	if ($this._where.length > 0) {
		q += ' ' + $this._genWhere(prepared, values);
	}

	if (this._orderBy.length > 0) {
		var order = [];
		_.forEach(this._orderBy, function(o) {
			order.push(quote(o.column) + ' ' + o.order);
		});
		q += ' ORDER BY ' + order.join(',');
	}

	if (this._limit !== null) {
		q += ' LIMIT ';
		if (prepared) {
			q += '?';
			values.push(this._limit);
		} else {
			q += this._limit;
		}
	}

	if (this._offset !== null) {
		q += ' OFFSET ';
		if (prepared) {
			q += '?';
			values.push(this._offset);
		} else {
			q += this._offset;
		}
	}

	if (prepared) {
		return { text: q, values: values };
	} else {
		return q;
	}
};

/**
 * Internal "insert" query generator
 * @returns {*}
 * @private
 */
Query.prototype._genInsert = function(prepared) {
	prepared = prepared || false;
	var $this = this;
	var q = 'INSERT INTO ' + quote($this.tableName);
	var cols = [];
	var values = [];
	var retValues = [];

	_.forEach($this.insertValues, function(vals, col) {
		cols.push(quote(col));

		_.forEach(vals, function(val, i) {
			if (!_.isArray(values[i])) {
				values[i] = [];
			}

			if (prepared) {
				values[i].push('?');
				if (!_.isArray(retValues[i])) {
					retValues[i] = [];
				}
				retValues[i].push(val);
			} else {
				values[i].push(quotev(val));
			}
		});
	});

	q += ' (' + cols.join(',') + ') VALUES';

	q += _.map(values, function(row) {
		return '(' + row.join(',') + ')';
	}).join(',');

	if (prepared) {
		return { text: q, values: _.flatten(retValues) };
	} else {
		return q;
	}
};

/**
 * Internal "update" query generator
 * @returns {*}
 * @private
 */
Query.prototype._genUpdate = function(prepared) {
	prepared = prepared || false;
	var $this = this;
	var q = 'UPDATE ' + quote($this.tableName) + ' SET ';
	var values = [];
	var retValues = [];

	_.forEach($this.updateValues, function(val, col) {
		if (prepared) {
			values.push(quote(col) + ' = ?');
			retValues.push(val);
		} else {
			values.push(quote(col) + ' = ' + quotev(val));
		}
	});

	q += values.join(',');

	if (this._where.length > 0) {
		q += ' ' + this._genWhere(prepared, retValues);
	}

	if (this._orderBy.length > 0) {
		var order = [];
		_.forEach(this._orderBy, function(o) {
			order.push(quote(o.column) + ' ' + o.order);
		});
		q += ' ORDER BY ' + order.join(',');
	}

	if (this._limit !== null) {
		q += ' LIMIT ';
		if (prepared) {
			q += '?';
			retValues.push(this._limit);
		} else {
			q += this._limit;
		}
	}

	if (prepared) {
		return { text: q, values: retValues };
	} else {
		return q;
	}
};

/**
 * Internal "delete" query generator
 * @returns {*}
 * @private
 */
Query.prototype._genDelete = function(prepared) {
	prepared = prepared || false;
	var q = 'DELETE FROM ' + quote(this.tableName);
	var values = [];

	if (this._where.length > 0) {
		q += ' ' + this._genWhere(prepared, values);
	}

	if (this._orderBy.length > 0) {
		var order = [];
		_.forEach(this._orderBy, function(o) {
			order.push(quote(o.column) + ' ' + o.order);
		});
		q += ' ORDER BY ' + order.join(',');
	}

	if (this._limit !== null) {
		q += ' LIMIT ';
		if (prepared) {
			q += '?';
			values.push(this._limit);
		} else {
			q += this._limit;
		}
	}

	if (prepared) {
		return { text: q, values: values };
	} else {
		return q;
	}
};

/**
 * Internal "create table" query generator
 * @returns {*}
 * @private
 */
Query.prototype._genCreateTable = function(prepared) {
	prepared = prepared || false;
	var $this = this;
	var q = 'CREATE TABLE ';
	var values = [];

	if ($this._ifNotExists) {
		q += 'IF NOT EXISTS ';
	}

	q += quote($this.tableName);

	var cols = [];

	_.forEach($this.tableColumns, function(columnDescription, name) {
		cols.push(quote(name) + ' ' + $this._typeFor(columnDescription));
	});

	q += ' (' + cols.join(',') + ')';

	q+= ' CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';

	if (prepared) {
		return { text: q, values: values };
	} else {
		return q;
	}
};

/**
 * Internal "drop table" query generator
 * @returns {*}
 * @private
 */
Query.prototype._genDropTable = function(prepared) {
	prepared = prepared || false;
	var q = 'DROP TABLE ';

	if (this._ifExists) {
		q += 'IF EXISTS ';
	}

	q += quote(this.tableName);

	if (prepared) {
		return { text: q, values: [] };
	} else {
		return q;
	}
};

/**
 * Internal "truncate table" query generator
 * @returns {*}
 * @private
 */
Query.prototype._genTruncate = function(prepared) {
	prepared = prepared || false;

	var q = 'TRUNCATE TABLE ' + quote(this.tableName);

	if (prepared) {
		return { text: q, values: [] };
	} else {
		return q;
	}
};

/**
 * Internal "where ..." query part generator
 * @returns {string}
 * @private
 */
Query.prototype._genWhere = function(prepared, values) {
	prepared = prepared || false;
	var $this = this;
	var q = 'WHERE ';

	_.forEach($this._where, function(op) {
		switch(op.type) {
			case 'operation':
				q += quote(op.column) + ' ' + op.operator + ' ';
				if (prepared) {
					q += '?';
					values.push(op.value);
				} else {
					q += quotev(op.value);
				}
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
};

/**
 * Intern "join ..." query part generator
 * @returns {string}
 * @private
 */
Query.prototype._genJoin = function() {
	var $this = this;

	if ($this._joins.length === 0) {
		return '';
	}

	if ($this._currentOn.length > 0) {
		$this._on.push($this._currentOn);
		$this._currentOn = [];
	}

	var q = '';
	var joins = [];

	_.forEach($this._joins, function(join, index) {
		var line = '';

		switch(join.type) {
			case 'inner':
				line += 'JOIN ';
				break;
			case 'left':
				line += 'LEFT JOIN ';
				break;
			case 'right':
				line += 'RIGHT JOIN ';
				break;
		}

		line += quote(join.tableName);

		if (join.alias) {
			line += ' AS ' + quote(join.alias);
		}

		line += ' ON ';

		var on = $this._on[index];
		var ons = '';

		_.forEach(on, function(op) {
			switch(op.type) {
				case 'operation':
					var column = quote(op.column);
					var _column = '';

					if (!_.isString(op.value) || op.value.indexOf('.') == -1) {
						_column = quotev(op.value);
					} else {
						_column = quote(op.value);
					}

					ons += column + ' ' + op.operator + ' ' + _column;
					break;
				case 'connector':
					ons += ' ' + op.operator + ' ';
					break;
				case 'openSub':
					ons += '(';
					break;
				case 'closeSub':
					ons += ')';
					break;
			}
		});

		line += ons;

		joins.push(line);
	});

	q += joins.join(' ');

	return q;
};

/**
 * Internal row type generator
 * @param columnDescription
 * @returns {string}
 * @private
 */
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
		case 'datetime': {
			resultType = 'DATETIME';
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
				+ ((_.isString(columnDescription.default) && columnDescription.default != 'CURRENT_TIMESTAMP') ? quotev(columnDescription.default) : columnDescription.default );
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

	if (columnDescription.onUpdate) {
		resultType += ' ON UPDATE '
				+ ((_.isString(columnDescription.onUpdate) && columnDescription.onUpdate != 'CURRENT_TIMESTAMP') ? quotev(columnDescription.onUpdate) : columnDescription.onUpdate );
	}

	if (columnDescription.null) {
		resultType += ' NULL';
	}

	return resultType;
};

/**
 * Sets table name for query
 * @param tableName
 * @returns {Query}
 */
Query.prototype.from = function(tableName) {
	this.tableName = tableName;
	return this;
};

/**
 * "select" type query
 * @returns {Query}
 */
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

/**
 * "insert" type query
 * @returns {Query}
 */
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

/**
 * "update" type query
 * @returns {Query}
 */
Query.prototype.update = function() {
	var $this = this;

	$this._setType('update');

	$this.updateValues = arguments[0];

	return $this;
};

/**
 * "delete" type query
 * @returns {Query}
 */
Query.prototype.delete = function() {
	var $this = this;

	$this._setType('delete');
	return $this;
};

/**
 * "offset" query parameter
 * @param {number} offset
 * @returns {Query}
 */
Query.prototype.offset = function(offset) {
	this._offset = offset;
	return this;
};

/**
 * "limit" query parameter
 * @param {number} limit
 * @returns {Query}
 */
Query.prototype.limit = function(limit) {
	this._limit = limit;
	return this;
};

/**
 * Ascending ordering for query
 * @param {string} column
 * @returns {Query}
 */
Query.prototype.asc = function(column) {
	this._orderBy.push({ column: column, order: 'ASC' });
	return this;
};

/**
 * Descending ordering for query
 * @param {string} column
 * @returns {Query}
 */
Query.prototype.desc = function(column) {
	this._orderBy.push({ column: column, order: 'DESC' });
	return this;
};

/**
 * If exists checking for drop table queries
 * @returns {Query}
 */
Query.prototype.ifExists = function() {
	this._ifExists = true;
	return this;
};

/**
 * If not exists checking for create table queries
 * @returns {Query}
 */
Query.prototype.ifNotExists = function() {
	this._ifNotExists = true;
	return this;
};

/**
 * "where" query part specifier
 * @returns {Query}
 */
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
							case 'like': {
								op_s = 'LIKE'
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

/**
 * "and" boolean continuation for "where" query part
 * @returns {Query}
 */
Query.prototype.andWhere = function() {
	this._where.push({
		type: 'connector',
		operator: 'AND'
	});

	return this.where.apply(this, arguments);
};

/**
 * "or" boolean continuation for "where" query part
 * @returns {Query}
 */
Query.prototype.orWhere = function() {
	this._where.push({
		type: 'connector',
		operator: 'OR'
	});

	return this.where.apply(this, arguments);
};

/**
 * Add column description for create table queries
 * @param columnDescription
 * @returns {Query}
 */
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

/**
 * "create table" query
 * @returns {Query}
 */
Query.prototype.createTable = function() {
	this._setType('createTable');
	return this;
};

/**
 * "drop table" query
 * @returns {Query}
 */
Query.prototype.dropTable = function() {
	this._setType('dropTable');
	return this;
};

/**
 * "truncate table" query
 * @returns {Query}
 */
Query.prototype.truncate = function() {
	this._setType('truncate');
	return this;
};

/**
 * "inner join" query part specifier
 * @param {string} tableName
 * @param alias
 * @returns {Query}
 */
Query.prototype.join = function(tableName, alias) {
	var join = {
		type: 'inner',
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

/**
 * "left join" query part specifier
 * @param tableName
 * @param alias
 * @returns {Query}
 */
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

/**
 * "right join" query part specifier
 * @param tableName
 * @param alias
 * @returns {Query}
 */
Query.prototype.rightJoin = function(tableName, alias) {
	var join = {
		type: 'right',
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

/**
 * "on" query part specifier for joins
 * @returns {Query}
 */
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

/**
 * "and" boolean continuation for "on" query part
 * @returns {Query}
 */
Query.prototype.andOn = function() {
	this._currentOn.push({
		type: 'connector',
		operator: 'AND'
	});

	return this.on.apply(this, arguments);
};

/**
 * "or" boolean continuation for "on" query part
 * @returns {Query}
 */
Query.prototype.orOn = function() {
	this._currentOn.push({
		type: 'connector',
		operator: 'OR'
	});

	return this.on.apply(this, arguments);
};

/**
 * Actual query generator based on previous calls of different methods
 * @returns {string}
 */
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

/**
 * Actual prepared statements ready query generator based on previous calls of different methods
 * @returns {*}
 */
Query.prototype.toPrepared = function() {
	var result;

	switch(this._type) {
		case 'select': {
			result = this._genSelect(true);
		}
			break;
		case 'insert': {
			result = this._genInsert(true);
		}
			break;
		case 'update': {
			result = this._genUpdate(true);
		}
			break;
		case 'delete': {
			result = this._genDelete(true);
		}
			break;
		case 'createTable': {
			result = this._genCreateTable(true);
		}
			break;
		case 'dropTable': {
			result = this._genDropTable(true);
		}
			break;
		case 'truncate': {
			result = this._genTruncate(true);
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