import {Evn, Element, ClassName, Style, Collection} from 'rvjs-dom';
import Tools from 'rvjs-tools';

let inline = ('B,BIG,I,SMALL,TT,ABBR,ACRONYM,CITE,CODE,DFN,EM,KBD,STRONG,SAMP,TIME,VAR,A,BDO,BR,IMG,MAP,OBJECT,Q,SCRIPT,SPAN,SUB,SUP,BUTTON,INPUT,LABEL,SELECT,TEXTAREA').split(',');

let EvnMouse = ['click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'];
let EvnUi = ['load', 'unload', 'abort', 'error', 'select', 'activate', 'beforeactivate', 'beforedeactivate', 'deactivate', 'DOMActivate', 'DOMFocusIn', 'DOMFocusOut', 'overflow', 'resize', 'scroll', 'underflow'];
let EvnFocus = ['blur', 'focus', 'focusin', 'focusout'];
let EvnComposition = ['compositionstart', 'compositionupdate', 'compositionend'];
let EvnKey = ['keydown', 'keyup', 'keypress'];
let EvnNew = true;

const Noop = function() {};

try {
	EvnNew = document.dispatchEvent( new Event('TestEvent') )
}
catch(e) {
	EvnNew = false
}

function getEvent(name, prop, custom)
{
	let evn = null;
	if( EvnNew )
	{
		if( ~ EvnUi.indexOf(name) ) evn = new UIEvent(name, prop);
		else if( ~ EvnFocus.indexOf(name) ) evn = new FocusEvent(name, prop);
		else if( ~ EvnMouse.indexOf(name) ) evn = new MouseEvent(name, prop);
		else if( name === 'wheel' ) evn = new WheelEvent(name, prop);
		else if( name === 'input' || name === 'beforeinput' ) evn = new InputEvent(name, prop);
		else if( ~ EvnKey.indexOf(name) ) evn = new KeyboardEvent(name, prop);
		else if( ~ EvnComposition.indexOf(name) ) evn = new CompositionEvent(name, prop);
		else if( custom ) evn = new CustomEvent(name, prop);
		else evn = new Event(prop);
	}
	else if( typeof document !== 'undefined' )
	{
		let getProp = function (name, def) {
			return prop.hasOwnProperty(name) ? prop[name] : def;
		};

		if( ~ EvnUi.indexOf(name) || ~ EvnFocus.indexOf(name) || name === 'input' || name === 'beforeinput' )
		{
			evn = document.createEvent('UIEvent');
			evn.initUIEvent(name,
				getProp('bubbles', true),
				getProp('cancelable', true),
				getProp('view', null),
				getProp('detail', 0)
			);
		}
		else if( ~ EvnMouse.indexOf(name) || name === 'wheel' )
		{
			evn = document.createEvent('MouseEvent');
			evn.initMouseEvent(name,
				getProp('bubbles', true), // всплывает?
				getProp('cancelable', true), // можно отменить?
				getProp('view', null), // объект window, null означает текущее окно
				getProp('detail', 0), // свойство detail и другие...
				getProp('screenX', 0),
				getProp('screenY', 0),
				getProp('clientX', 0),
				getProp('clientY', 0),
				getProp('ctrlKey', null),
				getProp('altKey', null),
				getProp('shiftKey', null),
				getProp('metaKey', null),
				getProp('button', 0),
				getProp('relatedTarget', null)
			);
		}
		else if( ~ EvnKey.indexOf(name) )
		{
			evn = document.createEvent('KeyboardEvent');
			evn.initKeyEvent(name,
				getProp('bubbles', true), // всплывает?
				getProp('cancelable', true), // можно отменить?
				getProp('view', null), // объект window, null означает текущее окно
				getProp('ctrlKey', null),
				getProp('altKey', null),
				getProp('shiftKey', null),
				getProp('metaKey', null),
				getProp('keyCode', 0), // свойство detail и другие...
				getProp('charCode', 0)
			);
		}
		else if( ~ EvnComposition.indexOf(name) )
		{
			evn = document.createEvent('CompositionEvent');
			evn.initCompositionEvent(name,
				getProp('bubbles', true),
				getProp('cancelable', true),
				getProp('view', null),
				getProp('data', null),
				getProp('locale', null),
			);
		}
		else {
			evn = document.createEvent('Event');
			evn.initEvent(name,
				getProp('bubbles', true), // всплывает?
				getProp('cancelable', true)
			);
		}
	}

	return evn;
}

