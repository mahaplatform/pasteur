"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
var _regeneratorRuntime = /*#__PURE__*/ _interopRequireDefault(require("regenerator-runtime"));
var _bluebird = /*#__PURE__*/ _interopRequireDefault(require("bluebird"));
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var Pasteur = /*#__PURE__*/ function() {
    "use strict";
    function Pasteur(config) {
        _classCallCheck(this, Pasteur);
        _defineProperty(this, "callbacks", {});
        _defineProperty(this, "debug", null);
        _defineProperty(this, "handlers", []);
        _defineProperty(this, "window", null);
        _defineProperty(this, "target", null);
        _defineProperty(this, "_handleRecieve", this._handleRecieve.bind(this));
        _defineProperty(this, "_handleRecieveRequest", this._handleRecieveRequest.bind(this));
        _defineProperty(this, "_handleRecieveResponse", this._handleRecieveResponse.bind(this));
        _defineProperty(this, "_handleSendResponse", this._handleSendResponse.bind(this));
        this.debug = config.debug;
        this.window = config.window;
        this.target = config.target;
        this.name = config.name;
        this.targetName = config.targetName || this.name;
        this.window.addEventListener("message", this._handleRecieve, false);
    }
    _createClass(Pasteur, [
        {
            key: "close",
            value: function close() {
                this.window.removeEventListener("message", this._handleRecieve, false);
            }
        },
        {
            key: "on",
            value: function on(event, handler) {
                this.handlers.push({
                    event: event,
                    handler: handler
                });
            }
        },
        {
            key: "send",
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
                if (this.debug) console.log("".concat(this.name, ": sending request to ").concat(this.targetName), message);
                this.target.postMessage(message, "*");
            }
        },
        {
            key: "_getId",
            value: function _getId() {
                var lower = Math.pow(36, 9);
                var upper = Math.pow(36, 10) - 1;
                var random = lower + Math.floor(Math.random() * (upper - lower + 1));
                return random.toString(36);
            }
        },
        {
            key: "_handleFailure",
            value: function _handleFailure(message) {
                var _this = this;
                return _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                    var failure;
                    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                        while(1)switch(_ctx.prev = _ctx.next){
                            case 0:
                                failure = _this.callbacks[message.id].failure;
                                if (!failure) {
                                    _ctx.next = 4;
                                    break;
                                }
                                _ctx.next = 4;
                                return failure(message.error);
                            case 4:
                            case "end":
                                return _ctx.stop();
                        }
                    }, _callee);
                }))();
            }
        },
        {
            key: "_handleRecieve",
            value: function _handleRecieve(e) {
                var _this = this;
                return _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                    var message;
                    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                        while(1)switch(_ctx.prev = _ctx.next){
                            case 0:
                                message = e.data;
                                if (!(message.target !== _this.name)) {
                                    _ctx.next = 3;
                                    break;
                                }
                                return _ctx.abrupt("return");
                            case 3:
                                if (_this.debug) console.log("".concat(_this.name, ": received from ").concat(_this.targetName), message);
                                if (!_this.callbacks[message.id]) {
                                    _ctx.next = 8;
                                    break;
                                }
                                _ctx.next = 7;
                                return _this._handleRecieveResponse(message);
                            case 7:
                                return _ctx.abrupt("return", _ctx.sent);
                            case 8:
                                _ctx.next = 10;
                                return _this._handleRecieveRequest(message);
                            case 10:
                            case "end":
                                return _ctx.stop();
                        }
                    }, _callee);
                }))();
            }
        },
        {
            key: "_handleRecieveRequest",
            value: function _handleRecieveRequest(message) {
                var _this = this;
                return _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                    var event, data;
                    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                        while(1)switch(_ctx.prev = _ctx.next){
                            case 0:
                                event = message.event, data = message.data;
                                _ctx.next = 3;
                                return _bluebird.default.mapSeries(_this.handlers.filter(function(handler) {
                                    return handler.event === event;
                                }), function() {
                                    var _ref = _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee(handler) {
                                        var response;
                                        return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                                            while(1)switch(_ctx.prev = _ctx.next){
                                                case 0:
                                                    _ctx.prev = 0;
                                                    _ctx.next = 3;
                                                    return handler.handler(data);
                                                case 3:
                                                    response = _ctx.sent;
                                                    _this._handleSendResponse(event, message.id, response);
                                                    _ctx.next = 10;
                                                    break;
                                                case 7:
                                                    _ctx.prev = 7;
                                                    _ctx.t0 = _ctx["catch"](0);
                                                    _this._handleSendResponse(event, message.id, null, _ctx.t0.toString());
                                                case 10:
                                                case "end":
                                                    return _ctx.stop();
                                            }
                                        }, _callee, null, [
                                            [
                                                0,
                                                7
                                            ]
                                        ]);
                                    }));
                                    return function(handler) {
                                        return _ref.apply(this, arguments);
                                    };
                                }());
                            case 3:
                            case "end":
                                return _ctx.stop();
                        }
                    }, _callee);
                }))();
            }
        },
        {
            key: "_handleRecieveResponse",
            value: function _handleRecieveResponse(message) {
                var _this = this;
                return _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                        while(1)switch(_ctx.prev = _ctx.next){
                            case 0:
                                if (_this.callbacks[message.id]) {
                                    _ctx.next = 2;
                                    break;
                                }
                                return _ctx.abrupt("return");
                            case 2:
                                if (!message.error) {
                                    _ctx.next = 5;
                                    break;
                                }
                                _ctx.next = 5;
                                return _this._handleFailure(message);
                            case 5:
                                if (!message.data) {
                                    _ctx.next = 8;
                                    break;
                                }
                                _ctx.next = 8;
                                return _this._handleSuccess(message);
                            case 8:
                                delete _this.callbacks[message.id];
                            case 9:
                            case "end":
                                return _ctx.stop();
                        }
                    }, _callee);
                }))();
            }
        },
        {
            key: "_handleSendResponse",
            value: function _handleSendResponse(event, id, data, error) {
                var message = {
                    target: this.targetName,
                    id: id,
                    event: event,
                    data: data,
                    error: error
                };
                if (this.debug) console.log("".concat(this.name, ": sending response to ").concat(this.targetName), message);
                this.target.postMessage(message, "*");
            }
        },
        {
            key: "_handleSuccess",
            value: function _handleSuccess(message) {
                var _this = this;
                return _asyncToGenerator(_regeneratorRuntime.default.mark(function _callee() {
                    var success;
                    return _regeneratorRuntime.default.wrap(function _callee$(_ctx) {
                        while(1)switch(_ctx.prev = _ctx.next){
                            case 0:
                                success = _this.callbacks[message.id].success;
                                if (!success) {
                                    _ctx.next = 4;
                                    break;
                                }
                                _ctx.next = 4;
                                return success(message.data);
                            case 4:
                            case "end":
                                return _ctx.stop();
                        }
                    }, _callee);
                }))();
            }
        }
    ]);
    return Pasteur;
}();
var _default = Pasteur;
