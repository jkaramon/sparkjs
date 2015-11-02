/*
 ******************************************************************************
 * @file lib/spark.js
 * @company Spark ( https://www.spark.io/ )
 * @source https://github.com/spark/sparkjs
 *
 * @Contributors
 *    David Middlecamp (david@spark.io)
 *    Edgar Silva (https://github.com/edgarsilva)
 *    Javier Cervantes (https://github.com/solojavier)
 *
 * @brief Main Spark Api class
 ******************************************************************************
  Copyright (c) 2014 Spark Labs, Inc.  All rights reserved.

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation, either
  version 3 of the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this program; if not, see <http://www.gnu.org/licenses/>.
  ******************************************************************************
 */

/*jslint node: true */
'use strict';

var when = require('when'),
    pipeline = require('when/pipeline');

 //fs = require('fs'),
var    util = require('./util'),
    EventEmitter = require('wolfy87-eventemitter'),
    Device = require('./device'),
    SparkApi = require('./spark-api');

/**
 * Creates a new Spark obj
 * @constructor {Spark}
 */
var Spark = function(opts) {

  Object.defineProperty(this, "baseUrl", {
    get: function() { return this.__baseUrl; },
    set: function(url) { this.__baseUrl = url; }
  });

  this.baseUrl = 'https://api.particle.io';
  this.clientId = 'Spark';
  this.clientSecret = 'Spark';
  this.accessToken = null;
  this.plugins = [];
  this.devices = {};
  this.api = new SparkApi({
    clientId: this.clientId,
    clientSecret: this.clientSecret,
    baseUrl: this.baseUrl
  });
};

util.inherits(Spark, EventEmitter);




/**
 * Login to the Spark Cloud
 * @returns {Promise}
 * @endpoint GET /oauth/token
 */
Spark.prototype.login = function (params) {
  return this.api.login(params).then(function(data) {
    this.accessToken = data.access_token;
    return data;
  }.bind(this));
};

Spark.prototype._mapDevice = function(data) {
  return new Device(data, this);
}

/**
 * Returns a device based on the param deviceId
 *
 * @this {Spark}
 * @param {string} deviceId - the id of the core to retrieve
 * @returns {Promise}
 * @endpoint GET /v1/devices
 */
Spark.prototype.getDevice = function (accessToken, deviceId) {
  return this.api.getDevice({deviceId: deviceId, accessToken: accessToken })
    .then(this._mapDevice.bind(this));
};

/**
 * Returns a list of devices for the logged in user and updates the local cache
 * of devices
 *
 * @this {Spark}
 * @param {function} callback(err, data)
 * @returns {Promise}
 * @endpoint GET /v1/devices
 */
Spark.prototype.listDevices = function (accessToken) {
  return this.api.listDevices({ accessToken: accessToken })
    .then(function(data) {
      return data.map(this._mapDevice.bind(this));
    }.bind(this));
};

/**
 * Creates an user in the Spark cloud
 *
 * @this {Spark}
 * @param {string} username - Email for the user to be registered
 * @param {string} password
 * @returns {Promise}
 * @endpoint POST /v1/users
 */
Spark.prototype.createUser = function (username, password) {
  return this.api.createUser(username, password);
};

/**
 * Removes accessToken from the Spark cloud for the specified user.
 *
 * @this {Spark}
 * @param {string} username - Email for the user to be registered
 * @param {string} password
 * @param {string} accessToken - the access_token to be removed
 * @returns {Promise}
 * @endpoint DELETE /v1/access_tokens/<access_token>
 */
Spark.prototype.removeAccessToken = function (username, password, accessToken) {
  return this.api.removeAccessToken(username, password, accessToken);
};

/**
 * Claims a device and adds it to the user currently logged in
 *
 * @param {string} deviceId - The id of the Spark device you wish to claim
 * @param {function} callback
 * @returns {Promise}
 * @endpoint POST /v1/devices
 */
Spark.prototype.claimDevice = function (accessToken, deviceId) {
  return this.api.claimCore(deviceId, accessToken);
};

/**
 * Removes a device from the user currently logged in
 *
 * @param {string} deviceId - The id of the Spark device you wish to claim
 * @returns {Promise}
 * @endpoint DELETE /v1/devices/<core_id>
 */
Spark.prototype.removeDevice = function (accessToken, deviceId) {
  return this.api.removeCore(coreId, accessToken);
};

