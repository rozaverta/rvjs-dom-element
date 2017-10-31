'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

try {
	EvnNew = document.dispatchEvent(new Event('TestEvent'));
} catch (e) {
	EvnNew = false;
}

function getEvent(name, prop, custom) {
	var evn = null;
	if (EvnNew) {
		if (~EvnUi.indexOf(name)) evn = new UIEvent(name, prop);else if (~EvnFocus.indexOf(name)) evn = new FocusEvent(name, prop);else if (~EvnMouse.indexOf(name)) evn = new MouseEvent(name, prop);else if (name == 'wheel') evn = new WheelEvent(name, prop);else if (name == 'input' || name == 'beforeinput') evn = new InputEvent(name, prop);else if (~EvnKey.indexOf(name)) evn = new KeyboardEvent(name, prop);else if (~EvnComposition.indexOf(name)) evn = new CompositionEvent(name, prop);else if (custom) evn = new CustomEvent(name, prop);else evn = new Event(prop);
	} else if (typeof document !== 'undefined') {
		var getProp = function getProp(name, def) {
			return prop.hasOwnProperty(name) ? prop[name] : def;
		};

		if (~EvnUi.indexOf(name) || ~EvnFocus.indexOf(name) || name == 'input' || name == 'beforeinput') {
			evn = document.createEvent('UIEvent');
			evn.initUIEvent(name, getProp('bubbles', true), getProp('cancelable', true), getProp('view', null), getProp('detail', 0));
		} else if (~EvnMouse.indexOf(name) || name == 'wheel') {
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

function Append(element, child) {
	var type = _rvjsTools2.default.getType(child);
	if (type === 'html-node') {
		element.appendChild(child);
	} else if (type === 'html-collection' || type === 'object' && child instanceof _rvjsDom.Collection) {
		for (var i = 0, length = child.length; i < length; i++) {
			element.appendChild(child[i]);
		}
	} else if (type === 'array') {
		for (var _i = 0, _length = child.length; _i < _length; _i++) {
			_rvjsTools2.default.isHtmlNodeElement(child[_i]) && element.appendChild(child[_i]);
		}
	}
}

var DomElement = function () {
	function DomElement(element) {
		_classCallCheck(this, DomElement);

		var display = element.style.display || '',
		    show = function show() {
			element.style.display = display;
			return this;
		};

		if (display == 'none') {
			display = '';
		}

		if (!display) {
			var cssDisplay = getStyles(element).getPropertyValue('display');
			if (cssDisplay && cssDisplay !== 'none') {
				display = cssDisplay;
			} else {
				display = inline.indexOf((element.tagName || '').toUpperCase()) > 0 ? 'inline' : 'block';
			}
		}

		Object.defineProperty(this, 'element', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: element
		});

		this.show = show.bind(this);
	}

	_createClass(DomElement, [{
		key: 'on',
		value: function on(event, callback) {
			_rvjsDom.Evn.add(this.element, event, callback);
			return this;
		}
	}, {
		key: 'off',
		value: function off(event, callback) {
			_rvjsDom.Evn.remove(this.element, event, callback);
			return this;
		}
	}, {
		key: 'dispatch',
		value: function dispatch(event, prop) {
			if ('dispatchEvent' in this.element) {
				var custom = arguments.length > 1 && prop !== null && (typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) != 'object',
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
			if (arguments.length < 2) {
				return this.element.getAttribute(name);
			} else if (value === null) {
				this.element.removeAttribute(name);
			} else {
				this.element.setAttribute(name, value);
			}
			return this;
		}
	}, {
		key: 'data',
		value: function data(name, value) {
			if (arguments.length < 2) {
				return this.element.dataset[name];
			} else if (value === null) {
				delete this.element.dataset[name];
			} else {
				this.element.dataset[name] = value;
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
				try {
					delete this.element[name];
				} catch (e) {}
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
		key: 'hide',
		value: function hide() {
			this.element.style.display = 'none';
			return this;
		}
	}, {
		key: 'style',
		value: function style(name, value) {
			if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) == 'object' && arguments.length < 2) {
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
					for (var _i2 = 0, _length2 = child.length; _i2 < _length2; _i2++) {
						_rvjsTools2.default.isHtmlNodeElement(child[_i2]) && this.element.appendChild(child[_i2]);
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