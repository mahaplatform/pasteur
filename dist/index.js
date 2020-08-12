'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Pasteur = function () {
  function Pasteur(config) {
    (0, _classCallCheck3.default)(this, Pasteur);
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

  (0, _createClass3.default)(Pasteur, [{
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
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(message) {
        var failure;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                failure = this.callbacks[message.id].failure;

                if (!failure) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return failure(message.error);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _handleFailure(_x) {
        return _ref.apply(this, arguments);
      }

      return _handleFailure;
    }()
  }, {
    key: '_handleRecieve',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(e) {
        var message;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                message = e.data;

                if (!(message.target !== this.name)) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt('return');

              case 3:
                if (this.debug) console.log(this.name + ': received from ' + this.targetName, message);

                if (!this.callbacks[message.id]) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 7;
                return this._handleRecieveResponse(message);

              case 7:
                return _context2.abrupt('return', _context2.sent);

              case 8:
                _context2.next = 10;
                return this._handleRecieveRequest(message);

              case 10:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _handleRecieve(_x2) {
        return _ref2.apply(this, arguments);
      }

      return _handleRecieve;
    }()
  }, {
    key: '_handleRecieveRequest',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(message) {
        var _this = this;

        var event, data;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                event = message.event, data = message.data;
                _context4.next = 3;
                return (0, _bluebird.mapSeries)(this.handlers.filter(function (handler) {
                  return handler.event === event;
                }), (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                  var response;
                  return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.prev = 0;
                          _context3.next = 3;
                          return handler.handler(data);

                        case 3:
                          response = _context3.sent;

                          _this._handleSendResponse(event, message.id, response);
                          _context3.next = 10;
                          break;

                        case 7:
                          _context3.prev = 7;
                          _context3.t0 = _context3['catch'](0);

                          _this._handleSendResponse(event, message.id, null, _context3.t0.toString());

                        case 10:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, _this, [[0, 7]]);
                })));

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _handleRecieveRequest(_x3) {
        return _ref3.apply(this, arguments);
      }

      return _handleRecieveRequest;
    }()
  }, {
    key: '_handleRecieveResponse',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(message) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.callbacks[message.id]) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt('return');

              case 2:
                if (!message.error) {
                  _context5.next = 5;
                  break;
                }

                _context5.next = 5;
                return this._handleFailure(message);

              case 5:
                if (!message.data) {
                  _context5.next = 8;
                  break;
                }

                _context5.next = 8;
                return this._handleSuccess(message);

              case 8:
                delete this.callbacks[message.id];

              case 9:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _handleRecieveResponse(_x4) {
        return _ref5.apply(this, arguments);
      }

      return _handleRecieveResponse;
    }()
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
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(message) {
        var success;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                success = this.callbacks[message.id].success;

                if (!success) {
                  _context6.next = 4;
                  break;
                }

                _context6.next = 4;
                return success(message.data);

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _handleSuccess(_x5) {
        return _ref6.apply(this, arguments);
      }

      return _handleSuccess;
    }()
  }]);
  return Pasteur;
}();

exports.default = Pasteur;