/**
 * Renames a device for the user currently logged in
 *
 * @param {string} deviceId - The id of the Spark device you wish to claim
 * @param {string} name - New device name
 * @param {function} callback
 * @returns {Promise}
 * @endpoint PUT /v1/devices/<core_id>
 */
Spark.prototype.renameDevice = function (accessToken, deviceId, name, callback) {
  return this.api.renameCore(deviceId, name, accessToken);
}

/**
 * Gets all attributes for a given device
 *
 * @param {string} deviceId - The id of the Spark device you wish get attrs for
 * @returns {Promise}
 * @endpoint GET /v1/devices/<core_id>
 */
Spark.prototype.getAttributes = function (accessToken, deviceId) {
  return this.api.getAttributes(deviceId, accessToken);
};

/**
 * Gets an attribute for a specific device
 *
 * @param {string} deviceId - The id of the Spark device you wish get attrs for
 * @param {string} name - The name of the variable/attr to retrieve
 * @returns {Promise}
 * @endpoint GET /v1/devices/<core_id>/<variable_name>
 */
Spark.prototype.getVariable = function (accessToken, deviceId, name) {
  return this.api.getVariable(deviceId, name, accessToken);
};

/**
 * Send a signal to a device
 *
 * @param {string} deviceId - The id of the Spark device you wish to signal
 * @param {boolean} beSignalling - If the device should be emitting signals or not
  * @returns {Promise}
 * @endpoint PUT /v1/devices/<core_id>
 */
Spark.prototype.signalDevice = function (accessToken, coreId, beSignalling, callback) {
  return this.api.signalCore(deviceId, beSignalling, accessToken);
};

/**
 * Flash Tinker firmware to a device
 *
 * @param {string} deviceId - The id of the Spark device you wish to signal
 * @param {function} callback
 * @returns {Promise}
 * @endpoint PUT /v1/devices/<core_id>
 */
Spark.prototype.flashTinker = function (accessToken, deviceId) {
  return this.api.flashTinker(deviceId, accessToken);
};

/**
 * Flash firmware to a Device
 *
 * @param {string} deviceId - The id of the Spark device you wish to signal
 * @param {[string]} files - An array of strings containing the files to flash
 * @returns {Promise}
 * @endpoint PUT /v1/devices/<device_id>
 */
Spark.prototype.flashDevice = function (accessToken, deviceId, files) {
  return this.api.flashCore(deviceId, files, accessToken);
};

/**
 * Compiles files in the Spark cloud
 *
 * @param {[string]} files - An array of strings containing the files to compile
 * @returns {Promise}
 * @endpoint PUT /v1/binaries
 */
Spark.prototype.compileCode = function(accessToken, files, options) {
  return this.api.compileCode(files, options, accessToken);
};

///**
// * Download binary file from the spark cloud
// *
// * @param {string} url - The url for the binary
// * @param {string} filename
// * @returns {Promise}
// * @endpoint GET /<url>
// */
//Spark.prototype.downloadBinary = function (accessToken, url, filename, callback) {
//  //var defer = this.createDefer('downloadBinary', callback),
//  //    outFs = fs.createWriteStream(filename),
//  //    handler = this.defaultHandler('downloadBinary', defer, callback).bind(this);
//  //
//  //this.api.downloadBinary(url, filename, this.accessToken, handler).pipe(outFs);
//  //
//  //var promise = (!!defer) ? defer.promise : null;
//  //return promise;
//};

/**
 * Sends a public key to the Spark cloud
 *
 * @param {string} deviceId - The id of the Device
 * @param {Buffer} buffer - The buffer for the public key
 * @returns {Promise}
 * @endpoint GET /v1/provisioning/<core_id>
 */
Spark.prototype.sendPublicKey = function (accessToken, deviceId, buffer) {
  return this.api.sendPublicKey(coreId, buffer, accessToken);
};

/**
 * Call a function on a Device
 *
 * @param {string} deviceId - The id of the Device
 * @param {string} functionName - The name of the function to call
 * @param {string} funcParam - Param for the function
 * @returns {Promise}
 * @endpoint GET /v1/devices/<core_id>/<function_name>
 */
Spark.prototype.callFunction = function (accessToken, deviceId, functionName, funcParam) {
  return this.api.callFunction(deviceId, functionName, funcParam, accessToken);
};


