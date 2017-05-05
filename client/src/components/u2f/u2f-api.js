//Copyright 2014-2015 Google Inc. All rights reserved.

//Use of this source code is governed by a BSD-style
//license that can be found in the LICENSE file or at
//https://developers.google.com/open-source/licenses/bsd

/**
 * @fileoverview The U2F api.
 */
'use strict';

Vue.mixin({
  /**
   * FIDO U2F Javascript API Version
   * @number
   */
  js_api_version,

  /**
   * The U2F extension id
   * @const {string}
   */
  // The Chrome packaged app extension ID.
  // Uncomment this if you want to deploy a server instance that uses
  // the package Chrome app and does not require installing the U2F Chrome extension.
  EXTENSION_ID = 'kmendfapggjehodndflmmgagdbamhnfd',
  // The U2F Chrome extension ID.
  // Uncomment this if you want to deploy a server instance that uses
  // the U2F Chrome extension to authenticate.
  // EXTENSION_ID = 'pfboblefjcgdjicmnffhdgionmgcdmne',
  /**
   * Message types for messsages to/from the extension
   * @const
   * @enum {string}
   */
  MessageTypes = {
    'U2F_REGISTER_REQUEST': 'u2f_register_request',
    'U2F_REGISTER_RESPONSE': 'u2f_register_response',
    'U2F_SIGN_REQUEST': 'u2f_sign_request',
    'U2F_SIGN_RESPONSE': 'u2f_sign_response',
    'U2F_GET_API_VERSION_REQUEST': 'u2f_get_api_version_request',
    'U2F_GET_API_VERSION_RESPONSE': 'u2f_get_api_version_response'
  },


  /**
   * Response status codes
   * @const
   * @enum {number}
   */
  ErrorCodes = {
    'OK': 0,
    'OTHER_ERROR': 1,
    'BAD_REQUEST': 2,
    'CONFIGURATION_UNSUPPORTED': 3,
    'DEVICE_INELIGIBLE': 4,
    'TIMEOUT': 5
  },


  /**
   * A message for registration requests
   * @typedef {{
   *   type: MessageTypes,
   *   appId: ?string,
   *   timeoutSeconds: ?number,
   *   requestId: ?number
   * }}
   */
  U2fRequest,


  /**
   * A message for registration responses
   * @typedef {{
   *   type: MessageTypes,
   *   responseData: (Error | RegisterResponse | SignResponse),
   *   requestId: ?number
   * }}
   */
  U2fResponse,


  /**
   * An error object for responses
   * @typedef {{
   *   errorCode: ErrorCodes,
   *   errorMessage: ?string
   * }}
   */
  Error,

  /**
   * Data object for a single sign request.
   * @typedef {enum {BLUETOOTH_RADIO, BLUETOOTH_LOW_ENERGY, USB, NFC}}
   */
  Transport,


  /**
   * Data object for a single sign request.
   * @typedef {Array<Transport>}
   */
  Transports,

  /**
   * Data object for a single sign request.
   * @typedef {{
   *   version: string,
   *   challenge: string,
   *   keyHandle: string,
   *   appId: string
   * }}
   */
  SignRequest,


  /**
   * Data object for a sign response.
   * @typedef {{
   *   keyHandle: string,
   *   signatureData: string,
   *   clientData: string
   * }}
   */
  SignResponse,


  /**
   * Data object for a registration request.
   * @typedef {{
   *   version: string,
   *   challenge: string
   * }}
   */
  RegisterRequest,


  /**
   * Data object for a registration response.
   * @typedef {{
   *   version: string,
   *   keyHandle: string,
   *   transports: Transports,
   *   appId: string
   * }}
   */
  RegisterResponse,


  /**
   * Data object for a registered key.
   * @typedef {{
   *   version: string,
   *   keyHandle: string,
   *   transports: ?Transports,
   *   appId: ?string
   * }}
   */
  RegisteredKey,


  /**
   * Data object for a get API register response.
   * @typedef {{
   *   js_api_version: number
   * }}
   */
  GetJsApiVersionResponse,

  //Low level MessagePort API support

  /**
   * Sets up a MessagePort to the U2F extension using the
   * available mechanisms.
   * @param {function((MessagePort|WrappedChromeRuntimePort_))} callback
   */
  getMessagePort = function (callback) {
    if (typeof chrome != 'undefined' && chrome.runtime) {
      // The actual message here does not matter, but we need to get a reply
      // for the callback to run. Thus, send an empty signature request
      // in order to get a failure response.
      var msg = {
        type: MessageTypes.U2F_SIGN_REQUEST,
        signRequests: []
      };
      chrome.runtime.sendMessage(EXTENSION_ID, msg, function () {
        if (!chrome.runtime.lastError) {
          // We are on a whitelisted origin and can talk directly
          // with the extension.
          getChromeRuntimePort_(callback);
        } else {
          // chrome.runtime was available, but we couldn't message
          // the extension directly, use iframe
          getIframePort_(callback);
        }
      });
    } else if (isAndroidChrome_()) {
      getAuthenticatorPort_(callback);
    } else if (isIosChrome_()) {
      getIosPort_(callback);
    } else {
      // chrome.runtime was not available at all, which is normal
      // when this origin doesn't have access to any extensions.
      getIframePort_(callback);
    }
  },

  /**
   * Detect chrome running on android based on the browser's useragent.
   * @private
   */
  isAndroidChrome_ = function () {
    var userAgent = navigator.userAgent;
    return userAgent.indexOf('Chrome') != -1 &&
      userAgent.indexOf('Android') != -1;
  },

  /**
   * Detect chrome running on iOS based on the browser's platform.
   * @private
   */
  isIosChrome_ = function () {
    return $.inArray(navigator.platform, ["iPhone", "iPad", "iPod"]) > -1;
  },

  /**
   * Connects directly to the extension via chrome.runtime.connect.
   * @param {function(WrappedChromeRuntimePort_)} callback
   * @private
   */
  getChromeRuntimePort_ = function (callback) {
    var port = chrome.runtime.connect(EXTENSION_ID,
      { 'includeTlsChannelId': true });
    setTimeout(function () {
      callback(new WrappedChromeRuntimePort_(port));
    }, 0);
  },

  /**
   * Return a 'port' abstraction to the Authenticator app.
   * @param {function(WrappedAuthenticatorPort_)} callback
   * @private
   */
  getAuthenticatorPort_ = function (callback) {
    setTimeout(function () {
      callback(new WrappedAuthenticatorPort_());
    }, 0);
  },

  /**
   * Return a 'port' abstraction to the iOS client app.
   * @param {function(WrappedIosPort_)} callback
   * @private
   */
  getIosPort_ = function (callback) {
    setTimeout(function () {
      callback(new WrappedIosPort_());
    }, 0);
  },

  /**
   * A wrapper for chrome.runtime.Port that is compatible with MessagePort.
   * @param {Port} port
   * @constructor
   * @private
   */
  WrappedChromeRuntimePort_ = function (port) {
    this.port_ = port;
  },

  /**
   * Format and return a sign request compliant with the JS API version supported by the extension.
   * @param {Array<SignRequest>} signRequests
   * @param {number} timeoutSeconds
   * @param {number} reqId
   * @return {Object}
   */
  formatSignRequest_ =
  function (appId, challenge, registeredKeys, timeoutSeconds, reqId) {
    if (js_api_version === undefined || js_api_version < 1.1) {
      // Adapt request to the 1.0 JS API
      var signRequests = [];
      for (var i = 0; i < registeredKeys.length; i++) {
        signRequests[i] = {
          version: registeredKeys[i].version,
          challenge: challenge,
          keyHandle: registeredKeys[i].keyHandle,
          appId: appId
        };
      }
      return {
        type: MessageTypes.U2F_SIGN_REQUEST,
        signRequests: signRequests,
        timeoutSeconds: timeoutSeconds,
        requestId: reqId
      };
    }
    // JS 1.1 API
    return {
      type: MessageTypes.U2F_SIGN_REQUEST,
      appId: appId,
      challenge: challenge,
      registeredKeys: registeredKeys,
      timeoutSeconds: timeoutSeconds,
      requestId: reqId
    };
  },

  /**
   * Format and return a register request compliant with the JS API version supported by the extension..
   * @param {Array<SignRequest>} signRequests
   * @param {Array<RegisterRequest>} signRequests
   * @param {number} timeoutSeconds
   * @param {number} reqId
   * @return {Object}
   */
  formatRegisterRequest_ =
  function (appId, registeredKeys, registerRequests, timeoutSeconds, reqId) {
    if (js_api_version === undefined || js_api_version < 1.1) {
      // Adapt request to the 1.0 JS API
      for (var i = 0; i < registerRequests.length; i++) {
        registerRequests[i].appId = appId;
      }
      var signRequests = [];
      for (var i = 0; i < registeredKeys.length; i++) {
        signRequests[i] = {
          version: registeredKeys[i].version,
          challenge: registerRequests[0],
          keyHandle: registeredKeys[i].keyHandle,
          appId: appId
        };
      }
      return {
        type: MessageTypes.U2F_REGISTER_REQUEST,
        signRequests: signRequests,
        registerRequests: registerRequests,
        timeoutSeconds: timeoutSeconds,
        requestId: reqId
      };
    }
    // JS 1.1 API
    return {
      type: MessageTypes.U2F_REGISTER_REQUEST,
      appId: appId,
      registerRequests: registerRequests,
      registeredKeys: registeredKeys,
      timeoutSeconds: timeoutSeconds,
      requestId: reqId
    };
  },


  /**
   * Posts a message on the underlying channel.
   * @param {Object} message
   */
  WrappedChromeRuntimePort_.prototype.postMessage = function (message) {
    this.port_.postMessage(message);
  },


  /**
   * Emulates the HTML 5 addEventListener interface. Works only for the
   * onmessage event, which is hooked up to the chrome.runtime.Port.onMessage.
   * @param {string} eventName
   * @param {function({data: Object})} handler
   */
  WrappedChromeRuntimePort_.prototype.addEventListener =
  function (eventName, handler) {
    var name = eventName.toLowerCase();
    if (name == 'message' || name == 'onmessage') {
      this.port_.onMessage.addListener(function (message) {
        // Emulate a minimal MessageEvent object
        handler({ 'data': message });
      });
    } else {
      console.error('WrappedChromeRuntimePort only supports onMessage');
    }
  },

  /**
   * Wrap the Authenticator app with a MessagePort interface.
   * @constructor
   * @private
   */
  WrappedAuthenticatorPort_ = function () {
    this.requestId_ = -1;
    this.requestObject_ = null;
  }

/**
 * Launch the Authenticator intent.
 * @param {Object} message
 */
WrappedAuthenticatorPort_.prototype.postMessage = function (message) {
    var intentUrl =
      WrappedAuthenticatorPort_.INTENT_URL_BASE_ +
      ';S.request=' + encodeURIComponent(JSON.stringify(message)) +
      ';end';
    document.location = intentUrl;
  },

  /**
   * Tells what type of port this is.
   * @return {String} port type
   */
  WrappedAuthenticatorPort_.prototype.getPortType = function () {
    return "WrappedAuthenticatorPort_";
  },


  /**
   * Emulates the HTML 5 addEventListener interface.
   * @param {string} eventName
   * @param {function({data: Object})} handler
   */
  WrappedAuthenticatorPort_.prototype.addEventListener = function (eventName, handler) {
    var name = eventName.toLowerCase();
    if (name == 'message') {
      var self = this;
      /* Register a callback to that executes when
       * chrome injects the response. */
      window.addEventListener(
        'message', self.onRequestUpdate_.bind(self, handler), false);
    } else {
      console.error('WrappedAuthenticatorPort only supports message');
    }
  },

  /**
   * Callback invoked  when a response is received from the Authenticator.
   * @param function({data: Object}) callback
   * @param {Object} message message Object
   */
  WrappedAuthenticatorPort_.prototype.onRequestUpdate_ =
  function (callback, message) {
    var messageObject = JSON.parse(message.data);
    var intentUrl = messageObject['intentURL'];

    var errorCode = messageObject['errorCode'];
    var responseObject = null;
    if (messageObject.hasOwnProperty('data')) {
      responseObject = /** @type {Object} */ (
        JSON.parse(messageObject['data']));
    }

    callback({ 'data': responseObject });
  },

  /**
   * Base URL for intents to Authenticator.
   * @const
   * @private
   */
  WrappedAuthenticatorPort_.INTENT_URL_BASE_ =
  'intent:#Intent;action=com.google.android.apps.authenticator.AUTHENTICATE';

  /**
   * Wrap the iOS client app with a MessagePort interface.
   * @constructor
   * @private
   */
  WrappedIosPort_ = function () { },

  /**
   * Launch the iOS client app request
   * @param {Object} message
   */
  WrappedIosPort_.prototype.postMessage = function (message) {
    var str = JSON.stringify(message);
    var url = "u2f://auth?" + encodeURI(str);
    location.replace(url);
  },

  /**
   * Tells what type of port this is.
   * @return {String} port type
   */
  WrappedIosPort_.prototype.getPortType = function () {
    return "WrappedIosPort_";
  },

  /**
   * Emulates the HTML 5 addEventListener interface.
   * @param {string} eventName
   * @param {function({data: Object})} handler
   */
  WrappedIosPort_.prototype.addEventListener = function (eventName, handler) {
    var name = eventName.toLowerCase();
    if (name !== 'message') {
      console.error('WrappedIosPort only supports message');
    }
  },

  /**
   * Sets up an embedded trampoline iframe, sourced from the extension.
   * @param {function(MessagePort)} callback
   * @private
   */
  getIframePort_ = function (callback) {
    // Create the iframe
    var iframeOrigin = 'chrome-extension://' + EXTENSION_ID;
    var iframe = document.createElement('iframe');
    iframe.src = iframeOrigin + '/u2f-comms.html';
    iframe.setAttribute('style', 'display:none');
    document.body.appendChild(iframe);

    var channel = new MessageChannel();
    var ready = function (message) {
      if (message.data == 'ready') {
        channel.port1.removeEventListener('message', ready);
        callback(channel.port1);
      } else {
        console.error('First event on iframe port was not "ready"');
      }
    };
    channel.port1.addEventListener('message', ready);
    channel.port1.start();

    iframe.addEventListener('load', function () {
      // Deliver the port to the iframe and initialize
      iframe.contentWindow.postMessage('init', iframeOrigin, [channel.port2]);
    });
  },


  //High-level JS API

  /**
   * Default extension response timeout in seconds.
   * @const
   */
  EXTENSION_TIMEOUT_SEC = 30,

  /**
   * A singleton instance for a MessagePort to the extension.
   * @type {MessagePort|WrappedChromeRuntimePort_}
   * @private
   */
  port_ = null,

  /**
   * Callbacks waiting for a port
   * @type {Array<function((MessagePort|WrappedChromeRuntimePort_))>}
   * @private
   */
  waitingForPort_ =[],

  /**
   * A counter for requestIds.
   * @type {number}
   * @private
   */
  reqCounter_ = 0,

  /**
   * A map from requestIds to client callbacks
   * @type {Object.<number,(function((Error|RegisterResponse))
   *                       |function((Error|SignResponse)))>}
   * @private
   */
  callbackMap_ = {},

  /**
   * Creates or retrieves the MessagePort singleton to use.
   * @param {function((MessagePort|WrappedChromeRuntimePort_))} callback
   * @private
   */
  getPortSingleton_ = function (callback) {
    if (port_) {
      callback(port_);
    } else {
      if (waitingForPort_.length == 0) {
        getMessagePort(function (port) {
          port_ = port;
          port_.addEventListener('message',
            /** @type {function(Event)} */(responseHandler_));

          // Careful, here be async callbacks. Maybe.
          while (waitingForPort_.length)
            waitingForPort_.shift()(port_);
        });
      }
      waitingForPort_.push(callback);
    }
  },

  /**
   * Handles response messages from the extension.
   * @param {MessageEvent.<Response>} message
   * @private
   */
  responseHandler_ = function (message) {
    var response = message.data;
    var reqId = response['requestId'];
    if (!reqId || !callbackMap_[reqId]) {
      console.error('Unknown or missing requestId in response.');
      return;
    }
    var cb = callbackMap_[reqId];
    delete callbackMap_[reqId];
    cb(response['responseData']);
  },

  /**
   * Dispatches an array of sign requests to available U2F tokens.
   * If the JS API version supported by the extension is unknown, it first sends a
   * message to the extension to find out the supported API version and then it sends
   * the sign request.
   * @param {string=} appId
   * @param {string=} challenge
   * @param {Array<RegisteredKey>} registeredKeys
   * @param {function((Error|SignResponse))} callback
   * @param {number=} opt_timeoutSeconds
   */
  sign = function (appId, challenge, registeredKeys, callback, opt_timeoutSeconds) {
    if (js_api_version === undefined) {
      // Send a message to get the extension to JS API version, then send the actual sign request.
      getApiVersion(
        function (response) {
          js_api_version = response['js_api_version'] === undefined ? 0 : response['js_api_version'];
          console.log("Extension JS API Version: ", js_api_version);
          sendSignRequest(appId, challenge, registeredKeys, callback, opt_timeoutSeconds);
        });
    } else {
      // We know the JS API version. Send the actual sign request in the supported API version.
      sendSignRequest(appId, challenge, registeredKeys, callback, opt_timeoutSeconds);
    }
  },

  /**
   * Dispatches an array of sign requests to available U2F tokens.
   * @param {string=} appId
   * @param {string=} challenge
   * @param {Array<RegisteredKey>} registeredKeys
   * @param {function((Error|SignResponse))} callback
   * @param {number=} opt_timeoutSeconds
   */
  sendSignRequest = function (appId, challenge, registeredKeys, callback, opt_timeoutSeconds) {
    getPortSingleton_(function (port) {
      var reqId = ++reqCounter_;
      callbackMap_[reqId] = callback;
      var timeoutSeconds = (typeof opt_timeoutSeconds !== 'undefined' ?
        opt_timeoutSeconds : EXTENSION_TIMEOUT_SEC);
      var req = formatSignRequest_(appId, challenge, registeredKeys, timeoutSeconds, reqId);
      port.postMessage(req);
    });
  },

  /**
   * Dispatches register requests to available U2F tokens. An array of sign
   * requests identifies already registered tokens.
   * If the JS API version supported by the extension is unknown, it first sends a
   * message to the extension to find out the supported API version and then it sends
   * the register request.
   * @param {string=} appId
   * @param {Array<RegisterRequest>} registerRequests
   * @param {Array<RegisteredKey>} registeredKeys
   * @param {function((Error|RegisterResponse))} callback
   * @param {number=} opt_timeoutSeconds
   */
  register = function (appId, registerRequests, registeredKeys, callback, opt_timeoutSeconds) {
    if (js_api_version === undefined) {
      // Send a message to get the extension to JS API version, then send the actual register request.
      getApiVersion(
        function (response) {
          js_api_version = response['js_api_version'] === undefined ? 0 : response['js_api_version'];
          console.log("Extension JS API Version: ", js_api_version);
          sendRegisterRequest(appId, registerRequests, registeredKeys,
            callback, opt_timeoutSeconds);
        });
    } else {
      // We know the JS API version. Send the actual register request in the supported API version.
      sendRegisterRequest(appId, registerRequests, registeredKeys,
        callback, opt_timeoutSeconds);
    }
  },

  /**
   * Dispatches register requests to available U2F tokens. An array of sign
   * requests identifies already registered tokens.
   * @param {string=} appId
   * @param {Array<RegisterRequest>} registerRequests
   * @param {Array<RegisteredKey>} registeredKeys
   * @param {function((Error|RegisterResponse))} callback
   * @param {number=} opt_timeoutSeconds
   */
  sendRegisterRequest = function (appId, registerRequests, registeredKeys, callback, opt_timeoutSeconds) {
    getPortSingleton_(function (port) {
      var reqId = ++reqCounter_;
      callbackMap_[reqId] = callback;
      var timeoutSeconds = (typeof opt_timeoutSeconds !== 'undefined' ?
        opt_timeoutSeconds : EXTENSION_TIMEOUT_SEC);
      var req = formatRegisterRequest_(
        appId, registeredKeys, registerRequests, timeoutSeconds, reqId);
      port.postMessage(req);
    });
  },


  /**
   * Dispatches a message to the extension to find out the supported
   * JS API version.
   * If the user is on a mobile phone and is thus using Google Authenticator instead
   * of the Chrome extension, don't send the request and simply return 0.
   * @param {function((Error|GetJsApiVersionResponse))} callback
   * @param {number=} opt_timeoutSeconds
   */
  getApiVersion = function (callback, opt_timeoutSeconds) {
    getPortSingleton_(function (port) {
      // If we are using Android Google Authenticator or iOS client app,
      // do not fire an intent to ask which JS API version to use.
      if (port.getPortType) {
        var apiVersion;
        switch (port.getPortType()) {
          case 'WrappedIosPort_':
          case 'WrappedAuthenticatorPort_':
            apiVersion = 1.1;
            break;

          default:
            apiVersion = 0;
            break;
        }
        callback({ 'js_api_version': apiVersion });
        return;
      }
      var reqId = ++reqCounter_;
      callbackMap_[reqId] = callback;
      var req = {
        type: MessageTypes.U2F_GET_API_VERSION_REQUEST,
        timeoutSeconds: (typeof opt_timeoutSeconds !== 'undefined' ?
          opt_timeoutSeconds : EXTENSION_TIMEOUT_SEC),
        requestId: reqId
      };
      port.postMessage(req);
    });
  }
})
