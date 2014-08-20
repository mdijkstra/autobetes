//molgenis entity REST API client
(function($, molgenis) {
	"use strict";
	var self = molgenis.RestClient = molgenis.RestClient || {};
	self.token = null;
	molgenis.RestClient = function RestClient() {};

	molgenis.RestClient.prototype.get = function(resourceUri, options) {
		return this._get(resourceUri, options);
	};

	molgenis.RestClient.prototype.getAsync = function(resourceUri, options, callback) {
		this._get(resourceUri, options, callback);
	};

	molgenis.RestClient.prototype._get = function(resourceUri, options, callback) {
		var resource = null;

		var async = callback !== undefined;

		var config = {
				'dataType' : 'json',
				'url' : this._toApiUri(resourceUri, options),
				'cache' : true,
				'async' : async,
				'success' : function(data) {
					if (async)
						callback(data);
					else
						resource = data;
				}
		};

		// tunnel get requests with query through a post,
		// because it might not fit in the URL
		if (options && options.q) {
			$.extend(config, {
				'type' : 'POST',
				'data' : JSON.stringify(options.q),
				'contentType' : 'application/json'
			});
		}

		if (self.token) {
			$.extend(config, {
				headers: {'x-molgenis-token': self.token}
			});
		}

		$.ajax(config);

		if (!async)
			return resource;
	};

	molgenis.RestClient.prototype._toApiUri = function(resourceUri, options) {
		var qs = "";
		if (resourceUri.indexOf('?') != -1) {
			var uriParts = resourceUri.split('?');
			resourceUri = uriParts[0];
			qs = '?' + uriParts[1];
		}
		if (options && options.attributes && options.attributes.length > 0)
			qs += (qs.length === 0 ? '?' : '&') + 'attributes=' + options.attributes.join(',');
		if (options && options.expand && options.expand.length > 0)
			qs += (qs.length === 0 ? '?' : '&') + 'expand=' + options.expand.join(',');
		if (options && options.q)
			qs += (qs.length === 0 ? '?' : '&') + '_method=GET';
		return resourceUri + qs;
	};



	molgenis.RestClient.prototype.getPrimaryKeyFromHref = function(href) {
		return href.substring(href.lastIndexOf('/') + 1);
	};

	molgenis.RestClient.prototype.getHref = function(entityName, primaryKey) {
		return '/api/v1/' + entityName + (primaryKey ? '/' + primaryKey : '');
	};

	molgenis.RestClient.prototype.remove = function(href, callback) {
		$.ajax({
			type : 'POST',
			url : href,
			data : '_method=DELETE',
			async : false,
			success : callback.success,
			error : callback.error
		});
	};

	molgenis.RestClient.prototype.entityExists = function(resourceUri) {
		var result = false;
		$.ajax({
			dataType : 'json',
			url : resourceUri + '/exist',
			async : false,
			success : function(exists) {
				result = exists;
			}
		});

		return result;
	};


	molgenis.RestClient.prototype.add = function(url, data, callback, errorHandler) {
		$.ajax({
			type: 'POST',
			headers: {'x-molgenis-token': self.token},
			url: url,
			data: JSON.stringify(data),
			async: false,
			contentType: 'application/json',
			success: function(data, textStatus, response) {
				callback(data, textStatus, response);
			},
			error: function(request, textStatus, error) {
				console.log("ERROR:" + error);
				errorHandler(request, textStatus, error);
			}
		});


	}

	molgenis.RestClient.prototype.update = function(url, data, callback, errorHandler) {
		console.log(url);
		console.log(JSON.stringify(data));
		console.log(self.token);
		console.log(callback);
		console.log(errorHandler);
		$.ajax({
			type: 'POST',
			headers: {'x-molgenis-token': self.token},
			url: url,
			data: JSON.stringify(data),
			async: false,
			contentType: 'application/json',
			success: function(data, textStatus, response) {
				callback(data, textStatus, response);
			},
			error: function(request, textStatus, error) {
				console.log("ERROR:" + error);
				errorHandler(request, textStatus, error)
			}
		});


	}


	molgenis.RestClient.prototype.login = function(url, username, password, callback, callbackLoginError) {
		$.ajax({
			type: 'POST',
			dataType : 'json',
			url : url,
			contentType : 'application/json',
			async : true,
			data: JSON.stringify({username: username, password: password}),
			success : function(loginResult) {
				self.token = loginResult.token;
				callback.success({
					username: loginResult.username,
					firstname: loginResult.firstname,
					lastname: loginResult.lastname,
					token: loginResult.token
				});
			},
			error : function(request, textStatus, error) {
				callBackLoginError(request, textStatus, error);

			}
		});
	};

	molgenis.RestClient.prototype.register = function(url, data, callback, errorHandler){
		console.log("register url:"+ url+", data:"+ data)
		$.ajax({
			type: 'POST',
			url: url,
			dataType : 'json',
			async : true,
			data: JSON.stringify(data),
			contentType: 'application/json',
			success: function(data, textStatus, response) {
				callback(data, textStatus, response);
			},
			error: function(request, textStatus, error) {
				errorHandler(request, textStatus, error);
			}
		});

	}
	molgenis.RestClient.prototype.getToken = function(){
		if(self.token === undefined){
			return null;
		}
		else{
			return self.token;
		}
	}
	molgenis.RestClient.prototype.setToken = function(token){
		return self.token = token;
	}

	molgenis.RestClient.prototype.logout = function(url, callback) {
		$.ajax({
			url : url,
			async : true,
			headers: {'x-molgenis-token': self.token},
			success : function() {
				self.token = null;

				callback();
			}
		});
	};

}($, window.top.molgenis = window.top.molgenis || {}));
