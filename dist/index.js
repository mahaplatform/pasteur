'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pasteur = function () {
  function Pasteur(config) {
    _classCallCheck(this, Pasteur);

    this.callbacks = {};
    this.debug = null;
    this.handlers = [];
    this.window = null;
    this.target = null;
    this._handleRecieve = this._handleRecieve.bind(this);
    this._handleRecieveRequest = this._handleRecieveRequest.bind(this);
    this._handleRecieveResponse = this._handleRecieveResponse.bind(this);
    this._handleSendResponse = this._handleSendResponse.bind(this);

    this.debug = config.debug;
    this.window = config.window;
    this.target = config.target;
    this.name = config.name;
    this.targetName = config.targetName || this.name;
    this.window.addEventListener('message', this._handleRecieve, false);
  }

  _createClass(Pasteur, [{
    key: 'close',
    value: function close() {
      this.window.removeEventListener('message', this._handleRecieve, false);
    }
  }, {
    key: 'on',
    value: function on(event, handler) {
      this.handlers.push({ event: event, handler: handler });
    }
  }, {
    key: 'send',
    value: function send(event, data, success, failure) {
      var id = this._getId();
      this.callbacks[id] = {
        success: success,
        failure: failure
      };
      var message = {
        target: this.targetName,
        id: id,
        event: event,
        data: data
      };
      if (this.debug) console.log(this.name + ': sending request to ' + this.targetName, message);
      this.target.postMessage(message, '*');
    }
  }, {
    key: '_getId',
    value: function _getId() {
      var lower = Math.pow(36, 9);
      var upper = Math.pow(36, 10) - 1;
      var random = lower + Math.floor(Math.random() * (upper - lower + 1));
      return random.toString(36);
    }
  }, {
    key: '_handleFailure',
    value: function _handleFailure(message) {
      var failure = this.callbacks[message.id].failure;

      if (failure) failure(message.error);
    }
  }, {
    key: '_handleRecieve',
    value: function _handleRecieve(e) {
      var message = e.data;
      if (message.target !== this.name) return;
      if (this.debug) console.log(this.name + ': received from ' + this.targetName, message);
      if (this.callbacks[message.id]) return this._handleRecieveResponse(message);
      this._handleRecieveRequest(message);
    }
  }, {
    key: '_handleRecieveRequest',
    value: function _handleRecieveRequest(message) {
      var _this = this;

      var event = message.event,
          data = message.data;

      this.handlers.filter(function (handler) {
        return handler.event === event;
      }).map(function (handler) {
        try {
          var response = handler.handler(data);
          _this._handleSendResponse(event, message.id, response);
        } catch (e) {
          _this._handleSendResponse(event, message.id, null, e.toString());
        }
      });
    }
  }, {
    key: '_handleRecieveResponse',
    value: function _handleRecieveResponse(message) {
      if (!this.callbacks[message.id]) return;
      if (message.error) this._handleFailure(message);
      if (message.data) this._handleSuccess(message);
      delete this.callbacks[message.id];
    }
  }, {
    key: '_handleSendResponse',
    value: function _handleSendResponse(event, id, data, error) {
      var message = {
        target: this.targetName,
        id: id,
        event: event,
        data: data,
        error: error
      };
      if (this.debug) console.log(this.name + ': sending response to ' + this.targetName, message);
      this.target.postMessage(message, '*');
    }
  }, {
    key: '_handleSuccess',
    value: function _handleSuccess(message) {
      var success = this.callbacks[message.id].success;

      if (success) success(message.data);
    }
  }]);

  return Pasteur;
}();

exports.default = Pasteur;