function getStyles(element)
{
	let view = element.ownerDocument.defaultView;

	if ( !view || !view.opener )
	{
		view = window;
	}

	return view.getComputedStyle( element );
}

/**
 * @return {boolean}
 */
function IsDuration(arg)
{
	return ! isNaN(arg) && arg >= 0 && isFinite(arg)
}

function CheckPropDisplay(from, to, name, type)
{
	if( typeof from[name] === type && (name !== 'duration' || IsDuration(from[name])) ) {
		to[name] = from[name]
	}
}

function PropDisplay(prop, args, dir)
{
	if( prop.to > 0 && dir !== prop.dir ) {
		clearTimeout(prop.to);
		prop.to = 0;
	}

	prop.duration = 0;
	prop.complete = Noop;

	if( args.length === 1 && typeof args[0] === 'object' ) {
		CheckPropDisplay(args[0], prop, 'complete', 'function');
		CheckPropDisplay(args[0], prop, 'duration', 'number');
		CheckPropDisplay(args[0], prop, 'name', 'string');
	}

	if( args.length > 0 ) {
		for( let i = 0, arg, tof; i < args.length; i ++ ) {
			arg = args[i];
			tof = typeof arg;
			if( tof === 'function' ) prop.complete = arg;
			else if( tof === 'number' && IsDuration(arg) ) prop.duration = arg;
			else if( tof === 'string' ) prop.name = arg;
		}
	}

	if( prop.duration > 0 && ! prop.name ) {
		prop.name = 'in'
	}
}

function CompleteDisplay(prop, show)
{
	prop.to = 0;
	prop.dir = 0;
	prop.complete(prop.self);
	prop.complete = Noop;
	prop.show = show
}

function ShowDisplay(prop, ...args)
{
	PropDisplay(prop, args, 1);
	if( prop.dir !== 1 ) {
		if(prop.show === true) {
			CompleteDisplay(prop, true)
		}
		else {
			let self = this;
			prop.dir = 1;
			self.element.style.display = prop.display;
			if( prop.duration > 100 ) {
				prop.to = setTimeout(() => {
					self.className("+" + prop.name);
					prop.to = setTimeout(() => { CompleteDisplay(prop, true) }, prop.duration - 100)
				}, 100)
			}
			else {
				prop.to = setTimeout(() => {
					prop.name && self.className("+" + prop.name);
					CompleteDisplay(prop, true)
				}, prop.duration)
			}
		}
	}
	return this
}

function HideDisplay(prop, ...args)
{
	PropDisplay(prop, args, -1);
	if( prop.dir !== -1 ) {
		if(prop.show === false) {
			CompleteDisplay(prop, false)
		}
		else {
			let self = this;
			prop.dir = -1;
			prop.name && self.className("-" + prop.name);
			prop.to = setTimeout(() => {
				self.element.style.display = 'none';
				CompleteDisplay(prop, false);
			}, prop.duration)
		}
	}
	return this
}

const regDataName = /-([a-z])/g;
const funcDataName = (m) => m[1].toUpperCase();

