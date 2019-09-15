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
    this.services = null;
    this.window = null;
    this.target = null;
    this._handleRecieve = this._handleRecieve.bind(this);
    this._handleRecieveRequest = this._handleRecieveRequest.bind(this);
    this._handleRecieveResponse = this._handleRecieveResponse.bind(this);
    this._handleSendResponse = this._handleSendResponse.bind(this);

    this.window = config.window;
    this.target = config.target;
    this.name = config.name;
    this.targetName = config.targetName || this.name;
    this.services = config.services || {};
    this.window.addEventListener('message', this._handleRecieve, false);
  }

  _createClass(Pasteur, [{
    key: 'addService',
    value: function addService(name, service) {
      this.services[name] = service;
    }
  }, {
    key: 'close',
    value: function close() {
      this.window.removeEventListener('message', this._handleRecieve, false);
    }
  }, {
    key: 'send',
    value: function send(service, action, data, success, failure) {
      var id = this._getId();
      this.callbacks[id] = {
        success: success,
        failure: failure
      };
      this.target.postMessage({
        target: this.targetName,
        id: id,
        service: service,
        action: action,
        data: data
      }, '*');
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
    key: '_handleRecieve',
    value: function _handleRecieve(e) {
      var message = e.data;
      if (message.target !== this.name) return;
      if (this.callbacks[message.id]) return this._handleRecieveResponse(message);
      this._handleRecieveRequest(message);
    }
  }, {
    key: '_handleRecieveRequest',
    value: function _handleRecieveRequest(message) {
      try {
        var service = this.services[message.service];
        if (!service) throw new Error('service ' + message.service + ' unknown');
        var action = service[message.action];
        if (!action) throw new Error('action ' + message.action + ' unknown');
        var response = action();
        this._handleSendResponse(message.service, message.action, message.id, response);
      } catch (e) {
        this._handleSendResponse(message.service, message.action, message.id, null, e.toString());
      }
    }
  }, {
    key: '_handleRecieveResponse',
    value: function _handleRecieveResponse(message) {
      var _callbacks$message$id = this.callbacks[message.id],
          success = _callbacks$message$id.success,
          failure = _callbacks$message$id.failure;

      if (message.error) failure(message.error);
      if (message.data) success(message.data);
      delete this.callbacks[message.id];
    }
  }, {
    key: '_handleSendResponse',
    value: function _handleSendResponse(service, action, id, data, error) {
      this.target.postMessage({
        target: this.targetName,
        id: id,
        service: service,
        action: action,
        data: data,
        error: error
      }, '*');
    }
  }]);

  return Pasteur;
}();

exports.default = Pasteur;