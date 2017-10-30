import {Evn, ClassName, Style} from 'rvjs-dom';

let inline = ('B,BIG,I,SMALL,TT,ABBR,ACRONYM,CITE,CODE,DFN,EM,KBD,STRONG,SAMP,TIME,VAR,A,BDO,BR,IMG,MAP,OBJECT,Q,SCRIPT,SPAN,SUB,SUP,BUTTON,INPUT,LABEL,SELECT,TEXTAREA').split(',');

let EvnMouse = ['click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'];
let EvnUi = ['load', 'unload', 'abort', 'error', 'select'];
let EvnFocus = ['blur', 'focus', 'focusin', 'focusout'];
let EvnComposition = ['compositionstart', 'compositionupdate', 'compositionend'];
let EvnNew = true;

try {
	EvnNew = document.dispatchEvent( new Event('TestEvent') )
}
catch(e) {
	EvnNew = false
}

function ce(name, prop, def)
{
	return prop.hasOwnProperty(name) ? prop[name] : def;
}

function getEvent(name, prop, custom)
{
	let evn = null;
	if( EvnNew )
	{
		if( ~ EvnUi.indexOf(name) ) evn = new UIEvent(name, prop);
		else if( ~ EvnFocus.indexOf(name) ) evn = new FocusEvent(name, prop);
		else if( ~ EvnMouse.indexOf(name) ) evn = new MouseEvent(name, prop);
		else if( name == 'wheel' ) evn = new WheelEvent(name, prop);
		else if( name == 'input' || name == 'beforeinput' ) evn = new InputEvent(name, prop);
		else if( name == 'keydown' || name == 'keyup' ) evn = new KeyboardEvent(name, prop);
		else if( ~ EvnComposition.indexOf(name) ) evn = new CompositionEvent(name, prop);
		else if( custom ) evn = new CustomEvent(name, prop);
		else evn = new Event(prop);
	}
	else if( typeof document !== 'undefined' )
	{
		let evn;
		if( ~ EvnUi.indexOf(name) ) evn = new UIEvent(name, prop);
		else if( ~ EvnFocus.indexOf(name) ) evn = new FocusEvent(name, prop);
		else if( ~ EvnMouse.indexOf(name) ) {
			evn = document.createEvent('MouseEvent');
			evn.initMouseEvent(name,
				ce('bubbles', prop, true), // всплывает?
				ce('cancelable', prop, null), // можно отменить?
				ce('AbstractView ? viewArg', prop, null), // объект window, null означает текущее окно
				ce('detailArg', prop, null), // свойство detail и другие...
				ce('screenXArg', prop, null),
				ce('screenYArg', prop, null),
				ce('clientXArg', prop, null),
				ce('clientYArg', prop, null),
				ce('ctrlKeyArg', prop, null),
				ce('altKeyArg', prop, null),
				ce('shiftKeyArg', prop, null),
				ce('metaKeyArg', prop, null),
				ce('short buttonArg', prop, null),
				ce('EventTarget', prop, null)
			);
		}
		else if( name == 'wheel' ) {
			evn = new WheelEvent(name, prop);
		}
		else if( name == 'input' || name == 'beforeinput' ) {
			evn = new InputEvent(name, prop);
		}
		else if( name == 'keydown' || name == 'keyup' ) {
			evn = new KeyboardEvent(name, prop);
		}
		else if( ~ EvnComposition.indexOf(name) ) {
			evn = new CompositionEvent(name, prop);
		}
		else {
			evn = document.createEvent('Event');
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

class Item
{
	constructor(element)
	{
		let display = element.style.display || '',
			show = function () {
				element.style.display = display;
				return this
			};

		if( display == 'none' )
		{
			display = ''
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
			}
		}

		Object.defineProperty(this, 'element', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: element
		});


		this.show = show.bind(this)
	}

	on(event, callback)
	{
		Evn.add(this.element, event, callback);
		return this
	}

	off(event, callback)
	{
		Evn.remove(this.element, event, callback);
		return this
	}

	dispatch(event, prop)
	{
		if( 'dispatchEvent' in this.element ) {
			let custom = arguments.length > 1 && prop !== null && typeof prop != 'undefined';

			if( ! custom ) {
				prop = {}
			}
			else if( typeof prop.detail != 'object' || prop.detail === null ) {
				custom = false
			}

			this.element.dispatchEvent(
				getEvent(event, prop, custom)
			);
		}

		return this
	}

	attr(name, value)
	{
		if( arguments.length < 2 )
		{
			return this.element.getAttribute(name)
		}
		else if( value === null )
		{
			this.element.removeAttribute(name)
		}
		else
		{
			this.element.setAttribute(name, value)
		}
		return this
	}

	data(name, value)
	{
		if( arguments.length < 2 )
		{
			return this.element.dataset[name]
		}
		else if( value === null )
		{
			delete this.element.dataset[name]
		}
		else
		{
			this.element.dataset[name] = value
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
			try {
				delete this.element[name]
			}
			catch(e) {}
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

	hide()
	{
		this.element.style.display = 'none';
		return this
	}

	style(name, value)
	{
		if( typeof name == 'object' && arguments.length < 2 )
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
}

export default Item;