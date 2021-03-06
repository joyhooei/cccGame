var _poolModule = require('generic-pool');
var mysql = require('mysql');
/*
 * Create mysql connection pool.
 */
var createMysqlPool = function(app,opt,id) {

	var mysqlConfig = app.get(opt)[id];
	return new _poolModule.Pool({
		name: mysqlConfig.database,
		create: function(callback) {

			var client = mysql.createConnection({
				host: mysqlConfig.host,
				user: mysqlConfig.user,
				password: mysqlConfig.password,
				database: mysqlConfig.database
			});
			callback(null, client);
		},
		destroy: function(client) {
			client.end();
		},
		max: 10,
		idleTimeoutMillis : 30000,
		log : false
	});
};


exports.createMysqlPool = createMysqlPool;