class DomElement
{
	constructor(element)
	{
		if( Tools.isWindowElement(element) ) {
			element = window.document.documentElement;
		}
		else if( element.nodeType === 9 && element.documentElement ) {
			element = element.documentElement;
		}
		else if( ! Tools.isHtmlNodeElement(element) ) {
			element = Element.create(element)
		}

		let display = element.style.display || '', prop = {to: 0, dir: 0, show: null, self: this};

		if( display === 'none' )
		{
			display = '';
			prop.show = false;
		}

		if( ! display )
		{
			let cssDisplay = getStyles(element).getPropertyValue('display');
			if( cssDisplay && cssDisplay !== 'none' )
			{
				display = cssDisplay
			}
			else
			{
				display = inline.indexOf((element.tagName || '').toUpperCase()) > 0 ? 'inline' : 'block';
				if( cssDisplay === 'none' ) {
					prop.show = false
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

	on(event, callback, name)
	{
		Evn.add(this.element, event, callback);
		if( arguments.length > 2 ) {
			let tof = typeof name, evn = this.events;
			if( tof === 'string' || tof === 'symbol' ) {
				if( !evn[name] ) {
					evn[name] = [callback];
				}
				else if( evn[name].indexOf(callback) < 0 ) {
					evn[name].push(callback)
				}
			}
		}
		return this
	}

	off(event, callback)
	{
		let tof = typeof callback;
		if( tof === 'string' || tof === 'symbol' ) {
			(this.events[callback] || []).forEach(remove => {
				Evn.remove(this.element, event, remove);
			})
		}
		else {
			Evn.remove(this.element, event, callback);
		}
		return this
	}

	dispatch(event, prop)
	{
		if( 'dispatchEvent' in this.element )
		{
			let custom = arguments.length > 1 && prop !== null && typeof prop !== 'object', evn;

			if( ! custom ) {
				prop = {}
			}
			else if( ! prop.hasOwnProperty('detail') ) {
				custom = false
			}

			evn = getEvent(event, prop, custom);
			if(evn) {
				this.element.dispatchEvent(evn);
			}
		}

		return this
	}

	attr(name, value)
	{
		let element = this.element;
		if( arguments.length < 2 )
		{
			return element.getAttribute(name)
		}
		else if( value === null )
		{
			element.removeAttribute(name)
		}
		else
		{
			element.setAttribute(name, value)
		}
		return this
	}

	data(name, value)
	{
		let element = this.element;
		name = String(name).replace(regDataName, funcDataName);

		if( arguments.length < 2 )
		{
			value = element.dataset[name];
			if( value && value.length > 1 && value[value.length-1] === '}' ) {
				let from = value[0], to = from === '{' ? '}' : (from === '[' ? ']' : false);
				if( to && value[value.length-1] === to ) {
					try {
						value = JSON.parse(value)
					}
					catch(e) {
						console.log("Can't ready JSON data property: " + value);
						value = from === '{' ? {} : []
					}
				}
			}
			return value;
		}
		else if( value === null )
		{
			delete element.dataset[name]
		}
		else
		{
			if( typeof value === "object" )
			{
				try { value = JSON.stringify(value) }
				catch(e) { value = Array.isArray(value) ? '[]' : '{}' }
			}
			element.dataset[name] = value
		}

		return this
	}

	value(value)
	{
		if( arguments.length < 1 )
		{
			return this.element.value || ""
		}

		this.element.value = String(value);
		return this
	}

	property(name, value)
	{
		if( arguments.length < 2 )
		{
			return this.element[name]
		}
		else
		{
			this.element[name] = value
		}

		return this
	}

	disable()
	{
		this.element.disabled = true;
		return this
	}

	enable()
	{
		this.element.disabled = false;
		return this
	}

	style(name, value)
	{
		if( typeof name === 'object' && arguments.length < 2 )
		{
			for(let i = 0, keys = Object.keys(name), length = keys.length; i < length; i++ )
			{
				Style(this.element, keys[i], name[keys[i]])
			}
		}
		else
		{
			Style(this.element, String(name), value)
		}
		return this
	}

	className(className, callback)
	{
		ClassName.dispatch(this.element, className, callback);
		return this
	}

	empty()
	{
		let element = this.element;

		if( element.firstChild )
		{
			try {
				element.innerHTML = '';
			}
			catch(e) {
				while(element.firstChild) {
					element.removeChild( element.firstChild )
				}
			}
		}

		return this;
	}

	append(child)
	{
		if( child ) {
			let type = Tools.getType(child);
			if( type === 'string' ) {
				let nodeElement = document.createElement('div');

				try {
					nodeElement.innerHTML = child;
				}
				catch(e) {
					console.log("Can't create HTML data: " + child);
					return this;
				}

				child = new Collection();
				nodeElement = nodeElement.firstChild;
				while(nodeElement) {
					child.add(nodeElement);
					nodeElement = nodeElement.nextSibling;
				}
				type = 'object';
			}

			if( type === 'html-node' ) {
				this.element.appendChild(child)
			}
			else if( type === 'html-collection' || type === 'object' && child instanceof Collection ) {
				for( let i = 0, length = child.length; i < length; i++ ) {
					this.element.appendChild(child[i])
				}
			}
			else if( type === 'array' ) {
				for( let i = 0, length = child.length; i < length; i++ ) {
					Tools.isHtmlNodeElement(child[i]) && this.element.appendChild(child[i])
				}
			}
		}

		return this;
	}

	tap(callback)
	{
		return callback(this.element);
	}
}

export default DomElement;