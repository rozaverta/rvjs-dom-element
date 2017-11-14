'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _rvjsDom = require('rvjs-dom');

var _rvjsTools = require('rvjs-tools');

var _rvjsTools2 = _interopRequireDefault(_rvjsTools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var inline = 'B,BIG,I,SMALL,TT,ABBR,ACRONYM,CITE,CODE,DFN,EM,KBD,STRONG,SAMP,TIME,VAR,A,BDO,BR,IMG,MAP,OBJECT,Q,SCRIPT,SPAN,SUB,SUP,BUTTON,INPUT,LABEL,SELECT,TEXTAREA'.split(',');

var EvnMouse = ['click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'];
var EvnUi = ['load', 'unload', 'abort', 'error', 'select', 'activate', 'beforeactivate', 'beforedeactivate', 'deactivate', 'DOMActivate', 'DOMFocusIn', 'DOMFocusOut', 'overflow', 'resize', 'scroll', 'underflow'];
var EvnFocus = ['blur', 'focus', 'focusin', 'focusout'];
var EvnComposition = ['compositionstart', 'compositionupdate', 'compositionend'];
var EvnKey = ['keydown', 'keyup', 'keypress'];
var EvnNew = true;

var Noop = function Noop() {};

try {
	EvnNew = document.dispatchEvent(new Event('TestEvent'));
} catch (e) {
	EvnNew = false;
}

function getEvent(name, prop, custom) {
	var evn = null;
	if (EvnNew) {
		if (~EvnUi.indexOf(name)) evn = new UIEvent(name, prop);else if (~EvnFocus.indexOf(name)) evn = new FocusEvent(name, prop);else if (~EvnMouse.indexOf(name)) evn = new MouseEvent(name, prop);else if (name === 'wheel') evn = new WheelEvent(name, prop);else if (name === 'input' || name === 'beforeinput') evn = new InputEvent(name, prop);else if (~EvnKey.indexOf(name)) evn = new KeyboardEvent(name, prop);else if (~EvnComposition.indexOf(name)) evn = new CompositionEvent(name, prop);else if (custom) evn = new CustomEvent(name, prop);else evn = new Event(prop);
	} else if (typeof document !== 'undefined') {
		var getProp = function getProp(name, def) {
			return prop.hasOwnProperty(name) ? prop[name] : def;
		};

		if (~EvnUi.indexOf(name) || ~EvnFocus.indexOf(name) || name === 'input' || name === 'beforeinput') {
			evn = document.createEvent('UIEvent');
			evn.initUIEvent(name, getProp('bubbles', true), getProp('cancelable', true), getProp('view', null), getProp('detail', 0));
		} else if (~EvnMouse.indexOf(name) || name === 'wheel') {
			evn = document.createEvent('MouseEvent');
			evn.initMouseEvent(name, getProp('bubbles', true), // всплывает?
			getProp('cancelable', true), // можно отменить?
			getProp('view', null), // объект window, null означает текущее окно
			getProp('detail', 0), // свойство detail и другие...
			getProp('screenX', 0), getProp('screenY', 0), getProp('clientX', 0), getProp('clientY', 0), getProp('ctrlKey', null), getProp('altKey', null), getProp('shiftKey', null), getProp('metaKey', null), getProp('button', 0), getProp('relatedTarget', null));
		} else if (~EvnKey.indexOf(name)) {
			evn = document.createEvent('KeyboardEvent');
			evn.initKeyEvent(name, getProp('bubbles', true), // всплывает?
			getProp('cancelable', true), // можно отменить?
			getProp('view', null), // объект window, null означает текущее окно
			getProp('ctrlKey', null), getProp('altKey', null), getProp('shiftKey', null), getProp('metaKey', null), getProp('keyCode', 0), // свойство detail и другие...
			getProp('charCode', 0));
		} else if (~EvnComposition.indexOf(name)) {
			evn = document.createEvent('CompositionEvent');
			evn.initCompositionEvent(name, getProp('bubbles', true), getProp('cancelable', true), getProp('view', null), getProp('data', null), getProp('locale', null));
		} else {
			evn = document.createEvent('Event');
			evn.initEvent(name, getProp('bubbles', true), // всплывает?
			getProp('cancelable', true));
		}
	}

	return evn;
}

function getStyles(element) {
	var view = element.ownerDocument.defaultView;

	if (!view || !view.opener) {
		view = window;
	}

	return view.getComputedStyle(element);
}

/**
 * @return {boolean}
 */
function IsDuration(arg) {
	return !isNaN(arg) && arg >= 0 && isFinite(arg);
}

function CheckPropDisplay(from, to, name, type) {
	if (_typeof(from[name]) === type && (name !== 'duration' || IsDuration(from[name]))) {
		to[name] = from[name];
	}
}

function PropDisplay(prop, args, dir) {
	if (prop.to > 0 && dir !== prop.dir) {
		clearTimeout(prop.to);
		prop.to = 0;
	}

	prop.duration = 0;
	prop.complete = Noop;

	if (args.length === 1 && _typeof(args[0]) === 'object') {
		CheckPropDisplay(args[0], prop, 'complete', 'function');
		CheckPropDisplay(args[0], prop, 'duration', 'number');
		CheckPropDisplay(args[0], prop, 'name', 'string');
	}

	if (args.length > 0) {
		for (var i = 0, arg, tof; i < args.length; i++) {
			arg = args[i];
			tof = typeof arg === 'undefined' ? 'undefined' : _typeof(arg);
			if (tof === 'function') prop.complete = arg;else if (tof === 'number' && IsDuration(arg)) prop.duration = arg;else if (tof === 'string') prop.name = arg;
		}
	}

	if (prop.duration > 0 && !prop.name) {
		prop.name = 'in';
	}
}

function CompleteDisplay(prop) {
	prop.to = 0;
	prop.dir = 0;
	prop.complete(prop.self);
	prop.complete = Noop;
}

function ShowDisplay(prop) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	PropDisplay(prop, args, 1);
	if (prop.dir !== 1) {
		if (prop.show === true) {
			CompleteDisplay(prop);
		} else {
			var self = this;
			prop.dir = 1;
			self.element.style.display = prop.display;
			if (prop.duration > 100) {
				prop.to = setTimeout(function () {
					self.className("+" + prop.name);
					prop.to = setTimeout(function () {
						CompleteDisplay(prop);
					}, prop.duration - 100);
				}, 100);
			} else {
				prop.to = setTimeout(function () {
					prop.name && self.className("+" + prop.name);
					CompleteDisplay(prop);
				}, prop.duration);
			}
		}
	}
	return this;
}