/**
 * Get eventListener to an event stream in the Spark cloud
 *
 * @param {string} eventName - Event to register
 * @param {[string]} deviceId - Optional Id for the device for which to get the listener
 * @param {function} callback
 * @endpoint GET /v1/devices/<core_id>/events
 *
 * @returns {Request}
 */
Spark.prototype.getEventStream = function (accessToken, eventName, deviceId, callback) {
  var defer = this.createDefer('getEventStream', callback),
      handler = this.defaultHandler('getEventStream', defer, callback).bind(this),
      requestObj = this.api.getEventStream(eventName, deviceId, this.accessToken, handler);

    if (callback) {
        //if ((event !== '') && (typeof(callback) === 'function')) { callback(event); }
        var processor = this._createStreamProcessor();
        processor.watch(requestObj, callback);
    }

  return requestObj;
};

/**
 * Collects SSE pieces, and parses and returns them nicely
 * @private
 */
Spark.prototype._createStreamProcessor = function() {

    var Processor = function() {};
    Processor.prototype = {
        chunks: [],
        appendToQueue: function(arr) {
            for (var i = 0; i < arr.length; i++) {
                var line = (arr[i] || "").trim();
                if (line == "") {
                    continue;
                }
                this.chunks.push(line);
                if (line.indexOf("data:") == 0) {
                    this.processItem(this.chunks);
                    this.chunks = [];
                }
            }
        },
        processItem: function(arr) {
            var obj = {};
            for (var i = 0; i < arr.length; i++) {
                var line = arr[i];

                if (line.indexOf("event:") == 0) {
                    obj.name = line.replace("event:", "").trim();
                }
                else if (line.indexOf("data:") == 0) {
                    line = line.replace("data:", "");
                    var name = obj.name;
                    obj = JSON.parse(line);
                    obj.name = name;
                }
            }

            if (this.onDataReady) {
                this.onDataReady(obj);
            }
        },
        onData: function(event) {
            var chunk = event.toString();
            this.appendToQueue(chunk.split("\n"));
        },
        watch: function(eventer, callback) {
            //when we have a JSON object ready
            this.onDataReady = callback;

			if (eventer.on) {
				//when we get something from the SSE
            	eventer.on('data', this.onData.bind(this));
			}
			else if (eventer.onreadystatechange) {
				// in a browser?
				var that = this,
					idx = 0;
				eventer.onreadystatechange = function() {
					var text = eventer.responseText.substr(idx);
					idx = eventer.responseText.length;
					that.onData(text);
				};
			}
			else {
				console.error("event stream couldn't stream!");
			}
        }
    };

    return new Processor();
};

/**
 * Subscribe callback to a global event in the Spark cloud
 *
 * @param {string} eventName - Event to listen
 * @param {function} callback
 *
 * @returns {Request}
 */
Spark.prototype.onEvent = function(eventName, callback) {
  this.getEventStream(eventName, false, callback);
};

/**
 * Register an event stream in the Spark cloud
 *
 * @param {string} eventName - Event to register
 * @param {string} data - To be passed to the to the event
 * @param {function} callback
 * @endpoint POST /v1/devices/events
 *
 * @returns {Promise}
 */
Spark.prototype.publishEvent = function (accessToken, eventName, data) {
  return this.api.publishEvent(eventName, data, accessToken);
};

/**
 * Creates a new webhook in the Spark cloud
 *
 * @param {string} eventName - Event to register
 * @param {string} url - To hook to
 * @param {string} deviceId - Id of the Device
 * @param {function} callback
 * @endpoint POST /v1/webhooks
 *
 * @returns {Promise}
 */
Spark.prototype.createWebhook = function (accessToken, eventName, url, deviceId) {
  return this.api.createWebhook(eventName, url, deviceId, accessToken);
};

/**
 * Deletes a webhook
 *
 * @param {string} hookId - Id of the webhook
 * @param {function} callback
 * @endpoint DELETE /v1/webhooks/<hook_id>
 *
 * @returns {Promise}
 */
Spark.prototype.deleteWebhook = function (accessToken, hookId) {
  return this.api.deleteWebhook(hookId, accessToken);
};

/**
 * Gets a list of all webhooks
 *
 * @param {function} callback
 * @endpoint GET /v1/webhooks
 *
 * @returns {Promise}
 */
Spark.prototype.listWebhooks = function (accessToken) {
  return this.api.listWebhooks(accessToken);
};

module.exports = new Spark();