function HideDisplay(prop) {
	for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
		args[_key2 - 1] = arguments[_key2];
	}

	PropDisplay(prop, args, -1);
	if (prop.dir !== -1) {
		if (prop.show === false) {
			CompleteDisplay(prop);
		} else {
			var self = this;
			prop.dir = -1;
			prop.name && self.className("-" + prop.name);
			prop.to = setTimeout(function () {
				self.element.style.display = 'none';
				CompleteDisplay(prop);
			}, prop.duration);
		}
	}
	return this;
}

var regDataName = /-([a-z])/g;
var funcDataName = function funcDataName(m) {
	return m[1].toUpperCase();
};

var DomElement = function () {
	function DomElement(element) {
		_classCallCheck(this, DomElement);

		if (_rvjsTools2.default.isWindowElement(element)) {
			element = window.document.documentElement;
		} else if (element.nodeType === 9 && element.documentElement) {
			element = element.documentElement;
		} else if (!_rvjsTools2.default.isHtmlNodeElement(element)) {
			element = _rvjsDom.Element.create(element);
		}

		var display = element.style.display || '',
		    prop = { to: 0, dir: 0, show: null, self: this };

		if (display === 'none') {
			display = '';
			prop.show = false;
		}

		if (!display) {
			var cssDisplay = getStyles(element).getPropertyValue('display');
			if (cssDisplay && cssDisplay !== 'none') {
				display = cssDisplay;
			} else {
				display = inline.indexOf((element.tagName || '').toUpperCase()) > 0 ? 'inline' : 'block';
				if (cssDisplay === 'none') {
					prop.show = false;
				}
			}
		}

		Object.defineProperty(this, 'element', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: element
		});

		prop.display = display;
		this.show = ShowDisplay.bind(this, prop);
		this.hide = HideDisplay.bind(this, prop);
		this.events = {};
	}

	_createClass(DomElement, [{
		key: 'on',
		value: function on(event, callback, name) {
			_rvjsDom.Evn.add(this.element, event, callback);
			if (arguments.length > 2) {
				var tof = typeof name === 'undefined' ? 'undefined' : _typeof(name),
				    evn = this.events;
				if (tof === 'string' || tof === 'symbol') {
					if (!evn[name]) {
						evn[name] = [callback];
					} else if (evn[name].indexOf(callback) < 0) {
						evn[name].push(callback);
					}
				}
			}
			return this;
		}
	}, {
		key: 'off',
		value: function off(event, callback) {
			var _this = this;

			var tof = typeof callback === 'undefined' ? 'undefined' : _typeof(callback);
			if (tof === 'string' || tof === 'symbol') {
				(this.events[callback] || []).forEach(function (remove) {
					_rvjsDom.Evn.remove(_this.element, event, remove);
				});
			} else {
				_rvjsDom.Evn.remove(this.element, event, callback);
			}
			return this;
		}
	}, {
		key: 'dispatch',
		value: function dispatch(event, prop) {
			if ('dispatchEvent' in this.element) {
				var custom = arguments.length > 1 && prop !== null && (typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) !== 'object',
				    evn = void 0;

				if (!custom) {
					prop = {};
				} else if (!prop.hasOwnProperty('detail')) {
					custom = false;
				}

				evn = getEvent(event, prop, custom);
				if (evn) {
					this.element.dispatchEvent(evn);
				}
			}

			return this;
		}
	}, {
		key: 'attr',
		value: function attr(name, value) {
			var element = this.element;
			if (arguments.length < 2) {
				return element.getAttribute(name);
			} else if (value === null) {
				element.removeAttribute(name);
			} else {
				element.setAttribute(name, value);
			}
			return this;
		}
	}, {
		key: 'data',
		value: function data(name, value) {
			var element = this.element;
			name = String(name).replace(regDataName, funcDataName);

			if (arguments.length < 2) {
				value = element.dataset[name];
				if (value && value.length > 1 && value[value.length - 1] === '}') {
					var from = value[0],
					    to = from === '{' ? '}' : from === '[' ? ']' : false;
					if (to && value[value.length - 1] === to) {
						try {
							value = JSON.parse(value);
						} catch (e) {
							console.log("Can't ready JSON data property: " + value);
							value = from === '{' ? {} : [];
						}
					}
				}
				return value;
			} else if (value === null) {
				delete element.dataset[name];
			} else {
				if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object") {
					try {
						value = JSON.stringify(value);
					} catch (e) {
						value = Array.isArray(value) ? '[]' : '{}';
					}
				}
				element.dataset[name] = value;
			}

			return this;
		}
	}, {
		key: 'value',
		value: function value(_value) {
			if (arguments.length < 1) {
				return this.element.value || "";
			}

			this.element.value = String(_value);
			return this;
		}
	}, {
		key: 'property',
		value: function property(name, value) {
			if (arguments.length < 2) {
				return this.element[name];
			} else {
				this.element[name] = value;
			}

			return this;
		}
	}, {
		key: 'disable',
		value: function disable() {
			this.element.disabled = true;
			return this;
		}
	}, {
		key: 'enable',
		value: function enable() {
			this.element.disabled = false;
			return this;
		}
	}, {
		key: 'style',
		value: function style(name, value) {
			if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && arguments.length < 2) {
				for (var i = 0, keys = Object.keys(name), length = keys.length; i < length; i++) {
					(0, _rvjsDom.Style)(this.element, keys[i], name[keys[i]]);
				}
			} else {
				(0, _rvjsDom.Style)(this.element, String(name), value);
			}
			return this;
		}
	}, {
		key: 'className',
		value: function className(_className, callback) {
			_rvjsDom.ClassName.dispatch(this.element, _className, callback);
			return this;
		}
	}, {
		key: 'empty',
		value: function empty() {
			var element = this.element;

			if (element.firstChild) {
				try {
					element.innerHTML = '';
				} catch (e) {
					while (element.firstChild) {
						element.removeChild(element.firstChild);
					}
				}
			}

			return this;
		}
	}, {
		key: 'append',
		value: function append(child) {
			if (child) {
				var type = _rvjsTools2.default.getType(child);
				if (type === 'string') {
					var nodeElement = document.createElement('div');

					try {
						nodeElement.innerHTML = child;
					} catch (e) {
						console.log("Can't create HTML data: " + child);
						return this;
					}

					child = new _rvjsDom.Collection();
					nodeElement = nodeElement.firstChild;
					while (nodeElement) {
						child.add(nodeElement);
						nodeElement = nodeElement.nextSibling;
					}
					type = 'object';
				}

				if (type === 'html-node') {
					this.element.appendChild(child);
				} else if (type === 'html-collection' || type === 'object' && child instanceof _rvjsDom.Collection) {
					for (var i = 0, length = child.length; i < length; i++) {
						this.element.appendChild(child[i]);
					}
				} else if (type === 'array') {
					for (var _i = 0, _length = child.length; _i < _length; _i++) {
						_rvjsTools2.default.isHtmlNodeElement(child[_i]) && this.element.appendChild(child[_i]);
					}
				}
			}

			return this;
		}
	}, {
		key: 'tap',
		value: function tap(callback) {
			return callback(this.element);
		}
	}]);

	return DomElement;
}();

exports.default = DomElement;