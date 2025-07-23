/*! fgta5js 1.0.6
* https://github.com/fgta5/fgta5js
* A simple component for FGTA5 framework
*
* Agung Nugroho DW
* https://github.com/agungdhewe
*
* build at 2025-07-22
*/
let counter = 0;


class Component {
	Id;
	Element;

	static get ACTION_SHOWMENU()  { return 'showmenu' }
	static get ACTION_SHOWHOME() { return 'showhome' }
	static get ACTION_APPLICATIONLOADED() { return 'applicationloaded' }

	constructor(id) {
		if (id!=undefined) {
			this.Id = id;
			this.Element = document.getElementById(id);
		}
	}

	static CreateSvgButton(svg, classname, fn_click) {
		return Component_CreateSvgButton(svg, classname, fn_click)
	}

	static GenerateId() {
		return `comp-${++counter}`;
	}

	static Sleep(ms) {
 		return new Promise(resolve => setTimeout(resolve, ms))
	}
}


function Component_CreateSvgButton(svg, classname, fn_click) {
	const btn = document.createElement('a');
	btn.innerHTML = svg;

	if (classname!='' && classname !=null) {
		btn.classList.add(classname);
	}
	
	btn.setAttribute('href', 'javascript:void(0)');

	if (typeof fn_click === 'function') {
		btn.addEventListener('click', (evt)=>{
			fn_click(evt);
		});
	}
	

	return btn
}

class Input extends Component {
	/* Construct Input */
	constructor(id) {
		super(id);
		Input_construct(this);
		this._readValidators();
	}
	
	/* mengembalikan nama class contructor, misalnya 'Textbox' */
	get Type() { return this.constructor.name }


	get Value() { return this.Element.value }
	set Value(v) { this.Element.value = v; }

	get Disabled() { return this.Element.disabled }
	set Disabled(v) { this.Element.disabled = v; }

	#_form
	get Form() { return this.#_form }
	bindForm(form) { this.#_form = form; }

	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) { 
		this.#_ineditmode = ineditmode; 
	}
	
	#invalidMessages = {}
	get InvalidMessages() { return this.#invalidMessages }
	_readValidators() {
		let input = this.Element;
		var prefix = 'invalid-message';
		Array.from(input.attributes).forEach(attr => {
			if (attr.name.startsWith(prefix)) {
				var key = attr.name === prefix ? "default" : attr.name.replace(`${prefix}-`, "");
				this.#invalidMessages[key] = attr.value;
			}
		});
		Input_readValidators(this);
	}


	NewData(initialvalue) {
		Input_NewData(this, initialvalue);
	}

	AcceptChanges() {
		Input_AcceptChanges(this);
	}
	
	Reset() {
		Input_Reset(this);
	}
	
	IsChanged() { 
		return Input_IsChanged(this)
	}

	SetError(msg) {
		Input_SetError(this, msg);
	}

	_setLastValue(v) {
		Input_setLastValue(this, v);
	}

	GetLastValue() {
		return Input_GetLastValue(this)
	} 


	GetBindingData() {
		var binding = this.Element.getAttribute('binding');
		if (binding === null) {
			return null
		} else {
			return binding
		}
	}

	Validate() { 
		// console.log(`Validating input '${this.Id}'`)
		return Input_Validate(this) 
	}

	#_validators = {}
	get Validators() { return this.#_validators }
	AddValidator(fnName, fnParams, message) {
		this.#_validators[fnName] = {
			param: fnParams,
			message: message
		};
	}
	RemoveValidator(str) {
		if (this.#_validators[str] !== undefined) {
			delete this.#_validators[str];
		}			
	}
	ClearValidators() {
		this.#_validators = {};
	}
	ReadValidators() {
		Input_readValidators(this);
	}


	_setupDescription() {
		var description = this.Element.getAttribute('description');
		if (description !== null && description.trim() !== '') {
			description = description.trim();
			const decrdiv = document.createElement('div');
			decrdiv.classList.add('fgta5-entry-description');
			decrdiv.innerHTML = description;
			this.Nodes.Container.appendChild(decrdiv);
		}		
	}

	#isrequired = false
	IsRequired() { return this.#isrequired}
	MarkAsRequired(r) {
		this.#isrequired = r;
		Input_MarkAsRequired(this, r);
	}


	addEventListener(evt, callback) {
		this.Listener.addEventListener(evt, callback);
	}


	#handlers = {}
	get Handlers() { return this.#handlers }
	Handle(name, fn) {
		this.#handlers[name] = fn;
	}
}

function Input_construct(self, id) {
	const container = document.createElement('div');
	const lastvalue = document.createElement('input');

	lastvalue.setAttribute('type', 'hidden'); 
	lastvalue.classList.add('fgta5-entry-lastvalue');

	container.classList.add('fgta5-entry-container');

	self.InitialValue = '';

	self.Element.getInputCaption = () => {
		return self.Id;
	};

	self.Listener = new EventTarget();
	self.Nodes = {
		Input: self.Element,
		Container: container,
		LastValue: lastvalue,
	};


}


function Input_SetError(self, msg) {
	var errdiv = self.Nodes.Container.querySelector('.fgta5-entry-error');
	if (msg!== null && msg !== '') {
		self.Nodes.Input.setAttribute('invalid', 'true');
		if (!errdiv) {
			 errdiv = document.createElement('div');
			 errdiv.classList.add('fgta5-entry-error');
			 self.Nodes.Container.insertBefore(errdiv, self.Nodes.InputWrapper.nextSibling);
		}
		errdiv.innerHTML = msg;
	} else {
		self.Nodes.Input.removeAttribute('invalid');
		if (errdiv) {
			errdiv.remove();
		}
	}
}


function Input_setLastValue(self, v) {
	self.Nodes.LastValue.value = v;
}

function Input_GetLastValue(self) {
	return self.Nodes.LastValue.value
}

function Input_NewData(self, initialvalue) {
	self.Value = initialvalue;
	self.AcceptChanges();
}

function Input_AcceptChanges(self) {
	self._setLastValue(self.Nodes.Input.value);
	self.Nodes.Input.removeAttribute('changed');
	self.SetError(null);
}

function Input_Reset(self) {
	self.Nodes.Input.value = self.Nodes.LastValue.value;
	self.AcceptChanges();
}

function Input_IsChanged(self) {
	// bandingkan nilai last value dan input value
	// bandingkan langsung dari nilai yang ada di element, jangan gunakan self.GetLastValue dan self.Value
	// karena nilai dari properti self.Value dan method GetLastValue bisa di modif sesuai tipe component
	if (self.Nodes.LastValue.value != self.Nodes.Input.value) {
		console.log(`Input '${self.Id}' is changed from '${self.Nodes.LastValue.value}' to '${self.Nodes.Input.value}'`);
		return true
	} else {
		return false
	}
}


function Input_GetErrorValidation(self, fnName) {
	const validatorData = self.Validators[fnName];
	const fnValidate = $validators[fnName];
	const fnParams = validatorData.param;
	const fnMessage = validatorData.message;
	const input = self.Nodes.Input;

	try {
		if (typeof fnValidate !== 'function') {
			var err = new Error(`Validator function '${fnName}' is not defined or not a function`);
			console.error(err);
			throw err
		}

		var valid = fnValidate(input.value, fnParams);
		if (!valid) {
			var defmsg = self.InvalidMessages['default'];
			if (fnMessage!=null) {
				throw new Error(fnMessage)
			} else if (defmsg != null) {
				throw new Error(defmsg)
			} else {
				throw new Error( `Invalid value '${input.value}' for '${input.getInputCaption()}' using validator '${fnName}(${fnParams??''})'` )
			}
		}
		return null
	} catch(err) {
		return err
	}
}


function Input_Validate(self) {
	// prioritas untama untuk proses validasi adalah required
	// jalankan validasi required dulu,
	// baru kemudian loop validasi yang lain, tapi kemudian skip required karena telah dieksekusi

	const vnamereq = 'required';
	if (self.Validators[vnamereq]!=null) {
		var err = Input_GetErrorValidation(self, vnamereq); // prioritas utama untuk validasi
		if (err!=null) {
			self.SetError(err.message);
			return false
		}
	}

	// lanjutkan untuk validasi berikutnya
	for (const fnName in self.Validators) {
		if (fnName==vnamereq) {
			continue
		}
		var err = Input_GetErrorValidation(self, fnName); 
		if (err!=null) {
			self.SetError(err.message);
			return false
		}
	}

	self.SetError(null);
	return true
}


function clearTime(dt) {
	dt.setHours(0);
	dt.setMinutes(0);
	dt.setSeconds(0);
}

function Input_readValidators(self) {
	const cname = self.Nodes.Input.getAttribute('fgta5-component');
	var attrname = '';

	attrname = 'minlength';
	var minlength = self.Nodes.Input.getAttribute(attrname);
	if (minlength != null) {
		minlength = parseInt(minlength);
		if (!isNaN(minlength)) {
			self.AddValidator(attrname, minlength, self.InvalidMessages[attrname]);
		}
	}

	attrname = 'maxlength';
	var maxlength = self.Nodes.Input.getAttribute(attrname);
	if (maxlength != null) {
		maxlength = parseInt(maxlength);
		if (!isNaN(maxlength)) {
			self.AddValidator(attrname, maxlength, self.InvalidMessages[attrname]);
		}
	}

	attrname = 'pattern';
	var pattern = self.Nodes.Input.getAttribute(attrname);
	if (pattern != null) {
		if (pattern.trim() !== '') {
			self.AddValidator('pattern', pattern, self.InvalidMessages[attrname]);
		}
	}


	attrname = 'min';
	var min = self.Nodes.Input.getAttribute(attrname);
	if (min != null) {
		var msg = self.InvalidMessages[attrname];
		if (cname=="Datepicker") {
			var mindate = new Date(min);
			clearTime(mindate);
			self.AddValidator('mindate', mindate, msg);
		} else if (cname=="Timepicker") {
			var mintime = min;
			self.AddValidator('mintime', mintime, msg);
		} else {
			min = parseInt(min);
			if (!isNaN(min)) {
				self.AddValidator(attrname, min, msg);
			}
		}
	}

	attrname = 'max';
	var max = self.Nodes.Input.getAttribute(attrname);
	if (max != null) {
		var msg = self.InvalidMessages[attrname];
		if (cname=="Datepicker") {
			var maxdate = new Date(max);
			clearTime(maxdate);
			self.AddValidator('maxdate', maxdate, msg);
		} else if (cname=="Timepicker") {
			var maxtime = max;
			self.AddValidator('maxtime', maxtime, msg);
		} else {
			max = parseInt(max);
			if (!isNaN(max)) {
				self.AddValidator(attrname, max, msg);
			}
		}
	}


	var validator = self.Nodes.Input.getAttribute('validator');
	if (validator != null && validator.trim() !== '') {
		validator = validator.split(',');
		for (var i=0; i<validator.length; i++) {
			var str = validator[i].trim();
			var { fnName, fnParams } = $fgta5.Validators.parseFunctionParam(str);
			self.AddValidator(fnName, fnParams, self.InvalidMessages[fnName]);
		}
	}
}

function Input_MarkAsRequired(self, required) {
	var attrname = 'required';
	var label = self.Nodes.Label;

	if (required) {
		self.Nodes.Input.setAttribute(attrname, '');
		self.AddValidator(attrname, null, self.InvalidMessages[attrname]);
	} else {
		self.Nodes.Input.removeAttribute(attrname);
		self.RemoveValidator(attrname);
	}
	
	if (label!=null && label !=undefined) {
		if (required) {
			self.Nodes.Label.setAttribute(attrname, '');
		} else {
			self.Nodes.Label.removeAttribute(attrname);
		}
	}
}

const InputEvent = (data)=>{ return new CustomEvent('input', data) };
const BlurEvent = (data)=>{ return new CustomEvent('blur', data) };
const KeydownEvent = (data)=> { return new KeyboardEvent('keydown', data) };




class Textbox extends Input {

	constructor(id) {
		super(id);
		Textbox_construct(this, id);
	}

	get Value() { return Textbox_GetValue(this) }
	set Value(v) { Textbox_SetValue(this, v); }


	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) {
		this.#_ineditmode = ineditmode;
		Textbox_SetEditingMode(this, ineditmode);
	}

	NewData(initialvalue) {
		super.NewData(initialvalue);
	}

	GetLastValue() {
		return Textbox_GetLastValue(this)
	} 

	IsChanged() { 
		return Textbox_IsChanged(this)
	}


}



function Textbox_construct(self, id) {
	const container = self.Nodes.Container;
	const lastvalue = self.Nodes.LastValue;
	const input = self.Nodes.Input;
	const wrapinput = document.createElement('div');
	const label = document.querySelector(`label[for="${id}"]`);
	

	// setup container, (harus di awal seblum yang lain-lain)
	// diperlukan untuk menampung semua element yang akan ditampilkan
	input.parentNode.insertBefore(container, input);


	// tambahkan elemen-element ke container
	// penambahakn container ke body document pada saat Input_construct di parent class Input
	wrapinput.appendChild(input);
	container.appendChild(wrapinput);
	container.appendChild(lastvalue);


	// tambahkan referensi elemen ke Nodes
	self.Nodes.InputWrapper = wrapinput;
	self.Nodes.Label = label; 


	// setup container
	container.setAttribute('fgta5-component', 'Textbox');
	container.setAttribute('input-id', id);
	if (input.style.width!='') {
		container.style.width = input.style.width;
	}
	if (input.style.marginTop!='') {
		container.style.marginTop = input.style.marginTop;
		input.style.marginTop = '';
	}
	if (input.style.marginBottom!='') {
		container.style.marginBottom = input.style.marginBottom;
		input.style.marginBottom='';
	}
	if (input.style.marginLeft!='') {
		container.style.marginLeft = input.style.marginLeft;
		input.style.marginLeft='';
	}
	if (input.style.marginRight!='') {
		container.style.marginRight = input.style.marginRight;
		input.style.marginRight='';
	}



	// setup wrapper
	wrapinput.classList.add('fgta5-entry-input-wrapper');


	// setup input
	input.classList.add('fgta5-entry-input');
	input.getInputCaption = () => {
		if (label!=null) {
			return label.innerHTML
		} else {
			return input.getAttribute('placeholder')
		}
	};
	const nonFgtaClasses = Array.from(input.classList).filter(className =>
		!className.startsWith('fgta5-')
	);
	for (var classname of nonFgtaClasses) {
		input.classList.remove(classname);
		container.classList.add(classname);
	}


	// label
	if (label!=null) {
		label.classList.add('fgta5-entry-label');
	}
	


	// set input value
	self._setLastValue(self.Value);

	// set input description
	self._setupDescription();

	
	// aditional property setup
	// background
	if (input.style.backgroundColor !== '') {
		wrapinput.style.backgroundColor = input.style.backgroundColor;
		input.style.backgroundColor = 'transparent';
	}

	// character casing
	var charCase = input.getAttribute('character-case'); 
	if (charCase !== null && charCase.trim() !== '') {
		input.charCase = charCase.trim().toLowerCase();
	}

	// required field
	var required = input.getAttribute('required');
	if (required != null) {
		self.MarkAsRequired(true);
	}


	// internal event listener
	input.addEventListener("input", (evt)=>{
		self.Listener.dispatchEvent(InputEvent({}));
		
		// jika tidak ada form, tidak ada perubahan change notifications
		if (self.Form==null) {
			return
		}

		if (self.GetLastValue() != self.Value) {
			input.setAttribute('changed', 'true');
		} else {
			input.removeAttribute('changed');
		}
	});

	input.addEventListener('blur', (evt)=> {
		Textbox_blur(self);
		self.Listener.dispatchEvent(BlurEvent({}));
	});	

	input.addEventListener('keydown', (evt)=>{
		const e = KeydownEvent({
			cancelable: true,
			key: evt.key,
			code: evt.code,
			ctrlKey: evt.ctrlKey,
			altKey: evt.altKey,
			shiftKey: evt.shiftKey,
			srcElement: evt.srcElement,
			target: evt.target
		});
		self.Listener.dispatchEvent(e);

		if (e.defaultPrevented) {
			evt.preventDefault();
		}
	});
	
}

function Textbox_getValueCased(self, v) {
	var value = v;
	var input = self.Nodes.Input;
	if (input.charCase === 'uppercase') {
		value = v.toUpperCase();
	} else if (input.charCase === 'lowercase') {
		value = v.toLowerCase();
	}
	return value
}


function Textbox_GetValue(self) {
	var input = self.Nodes.Input;
	var value = Textbox_getValueCased(self, input.value);
	return value
}

function Textbox_SetValue(self, v) {
	if (v===null || v===undefined) {
		v='';
	}
	self.Element.value = Textbox_getValueCased(self, v);
}



function Textbox_IsChanged(self) {
	var lastvalue = self.GetLastValue();
	var currentvalue = self.Value;
	if (currentvalue!=lastvalue) {
		console.log(`Textbox '${self.Id}' is changed from '${lastvalue}' to '${currentvalue}'`);
		return true
	} else {
		return false
	}
}

function Textbox_GetLastValue(self) {
	var lastvalue = self.Nodes.LastValue.value;
	return Textbox_getValueCased(self, lastvalue)
}

function Textbox_SetEditingMode(self, ineditmode) {
	var attrval = ineditmode ? 'true' : 'false';
	self.Nodes.Input.setAttribute('editmode', attrval);
	self.Nodes.InputWrapper.setAttribute('editmode', attrval);

	if (ineditmode) {
		self.Nodes.Input.removeAttribute('readonly');
	} else {
		self.Nodes.Input.setAttribute('readonly', 'true');
		self.SetError(null);
	}
}


function Textbox_blur(self, e) {
	if (self.InEditMode) {
		self.SetError(null);
		self.Validate();
	}
}

const ChangeEvent$2 = (data)=>{ return new CustomEvent('change', data) };


class Numberbox extends Input {

	constructor(id) {
		super(id);

		this.formatterFixed = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});

		Numberbox_construct(this, id);
	}

	get Value() { return Numberbox_getValue(this) }
	set Value(v) { Numberbox_setValue(this, v); }
		
		


	get Disabled() { return this.Element.disabled }
	set Disabled(v) { 
		this.Element.disabled = v; 
		Numberbox_setDisabled(this, v);
	}

	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) {
		this.#_ineditmode = ineditmode;
		Numberbox_SetEditingMode(this, ineditmode);
	}


	NewData(initialvalue) {
		if (initialvalue===undefined || initialvalue===null) {
			initialvalue = 0;
		}
		super.NewData(initialvalue);
	}


	AcceptChanges() {
		super.AcceptChanges();
		Numberbox_AcceptChanges(this);
		
	}

	Reset() {
		super.Reset();
		Numberbox_Reset(this);
	}

	SetError(msg) {
		super.SetError(msg);
		Numberbox_SetError(this, msg);
	}


	GetLastValue() {
		return Numberbox_GetLastValue(this)
	} 

}



function Numberbox_construct(self, id) {
	const container = self.Nodes.Container;
	const lastvalue = self.Nodes.LastValue;
	const input = self.Nodes.Input;
	const wrapinput = document.createElement('div');
	const display = document.createElement('input');
	const label = document.querySelector(`label[for="${id}"]`);


	// setup container, (harus di awal seblum yang lain-lain)
	// diperlukan untuk menampung semua element yang akan ditampilkan
	input.parentNode.insertBefore(container, input);


	// tambahkan elemen-element ke container
	// penambahakn container ke body document pada saat Input_construct di parent class Input
	wrapinput.appendChild(display);
	wrapinput.appendChild(input);
	container.appendChild(wrapinput);
	container.appendChild(lastvalue);


	// tambahkan referensi elemen ke Nodes
	self.Nodes.InputWrapper = wrapinput;
	self.Nodes.Label = label; 
	self.Nodes.Display = display;


	// setup container
	container.setAttribute('fgta5-component', 'Numberbox');


	// setup wrapper
	wrapinput.classList.add('fgta5-entry-input-wrapper');
	
	
	// precission and step
	var {precision, step} = getPrecission(self.Element.getAttribute('precision'));
	self.formatterFixed.minimumFractionDigits = precision;
	self.formatterFixed.maximumFractionDigits = precision;

	// setup input
	input.classList.add('fgta5-entry-input');
	input.maxlength = input.getAttribute('maxlength'); 
	input.precision = precision;
	input.setAttribute('type', 'hidden');
	input.setAttribute('step', step);
	input.getInputCaption = () => { return label.innerHTML };
	

	// setup display
	display.id = self.Id + '-display';
	display.min = input.min;
	display.max = input.max;
	display.maxlength = input.maxlength;
	display.required = input.required;
	display.value = self.formatterFixed.format(input.value);
	display.classList.add('fgta5-entry-display');
	display.setAttribute('precision', precision);
	display.setAttribute('step', step);
	display.setAttribute('style', input.getAttribute('style') || '');
	display.setAttribute('type', 'text');
	display.setAttribute('fgta5-component', 'Numberbox');

	
	// label
	label.setAttribute('for', display.id);
	label.classList.add('fgta5-entry-label');


	// additional property setup
	var required = input.getAttribute('required');
	if (required != null) {
		self.MarkAsRequired(true);
	}


	if (input.value === null || input.value === '') {
		input.value = 0;
	}

	self._setLastValue(input.value);
	self._setupDescription();


	// internal event listener
	display.addEventListener('focus', (e)=>{
		Numberbox_displayFocus(self);
	});

	display.addEventListener('blur', (e)=>{
		Numberbox_displayBlur(self);
	});

	display.addEventListener("input", (e)=>{
		if (display.value !== lastvalue.value) {
			display.setAttribute('changed', 'true');
		} else {
			display.removeAttribute('changed');
		}
	});

	display.addEventListener("keydown", (e)=>{
		if (display.type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        	e.preventDefault();
    	}
	});


	// batasi panjang entri data sesuai maxlength yang di set
	var maxlegth = display.maxlength;
	if (maxlegth !== null && maxlegth.trim() !== '') {
		maxlegth = parseInt(maxlegth.trim());
		if (!isNaN(maxlegth) && maxlegth > 0) {
			display.addEventListener('beforeinput', (e)=>{
				if (e.target.value.length >= maxlegth && e.inputType !== "deleteContentBackward" && e.inputType !== "deleteContentForward") {
					e.preventDefault();
				}
			});
		}
	}

}


function getPrecission(precision) {
	// var precision = self.Element.getAttribute('precision')
	if (precision !== null && precision.trim() !== '') {
		precision = parseInt(precision.trim());
		if (isNaN(precision) || precision < 0) {
			precision = 0;
		}
	} else {
		precision = 0;
	}
	var step = Math.pow(10, -precision);

	return {
		precision: precision,
		step: step
	}
}


function Numberbox_getValue(self) {
	var num = Number(self.Nodes.Input.value);
	return num
}


function Numberbox_setValue(self, v) {
	self.Nodes.Input.value = v;

	if (isNaN(v)) {
		v = Number(v); // v buka Angka, ubah dulu ke angka
	}
	var formattedValue = self.formatterFixed.format(v);
	if (self.Nodes.Display.type === 'text') {
		self.Nodes.Display.value = formattedValue;
	} else {
		self.Nodes.Display.value = num;
	}

	Numberbox_markChanged(self);
}


function Numberbox_setDisabled(self, v) {
	if (v) {
		self.Nodes.Display.disabled = true;
	} else {
		self.Nodes.Display.disabled = false;
	}
}

function Numberbox_SetEditingMode(self, ineditmode) {
	var attrval = ineditmode ? 'true' : 'false';

	self.Nodes.Display.setAttribute('editmode', attrval);
	self.Nodes.Input.setAttribute('editmode', attrval);
	self.Nodes.InputWrapper.setAttribute('editmode', attrval);

	if (ineditmode) {
		self.Nodes.Input.removeAttribute('readonly');
		self.Nodes.Display.removeAttribute('readonly');
	} else {
		self.Nodes.Input.setAttribute('readonly', 'true');
		self.Nodes.Display.setAttribute('readonly', 'true');
		self.SetError(null);
	}
}

function Numberbox_displayFocus(self, e) {
	var display = self.Nodes.Display;
	var input = self.Nodes.Input;
	
	if (self.InEditMode) {
		display.setAttribute('type', 'number');
	
		var num = Number(input.value);
		display.value = num;
	}
}

function Numberbox_displayBlur(self, e) {
	var display = self.Nodes.Display;
	var input = self.Nodes.Input;
	
	if (self.InEditMode) {
		var num = Number(display.value);
		if (isNaN(num)) {
			self.Listener.dispatchEvent(ChangeEvent$2({detail: {invalid:true}}));
			self.SetError('Invalid number');
		} else {
			self.SetError(null);
			
			input.value = num;
			var invalid = !self.Validate();
			var formattedValue = self.formatterFixed.format(num);
			display.setAttribute('type', 'text');
			display.value = formattedValue;

			self.Listener.dispatchEvent(ChangeEvent$2({detail: {invalid:invalid, value:num, formatted:formattedValue}}));
		}

	}
}


function Numberbox_AcceptChanges(self) {
	self.Nodes.Display.removeAttribute('changed');
}

function Numberbox_Reset(self) {
	self.Value = self.GetLastValue();
}

function Numberbox_SetError(self, msg) {
	var display = self.Nodes.Display;
	if (msg!== null && msg !== '') {
		display.setAttribute('invalid', 'true');
	} else {
		display.removeAttribute('invalid');
	}
}


function Numberbox_markChanged(self) {
	var input = self.Nodes.Input;
	var display = self.Nodes.Display;
	
	if (self.Value!=self.GetLastValue()) {
		input.setAttribute('changed', 'true');
		display.setAttribute('changed', 'true');
	} else {
		input.removeAttribute('changed');
		display.removeAttribute('changed');
	}
}

function Numberbox_GetLastValue(self) {
	var lastvalue = Number(self.Nodes.LastValue.value);
	return lastvalue
}

const CheckedEvent = (data)=>{ return new CustomEvent('checked', data) };
const UnCheckedEvent = (data)=>{ return new CustomEvent('unchecked', data) };

/*
* reference:
* https://moderncss.dev/pure-css-custom-checkbox-style/
*/


class Checkbox extends Input {

	constructor(id) {
		super(id);
		Checkbox_construct(this, id);
	}

	get Value() { return Checkbox_getValue(this) }
	set Value(v) {
		Checkbox_setValue(this, v);
	}


	get Disabled() { return Checkbox_getDisabled(this) }
	set Disabled(v) { 
		this.Element.disabled = v; 
		Checkbox_setDisabled(this, v);
	}


	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) {
		this.#_ineditmode = ineditmode;
		Checkbox_SetEditingMode(this, ineditmode);
	}

	NewData(initialvalue) {
		super.NewData(initialvalue);
		Checkbox_NewData(this, initialvalue);
	}

	GetLastValue() {
		return Checkbox_GetLastValue(this)
	} 

	IsChanged() { 
		return Checkbox_IsChanged(this)
	}

	Reset() {
		Checkbox_Reset(this);
	}

	_setLastValue(v) {
		Checkbox_setLastValue(this, v);
	}
}



function Checkbox_construct(self, id) {
	const container = self.Nodes.Container;
	const lastvalue = self.Nodes.LastValue;
	const input = self.Nodes.Input;
	const label = document.querySelector(`label[for="${id}"]`);
	const checkboxlabel = document.createElement("label");


	// setup container, (harus di awal seblum yang lain-lain)
	// diperlukan untuk menampung semua element yang akan ditampilkan
	input.parentNode.insertBefore(container, input);


	// tambahkan elemen-element ke container
	// penambahakn container ke body document pada saat Input_construct di parent class Input
	checkboxlabel.appendChild(input);
	checkboxlabel.appendChild(document.createTextNode(label.innerHTML));
	container.appendChild(checkboxlabel);
	container.appendChild(lastvalue);


	// tambahkan referensi elemen ke Nodes
	self.Nodes.Label = label; 
	
	
	// setup container
	container.setAttribute('fgta5-component', 'Checkbox');

	// setup input
	input.classList.add('fgta5-checkbox-input');
	
	// setup checkbox label untuk menampung checkbox
	checkboxlabel.classList.add('fgta5-checkbox');
	
	
	// ganti original label tag menjadi div 
	// karena label di form harus mereferensi ke input
	// sedangkan label di checkbox kita fungsikan sebagai text pada checkbox untuk di klik
	var replLabel = document.createElement('div');
	replLabel.innerHTML = "&nbsp";
	replLabel.style.display = "inline-block";
	replLabel.setAttribute('label', '');
	label.parentNode.replaceChild(replLabel, label);


	// inisialisasi last value
	self._setLastValue(self.Element.checked);


	// tambahkan event listener internal
	input.addEventListener('change', (event) => {
		Checkbox_checkedChanged(self);		
	});

}

function Checkbox_getDisabled(self) {
	var disabled = self.Nodes.Input.getAttribute('permanent-disabled');
	if (disabled === null) {
		return false
	}
	if (disabled === 'true') {
		return true
	}

	return false
}

function Checkbox_setDisabled(self, v) {
	var input = self.Nodes.Input;

	var editmode = input.getAttribute('editmode');
	var ineditmode = ((editmode==null || editmode=='' || editmode=='false')) ? false : true;

	if (v) {
		input.setAttribute('permanent-disabled', 'true');
		input.parentNode.setAttribute('permanent-disabled', 'true');
	} else {
		input.removeAttribute('permanent-disabled');
		input.parentNode.removeAttribute('permanent-disabled');
		if (!ineditmode) {
			input.disabled = true;	
		}
	}
}


function Checkbox_SetEditingMode(self, ineditmode) {
	var input = self.Nodes.Input;
	var attrval = ineditmode ? 'true' : 'false';
	var permdisattr = input.getAttribute('permanent-disabled');
	var permanentDisabled = ((permdisattr==null || permdisattr=='' || permdisattr=='false')) ? false : true;

	input.setAttribute('editmode', attrval);
	if (ineditmode) {
		if (permanentDisabled) {
			input.setAttribute('disabled', 'true');
		} else {
			input.removeAttribute('disabled');
		}
	} else {
		input.setAttribute('disabled', 'true');
	}
}

function Checkbox_setLastValue(self, v) {
	var lastvalue = 1;
	if (v==='off' || v==='0' || v===0 || v===false) {
		lastvalue = 0;
	}
	self.Nodes.LastValue.value = lastvalue;
}


function Checkbox_checkedChanged(self) {
	var input = self.Nodes.Input;
	input.value = input.checked ? 1 : 0;
	if (self.GetLastValue() != self.Value) {
		input.setAttribute('changed', 'true');
	} else {
		input.removeAttribute('changed');
	}

	if (input.checked) {
		self.Listener.dispatchEvent(CheckedEvent({}));
	} else {
		self.Listener.dispatchEvent(UnCheckedEvent({}));
	}
}


function Checkbox_IsChanged(self) {
	var lastvalue = self.GetLastValue();
	var currentvalue = self.Value;
	if (currentvalue!=lastvalue) {
		// console.log(`Checkbox '${self.Id}' is changed from '${lastvalue}' to '${currentvalue}'`)
		return true
	} else {
		return false
	}
}



function Checkbox_getBoolValue(v) {
	if (v===0||v==='0'||v===false||v===undefined) {
		return false
	} else {
		return true
	}
}



function Checkbox_getValue(self) {
	return self.Element.checked
}

function Checkbox_setValue(self, v) {
	var input = self.Nodes.Input;
	var checked = Checkbox_getBoolValue(v);
	input.checked = checked;
	if (checked) {
		input.value = 1;
	} else {
		input.value = 0;
	}

	Checkbox_markChanged(self);
}

function Checkbox_GetLastValue(self) {
	var lastvalue = self.Nodes.LastValue.value;
	return Checkbox_getBoolValue(lastvalue)
}

function Checkbox_Reset(self) {
	var checked = self.GetLastValue();
	self.Value = checked;
	self._setLastValue(checked);
}


function Checkbox_NewData(self, initialvalue) {
	var checked = Checkbox_getBoolValue(initialvalue);
	self.Value = checked;
	self._setLastValue(checked);
}

function Checkbox_markChanged(self) {
	var input = self.Nodes.Input;
	if (self.Value!=self.GetLastValue()) {
		input.setAttribute('changed', 'true');
	} else {
		input.removeAttribute('changed');
	}
}

const button_icon$2 = `<svg transform="translate(0 3)" width="12" height="12" stroke="currentColor" stroke-linecap="round" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<rect x="1.3095" y="6.6682" width="21.393" height="1.8579" fill="none" stroke-width="2"/>
		<rect x=".81949" y="10" width="22.341" height="13.251" fill="none" stroke-width="1.02"/>
		<rect x="3.8664" y="1.1531" width="2.5776" height="1.4923" fill="none" stroke-width="2"/>
		<rect x="17.223" y="1.1203" width="2.5776" height="1.6958" fill="none" stroke-width="2"/>
		<path d="m1.2888 16.278 21.367-0.13566" fill="none" stroke-width="1.02"/>
		<path d="m8.2775 10.07-0.13566 12.888" fill="none" stroke-width="1.02"/>
		<path d="m15.799 9.9671-0.13566 12.888" fill="none" stroke-width="1.02"/>
		</svg>`;


/*
 * https://weblog.west-wind.com/posts/2023/Feb/06/A-Button-Only-Date-Picker-and-JavaScript-Date-Control-Binding
 */

const ChangeEvent$1 = (data) => { return new CustomEvent('change', data) };


class Datepicker extends Input {

	constructor(id) {
		super(id);
		Datepicker_construct(this, id);
	}

	get Value() { return Datepicker_getValue(this) }
	set Value(v) { Datepicker_setValue(this, v); }


	get Min() { 
		if (this.Element.min!="") {
			var dt = new Date(this.Element.min );
			return dt
		} else {
			return null
		}
	}
	set Min(v) {
		if (v instanceof Date) {
			this.Element.min = v.toISOString().split("T")[0];
		} else if (typeof v === "string") {
			this.Element.min = v;
		}
	}

	get Max() { 
		if (this.Element.max!="") {
			var dt = new Date(this.Element.max);
			return dt
		} else {
			return null
		}
	}
	set Max(v) {
		if (v instanceof Date) {
			this.Element.max = v.toISOString().split("T")[0];
		} else if (typeof v === "string") {
			this.Element.max = v;
		}
	}


	get Disabled() { return this.Element.disabled }
	set Disabled(v) { 
		this.Element.disabled = v; 
		Datepicker_setDisabled(this, v);
	}


	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) {
		this.#_ineditmode = ineditmode;
		Datepicker_SetEditingMode(this, ineditmode);
	}




	NewData(initialvalue) {
		if (initialvalue===undefined || initialvalue===null) {
			initialvalue = '';
		}
		super.NewData(initialvalue);
		// Datepicker_Newdata(this, initialvalue)
	}

	AcceptChanges() {
		super.AcceptChanges();
		Datepicker_AcceptChanges(this);
		
	}

	Reset() {
		super.Reset();
		Datepicker_Reset(this);
	}

	SetError(msg) {
		super.SetError(msg);
		Datepicker_SetError(this, msg);
	}

	GetLastValue() {
		return Datepicker_GetLastValue(this)
	} 

}

function Datepicker_construct(self, id) {
	const container = self.Nodes.Container;
	const lastvalue = self.Nodes.LastValue;
	const input = self.Nodes.Input;
	const wrapinput = document.createElement('div');
	const display = document.createElement('input');
	const button = document.createElement('button');
	const label = document.querySelector(`label[for="${id}"]`);



	// setup container, (harus di awal seblum yang lain-lain)
	// diperlukan untuk menampung semua element yang akan ditampilkan
	input.parentNode.insertBefore(container, input);


	// tambahkan elemen-element ke container
	// penambahakn container ke body document pada saat Input_construct di parent class Input
	wrapinput.appendChild(display);
	wrapinput.appendChild(button);
	button.appendChild(input);
	container.appendChild(wrapinput);
	container.appendChild(lastvalue);


	// tambahkan referensi elemen ke Nodes
	self.Nodes.InputWrapper = wrapinput;
	self.Nodes.Label = label; 
	self.Nodes.Display = display;
	self.Nodes.Button = button;

	


	// setup container
	container.setAttribute('fgta5-component', 'Datepicker');
	if (input.style.width!='') {
		container.style.width = input.style.width;
	}
	if (input.style.marginTop!='') {
		container.style.marginTop = input.style.marginTop;
		input.style.marginTop = '';
	}
	if (input.style.marginBottom!='') {
		container.style.marginBottom = input.style.marginBottom;
		input.style.marginBottom='';
	}
	if (input.style.marginLeft!='') {
		container.style.marginLeft = input.style.marginLeft;
		input.style.marginLeft='';
	}
	if (input.style.marginRight!='') {
		container.style.marginRight = input.style.marginRight;
		input.style.marginRight='';
	}
		



	// setup wrapper
	wrapinput.classList.add('fgta5-entry-input-wrapper');



	// display
	display.setAttribute('id', `${id}-display`);
	display.setAttribute('type', 'text');
	display.setAttribute('fgta5-component', 'Datepicker');
	display.setAttribute('readonly', 'true');
	display.classList.add('fgta5-entry-display');
	display.classList.add('fgta5-entry-display-datepicker');
	var placeholder = input.getAttribute('placeholder');
	if (placeholder!=null && placeholder !='') {
		display.setAttribute('placeholder', placeholder);
	}
	// var cssclass = input.getAttribute('class')
	// if (cssclass!=null && cssclass !='') {
	// 	display.setAttribute('class', cssclass)
	// }
	// var cssstyle = input.getAttribute('style')
	// if (cssstyle!=null && cssstyle !='') {
	// 	display.setAttribute('style', cssstyle)
	// }


	// main input
	const nonFgtaClasses = Array.from(input.classList).filter(className =>
		!className.startsWith('fgta5-')
	);

	input.setAttribute('type', 'date');
	input.removeAttribute('class');
	input.removeAttribute('style');
	input.classList.add('fgta5-entry-input');
	input.classList.add('fgta5-entry-input-datepicker');
	input.getInputCaption = () => {
		if (label!=null) {
			return label.innerHTML
		} else {
			return input.getAttribute('placeholder')
		}
	};
	
	for (var classname of nonFgtaClasses) {
		// console.log(classname)
		input.classList.remove(classname);
		display.classList.remove(classname);
		container.classList.add(classname);
	}



	// picker button
	button.id = self.Id + '-button';
	button.insertAdjacentHTML("beforeend", button_icon$2);
	button.classList.add('fgta5-entry-button-datepicker');	


	// label
	if (label!=null) {
		label.setAttribute('for', button.id);
		label.classList.add('fgta5-entry-label');
	}



	// additional property setup

	// required
	var required = input.getAttribute('required');
	if (required != null) {
		self.MarkAsRequired(true);
	}

	if (input.value != null && input.value != '') {
		self.Value = input.value;
		self._setLastValue(input.value);
		self.AcceptChanges();
	}

	
	// set input description
	self._setupDescription();



	// internal event
	input.addEventListener('change', (e)=>{
		Datepicker_changed(self);
	});


}



function Datepicker_setDisabled(self, v) {
	var display = self.Nodes.Display;
	var inputwrap = self.Nodes.InputWrapper;
	var button = self.Nodes.Button;

	if (v) {
		display.disabled = true;
		inputwrap.setAttribute('disabled', 'true');
		button.setAttribute('disabled', 'true');
	} else {
		display.disabled = false;
		inputwrap.removeAttribute('disabled');
		button.removeAttribute('disabled');
	}
}


function Datepicker_SetEditingMode(self, ineditmode) {
	var attrval = ineditmode ? 'true' : 'false';
	var input = self.Nodes.Input;
	var display = self.Nodes.Display;
	var inputwrap = self.Nodes.InputWrapper;

	display.setAttribute('editmode', attrval);
	input.setAttribute('editmode', attrval);
	inputwrap.setAttribute('editmode', attrval);

	if (ineditmode) {
		input.removeAttribute('readonly');
	} else {
		input.setAttribute('readonly', 'true');
		self.SetError(null);
	}
}


function Datepicker_getValue(self) {
	if (self.Nodes.Input.value=='') {
		return null
	} else {
		return Datepicker_getIsoDateValue(self.Nodes.Input.value) 
	}
}


function Datepicker_setValue(self, dt) {
	self.Nodes.Input.value = dt;
	Datepicker_setDisplay(self, dt);
	Datepicker_markChanged(self);
}


// function Datepicker_Newdata(self, initialvalue) {
// 	self.AcceptChanges()
// }


function Datepicker_AcceptChanges(self) {
	self.Nodes.Display.removeAttribute('changed');
}

function Datepicker_Reset(self) {
	var lastvalue = self.GetLastValue();
	if (lastvalue==null) {
		self.Value = '';
	} else {
		self.Value = lastvalue;
	}
}

function Datepicker_changed(self) {
	var input = self.Nodes.Input;
	Datepicker_setDisplay(self, input.value);

	// trigger object change
	try {
		self.Listener.dispatchEvent(ChangeEvent$1({
			sender: self,
			detail: {value:  input.value, sender: self}
		}));
	} catch (err) {
		console.error(err.message);
	}
	
	
	Datepicker_markChanged(self);
	if (self.InEditMode) {
		self.SetError(null);
		self.Validate();
	}
}


function Datepicker_getIsoDateValue(v) {
	var dt;
	if (typeof v==='string') {
		dt = new Date(v);
	} else if (v instanceof Date) {
		dt = v;
	} 
	return dt.toISOString().split("T")[0]
}

// function Datepicker_getFormattedValue(isodate) {
// 	var date = new Date(isodate);
//     var options = { day: '2-digit', month: 'short', year: 'numeric' };
// 	var formattedDate = date.toLocaleDateString('en-ID', options).replace('.', ''); 
// 	return formattedDate
// }


function Datepicker_markChanged(self) {
	if (self.Form==null) {
		return
	}

	var display = self.Nodes.Display;
	if (self.Value!=self.GetLastValue()) {
		display.setAttribute('changed', 'true');
	} else {
		display.removeAttribute('changed');
	}
}

function Datepicker_setDisplay(self, dtiso) {
	var display = self.Nodes.Display;
	if (dtiso=='') {
		display.value = '';
	} else {
		const date = new Date(dtiso);
		const options = { day: '2-digit', month: 'short', year: 'numeric' };
		const formattedDate = date.toLocaleDateString('en-ID', options).replace('.', ''); 
		display.value = formattedDate;
	}
}


function Datepicker_SetError(self, msg) {
	var display = self.Nodes.Display;
	if (msg!== null && msg !== '') {
		display.setAttribute('invalid', 'true');
	} else {
		display.removeAttribute('invalid');
	}
}

function Datepicker_GetLastValue(self) {
	var lastvalue = self.Nodes.LastValue.value;
	if (lastvalue=='') {
		return null
	} else {
		return lastvalue
	}
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const button_icon$1 = `<?xml version="1.0" encoding="UTF-8"?>
<svg transform="translate(0 3)" width="12" height="12" stroke="currentColor" stroke-linecap="round" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="m12.339 12.142 0.01403-6.5322" fill="none" stroke-width="2"/>
<path d="m8.4232 14.469 3.7103-1.9861" fill="none" stroke-width="2.4"/>
<ellipse cx="12.004" cy="11.983" rx="10.102" ry="9.9964" fill="none" stroke-width="2.4"/>
</svg>

`;


/*
 * https://weblog.west-wind.com/posts/2023/Feb/06/A-Button-Only-Date-Picker-and-JavaScript-Date-Control-Binding
 */
class Timepicker extends Input {
	constructor(id) {
		super(id);
		Timepicker_construct(this, id);
	}

	get Min() { return this.Element.min }
	set Min(v) { this.Element.min = v; }

	get Max() { return this.Element.max }
	set Max(v) { this.Element.max = v; }


	get Value() { return Timepicker_getValue(this) }
	set Value(v) { Timepicker_setValue(this, v); }

	get Disabled() { return this.Element.disabled }
	set Disabled(v) { 
		this.Element.disabled = v; 
		Timepicker_setDisabled(this, v);
	}

	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) {
		this.#_ineditmode = ineditmode;
		Timepicker_SetEditingMode(this, ineditmode);
	}

	
	NewData(initialvalue) {
		if (initialvalue=='' || initialvalue==null) {
			initialvalue = '00:00';
		}
		super.NewData(initialvalue);
		// Timepicker_Newdata(this, initialvalue)
	}

	AcceptChanges() {
		super.AcceptChanges();
		Timepicker_AcceptChanges(this);
		
	}

	Reset() {
		super.Reset();
		Timepicker_Reset(this);
	}
	

	SetError(msg) {
		super.SetError(msg);
		Timepicker_SetError(this, msg);
	}

	GetLastValue() {
		return Timepicker_GetLastValue(this)
	} 

}




function Timepicker_construct(self, id) {
	const container = self.Nodes.Container;
	const lastvalue = self.Nodes.LastValue;
	const input = self.Nodes.Input;
	const wrapinput = document.createElement('div');
	const display = document.createElement('input');
	const button = document.createElement('button');
	const label = document.querySelector(`label[for="${id}"]`);

	// setup container, (harus di awal seblum yang lain-lain)
	// diperlukan untuk menampung semua element yang akan ditampilkan
	input.parentNode.insertBefore(container, input);
	


	// tambahkan elemen-element ke container
	// penambahakn container ke body document pada saat Input_construct di parent class Input
	wrapinput.appendChild(display);
	wrapinput.appendChild(button);
	button.appendChild(input);
	container.appendChild(wrapinput);
	container.appendChild(lastvalue);


	// tambahkan referensi elemen ke Nodes
	self.Nodes.InputWrapper = wrapinput;
	self.Nodes.Label = label; 
	self.Nodes.Display = display;
	self.Nodes.Button = button;


	// setup container
	container.setAttribute('fgta5-component', 'Timepicker');


	// setup wrapper
	wrapinput.classList.add('fgta5-entry-input-wrapper');


	// display
	display.setAttribute('id', `${id}-display`);
	display.setAttribute('type', 'text');
	display.setAttribute('picker', 'time');
	display.setAttribute('fgta5-component', 'Timepicker');
	display.setAttribute('readonly', 'true');
	display.classList.add('fgta5-entry-display');
	display.classList.add('fgta5-entry-display-datepicker');
	var placeholder = input.getAttribute('placeholder');
	if (placeholder!=null && placeholder !='') {
		display.setAttribute('placeholder', placeholder);
	}
	var cssclass = input.getAttribute('class');
	if (cssclass!=null && cssclass !='') {
		display.setAttribute('class', cssclass);
	}
	var cssstyle = input.getAttribute('style');
	if (cssstyle!=null && cssstyle !='') {
		display.setAttribute('style', cssstyle);
	}


	// main input
	input.setAttribute('type', 'time');
	input.setAttribute('picker', 'time');
	input.removeAttribute('class');
	input.removeAttribute('style');
	input.classList.add('fgta5-entry-input');
	input.classList.add('fgta5-entry-input-datepicker');
	input.getInputCaption = () => {
		return label.innerHTML
	};

	
	// picker button
	button.id = self.Id + '-button';
	button.insertAdjacentHTML("beforeend", button_icon$1);
	button.classList.add('fgta5-entry-button-datepicker');	


	// label
	label.setAttribute('for', button.id);
	label.classList.add('fgta5-entry-label');




	// additional property setup

	// required field
	var required = input.getAttribute('required');
	if (required != null) {
		self.MarkAsRequired(true);
	}

	if (input.value == null || input.value == '') {
		input.value = '00:00';
	}
	self.Value = input.value;
	self._setLastValue(input.value);
	self.AcceptChanges();


	// set input description
	self._setupDescription();


	input.addEventListener('change', (e)=>{
		Timepicker_changed(self);
	});
}


function Timepicker_setDisabled(self, v) {
	var display = self.Nodes.Display;
	var inputwrap = self.Nodes.InputWrapper;
	var button = self.Nodes.Button;

	if (v) {
		display.disabled = true;
		inputwrap.setAttribute('disabled', 'true');
		button.setAttribute('disabled', 'true');
	} else {
		display.disabled = false;
		inputwrap.removeAttribute('disabled');
		button.removeAttribute('disabled');
	}
}


function Timepicker_SetEditingMode(self, ineditmode) {
	var attrval = ineditmode ? 'true' : 'false';
	var input = self.Nodes.Input;
	var display = self.Nodes.Display;
	var inputwrap = self.Nodes.InputWrapper;

	display.setAttribute('editmode', attrval);
	input.setAttribute('editmode', attrval);
	inputwrap.setAttribute('editmode', attrval);

	if (ineditmode) {
		input.removeAttribute('readonly');
	} else {
		input.setAttribute('readonly', 'true');
		self.SetError(null);
	}
}


function Timepicker_AcceptChanges(self) {
	self.Nodes.Display.removeAttribute('changed');
}

function Timepicker_Reset(self) {
	var lastvalue = self.GetLastValue();
	if (lastvalue==null) {
		self.Value = '';
	} else {
		self.Value = lastvalue;
	}
}


function Timepicker_changed(self) {
	var input = self.Nodes.Input;
	Timepicker_setDisplay(self, input.value);
	
	Timepicker_markChanged(self);
	if (self.InEditMode) {
		self.SetError(null);
		self.Validate();
	}
}


function Timepicker_markChanged(self) {
	var display = self.Nodes.Display;
	if (self.Value!=self.GetLastValue()) {
		display.setAttribute('changed', 'true');
	} else {
		display.removeAttribute('changed');
	}
}



function Timepicker_getValue(self) {
	var input = self.Nodes.Input;
	if (input.value=='') {
		return null
	} else {
		return input.value
	}
}



function Timepicker_setValue(self, dt) {
    if (!timeRegex.test(dt)) {
		throw new Error(`invalid HH:ss format for '${dt}'`)
	}

	self.Nodes.Input.value = dt;
	Timepicker_setDisplay(self, dt);
	Timepicker_markChanged(self);
}


function Timepicker_setDisplay(self, tm) {
	self.Nodes.Display.value = tm;
}

function Timepicker_SetError(self, msg) {
	var display = self.Nodes.Display;
	if (msg!== null && msg !== '') {
		display.setAttribute('invalid', 'true');
	} else {
		display.removeAttribute('invalid');
	}
}


function Timepicker_GetLastValue(self) {
	var lastvalue = self.Nodes.LastValue.value;
	if (lastvalue=='') {
		return null
	} else {
		return lastvalue
	}
}

class Dataloader {

	#controller;

	constructor() {
		this.#controller = new AbortController();
	}

	Abort() {
		this.#controller.abort();
	}


	async Load(url, options, loadedCallback) {
		const signal = this.#controller.signal;

		
		/*
		// contoh parameter options
		options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer your-token-here' // jika perlu autentikasi
			},
			body: JSON.stringify({
				key1: 'value1',
				key2: 'value2'
			})
		}
		*/

		if (options==null) {
			options={};
		}

		const opt = Object.assign({ signal }, options);
		try {
			const response = await fetch(url, opt);
			const data = await response.json();
			if (typeof loadedCallback == 'function') {
				try {
					loadedCallback(null, data);
				} catch (err) {
					console.error(err);
				}
			}
		} catch (err) {
			if (err.name === "AbortError") {
				console.log("Request dibatalkan!");
			} else {
				if (typeof loadedCallback == 'function') {
					try {
						loadedCallback(err, null);
					} catch (err) {
						console.error(err);
					}
				}
			}
		}



	}

}

const ChangeEvent = (data) => { return new CustomEvent('change', data) };
const OptionFormattingEvent = (data) => { return new CustomEvent('optionformatting', data) };
const SelectingEvent = (data) => { return new CustomEvent('selecting', data) };


const icon_cbo_button = `<?xml version="1.0" encoding="UTF-8"?>
<svg transform="translate(0 3)" width="12" height="12" stroke-linecap="round" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path transform="matrix(.8169 0 0 -.64538 10.987 14.119)" d="m11.299 11.275h-10.157l-10.157-1e-6 10.157-17.593 5.0786 8.7965z"/>
</svg>
`;

const icon_cbo_close = `<?xml version="1.0" encoding="UTF-8"?>
<svg transform="translate(0 3)" width="12" height="12" stroke="currentColor" stroke-linecap="round" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="m3.5642 20.295 16.853-16.833" fill="none" stroke-width="4"/>
<path d="m3.5741 3.4523 16.833 16.853" fill="none" stroke-width="4"/>
</svg>`;



const ATTR_EDITMODE = 'editmode';
const ATTR_SHOWED = 'showed';
const ATTR_REMOVING = 'removing';
const ATTR_SELECTED = 'selected';
const ATTR_INDEX = 'data-index';

const DEF_LIMIT = 30;

class Combobox extends Input {

	constructor(id) {
		super(id);
		Combobox_construct(this, id);
	}

	get Value() { return Combobox_getValue(this) }
	set Value(v) {  throw Error('Value is readonly') }

	get Text() { return  Combobox_getText(this) }
	set Text(v) { throw Error('Text is readonly') }

	get Disabled() { return this.Element.disabled }
	set Disabled(v) { 
		this.Element.disabled = v; 
		Combobox_setDisabled(this, v);
	}

	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) {
		this.#_ineditmode = ineditmode;
		Combobox_SetEditingMode(this, ineditmode);
	}

	NewData(initialdata) {
		Combobox_NewData(this, initialdata);
	}

	AcceptChanges() {
		super.AcceptChanges();
		Combobox_AcceptChanges(this);
	}
	
	Reset() {
		super.Reset();
		Combobox_Reset(this);
	}

	_setLastValue(v, t) {
		super._setLastValue(v);
		Combobox_setLastValue(this, v, t);
	}

	GetLastValue() {
		return Combobox_GetLastValue(this)
	} 

	GetLastText() {
		return Combobox_GetLastText()
	} 

	SetSelected(value, text) {
		if (text===undefined || text===null) {
			text = value;
		}
		Combobox_SetSelected(this, value, text);
	}


	AddOptions(data) {
		Combobox_AddOptions(this, data);
	}

	SetOptions(data) {
		Combobox_SetOptions(this, data);
	}


	#iswaiting = false
	IsWaiting() { return this.#iswaiting }
	Wait(iswaiting) {
		this.#iswaiting = iswaiting===undefined ? true : iswaiting;
		Combobox_Wait(this, iswaiting);
	}
	
	// untuk keperluan abort fetch data yang dibatalkan
	// apabila belum selesai tapi dialog sudah ditutup
	AbortHandler = null


	HasStaticOption = null

}


function Combobox_SetSelected(self, value, text) {
	self.Nodes.Input.value = value;
	self.Nodes.Display.value = text;
	Combobox_markChanged(self);
}

function Combobox_construct(self, id) {
	const container = self.Nodes.Container;
	const lastvalue = self.Nodes.LastValue;
	const input = self.Nodes.Input;
	const wrapinput = document.createElement('div');
	const display = document.createElement('input');
	const button = document.createElement('button');
	const label = document.querySelector(`label[for="${id}"]`);
	const datalist = input.parentNode.querySelector(`datalist[for="${id}"]`);
	const dialog = document.createElement('dialog');
	const lasttext = document.createElement('input');


	// setup container, (harus di awal seblum yang lain-lain)
	// diperlukan untuk menampung semua element yang akan ditampilkan
	input.parentNode.insertBefore(container, input);


	// tambahkan elemen-element ke container
	// penambahakn container ke body document pada saat Input_construct di parent class Input
	wrapinput.appendChild(input);
	wrapinput.appendChild(display);
	wrapinput.appendChild(button);
	container.appendChild(wrapinput);
	container.appendChild(lastvalue);
	container.appendChild(lasttext);
	container.appendChild(dialog); 


	// tambahkan referensi elemen ke Nodes
	self.Nodes.InputWrapper = wrapinput;
	self.Nodes.Label = label; 
	self.Nodes.Display = display;
	self.Nodes.Button = button;
	self.Nodes.Dialog = dialog;
	self.Nodes.LastText = lasttext;


	// setup container
	container.setAttribute('fgta5-component', 'Combobox');
	if (input.style.width!='') {
		container.style.width = input.style.width;
	}
	if (input.style.marginTop!='') {
		container.style.marginTop = input.style.marginTop;
		input.style.marginTop = '';
	}
	if (input.style.marginBottom!='') {
		container.style.marginBottom = input.style.marginBottom;
		input.style.marginBottom='';
	}
	if (input.style.marginLeft!='') {
		container.style.marginLeft = input.style.marginLeft;
		input.style.marginLeft='';
	}
	if (input.style.marginRight!='') {
		container.style.marginRight = input.style.marginRight;
		input.style.marginRight='';
	}


	// setup wrapper
	wrapinput.classList.add('fgta5-entry-input-wrapper');

	// setup input
	input.classList.add('fgta5-entry-input');
	input.setAttribute('type', 'hidden');
	input.getInputCaption = () => {
		if (label!=null) {
			return label.innerHTML
		} else {
			return input.getAttribute('placeholder')
		}
	};
	const nonFgtaClasses = Array.from(input.classList).filter(className =>
		!className.startsWith('fgta5-')
	);
	for (var classname of nonFgtaClasses) {
		input.classList.remove(classname);
		container.classList.add(classname);
	}


	// setup display
	display.id = self.Id + '-display';
	display.classList.add('fgta5-entry-display');
	display.setAttribute('style', input.getAttribute('style') || '');
	display.setAttribute('type', 'text');
	display.setAttribute('readonly', 'true');
	display.setAttribute('fgta5-component', 'Combobox');
	display.setAttribute('placeholder', input.getAttribute('placeholder'));
	display.required = input.required;

	// setup button
	button.classList.add('fgta5-entry-button-combobox');	
	button.innerHTML = icon_cbo_button;
	button.addEventListener('click', (e)=>{
		Combobox_buttonClick(self);
	});


	// setup lasttext
	lasttext.setAttribute('type', 'hidden');

	// setup label
	if (label!=null) {
		label.setAttribute('for', display.id);
		label.classList.add('fgta5-entry-label');
	}


	// required field
	var required = input.getAttribute('required');
	if (required != null) {
		self.MarkAsRequired(true);
	}

	// dialog
	if (datalist!=null) {
		self.HasStaticOption = true;
	}
	Combobox_createDialog(self, dialog);
	dialog.addEventListener("cancel", (e)=>{
		dialog.setAttribute(ATTR_REMOVING, 'true');
		e.preventDefault();
		setTimeout(() => {
			dialog.close();
			dialog.removeAttribute(ATTR_REMOVING);
			dialog.removeAttribute(ATTR_SHOWED);
			Combobox_closed(self);
		}, 200);
    });

	dialog.addEventListener('close', (evt)=>{
	});

	

	// datalist
	if (datalist!=null) {
		datalist.remove();
		var opt = Combobox_createStaticOptions(self, dialog, datalist);
		if (opt.default!=null) {
			input.value = opt.default.value;
			display.value = opt.default.text;
		}

		if (opt.count>0) {
			self.HasStaticOption = true;
		}
	} else {
		input.value = '';
		display.value = '';
	}


	// baca attribut kelengkapan combobox
	self._read;

	// set input description
	self._setupDescription();
	self._setLastValue(input.value, display.value);
	
}


function Combobox_getValue(self) {
	var input = self.Nodes.Input;
	if (input.value=='') {
		return null
	} else {
		return input.value
	}
}

function Combobox_getText(self) {
	return self.Nodes.Display.value
}


function Combobox_NewData(self, initialdata) {
	var input = self.Nodes.Input;
	var display = self.Nodes.Display;


	if (initialdata===undefined) {
		input.value = '';
		display.value = '';
	} else if (typeof initialdata==='string') {
		input.value = initialdata;
		display.value = initialdata;
	} else if (initialdata!=null) {
		input.value = initialdata.value;
		display.value = initialdata.text;
	} else {
		input.value = '';
		input.value = '';
	}
	self.Nodes.Display.removeAttribute('changed');

	self.SetError(null);
	self.AcceptChanges();
}

function Combobox_AcceptChanges(self) {
	self.Nodes.Display.removeAttribute('changed');
	self._setLastValue(self.Value, self.Text);
}

function Combobox_Reset(self) {
	self.Value = self.GetLastValue();
	self.Text = self.GetLastText();
	self.Nodes.Display.removeAttribute('changed');
}

function Combobox_setLastValue(self, v, t) {
	self.Nodes.LastValue.value = v;
	self.Nodes.LastText.value = t;
}

function Combobox_setDisabled(self, v) {
	if (v) {
		self.Nodes.Display.disabled = true;
		self.Nodes.Button.disabled = true;
	} else {
		self.Nodes.Display.disabled = false;
		self.Nodes.Button.disabled = false;
	}
}

function Combobox_markSelected(self, tr) {
	tr.setAttribute(ATTR_SELECTED, '');
	
	setTimeout(()=>{
		let d = tr.getAttribute('data-none');
 		if (d=='') ; else {
			// geser tr ke atas atau setelah none 
			const dialog = self.Nodes.Dialog;
			const tbody = dialog.getElementsByTagName('tbody')[0];
			const none = tbody.querySelector('tr[data-none]');
			if (none!=null) {
				none.after(tr);	
			}
		}
	}, 100);
	
}


function Combobox_SetEditingMode(self, ineditmode) {
	var attrval = ineditmode ? 'true' : 'false';

	self.Nodes.Display.setAttribute(ATTR_EDITMODE, attrval);
	self.Nodes.Input.setAttribute(ATTR_EDITMODE, attrval);
	self.Nodes.InputWrapper.setAttribute(ATTR_EDITMODE, attrval);
	self.Nodes.Button.setAttribute(ATTR_EDITMODE, attrval);

	if (ineditmode) {
		self.Nodes.Input.removeAttribute('readonly');
	} else {
		self.Nodes.Input.setAttribute('readonly', 'true');
		self.SetError(null);
	}
}


function Combobox_createOptionRow(self, value, text, data) {
	let tr = document.createElement('tr');
	var td = document.createElement('td');

	tr.classList.add('fgta-combobox-option-row');
	tr.setAttribute('value', value);

	td.setAttribute('option', '');
	td.setAttribute('value', value);
	td.innerHTML = text;
	td.addEventListener('click', (e)=>{

		// untuk menghindari kesalah jika melakukan double click
		// karena efek animate
		if (self.pauseClickEvent===true) {
			return
		}
		self.pauseClickEvent = true;
		setTimeout(()=>{
			self.pauseClickEvent = false;
		}, 500);

		// reset dulu jika ada option yang terpilih sebelumnya
		Combobox_resetSelected(self);

		// tandai baris yang sekarang dilih
		if (text=='none') {
			console.log('add none row option');
		}

		Combobox_markSelected(self, tr);


		self.Nodes.Input.value = value;
		self.Nodes.Display.value = text;
		Combobox_userSelectValue(self, value, text, data);


	});

	tr.appendChild(td);



	// CATATAN:
	// dispatch event di sini tidak berlaku untuk static options
	// karena event handler pada main program baru akan diexekusi setelah pembuatan content option statis
	self.Listener.dispatchEvent(OptionFormattingEvent({
		detail: {
			value: value,
			text: text,
			tr: tr,
			data: data
		}
	}));


	// tandai baris pilihan ini jika merupakan opsi yang dipilih user saat ini
	var valueselected=self.Value??'';
	if (value==valueselected) {
		Combobox_markSelected(self, tr);
	}


	return tr
} 

function Combobox_createStaticOptions(self, dialog, datalist) {
	const options = datalist.getElementsByTagName("option");
	
	const thead = dialog.getElementsByTagName('thead')[0];
	const tbody = dialog.getElementsByTagName('tbody')[0];
	const tfoot = dialog.getElementsByTagName('tfoot')[0];
	var defaultOption = null;
	
	thead.style.display='none';
	tfoot.style.display='none';


	// jika tidak harus diisi,
	// tambahkan opsi none
	if (!self.IsRequired()) {
		var tr = Combobox_createOptionRow(self, '', 'none', {});
		tr.setAttribute('data-none', '');
		tr.setAttribute(ATTR_INDEX, 0);
		tbody.appendChild(tr);
	}

	// selanjutnya isi data berdasar options default
	var i = 0;
	for (let option of options) {
		i++;
		let text = option.textContent || option.innerText;
		let value = (option.value==null || option.value=='') ? text : option.value;

		var def = option.getAttribute('default');
		if (def!=null) {
			defaultOption = {
				value: value,
				text: text
			};
		}

		var idx = tbody.rows.length - 1;
		var tr = Combobox_createOptionRow(self, value, text, { option: option });
		
		tr.setAttribute(ATTR_INDEX, idx);
		tbody.appendChild(tr);
	}

	return {
		count: i,
		default: defaultOption
	}

}

function Combobox_createDialog(self, dialog) {
	dialog.classList.add('fgta5-combobox-dialog');

	// buat header dialog
	var head = document.createElement('div');
	head.classList.add('fgta5-combobox-dialog-head');
	head.innerHTML = self.Nodes.Input.getInputCaption();
	dialog.appendChild(head);

	// tombol tutup dialog (tanpa memilih)
	var btnClose = document.createElement('button');
	btnClose.innerHTML = icon_cbo_close;
	head.appendChild(btnClose);



	
	// filtering
	if (!self.HasStaticOption) {
		var srccontainer = document.createElement('div');
		var srcinput = document.createElement('input');
		var srcbuton = document.createElement('button');
		var btnnext = document.createElement('a');

		srcinput.setAttribute('placeholder', 'Search');
		srcinput.setAttribute('maxlength', 30);
		srcinput.addEventListener('keypress', (evt)=>{
			if (evt.key==="Enter") {
				srcbuton.click();
			}
		});
		

		srcbuton.innerHTML = 'Submit';
		srcbuton.addEventListener('click', (evt)=>{
			var searchtext = srcinput.value;
			var limit = DEF_LIMIT;
			var offset = 0;

			btnnext.searchtext = searchtext;
			Combobox_resetSelected(self);
			Combobox_Search(self, searchtext, limit, offset);
		});

		srccontainer.classList.add('fgta5-combobox-dialog-filter');
		srccontainer.appendChild(srcinput);
		srccontainer.appendChild(srcbuton);
		dialog.appendChild(srccontainer);

	}






	// template tabel dialog
	var table = document.createElement('table');
	var thead = document.createElement('thead');
	var tbody = document.createElement('tbody');
	var tfoot = document.createElement('tfoot');
	dialog.appendChild(table);
	
	
	table.appendChild(tbody);
	table.appendChild(tfoot);
	table.appendChild(thead);


	if (!self.HasStaticOption) {
		// siapkan tombol next,
		// jikalau nanti ada data yang panjang dan perlu paging
		btnnext.classList.add('fgta5-combobox-dialog-nextbutton');
		btnnext.innerHTML = 'next data';
		btnnext.style.display = 'none';
		btnnext.setAttribute('href', 'javascript:void(0)');
		btnnext.addEventListener('click', (evt)=>{
			// ketiak, eh ketika tombol next di klik
			var searchtext = btnnext.searchtext;
			var limit = btnnext.limit;
			var nextoffset = btnnext.nextoffset;
			Combobox_Search(self, searchtext, limit, nextoffset);
		});
		dialog.appendChild(btnnext);

		dialog.SetNext = (nextoffset, limit) => {
			btnnext.nextoffset = nextoffset;
			btnnext.limit = limit;
			if (nextoffset!=null && nextoffset!=0) {
				btnnext.style.display = 'inline-block';
			} else {
				btnnext.style.display = 'none';
			}
		};
	} else {
		dialog.SetNext = (nextoffset, limit) => {
			console.log('not implemented');
		};
	}	
	
	
}

function Combobox_userSelectValue(self, value, text, data) {
	// trigger event
	self.Listener.dispatchEvent(ChangeEvent({
		sender: self,
		detail: {value: value, text: text, data:data, sender: self}
	}));

	Combobox_markChanged(self);

	// tutup
	self.Nodes.Dialog.removeAttribute(ATTR_SHOWED);
	setTimeout(() => {
		self.Nodes.Dialog.close();
		Combobox_closed(self);
	}, 200);
}

function Combobox_markChanged(self) {
	if (self.Form==null) {
		return
	}

	var display = self.Nodes.Display;
	if (self.Value!=self.GetLastValue()) {
		display.setAttribute('changed', 'true');
	} else {
		display.removeAttribute('changed');
	}
}


function Combobox_GetLastValue(self) {
	var lastvalue = self.Nodes.LastValue.value;
	if (lastvalue=='') {
		return null
	} else {
		return lastvalue
	}
}

function Combobox_GetLastText(self) {
	return this.Nodes.LastText.value
}


function Combobox_ClearOptions(self, tbody) {
	const dialog = self.Nodes.Dialog;
	if (tbody==undefined || tbody==null) {
		tbody = dialog.getElementsByTagName('tbody')[0];
	}

	tbody.replaceChildren();
}

function Combobox_AddOptions(self, data, tbody) {
	if (data==undefined || data==null) {
		return
	}

	const dialog = self.Nodes.Dialog;
	if (tbody==undefined || tbody==null) {
		tbody = dialog.getElementsByTagName('tbody')[0];
	}

	for (let row of data) {
		tbody.appendChild(Combobox_createOptionRow(self, row.value, row.text, data));
	}
}

function Combobox_SetOptions(self, data) {
	const dialog = self.Nodes.Dialog;
	const tbody = dialog.getElementsByTagName('tbody')[0];

	// hapus dulu datanya
	Combobox_ClearOptions(self, tbody);
	
	// cek apakah tidak required
	// jika tidak required, tambahkan none di paling atas
	if (!self.IsRequired()) ;


	// tampilkan data pada pilihan
	Combobox_AddOptions(self, data, tbody);
}

function Combobox_closed(self) {
	console.log('combobox closed');
	if (typeof self.AbortHandler==='function') {
		self.AbortHandler();
	}
}


function Combobox_Search(self, searchtext, limit, offset) {
	const dialog = self.Nodes.Dialog;
	const tbody = dialog.getElementsByTagName('tbody')[0];


	// required atau nggak
	var addNoneIfNotRequired = () => {
		var none = tbody.querySelector('tr[data-none]');
		if (self.IsRequired()) {
			// hilangkan none
			none.remove();
		} else {
			// tambahkan none jika belum ada
			if (none==null) {
				var tr = Combobox_createOptionRow(self, '', 'none', {});
				tr.setAttribute('data-none', '');
				tr.setAttribute(ATTR_INDEX, 0);
				tbody.prepend(tr);
				console.log('add none');
			}
		}
	};

	var execute_selecting = true;
	if (offset==0) {
		var prevselected = dialog.querySelector(`table tr[${ATTR_SELECTED}]`);
		if (prevselected != null) {
			// kalau sudah ada yang dipilih sebelumnya
			// tidak perlu query selecting lagi 
			execute_selecting = false;
		} else {
			execute_selecting = true;
			Combobox_ClearOptions(self, tbody);
			dialog.SetNext(null);
		}
	}
	


	if (execute_selecting) {

		// selecting event
		addNoneIfNotRequired();


		self.Listener.dispatchEvent(SelectingEvent({
			detail: {
				sender: self,
				dialog: dialog,
				searchtext: searchtext,
				limit: limit, 
				offset: offset,
				addRow: (value, text, data) => {
					var idx = tbody.rows.length - 1;
					var tr = Combobox_createOptionRow(self, value, text, data);
					tr.setAttribute(ATTR_INDEX, idx);
					tbody.appendChild(tr);
				}
			}
		}));
	}


}


function Combobox_buttonClick(self, e) {
	const dialog = self.Nodes.Dialog;

	if (self.Form!=null) {
		var editmode = self.Nodes.Button.getAttribute(ATTR_EDITMODE);
		if (editmode!=="true") {
			return
		}
	}

	if (self.HasStaticOption) {
		// populasi data option statis melalui definisi datalist pada element
		self.Listener.dispatchEvent(SelectingEvent({
			detail: {
				sender: self,
				dialog: dialog,
				searchtext: '', limit: 0, offset: 0,
				addRow: (value, text, data) => {
					var tr = Combobox_createOptionRow(self, value, text, data);
					tbody.appendChild(tr);
				}
			}
		}));

	} else {
		// populasi data option dengan secara dinamis,
		var searchtext = null; // diisi null berarti saat klik pertama kali
		var limit = DEF_LIMIT;
		var offset = 0;

		// tambahkan data yang dipilih
		Combobox_Search(self, searchtext, limit, offset);

		// set focus pada input search
		setTimeout(()=>{
			var inputsearch = dialog.querySelector(".fgta5-combobox-dialog-filter input");
			if (inputsearch!=null) {
				inputsearch.focus();
			}
		}, 100);


	}

	// set jika dalam waktu 1 detik masih dalam posisi waiting, munculkan mask
	setTimeout(()=>{
		if (self.IsWaiting()) {
			dialog.mask = $fgta5.Modal.Mask();
		}
	}, 1000);

	// tampilkan modal dialog untuk options
	dialog.showModal();
	dialog.setAttribute(ATTR_SHOWED, 'true');


	// handler tombol untuk menutup dialog pilihan combobox
	var btnClose = dialog.querySelector('.fgta5-combobox-dialog-head > button');
	if (btnClose.onclick==null) {
		btnClose.onclick=(e) => {
			dialog.setAttribute(ATTR_REMOVING, 'true');
			setTimeout(() => {
				dialog.close();
				dialog.removeAttribute(ATTR_REMOVING);
				dialog.removeAttribute(ATTR_SHOWED);
				Combobox_closed(self);
			}, 200);
		};
	}

}


function Combobox_Wait(self, iswaiting) {
	const dialog = self.Nodes.Dialog;
	var tbody = dialog.getElementsByTagName('tbody')[0];

	iswaiting = iswaiting===undefined ? true : iswaiting;
	if (iswaiting) {
		var tr = document.createElement('tr');
		var td = document.createElement('td');

		tr.setAttribute('data-waiting', '');
		td.innerHTML = 'fetching data from server ...';
		tr.appendChild(td);
		tbody.appendChild(tr);

		
	} else {
		var el = tbody.querySelector('[data-waiting]');
		if (el!=null) {
			el.remove();
		}

		if (dialog.mask!=null) {
			dialog.mask.close();
			delete dialog.mask;
		}
	}

}


function Combobox_resetSelected(self) {
	// ambil baris yang dipilih sebelumnya
	const prevselected = self.Nodes.Dialog.querySelector(`table tr[${ATTR_SELECTED}]`);
	if (prevselected != null) {

		// kemablikan ke urutan sesuai index
		const idx = prevselected.getAttribute(ATTR_INDEX);	
		if (idx!='' && idx!=null) {
			const index = Number(idx);
			const tbody = prevselected.closest('tbody');
			const trs = tbody.querySelectorAll('tr');
			for (var tr of trs) {
				var rowidx = tr.getAttribute(ATTR_INDEX) ?? 0;
				var rowindex = Number(rowidx);
				if (rowindex==0) continue
				if (rowindex==index) continue

				if (index<rowindex) {
					tr.insertAdjacentElement("beforebegin", prevselected);
					break
				}
			}
		}	

		// remove status selected
		prevselected.removeAttribute(ATTR_SELECTED);
	}
}

const button_icon = `<?xml version="1.0" encoding="UTF-8"?>
<svg transform="translate(0 3)" width="12" height="12" stroke="currentColor" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="m3.0207 17.447v3.9708h18.328v-3.9708" fill="none" stroke-linecap="square" stroke-width="4"/>
<path d="m18.595 8.3606-6.4542-4.0017-6.3622 4.0017m6.3622-1.8991v7.1708" fill="none" stroke-linecap="square" stroke-width="4"/>
</svg>
`;


class Filebox extends Input {
	constructor(id) {
		super(id);
		Filebox_construct(this, id);
	}


	get Value() { 
		if (this.Element.files.length===0) {
			return ''
		} else {
			return this.Element.files[0].name
		}
	}
	


	get Disabled() { return this.Element.disabled }
	set Disabled(v) { 
		this.Element.disabled = v; 
		Filebox_setDisabled(this, v);
	}

	#_ineditmode = true
	get InEditMode() { return this.#_ineditmode }
	SetEditingMode(ineditmode) {
		this.#_ineditmode = ineditmode;
		Filebox_SetEditingMode(this, ineditmode);
	}

	NewData() {
		Filebox_NewData(this);
	}

	AcceptChanges() {
		Filebox_AcceptChanges(this);
	}

	Reset() {
		Filebox_Reset(this);
	}

	IsChanged() { 
		return Filebox_IsChanged(this)
	}

	SetError(msg) {
		super.SetError(msg);
		Filebox_SetError(this, msg);
	}



}

function Filebox_construct(self, id) {
	const container = self.Nodes.Container;
	const lastvalue = self.Nodes.LastValue;
	const input = self.Nodes.Input;
	const wrapinput = document.createElement('div');
	const display = document.createElement('input');
	const button = document.createElement('button');
	const label = document.querySelector(`label[for="${id}"]`);

	// setup container, (harus di awal seblum yang lain-lain)
	// diperlukan untuk menampung semua element yang akan ditampilkan
	input.parentNode.insertBefore(container, input);
	


	// tambahkan elemen-element ke container
	// penambahakn container ke body document pada saat Input_construct di parent class Input
	wrapinput.appendChild(display);
	wrapinput.appendChild(button);
	button.appendChild(input);
	container.appendChild(wrapinput);
	container.appendChild(lastvalue);


	// tambahkan referensi elemen ke Nodes
	self.Nodes.InputWrapper = wrapinput;
	self.Nodes.Label = label; 
	self.Nodes.Display = display;
	self.Nodes.Button = button;


	// setup container
	container.setAttribute('fgta5-component', 'Filebox');


	// setup wrapper
	wrapinput.classList.add('fgta5-entry-input-wrapper');


	// display
	display.setAttribute('id', `${id}-display`);
	display.setAttribute('type', 'text');
	display.setAttribute('picker', 'file');
	display.setAttribute('fgta5-component', 'Filebox');
	display.setAttribute('readonly', 'true');
	display.classList.add('fgta5-entry-display');
	display.classList.add('fgta5-entry-display-filebox');
	var placeholder = input.getAttribute('placeholder');
	if (placeholder!=null && placeholder !='') {
		display.setAttribute('placeholder', placeholder);
	}
	var cssclass = input.getAttribute('class');
	if (cssclass!=null && cssclass !='') {
		display.setAttribute('class', cssclass);
	}
	var cssstyle = input.getAttribute('style');
	if (cssstyle!=null && cssstyle !='') {
		display.setAttribute('style', cssstyle);
	}


		// main input
	input.setAttribute('type', 'file');
	input.setAttribute('picker', 'file');
	input.removeAttribute('class');
	input.removeAttribute('style');
	input.classList.add('fgta5-entry-input');
	input.classList.add('fgta5-entry-input-filebox');
	input.getInputCaption = () => {
		if (label!=null) {
			return label.innerHTML
		} else {
			return input.getAttribute('placeholder')
		}
	};

	
	// picker button
	button.id = self.Id + '-button';
	button.insertAdjacentHTML("beforeend", button_icon);
	button.classList.add('fgta5-entry-button-filebox');	

	// label
	label.setAttribute('for', button.id);
	label.classList.add('fgta5-entry-label');




	// additional property setup

	// required field
	var required = input.getAttribute('required');
	if (required != null) {
		self.MarkAsRequired(true);
	}

	self._setLastValue(input.value);
	self.AcceptChanges();


	// set input description
	self._setupDescription();


	input.addEventListener('change', (e)=>{
		Filebox_changed(self);
	});


}


function Filebox_setDisabled(self, v) {
	var display = self.Nodes.Display;
	var button = self.Nodes.Button;
	if (v) {
		display.disabled = true;
		button.disabled = true;
	} else {
		display.disabled = false;
		button.disabled = false;
	}
}


function Filebox_SetEditingMode(self, ineditmode) {
	var display = self.Nodes.Display;
	var input = self.Nodes.Input;
	var attrval = ineditmode ? 'true' : 'false';

	display.setAttribute('editmode', attrval);
	input.setAttribute('editmode', attrval);
	self.Nodes.InputWrapper.setAttribute('editmode', attrval);

	if (ineditmode) {
		input.disabled = false;
	} else {
		input.disabled = true;
		self.SetError(null);
	}
}


function Filebox_changed(self) {
	var input = self.Nodes.Input;

	if (input.files.length === 0) {
		return
	}

	self.Nodes.Display.value = input.files[0].name;
	Filebox_markChanged(self);
	if (self.InEditMode) {
		self.SetError(null);
		self.Validate();
	}
}

function Filebox_markChanged(self) {
	var display = self.Nodes.Display;
	if (self.Value!=self.GetLastValue()) {
		display.setAttribute('changed', 'true');
	} else {
		display.removeAttribute('changed');
	}
}



function Filebox_SetError(self, msg) {
	var display = self.Nodes.Display;
	if (msg!== null && msg !== '') {
		display.setAttribute('invalid', 'true');
	} else {
		display.removeAttribute('invalid');
	}
}

function Filebox_NewData(self) {
	self.Nodes.Input.value = '';
	self.Nodes.Display.value = '';
	self.AcceptChanges();
}


function Filebox_Reset(self) {
	// let newFileInput = self.Nodes.Input.cloneNode();
	// newFileInput.addEventListener('change', (e)=>{
	// 	Filebox_changed(self)
	// })
	
	// self.Nodes.Input.replaceWith(newFileInput)
	// self.Nodes.Input = newFileInput
	self.Nodes.Input.value = '';
	
	var lastvalue = self.GetLastValue();
	self.Nodes.Display.value = lastvalue;
	self.AcceptChanges();
}

function Filebox_AcceptChanges(self) {
	var display = self.Nodes.Display;
	var input = self.Nodes.Input;
	var currentvalue = '';
	if (input.files.length>0) {
		currentvalue = input.files[0].name;
	}
	
	self._setLastValue(currentvalue);
	input.removeAttribute('changed');
	display.removeAttribute('changed');
	self.SetError(null);
}


function Filebox_IsChanged(self) {
	var lastvalue = self.Nodes.LastValue.value;
	var currentvalue = self.Value;
	if (currentvalue!=lastvalue) {
		console.log(`Input '${self.Id}' is changed from '${lastvalue}' to '${currentvalue}'`);
		return true
	} else {
		return false
	}
}

const formLockedEvent = new CustomEvent('locked');
const formUnLockedEvent = new CustomEvent('unlocked');


class Form extends Component {
	#_locked = false
	#_autoid = false
	#_primarykey

	Inputs = {}

	constructor(id) {
		super(id);

		this.#readAttributes();
		Construct$1(this, id);
	}


	get AutoID() { return this.#_autoid }
	get PrimaryKey() { return this.#_primarykey } 

	Lock(lock) { 
		this.#_locked = Form_Lock(this, lock); 
	}

	IsLocked() { 
		return this.#_locked
	}

	#isnew
	IsNew() {
		return this.#isnew
	}

	Reset() { 
		this.#isnew = false;
		Form_Reset(this); 
	}

	AcceptChanges() { 
		this.#isnew = false;
		Form_AcceptChanges(this); 
	}

	IsChanged() { return Form_IsChanged(this) }

	

	NewData(data) { 
		this.#isnew = true;
		Form_NewData(this, data); 
	}

	Render() { Form_Render(this); }

	Validate() { return Form_Validate(this) }


	GetData() {
		return Form_GetData(this)
	}

	addEventListener(event, callback) {
		this.Element.addEventListener(event, callback);
	}

	#readAttributes() {
		var locked = this.Element.getAttribute('locked'); 
		if (locked == null) {
			locked = 'false';
		}
		if (locked.toLowerCase() === 'true') {
			this.#_locked = true;
		} else {
			this.#_locked = false;
		}

		var autoid = this.Element.getAttribute('autoid');
		if (autoid!=null) {
			if (autoid.toLowerCase() === 'true') {
				this.#_autoid = true;
			} else {
				this.#_autoid = false;
			}
		} 
		


		var primarykey = this.Element.getAttribute('primarykey');
		this.#_primarykey = primarykey;

	}

}


function Construct$1(self, id) {
	var formEl =  document.getElementById(id);

	self.Id = id;
 	self.Element = formEl;
	self.Inputs = {};

	self.Element.setAttribute('novalidate', '');
	self.Element.addEventListener('submit', (event) => {
		event.preventDefault();
	});



	// ambil semua input
	var inputs = formEl.querySelectorAll('input');
	for (var i = 0; i < inputs.length; i++) {
		var input = inputs[i];
		var fgtacomp = input.getAttribute('fgta5-component');
		if (fgtacomp==null || input.id==null || input.id=='') {
			continue
		}

		if (fgtacomp=='Textbox') {
			self.Inputs[input.id] = new Textbox(input.id);
		} else if (fgtacomp=='Numberbox') {
			self.Inputs[input.id] = new Numberbox(input.id);
		} else if (fgtacomp=='Datepicker') {
			self.Inputs[input.id] = new Datepicker(input.id);
		} else if (fgtacomp=='Timepicker') {
			self.Inputs[input.id] = new Timepicker(input.id);
		} else if (fgtacomp=='Combobox') {
			self.Inputs[input.id] = new Combobox(input.id);
		} else if  (fgtacomp=='Checkbox') {
			self.Inputs[input.id] = new Checkbox(input.id);
		} else if (fgtacomp=='Filebox') {
			self.Inputs[input.id] = new Filebox(input.id);
		}
	
	}
	
}


function Form_Render(self) {
	// render semua input
	for (var name in self.Inputs) {
		var obj = self.Inputs[name];
		obj.bindForm(self);
	}

	var locked = self.IsLocked() ? true : false;
	if (locked) {
		Form_Lock(self, true);
	} else {
		Form_Lock(self, false);
	}

}

function Form_Lock(self, lock) {
	var formEl = self.Element;
	var editmode = lock ? false : true;
	for (var name in self.Inputs) {
		var obj = self.Inputs[name];
		obj.SetEditingMode(editmode);
	}

	if (lock) {
		formEl.dispatchEvent(formLockedEvent);
		formEl.setAttribute('locked', lock);
	} else {
		formEl.dispatchEvent(formUnLockedEvent);
		formEl.removeAttribute('locked');
	}
	return lock
}




function Form_AcceptChanges(self) {
	for (var name in self.Inputs) {
		var obj = self.Inputs[name];
		obj.AcceptChanges();
	}
}

function Form_Reset(self) {
	for (var name in self.Inputs) {
		var obj = self.Inputs[name];
		obj.Reset();
	}
}


function Form_NewData(self, data) {
	data = data!=null ? data : {}; 

	for (var name in self.Inputs) {
		
		var obj = self.Inputs[name];
		var bindingdata = obj.GetBindingData();
		var initialvalue = data[bindingdata];

		if (obj instanceof Combobox) {
			var initialdata = (initialvalue!=null) ? initialvalue : {value:'',text:''};
			obj.NewData({
				value: initialdata.value,
				text: initialdata.text
			});
		} else if (obj instanceof Checkbox) { 
			obj.NewData(initialvalue);
		} else {
			obj.NewData(initialvalue);
		}
	}
}

function Form_IsChanged(self) {
	for (var name in self.Inputs) {
		var obj = self.Inputs[name];
		if (obj.IsChanged()) {
			return true
		}
	}
	return false
} 

function Form_Validate(self) {
	var isValid = true;
	for (var name in self.Inputs) {
		var obj = self.Inputs[name];
		isValid &&= obj.Validate();
	}
	return isValid
}


function Form_GetData(self) {
	var data = {};
	for (var name in self.Inputs) {
		var obj = self.Inputs[name];
		var bindingdata = obj.GetBindingData();
		if (bindingdata) {
			data[bindingdata] = obj.Value;
		}
	}
	return data
}

class Button extends Component {
	constructor(id) {
		super(id);
		Construct(this);
	}

	#_disabled = false
	get Disabled() { return this.#_disabled }
	set Disabled(v) {
		this.#_disabled = v;
		Button_setDisabled(this, v);
	}

	addEventListener(event, callback) {
		this.Element.addEventListener(event, callback);
	}

	click() {
		this.Element.click();
	}

}

function Construct(self, id) {
	// console.log(`construct button ${id}`)
	self.Element.classList.add('fgta5-button');
	self.Element.setAttribute('type', 'button'); // tambahkan attribut type=button untuk menghindari trigger button click saat tombol enter ditekan 
}

function Button_setDisabled(self, disabled) {
	self.Element.disabled = disabled;
}

const iconsCss = {
	'info': 'fgta5-icon-info',
	'warning': 'fgta5-icon-warning',
	'error': 'fgta5-icon-error',
	'question': 'fgta5-icon-question',
};


const ICON_ERROR = `<svg width="32" height="32" version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<path d="m2.6952 0.48756-2.2081 2.1923-0.010649 3.1118 2.193 2.208 3.112 0.010647 2.2075-2.1929 6.415e-4 -0.066396 0.010022-3.0448-2.1924-2.208z" color="#000000" fill="#f00" stroke-width=".32071" style="-inkscape-stroke:none"/>
<path transform="translate(5.0428e-6 -.019403)" d="m2.582 1.8223a0.33639 0.33639 0 0 0-0.23828 0.097656l-0.43164 0.43164a0.33639 0.33639 0 0 0 0 0.47656l1.4492 1.4492-1.4492 1.4473a0.33639 0.33639 0 0 0 0 0.47656l0.43164 0.43164a0.33639 0.33639 0 0 0 0.47656 0l1.4473-1.4492 1.4492 1.4492a0.33639 0.33639 0 0 0 0.47656 0l0.43164-0.43164a0.33639 0.33639 0 0 0 0-0.47656l-1.4492-1.4473 1.4492-1.4492a0.33639 0.33639 0 0 0 0-0.47656l-0.43164-0.43164a0.33639 0.33639 0 0 0-0.47656 0l-1.4492 1.4492-1.4473-1.4492a0.33639 0.33639 0 0 0-0.23828-0.097656z" fill="#fff" stroke-width=".52389"/>
</svg>`;

const ICON_INFO = `<svg width="32" height="32" version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<path d="m1.6397 0.49839h5.2163c0.63356 0 1.1436 0.51005 1.1436 1.1436v3.83c0 0.63356-0.51005 1.1436-1.1436 1.1436l-2.0655 0.041342-1.8192 1.3427 0.54046-1.384h-1.872c-0.63356 0-1.1436-0.51005-1.1436-1.1436v-3.83c0-0.63356 0.51005-1.1436 1.1436-1.1436z" fill="#ececec" stroke-width=".29427"/>
<path d="m4.103 1.9561c-0.3426 0-0.62096 0.24685-0.62096 0.55066 0 0.30381 0.27836 0.55066 0.61025 0.55066 0.3533 0 0.63167-0.24685 0.63167-0.55066 0-0.30381-0.27836-0.55066-0.62096-0.55066z" fill="#000080" stroke-width=".25205"/>
<path d="m4.7552 3.6379-2.191 0.038907v0.15209h0.59436c0.44285 0.00353 0.50112 0.024758 0.50112 0.17685v1.0116c-0.01164 0.053055-0.02332 0.074277-0.06993 0.091962-0.08157 0.031833-0.303 0.045981-0.80413 0.049518h-0.08157v0.12733h3.0184v-0.12733h-0.08157c-0.78082-0.00707-0.88571-0.024759-0.88571-0.15209v-0.15563z" fill="#000080" stroke-width=".16051"/>
</svg>`;

const ICON_QUESTION = `<svg width="32" height="32" version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="4.2374" cy="4.2692" rx="3.6992" ry="3.7484" fill="#000080"/>
<path d="m4.8395 5.9237q0 0.23059-0.17562 0.3913-0.17562 0.16071-0.42928 0.16071-0.25757 0-0.43709-0.16071-0.17952-0.16071-0.17952-0.3913 0-0.22709 0.17952-0.38431 0.17952-0.15722 0.43709-0.15722 0.25367 0 0.42928 0.15722 0.17562 0.15722 0.17562 0.38431z" fill="#fff" stroke-width=".18906"/>
<path d="m5.5497 2.9486q0 0.20872-0.10927 0.379-0.10927 0.16753-0.27318 0.31308-0.16001 0.14556-0.32391 0.28013-0.16001 0.13457-0.26928 0.27463-0.10927 0.14006-0.10927 0.29935 0 0.030209 0.01561 0.085137 0.01561 0.054927 0.01561 0.054927l-0.48782-0.0054933q-0.070246-0.10161-0.11708-0.21147-0.042928-0.1126-0.042928-0.27738 0-0.16753 0.093662-0.32407 0.097564-0.15929 0.22245-0.30484 0.12488-0.14556 0.21854-0.26914 0.097564-0.12359 0.097564-0.21971 0-0.14556-0.13659-0.24168-0.13659-0.096122-0.38245-0.096122-0.23415 0-0.33952 0.074151-0.10537 0.074151-0.1483 0.15105h-0.28879q-0.085856-0.054926-0.14049-0.13732-0.050733-0.08239-0.050733-0.14556 0-0.10985 0.12098-0.23344 0.12488-0.12633 0.39416-0.21421 0.26928-0.090629 0.69856-0.090629 0.43319 0 0.73368 0.12633 0.3005 0.12359 0.4527 0.32132 0.1561 0.19499 0.1561 0.41195z" fill="#fff" stroke-width=".16762"/>
</svg>`;

const ICON_WARNING = `<svg width="32" height="32" version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<path transform="matrix(.20595 0 0 .1924 3.8511 -.31824)" d="m1.875 9.1397 18.269 31.643-18.269-1e-6h-18.269l9.1345-15.821z" fill="#ff7f2a"/>
<path d="m4.751 6.4121q0 0.20413-0.14691 0.34641-0.14691 0.14227-0.35911 0.14227-0.21547 0-0.36564-0.14227-0.15017-0.14227-0.15017-0.34641 0-0.20104 0.15017-0.34022 0.15017-0.13918 0.36564-0.13918 0.2122 0 0.35911 0.13918 0.14691 0.13918 0.14691 0.34022z" fill="#fff" stroke-width=".16269"/>
<path d="m4.8197 3.7022q0 0.098082-0.022286 0.19403-0.022286 0.093818-0.057939 0.20683l-0.31198 1.0832h-0.43232l-0.2897-1q-0.040112-0.15139-0.075767-0.26013-0.035655-0.11088-0.035655-0.22815 0-0.25373 0.16045-0.37101 0.1649-0.11727 0.46351-0.11727 0.29415 0 0.44569 0.10661 0.15599 0.10661 0.15599 0.38593z" fill="#fff" stroke-width=".15783"/>
</svg>
`;

class MessageBoxButton {
	Text = 'button'
	
	constructor(text) {
		this.Text = text;
	}

}

class MessageBox {
	static ButtonOkCancel = Object.freeze({ok:new MessageBoxButton('Ok'), cancel:new MessageBoxButton('Cancel')})
	static ButtonYesNo = Object.freeze({yes:new MessageBoxButton('Yes'), no:new MessageBoxButton('No')})
	static ButtonYesNoCancel = Object.freeze({yes:new MessageBoxButton('Yes'), no:new MessageBoxButton('No'), cancel:new MessageBoxButton('Cancel')})

	static async Show (message, config) { return await MessageBox_Show(message, config) }
	static async Error(message) { return await MessageBox_Error(message) }
	static async Info(message) { return await MessageBox_Info(message) }
	static async Warning(message) { return await MessageBox_Warning(message) }
	static async Confirm(message, buttons) { return await MessageBox_Confirm(message, buttons) }
}





function Create(message, config) {
	const dialog = document.createElement('dialog');
    dialog.classList.add('fgta5-messagebox-dialog');

	dialog.addEventListener('close', (evt) => {
		dialog.parentNode.removeChild(dialog);
	});
	

    if (config.title) {
		dialog.divTitle = document.createElement('div');
		dialog.divTitle.classList.add('fgta5-messagebox-title');
		dialog.divTitle.innerHTML = config.title;
		dialog.appendChild(dialog.divTitle);
    }

	 if (config.iconSvg!==undefined) {
		var iconcss = iconsCss[config.iconcss] ? iconsCss[config.iconcss] : config.iconcss;
		dialog.divIcon = document.createElement('div');
		dialog.divIcon.classList.add('fgta5-messagebox-icon');
		// dialog.divIcon.style.backgroundImage = `url:("data:image/svg+xml,${encodeURIComponent(config.iconSvg)}")`
		dialog.divIcon.innerHTML = config.iconSvg;
		dialog.appendChild(dialog.divIcon);
	} else if (config.iconcss!=undefined) {
		var iconcss = iconsCss[config.iconcss] ? iconsCss[config.iconcss] : config.iconcss;
		dialog.divIcon = document.createElement('div');
		dialog.divIcon.classList.add('fgta5-messagebox-icon');
		dialog.divIcon.classList.add(iconcss);
		dialog.appendChild(dialog.divIcon);
	}

	dialog.divContent = document.createElement('div');
	dialog.divContent.classList.add('fgta5-messagebox-content');
	dialog.divContent.innerHTML = message;
	dialog.appendChild(dialog.divContent);

	dialog.divButtons = document.createElement('div');
	dialog.divButtons.classList.add('fgta5-messagebox-buttonsbar');
	dialog.appendChild(dialog.divButtons);
	
	document.body.appendChild(dialog);
	return dialog
}


async function MessageBox_Show(message, config) {
	if (config === undefined) config = {};

	var dialog = Create(message, config);
	return new Promise((resolve)=>{
		if (config.buttons) {
			for (const [key, btn] of Object.entries(config.buttons)) {
				const btnEl = document.createElement('button');
				btnEl.classList.add('fgta5-messagebox-button');
				btnEl.innerHTML = btn.Text;
				btnEl.addEventListener('click', () => {
					dialog.close();
					resolve(key);
				});
				dialog.divButtons.appendChild(btnEl);
			}
		} else {
			const btnOk = document.createElement('button');
			btnOk.classList.add('fgta5-messagebox-button');
			btnOk.innerHTML = 'Ok';
			btnOk.addEventListener('click', () => {
				dialog.close();
				resolve('ok');
			});
			dialog.divButtons.appendChild(btnOk); 
		}
	
		dialog.showModal();
	});
}


async function MessageBox_Error(message) {
	return await MessageBox_Show(message, {iconSvg: ICON_ERROR})
}

async function MessageBox_Info(message) {
	return await MessageBox_Show(message, {iconSvg: ICON_INFO})
}
async function MessageBox_Warning(message) {
	return await MessageBox_Show(message, {iconSvg: ICON_WARNING})
}
async function MessageBox_Confirm(message, buttons) {
	buttons = buttons===undefined ? MessageBox.ButtonOkCancel : buttons; 

	return await MessageBox_Show(message, {
		iconSvg: ICON_QUESTION,
		buttons: buttons
	})
}

class Modal  {
	static Show (content) { return Modal_Show() }
	static Mask (message) { return Modal_Mask(message) }
	static Progress (config) { return Modal_Progress(config) }
}


function CreateModal() {
	const modal = document.createElement('dialog');
	modal.classList.add('fgta5-modal-message');
	modal.addEventListener('close', (evt) => {
		modal.parentNode.removeChild(modal);
	});
	document.body.appendChild(modal);
	modal.showModal();
	return modal
}


function Modal_Show(content) {
	const modal = CreateModal();
	return modal
}

function Modal_Mask(message) {
	message =  message===undefined ? 'Please wait ...' : message;
	
	const modal = CreateModal();

	var infoContainer = document.createElement('div');
	infoContainer.classList.add('fgta5-modal-loadermask-msg');
	modal.appendChild(infoContainer);

	var spinner = document.createElement('div');
	spinner.classList.add('fgta5-modal-loadermask-msg-icon');
	spinner.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><radialGradient id="a11" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)"><stop offset="0" stop-color="#575757"></stop><stop offset=".3" stop-color="#575757" stop-opacity=".9"></stop><stop offset=".6" stop-color="#575757" stop-opacity=".6"></stop><stop offset=".8" stop-color="#575757" stop-opacity=".3"></stop><stop offset="1" stop-color="#575757" stop-opacity="0"></stop></radialGradient><circle transform-origin="center" fill="none" stroke="url(#a11)" stroke-width="30" stroke-linecap="round" stroke-dasharray="200 1000" stroke-dashoffset="0" cx="100" cy="100" r="70"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="1.8" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></circle><circle transform-origin="center" fill="none" opacity=".2" stroke="#575757" stroke-width="30" stroke-linecap="round" cx="100" cy="100" r="70"></circle></svg>`;
	infoContainer.appendChild(spinner);

	var infoText = document.createElement('div');
	infoText.classList.add('fgta5-modal-loadermask-msg-text');
	infoText.innerHTML = message;
	infoContainer.appendChild(infoText);

	modal.setText = (message) => {
		infoText.innerHTML = message;
	};

	return modal
}


function Modal_Progress(config) {
	if (config === undefined) config = {};
	

	const modal = CreateModal();

	modal.IsError = false;
	

	var prgBarErrIcon = document.createElement('div');
	modal.appendChild(prgBarErrIcon);

	var prgBarContainer = document.createElement('div');
	prgBarContainer.classList.add('fgta5-modal-progressbar-container');
	modal.appendChild(prgBarContainer);

	var prgBar = document.createElement('label');
	prgBar.classList.add('fgta5-modal-progressbar');
	prgBarContainer.appendChild(prgBar);

	var prgMsg = document.createElement('div');
	prgMsg.classList.add('fgta5-modal-progressbar-text');
	modal.appendChild(prgMsg);

	modal.setProgress = function (progress, message) {
		if (progress > 100) progress = 100;
		prgBar.innerHTML = `${progress}%`;
		prgBar.style.width = `${progress}%`;
		prgMsg.innerHTML = message;
	};


	modal.setError = function (message) {
		modal.IsError = true;

		prgBarErrIcon.classList.add('fgta5-icon-error');
		prgBarErrIcon.style.height = '32px';
		prgBarErrIcon.style.marginBottom = '10px';

		prgMsg.innerHTML = message;
		prgMsg.setAttribute('error', 'true');
		prgBar.setAttribute('error', 'true');
	};

	modal.finish = function (text, completed) {
		if (text===undefined) text = 'Done';
		if (completed===undefined) completed = true;

		if (config.buttonClose===true || modal.IsError) {
			if (completed) {
				prgMsg.style.display = 'none';
				prgBar.style.width = '100%';
				prgBar.innerHTML = '100%';
			}

			var div = document.createElement('div');
			div.style.textAlign = 'center';
			div.style.marginTop = '10px';
			div.style.marginBottom = '0';
			var btn = document.createElement('button');
			btn.classList.add('fgta5-modal-button');
			btn.innerHTML = text;
			btn.addEventListener('click', () => {
				modal.close();
			});
			div.appendChild(btn);
			modal.appendChild(div);
		} else {
			modal.close();
		}
	};

	return modal
}

const MENU = `<svg version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="square">
	<rect x="19.5" y="19.5" width="12" height="12" fill="currentColor"/>
	<rect x="2" y="20" width="12" height="12" fill="currentColor"/>
	<rect x="20" y="2" width="12" height="12" fill="currentColor"/>
	<rect x="2" y="2" width="12" height="12" fill="currentColor"/>
  </g>
</svg>`;

const CLOSE = `<svg version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <g stroke="currentColor" stroke-linecap="round" stroke-width="5">
	<path d="M4 4 L28 28"/>
	<path d="M4 28 L28 4"/>
  </g>
</svg>`;

const BACK = `<svg version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<path d="m5.5873 1.1684-2.515 3.0773 2.515 3.0773" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.3229"/>
</svg>`;

const ACTION = `<svg version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<path d="m3.4777 0.49839-1.3861 4.1094h1.945l-1.2743 3.3919 3.7782-4.663h-1.9226l1.252-2.8383z"/>
</svg>`;

const USER = `<svg version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<g stroke="#fff" fill="currentColor" stroke-linecap="round" stroke-width=".223">
<path d="m4.2633 4.9935c-0.85356-0.0027456-2.0017 0.17383-2.3611 0.28348-0.35939 0.10964-0.71426 0.67396-0.71727 0.93517 0.62166 0.68677 2.0469 1.1278 3.0784 1.3222 1.0315-0.19439 2.4572-0.6354 3.0789-1.3222-0.0030132-0.26121-0.35788-0.82553-0.71727-0.93517-0.35939-0.10964-1.5081-0.28622-2.3616-0.28348z"/>
<path d="m3.9018 5.7326-0.37517 1.8759 0.69032 0.57026 0.73534-0.55525-0.36016-1.8909z" stroke-linejoin="bevel"/>
<rect x="3.8568" y="4.9072" width=".76535" height=".76535" stroke-linejoin="bevel"/>
<circle cx="4.2238" cy="2.7633" r="2.0523"/>
</g>
</svg>`;


const LOGOUT = `<svg version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<g stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="bevel">
<path d="m5.0725 0.70989h-4.3649v7.0783h4.3649z" fill="none" stroke-width=".423"/>
<path d="m5.0725 0.70989-3.1237 2.5006 0.021392 4.5776h-1.2627l-2.6e-7 -7.0783z" stroke-width=".423"/>
<path d="m3.1515 5.0723h3.4527v1.3606l1.3955-1.9759-1.3955-1.9759v1.3606h-3.4527z" stroke-width=".423"/>
</g>
</svg>`;

const SEARCH = `<svg version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="currentColor" stroke-linecap="square">
<circle cx="4.9312" cy="3.5669" r="2.7378" stroke-width=".66146"/>
<path d="m1.1989 7.1728 0.88885-0.80617" stroke-width="1.3229"/>
</g>
</svg>`;

const SETTING = `<svg version="1.1" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<g transform="matrix(.82343 0 0 .82343 4.0086 7.2155)" fill="currentColor" stroke-width="1.2144">
<path d="m0 0h48v48h-48z" fill="none"/>
<path d="m38.86 25.95c0.08-0.64 0.14-1.29 0.14-1.95s-0.06-1.31-0.14-1.95l4.23-3.31c0.38-0.3 0.49-0.84 0.24-1.28l-4-6.93c-0.25-0.43-0.77-0.61-1.22-0.43l-4.98 2.01c-1.03-0.79-2.16-1.46-3.38-1.97l-0.75-5.3c-0.09-0.47-0.5-0.84-1-0.84h-8c-0.5 0-0.91 0.37-0.99 0.84l-0.75 5.3c-1.22 0.51-2.35 1.17-3.38 1.97l-4.98-2.01c-0.45-0.17-0.97 0-1.22 0.43l-4 6.93c-0.25 0.43-0.14 0.97 0.24 1.28l4.22 3.31c-0.08 0.64-0.14 1.29-0.14 1.95s0.06 1.31 0.14 1.95l-4.22 3.31c-0.38 0.3-0.49 0.84-0.24 1.28l4 6.93c0.25 0.43 0.77 0.61 1.22 0.43l4.98-2.01c1.03 0.79 2.16 1.46 3.38 1.97l0.75 5.3c0.08 0.47 0.49 0.84 0.99 0.84h8c0.5 0 0.91-0.37 0.99-0.84l0.75-5.3c1.22-0.51 2.35-1.17 3.38-1.97l4.98 2.01c0.45 0.17 0.97 0 1.22-0.43l4-6.93c0.25-0.43 0.14-0.97-0.24-1.28zm-14.86 5.05c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
</g>
</svg>`;


const HOME = `<svg version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<g fill="currentColor">
<rect x="4.2337" y="3.9367" width="3.0541" height="4.063"/>
<rect x="1.2121" y="3.9367" width=".9332" height="4.0184"/>
<path d="m4.2479 1.0276 3.7518 3.4383-7.5035-1e-7z"/>
<rect x="1.6787" y="3.9367" width="3.2135" height="1.4646"/>
</g>
</svg>`;


const TRASH = `<svg version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg">
<g fill="currentColor">
<path d="m6.5113 2.4805h-4.775l0.85705 5.5191h3.0609z" stroke-linecap="square" stroke-width="1.3229"/>
<path d="m3.2115 0.40101v0.41341h-1.8266v0.86816h5.519v-0.86816h-1.8462v-0.41341z"/>
</g>
</svg>`;

const DIRDEF = '<svg width="32" height="32" version="1.1" viewBox="0 0 8.4667 8.4667" xmlns="http://www.w3.org/2000/svg"><rect x=".4961" y="3.9307" width="7.5035" height="4.0689"/><path d="m0.4961 3.2521h7.5035l1e-7 -0.71184h-4.2386l-0.87664-1.3525h-2.3883z"/><rect x="5.8727" y="5.303" width="1.2058" height="1.1077" fill="#fff"/></svg>';



const UNSORT = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
<path d="m2.1656 5.2663 3.8057-4.6994 3.8057 4.6994z" fill="currentColor"/>
<path d="m2.1656 6.6955 3.8057 4.6994 3.8057-4.6994z" fill="currentColor"/>
</svg>`;

const SORTASC = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
<path d="m2.1943 9.1198 3.8057-6.5338 3.8057 6.5338z" fill="currentColor"/>
</svg>`;

const SORTDESC = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
<path d="m2.1943 2.586 3.8057 6.5338 3.8057-6.5338z" fill="currentColor"/>
</svg>
`;

const YES = `<svg width="1rem" height="1rem" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
<circle cx="15" cy="15" r="12" stroke="currentColor" stroke-width="1" fill="none" />
<circle cx="15" cy="15" r="8" fill="currentColor" />
</svg>`;

const NO = `<svg width="1rem" height="1rem" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
<circle cx="15" cy="15" r="12" stroke="currentColor" stroke-width="1" fill="none" />
</svg>`;

const NEWDOCUMENT = `<svg version="1.1" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<g stroke-linecap="round" stroke-linejoin="bevel" stroke-width="2">
<path d="m40 34.75v-30.75h-30v41h20z" fill="#e6e6e6" stroke="#000"/>
<circle cx="25" cy="21" r="9" fill="#59f" stroke="#000"/>
<path d="m30 45v-10h10z"/>
<path d="m20 21h10" stroke="#fff"/>
<path d="m25 16v10" stroke="#fff"/>
</g>
</svg>`;


class Icons {
	static get MENU() { return MENU }
	static get CLOSE() { return CLOSE }
	static get BACK() { return BACK }
	static get ACTION() { return ACTION }
	static get USER() { return USER }
	static get LOGOUT() { return LOGOUT }
	static get SEARCH() { return SEARCH }
	static get SETTING() { return SETTING }
	static get HOME() { return HOME }
	static get TRASH() { return TRASH }
	static get DIRDEF() { return DIRDEF }
	static get UNSORT() { return UNSORT }
	static get SORTASC() { return SORTASC }
	static get SORTDESC() { return SORTDESC }
	static get YES() { return YES }
	static get NO() { return NO }
	static get NEWDOCUMENT() { return NEWDOCUMENT }
}

const ATTR_ROWSELECTOR = 'rowselector';
const ATTR_AUTONUMBER = 'autonumber';
const ATTR_BINDING = 'binding';
const ATTR_SORTING = 'sorting';
const ATTR_FORMATTER = 'formatter';
const ATTR_TEXTALIGN = 'text-align';
const ATTR_ROWSELECTED = 'data-selected';
const ATTR_COLNAME = 'data-name';
const ATTR_VALUE = 'data-value';
const ATTR_ROWKEY = 'key';
const ATTR_ROWKEYVALUE = 'keyvalue';
const ATTR_ROWPROCESSING = 'data-rowprocessing';
const ATTR_MAINHEADROW = 'data-mainrowhead'; // menandai row utama header (berisi contol sorting)
const ATTR_LINENUMBER = "linenumber";

const TYPE_ROWSELECTOR = 'rowselector';
const TYPE_AUTONUMBER = 'autonumber';
const TYPE_STANDARD = 'standard';

const CellClickEvent = (data) => { return new CustomEvent('cellclick', data) };
const CellDblClickEvent = (data) => { return new CustomEvent('celldblclick', data) };
const RowRenderEvent = (data) => { return new CustomEvent('rowrender', data) };
const RowRemovingEvent = (data) => { return new CustomEvent('rowremoving', data) };
const SortingEvent = (data) => { return new CustomEvent('sorting', data) };
const NextDataEvent = (data) => { return new CustomEvent('nextdata', data) };

class Gridview extends Component {
	constructor(id) {
		super(id);
		
		var el = this.Element;
		if (el!=undefined) {
			if (el.tagName.toLowerCase()!='table' ) {
				throw new Error(`element '${id}' is not table`)
			}
			Gridview_construct(this);
		} else {
			throw new Error(`element id '${id}' for gridview is not defined`)
		}
	}

	AddRow(row) {
		Gridview_AddRows(this, row);
	}

	AddRows(rows) {
		Gridview_AddRows(this, rows);
	}

	SetNext(nextoffset, limit) {
		// GridView_SetNext(this, nextoffset, limit)
	}

	#columndata
	get Columns() { return this.#columndata }
	setColumnData(columndata) {
		this.#columndata = columndata;
	}

	#key
	get Key() { return this.#key }
	setKey(key) {
		this.#key = key;
	}


	RemoveSelected(onFinished) {
		GridView_RemoveSelected(this, onFinished);
	}

	HasRowPendingProcess() {
		return GridView_HasRowPendingProcess(this)
	}

	addEventListener(evt, callback) {
		this.Listener.addEventListener(evt, callback);
	}

	Clear() {
		this.Nodes.Tbody.innerHTML = '';
	}

	SetNext(nextoffset, limit)  {
		GridView_SetNext(this, nextoffset, limit);
	}

	GetSort() {
		return GridView_GetSort(this)
	}

	#criteria = {}
	get Criteria() { return this.#criteria } 
	SetCriteria(criteria) {
		this.#criteria = criteria;
	}
}


function Gridview_construct(self) {
	var tbl = self.Element;
	var thead = tbl.querySelector('thead');
	var tbody = document.createElement('tbody');
	var tfoot = document.createElement('tfoot');
	
	
	// tambahkan tbody dan tfoot sebelum thead
	tbl.prepend(tfoot);
	tbl.prepend(tbody);

	// tambahkan referensi elemen 
	self.Listener = new EventTarget();
	self.Nodes = {
		Table: tbl,
		Thead: thead,
		Tbody: tbody,
		Tfoot: tfoot
	};


	// setup table
	tbl.classList.add('fgta5-gridview');
	tbl.setAttribute('cellspacing', 0);
	

	// baca kolom
	const {headrow, columns, key} =Gridview_getColumns(self);
	self.setColumnData(columns);
	self.setKey(key);

	// create header
	headrow.remove();
	Gridview_setupHeader(self, columns);

	


	// const columns = Gridview_getColumns()
	// Gridview_createTableHaeder(self, tbl)


}


function Gridview_getColumns(self) {
	var columns = [];
	var thead = self.Nodes.Thead;
	var headrow = thead.querySelector("tr[data-header]");
	var ths = headrow.querySelectorAll("th");
	for (var th of ths) {
		let column = {};
		var rowselector = th.getAttribute(ATTR_ROWSELECTOR);
		var autonumber = th.getAttribute(ATTR_AUTONUMBER);
		var binding = th.getAttribute(ATTR_BINDING);
		var name = th.getAttribute(ATTR_COLNAME);
		var formatter = th.getAttribute(ATTR_FORMATTER);
		var textalign = (th.getAttribute(ATTR_TEXTALIGN) ?? '').toLowerCase();
		var sorting = (th.getAttribute(ATTR_SORTING) ?? '').toLowerCase() === "true" ? true : false;
		var cssclass = th.getAttribute('class');
		var cssstyle = th.getAttribute('style');
		var html = th.innerHTML;
		
		

		// baca tipe column
		if (rowselector!=null) {
			column.type = TYPE_ROWSELECTOR;
		} else if (autonumber!=null) {
			column.type = TYPE_AUTONUMBER;
		} else {
			column.type = TYPE_STANDARD;
		}

		// ambil daftar class
		column.cssclass = cssclass;
		column.cssstyle = cssstyle;
		column.binding = binding;
		column.name = name; 
		column.formatter = formatter;
		column.textalign = textalign=='' ? 'left' : textalign;
		column.sorting = sorting;
		column.html = html;

		columns.push(column);
	}

	var key = headrow.getAttribute(ATTR_ROWKEY);

	return {
		headrow: headrow,
		columns: columns,
		key: key
	}
}


function Gridview_setupHeader(self, columns) {
	var tr = document.createElement('tr');
	tr.setAttribute(ATTR_MAINHEADROW, '');

	for (let column of columns) {
		var th = document.createElement('th');

		setAttributeIfNotNull(th, 'class', column.cssclass);
		setAttributeIfNotNull(th, 'style', column.cssstyle);
		setAttributeIfNotNull(th, ATTR_COLNAME, column.name);

		th.classList.add('fgta5-gridview-head');
		th.setAttribute(ATTR_TEXTALIGN, column.textalign);

		if (column.type==TYPE_ROWSELECTOR) {
			var chk = createCheckbox();
			chk.addEventListener('change', (evt)=>{ Gridview_headerCheckboxChange(self, evt);});
			
			th.appendChild(chk);
			th.setAttribute(ATTR_ROWSELECTOR, '');

		} else if (column.type==TYPE_AUTONUMBER) {
			th.setAttribute(ATTR_AUTONUMBER, '');
			th.innerHTML = column.html;
		} else {

			if (column.sorting) {
				var container = document.createElement('span');
				container.setAttribute('container', '');
				container.setAttribute(ATTR_TEXTALIGN, column.textalign);

				let sortbtn = document.createElement('button');
				sortbtn.innerHTML = Icons.UNSORT;
				sortbtn.setAttribute(ATTR_SORTING, '');
				sortbtn.setAttribute(ATTR_BINDING, column.binding);
				sortbtn.addEventListener('click', (evt)=>{ Gridview_sort(self, sortbtn); });

				var text = document.createElement('div');
				text.innerHTML = column.html;

				container.appendChild(sortbtn);
				container.appendChild(text);

				th.classList.add('fgta5-gridview-colwithbutton');
				th.appendChild(container);

			} else {

				var text = document.createTextNode(column.html);
				th.appendChild(text);
			}
		
			
			
			
		}

		tr.appendChild(th);
	}
	self.Nodes.Thead.appendChild(tr);
}




function setAttributeIfNotNull(el, attrname, attrvalue) {
	if (attrvalue!=null) {
		el.setAttribute(attrname, attrvalue);
	}
}

function createCheckbox() {
	var chk = document.createElement('label');
	var input = document.createElement('input');
	var span = document.createElement('span');

	chk.classList.add('fgta5-gridview-checkbox');
	chk.appendChild(input);
	chk.appendChild(span);
	chk.checkbox = input;

	input.setAttribute('type', 'checkbox');

	span.classList.add('fgta5-gridview-checkmark');

	return chk
}


function Gridview_headerCheckboxChange(self, evt) {
	var headchk = evt.target;
	var trs = self.Nodes.Tbody.querySelectorAll('tr');
	for (var tr of trs) {
		var chk = tr.querySelector(`td[${ATTR_ROWSELECTOR}] input[type="checkbox"]`);
		chk.checked = headchk.checked;
		if (headchk.checked) {
			tr.setAttribute(ATTR_ROWSELECTED, '');
		} else {
			tr.removeAttribute(ATTR_ROWSELECTED);
		}
	}
}

function Gridview_rowCheckboxChange(self, evt) {
	var chk = evt.target;
	var tr = chk.closest('tr');
	if (chk.checked) {
		tr.setAttribute(ATTR_ROWSELECTED, '');
	} else {
		tr.removeAttribute(ATTR_ROWSELECTED);

		// uncheck header
		var headchk = self.Nodes.Thead.querySelector(`tr th[${ATTR_ROWSELECTOR}] input[type="checkbox"]`);
		headchk.checked = false;
	}
}

function Gridview_AddRows(self, rows) {
	var tbody = self.Nodes.Tbody;
	for (var row of rows) {
		GridView_AddRow(self, row, tbody);
	}
}


function GridView_AddRow(self, row, tbody) {
	if (tbody===undefined) {
		tbody = self.Nodes.Tbody;
	}

	

	var tr = document.createElement('tr');
	tr.classList.add('fgta5-gridview-row');

	var key = self.Key;
	if (key!=null) {
		var keyvalue = row[key];
		if (keyvalue!=null) {
			tr.setAttribute(ATTR_ROWKEY, key);
			tr.setAttribute(ATTR_ROWKEYVALUE, keyvalue);
		}
	}

	for (var column of self.Columns) {
		let td = document.createElement('td');

		setAttributeIfNotNull(td, 'class', column.cssclass);
		setAttributeIfNotNull(td, ATTR_COLNAME, column.name);
		setAttributeIfNotNull(td, ATTR_BINDING, column.binding);
		setAttributeIfNotNull(td, ATTR_FORMATTER, column.formatter);
		setAttributeIfNotNull(td, ATTR_TEXTALIGN, column.textalign);

		td.classList.add('fgta5-gridview-cell');
	
		if (column.type==TYPE_ROWSELECTOR) {
			var chk = createCheckbox();
			chk.addEventListener('change', (evt)=>{ Gridview_rowCheckboxChange(self, evt); });
			td.appendChild(chk);
			td.setAttribute(ATTR_ROWSELECTOR, '');
		} else if (column.type==TYPE_AUTONUMBER) {
			var linenumber = GridView_getLastLineNumber(self);

			linenumber++;
			td.setAttribute(ATTR_AUTONUMBER, '');
			td.setAttribute(ATTR_LINENUMBER, linenumber);
			td.innerHTML = linenumber;
			td.addEventListener('click', (evt)=>{ GridView_cellClick(self, td, tr); });
			td.addEventListener('dblclick', (evt)=>{ GridView_cellDblClick(self, td, tr); });
		} else {
			var value = row[column.binding];
			td.setAttribute(ATTR_VALUE, value);
			if (value!=null) {
				if (column.formatter!=null) {
					try {
					// 	eval(`value=${column.formatter}`)
						const func = Gridview_createFunction(column.formatter, value);
						value = func(value);
					} catch (err) {
						console.error(err);
					}
					

				}
				td.innerHTML = value;
				
			} else {
				td.innerHTML = '';
			}
			td.addEventListener('click', (evt)=>{ GridView_cellClick(self, td, tr); });
			td.addEventListener('dblclick', (evt)=>{ GridView_cellDblClick(self, td, tr); });
		}

		
	
		tr.appendChild(td);
	}

	GridView_rowRender(self, tr);
	tbody.appendChild(tr);
	

}


function GridView_cellClick(self, td, tr) {
	self.Listener.dispatchEvent(CellClickEvent({
		detail: {tr: tr, td: td}
	}));
}

function GridView_cellDblClick(self, td, tr) {
	self.Listener.dispatchEvent(CellDblClickEvent({
		detail: {tr: tr, td: td}
	}));
}

function GridView_rowRender(self, tr) {
	self.Listener.dispatchEvent(RowRenderEvent({
		detail: {tr: tr}
	}));
}

function Gridview_sort(self, btn) {
	var sorting = btn.getAttribute(ATTR_SORTING);
	var binding = btn.getAttribute(ATTR_BINDING);
	var th = btn.closest('th');
	
	th.setAttribute(ATTR_BINDING, binding);

	if (sorting==null || sorting=='') {
		// ubah ke ascending
		th.setAttribute(ATTR_SORTING, 'asc');
		btn.setAttribute(ATTR_SORTING, 'asc');
		btn.innerHTML = Icons.SORTASC;
	} else if (sorting=='asc') {
		// ubah ke desc
		th.setAttribute(ATTR_SORTING, 'desc');
		btn.setAttribute(ATTR_SORTING, 'desc');
		btn.innerHTML = Icons.SORTDESC;
	} else {
		// ubah ke unsort
		th.removeAttribute(ATTR_SORTING);
		btn.setAttribute(ATTR_SORTING, '');
		btn.innerHTML = Icons.UNSORT;
	}

	// ambil semua kolom yang di sort
	const tr = btn.closest('tr');
	const sort = GridView_GetSort(self, tr);
	const criteria = self.Criteria;

	self.Listener.dispatchEvent(SortingEvent({
		detail: {
			sort: sort,
			criteria: criteria
		
		}
	}));

}


function GridView_RemoveSelected(self, onFinished) {
	var chks = self.Nodes.Tbody.querySelectorAll(`tr td[${ATTR_ROWSELECTOR}] input[type="checkbox"]:checked`);
	if (chks.length==0) {
		if (typeof onFinished==='function') {
			onFinished();
		}
		return
	}


	for (var chk of chks) {
		let tr = chk.closest('tr');
		tr.MarkProcessing = (p)=>{
			if (p===true || p===undefined) {
				tr.setAttribute(ATTR_ROWPROCESSING, '');
			} else {
				tr.removeAttribute(ATTR_ROWPROCESSING);
			}
		};

		let evt = RowRemovingEvent({
			detail: {
				tr: tr,
				onFinished: onFinished
			}
		});

		tr.MarkProcessing();
		self.Listener.dispatchEvent(evt);
		if (!evt.handled) {
			tr.MarkProcessing(false);
			tr.remove();
		}
	}
}


function GridView_HasRowPendingProcess(self) {
	var rows = self.Nodes.Tbody.querySelectorAll(`tr[${ATTR_ROWPROCESSING}]`);

	console.log(rows.length);
	if (rows.length > 0) {
		return true
	} else {
		return false
	}
}


function GridView_SetNext(self, nextoffset, limit) {
	var nextoffsetcontainer = self.Nodes.Tfoot.querySelector('tr[data-nextoffset]');
	if (nextoffsetcontainer!=null) {
		nextoffsetcontainer.remove();
	}
	
	

	if (nextoffset!=null) {
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		var next = document.createElement('a');

		next.innerHTML = 'load next data';
		next.setAttribute('href', 'javascript:void(0)');
		next.addEventListener('click', (evt)=>{
			self.Listener.dispatchEvent(NextDataEvent({
				detail: {
					criteria: self.Criteria,
					nextoffset: nextoffset,
					limit: limit,
					sort: self.GetSort()
				}
			}));
		});
	
		var colspan = self.Nodes.Tbody.rows[0].cells.length;
		td.setAttribute('colspan', colspan);
		td.setAttribute('align', 'center');
		td.setAttribute('data-nextoffset', '');
		td.appendChild(next);
		
		tr.setAttribute('data-nextoffset', '');
		tr.appendChild(td);
		self.Nodes.Tfoot.appendChild(tr);
	
	} 
}

function  GridView_GetSort(self, tr) {
	if (tr==null) {
		tr = self.Nodes.Thead.querySelector(`tr[${ATTR_MAINHEADROW}]`);
	}

	var ths = tr.querySelectorAll(`th[${ATTR_SORTING}]`);
	var sort = {};
	for (var th of ths) {
		var sorting = th.getAttribute(ATTR_SORTING);
		var binding = th.getAttribute(ATTR_BINDING);
		sort[binding] = sorting;
	}

	return sort
}


function GridView_getLastLineNumber(self) {
	var lastrow = self.Nodes.Tbody.querySelector('tr:last-child td[autonumber]');
	if (lastrow==null) {
		return 0
	}

	var lastlinenumber = lastrow.getAttribute(ATTR_LINENUMBER);
	if (lastlinenumber==null) {
		return 0
	}

	return Number(lastlinenumber)
}


function Gridview_createFunction(expression) {
    const match = expression.match(/(\w+)\(([^)]+)\)/);
    if (!match) return null;

    const [, funcName, args] = match;
    const parsedArgs = args.split(",").map(arg => parseFloat(arg.trim()));

    if (funcName === "decimal") {
        return (v) => Gridview_formatDecimal(v, parsedArgs[1]);
    } else if (funcName === 'checkmark') {
		return (v) => Gridview_formatCheckmark(v)
	}
    return null;
}


function Gridview_formatDecimal (value, precision)  { 
	const formatterFixed = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: precision,
		maximumFractionDigits: precision
	});
	return formatterFixed.format(value)
}

function Gridview_formatCheckmark(value) {
	const yes = Icons.YES;
	const no = Icons.NO;

	if (value===undefined || value===null) {
		return no
	}

	if (value===false) {
		return no
	}

	if (value=='0' || value=='' ||value=='-' || value==0) {
		return no
	}

	return yes
}

const ICON_DEFAULT = `<svg version="1.1" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<g fill="currentColor">
<path d="m20.019 2c-2.9332 0-5.2348 2.3057-5.2348 5.2389v3.1417h-8.3806c-2.3047 0-4.1903 1.8856-4.1903 4.1903v7.9628h3.1417c3.1427 0 5.6567 2.514 5.6567 5.6567 0 3.1427-2.514 5.6567-5.6567 5.6567h-3.3547v7.9628c0 2.3047 1.8856 4.1903 4.1903 4.1903h7.9628v-3.1458c0-3.1427 2.514-5.6567 5.6567-5.6567 3.1427 0 5.6567 2.514 5.6567 5.6567v3.1458h7.9628c2.3047 0 4.1903-1.8856 4.1903-4.1903v-8.3806h3.1417c2.9332 0 5.2389-2.3057 5.2389-5.2389 0-2.9332-2.3057-5.2389-5.2389-5.2389h-3.1417v-8.3806c0-2.3047-1.8856-4.1903-4.1903-4.1903h-8.3806v-3.1417c0.20951-2.9332-2.0968-5.2389-5.03-5.2389z"/>
</g>
</svg>`;



class ModuleData {
	constructor(param) {
		this.#name = param.name;
		this.#title = param.title;
		this.#disabled = param.disabled;
		this.#icon = param.icon;
		this.#url = param.url;
	}

	static get ICON_DEFAULT() { return ICON_DEFAULT }

	#name
	get name() { return this.#name }

	#title
	get title() { return this.#title }

	#disabled
	get disabled() { return this.#disabled===true ? true : false}

	#icon
	get icon() { return this.#icon }

	#url 
	get url() { return this.#url }
}

const ATTR_NAVSHOWED = 'showed';
const ATTR_MODULENAME = 'data-module';
const ATTR_FAVOURITE = "data-favourite";
const ATTR_OPENEDMODULE = 'data-openedmodule';
const ATTR_CURRENTUSER = 'data-currentuser';
const ATTR_MENUICONCONTAINER = 'data-iconcontainer';
const ATTR_MENUICONIMAGE = 'data-iconimage';
const ATTR_MENUICONTEXT = 'data-icontext';
const ATTR_GRIDAREA = 'data-gridarea';
const ATTR_SHORTCUT_ICON = 'data-icon';
const ATTR_SHORTCUT_TITLE = 'data-title';
const ATTR_SHORTCUT_INFO = 'data-info';
const ATTR_SHORTCUT_CLOSE = 'data-buttonclose';
const ATTR_DRAGOVER = 'data-dragover';
const ATTR_LABEL = 'data-label';
const ATTR_ICON = 'data-icon';
const ATTR_MAINBUTTON = 'data-mainbutton';
const ATTR_DRAGGABLE = 'draggable';

const CLS_BUTTONHEAD$1 = 'fgta5-button-head';
const CLS_BUTTONMENU = 'fgta5-button-menu';
const CLS_SHORTCUTBUTTONCLOSE = 'fgta5-button-shorcutclose';
const CLS_HIDDEN$1 = 'hidden';

const EVT_CLICK = 'click';
const EVT_DRAGSTART = 'dragstart';

const TXT_FAVOURITE = 'Favourite Programs';
const TXT_OPENED = 'Opened Programs';

const C_SHORTCUT_PREFIX = 'fgta5-sch-mod-';



const ActionEvent = (data) => { return new CustomEvent('action', data) };
const LogoutEvent = (data) => { return new CustomEvent('logout', data) };
const OpenProfileEvent = (data) => { return new CustomEvent('openprofile', data) };
const OpenSettingEvent = (data) => { return new CustomEvent('opensetting', data) };
const AddToFavouriteEvent = (data) => { return new CustomEvent('addtofavourite', data) };
const RemoveFromFavouriteEvent = (data) => { return new CustomEvent('removefavourite', data) };


let current_dragged_modulename;
let current_drag_action;

class AppManager extends Component {
	constructor(id) {
		super(id);
		AppManager_construct(this);
		AppManager_listenMessage(this);
	}


	RootIcons

	#modules = {}
	get Modules() { return this.#modules }


	#title
	get Title() { return this.#title }
	SetTitle(title) {
		this.#title = title;
		AppManager_SetTitle(this, title);
	}

	SetMenu(data) {
		AppManager_SetMenu(this, data);
	}

	ShowMenu() {
		AppManager_ShowMenu(this);	
	}

	

	SetFavourite(data) {
		AppManager_SetFavourite(this, data);
	}

	async OpenModule(module) {
		await AppManager_OpenModule(this, module);
		AppManager_closeMenu(this);
	}

	#userdata
	get User() { return this.#userdata }
	SetUser(data) {
		this.#userdata = data;
		AppManager_SetUser(this, data);
	}
	

	addEventListener(evt, callback) {
		this.Listener.addEventListener(evt, callback);
	}
}

function AppManager_construct(self) {
	console.log('constructiong application manager');

	const title = document.createElement('span');
	const main = self.Element;  
	const head = document.createElement('header');
	const iframes = document.createElement('div');
	const nav = document.createElement('nav');
	const favourite = main.querySelector(`div[${ATTR_FAVOURITE}]`);
	const trahsbox = document.createElement('div');
	const currentuser = main.querySelector(`div[${ATTR_CURRENTUSER}]`);
	const btnmenu = AppManager_createHeadButton(self, Icons.MENU, ()=>{
		AppManager_ShowMenu(self);
	});
	
	main.after(head);
	head.after(iframes);
	iframes.after(nav);

	title.innerHTML = 'Application Manager'; // default title, nanti diganti dengan SetTitle


	head.classList.add('fgta5-app-head');
	head.appendChild(title);
	head.appendChild(btnmenu);

	main.classList.add('fgta5-app-main');
	nav.classList.add('fgta5-appmanager-nav');

	const {Opened} = AppManager_createOpenedBoard(self, main);
	const {MenuBoard, MenuFooter, ProfileButton, LogoutButton, MenuResetButton} = AppManager_createMenuBoard(self, nav);


	self.Listener = new EventTarget();
	self.Nodes = {
		Head: head,
		Nav: nav,
		Main: main,
		IFrames: iframes,
		Favourite: favourite,
		Opened: Opened,
		Currentuser: currentuser,
		MenuBoard: MenuBoard,
		MenuFooter: MenuFooter, 
		ProfileButton: ProfileButton,
		LogoutButton: LogoutButton,
		MenuResetButton: MenuResetButton,
		TrashBox: trahsbox,
		Title: title
	};

}

function AppManager_listenMessage(self) {
	window.addEventListener("message", (evt) => {
		if (evt.data.action!=undefined) {
			var action = evt.data.action;
			if (action==Component.ACTION_SHOWMENU) {
				AppManager_ShowMenu(self);
			} else if (action==Component.ACTION_SHOWHOME) {
				AppManager_showHome(self);
			} else if (action==Component.ACTION_APPLICATIONLOADED) ;
		}
	});


	window.history.pushState(null, "", window.location.href);
	window.addEventListener("popstate", function(evt) {
		evt.preventDefault();
		window.history.pushState(null, "", window.location.href);
	});
}




function AppManager_createHeadButton(self, svg, fn_click) {
	return Component.CreateSvgButton(svg, CLS_BUTTONHEAD$1, fn_click )
}

function AppManager_SetTitle(self, title) {
	self.Nodes.Title.innerHTML = title;
}


function AppManager_createMenuBoard(self, nav) {
	const menuhead = document.createElement('div');
	const btnmenureset = AppManager_createHeadButton(self, Icons.MENU, ()=>{ AppManager_ResetMenu(self); });
	const divcenter = document.createElement('div');
	const btnclose = AppManager_createHeadButton(self, Icons.CLOSE, ()=>{ AppManager_closeMenu(self); });
	const main = document.createElement('div');
	const toppanel = document.createElement('div');
	const toppanel_left = document.createElement('div');
	const toppanel_center = document.createElement('div');
	const toppanel_right = document.createElement('div');
	const txtsearch = document.createElement('input');
	const btnsearch = document.createElement('button');
	const btnlogout = document.createElement('a');
	
	
	const menuboard = document.createElement('div');
	const footer = document.createElement('div');
	const divleft = document.createElement('div');

	
	// divleft untuk button reset
	divleft.appendChild(btnmenureset);

	// header
	menuhead.setAttribute('header', '');
	menuhead.appendChild(divleft);
	menuhead.appendChild(divcenter);
	menuhead.appendChild(btnclose);
	divcenter.innerHTML = 'Menu';


	// footer
	footer.classList.add(CLS_HIDDEN$1);
	footer.classList.add('fgta5-menu-footer');
	footer.appendChild(btnlogout);



	// main
	main.setAttribute('main', '');
	main.appendChild(toppanel);
	main.appendChild(menuboard);
	main.appendChild(footer);
	main.addEventListener('scroll', ()=>{
		 if (main.scrollTop > 10) {
			menuhead.classList.add('fgta5-fixheader-scrolled');
		 } else {
			menuhead.classList.remove('fgta5-fixheader-scrolled');
		 }
	});


	// top panel: home, search, logout, profile
	toppanel.classList.add('fgta5-menu-toppanel');
	toppanel.appendChild(toppanel_left);
	toppanel.appendChild(toppanel_center);
	toppanel.appendChild(toppanel_right);


	// home
	const btnhome = Component.CreateSvgButton(Icons.HOME, CLS_BUTTONMENU, ()=>{
		AppManager_showHome(self);
	});

	// setting
	const btnsetting = Component.CreateSvgButton(Icons.SETTING, CLS_BUTTONMENU, ()=>{
		AppManager_openSetting(self);
	});
	
	
	// search
	const menusearch = document.createElement('div');
	menusearch.classList.add('fgta5-menu-search');
	menusearch.appendChild(txtsearch);
	menusearch.appendChild(btnsearch);

	txtsearch.classList.add('fgta5-menu-search');
	txtsearch.setAttribute('name', 'menusearch');
	txtsearch.setAttribute('placeholder', 'search module');
	txtsearch.addEventListener('keydown', (evt)=>{
		if (evt.key=='Enter') {
			AppManager_searchModule(self, txtsearch.value);
		}
	});

	btnsearch.classList.add('fgta5-menu-search');
	btnsearch.innerHTML = Icons.SEARCH;
	btnsearch.addEventListener(EVT_CLICK, (evt)=>{
		txtsearch.focus();
		AppManager_searchModule(self, txtsearch.value);
	});


	// user
	const btnprofile = Component.CreateSvgButton(Icons.USER, CLS_BUTTONMENU);
	btnprofile.classList.add(CLS_HIDDEN$1);
	

	// toppanel content
	toppanel_left.setAttribute(ATTR_GRIDAREA, 'left');
	toppanel_left.appendChild(btnhome);
	toppanel_left.appendChild(btnsetting);
	
	toppanel_center.setAttribute(ATTR_GRIDAREA, 'center');
	toppanel_center.appendChild(menusearch);


	toppanel_right.setAttribute(ATTR_GRIDAREA, 'right');
	toppanel_right.appendChild(btnprofile);


	// main menuboard
	menuboard.classList.add('fgta5-menu');


	// button logout
	btnlogout.innerHTML = `<div icon>${Icons.LOGOUT}</div><div>Sign Out</div>`;
	btnlogout.setAttribute('href', 'javascript:void(0)');


	// setup nav
	nav.appendChild(main);
	nav.appendChild(menuhead);




	return {
		MenuBoard: menuboard,
		MenuFooter: footer,
		ProfileButton: btnprofile,
		LogoutButton: btnlogout,
		MenuResetButton: btnmenureset
	}
}	


function AppManager_ShowMenu(self) {
	console.log('show menu');
	const nav = self.Nodes.Nav;

	nav.setAttribute(ATTR_NAVSHOWED, '');
}

function AppManager_showHome(self) {
	AppManager_closeMenu(self);
	self.Nodes.IFrames.classList.add(CLS_HIDDEN$1);
}

function AppManager_closeMenu(self) {
	const nav = self.Nodes.Nav;
	nav.removeAttribute(ATTR_NAVSHOWED);
}


function AppManager_iframeLoaded(self, iframe, module) {
	// client iframe kirim message ke parent window
	// informasi bahwa client sudah selesai di load
	iframe.contentWindow.postMessage({
		action: Component.ACTION_APPLICATIONLOADED,
		module: {
			title: module.title,
			name: module.name
		}
	}, '*');

	// saat module pertama di load
	self.Listener.dispatchEvent(ActionEvent({
		detail: {
			name: 'moduleloaded',
			modulename: module.name,
			title: module.title,
			iframe: iframe
		}
	}));

	// module terbuka
	self.Listener.dispatchEvent(ActionEvent({
		detail: {
			name: 'moduleopened',
			modulename: module.name,
			title: module.title,
			iframe: iframe
		}
	}));

	// tambahkan di recent app
	AppManager_addOpenedModule(self, iframe, module);
}

function AppManager_iframeReOpen(self, iframe, module) {
	// tampilkan iframe
	iframe.classList.remove(CLS_HIDDEN$1);

	// module terbuka
	self.Listener.dispatchEvent(ActionEvent({
		detail: {
			name: 'moduleopened',
			modulename: module.name,
			title: module.title,
			iframe: iframe
		}
	}));

	// untuk geser shortcut ke awal
	AppManager_addOpenedModule(self, iframe, module);
}



async function AppManager_OpenModule(self, module) {
	const iframes = self.Nodes.IFrames;
	const modulename = module.name;

	

	const qry = `iframe[${ATTR_MODULENAME}="${modulename}"]`;
	const ifr = iframes.querySelector(qry);
	if (ifr==null) {
		// buka iframe baru
		const mask = $fgta5.Modal.Mask('Please wait...');

		var url = module.url ?? 'demo-application';
		let newframe = document.createElement('iframe');
		newframe.classList.add('fgta5-iframe');
		newframe.classList.add(CLS_HIDDEN$1);
		newframe.setAttribute(ATTR_MODULENAME, modulename);
		
		newframe.onload = (evt) => {
			AppManager_iframeLoaded(self, newframe, module);
			newframe.classList.remove(CLS_HIDDEN$1);
			mask.close();
		};

		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP Error: ${response.status}`);
				}
				newframe.src = url;
				iframes.appendChild(newframe);
				self.Nodes.IFrames.classList.remove(CLS_HIDDEN$1);
			}).catch(error => {
				$fgta5.MessageBox.Error(error);
				mask.close();
			});
	} else {	
		// tampilkan iframe
		// hide semua iframe kecuali iframe yang akan dibuka
		var frames = iframes.querySelectorAll('iframe');
		for (var f of frames) {
			var fname = f.getAttribute(ATTR_MODULENAME);
			if (fname==modulename) {
				AppManager_iframeReOpen(self, f, module);
			} else {
				f.classList.add(CLS_HIDDEN$1);
			}
		} 
		self.Nodes.IFrames.classList.remove(CLS_HIDDEN$1);
	}
}


function AppManager_SetFavourite(self, data)	 {
	// apakah div untuk favourite sudah didefinisikan
	if (self.Nodes.Favourite==null) {
		return
	}
	
	const favourite = self.Nodes.Favourite;
	const title = document.createElement('div');
	const trahscontainer = self.Nodes.TrashBox;
	const trashbox = document.createElement('div');
	const trashicon = document.createElement('div');
	const trashlabel = document.createElement('div');
	
	// <div class='fgta5-roundbox'>?</div>
	title.innerHTML = `${TXT_FAVOURITE}&nbsp;&nbsp;&nbsp;&nbsp;`;
	title.classList.add('fgta5-appmanager-home-subtitle');

	trashicon.setAttribute(ATTR_ICON, '');
	trashicon.innerHTML = Icons.TRASH;
	
	trashicon.setAttribute(ATTR_LABEL, '');
	trashlabel.innerHTML = 'Delete';

	trashbox.setAttribute(ATTR_MAINBUTTON,'');
	trashbox.appendChild(trashicon);
	trashbox.appendChild(trashlabel);

	trahscontainer.classList.add('fgta5-favourite-trashcontainer');
	trahscontainer.classList.add(CLS_HIDDEN$1);
	trahscontainer.appendChild(trashbox);
	self.Nodes.Head.after(trahscontainer);


	favourite.before(title);
	favourite.classList.add('fgta5-menu');
	favourite.classList.add('fgta5-favourite');
	favourite.addEventListener('dragover', (evt)=>{ AppManager_FavouriteDragOver(self, evt, favourite); });
	favourite.addEventListener('dragleave', (evt)=>{ AppManager_FavouriteDragLeave(self, evt, favourite); });
	favourite.addEventListener('drop', (evt)=>{ AppManager_FavouriteDrop(self, evt, favourite);  });

	for (let modulename of data) {
		let module = self.Modules[modulename];
		if (module!=null) {
			let mi = AppManager_CreateModuleIcon(self, module.data);
			AppManager_setAsFavouriteIcon(self, mi, modulename, favourite);
			favourite.appendChild(mi);
		}
	}
}



function AppManager_CreateModuleIcon(self, module) {
	const container = document.createElement('div');
	const icon = document.createElement('div');
	const text = document.createElement('div');
	
	container.setAttribute('name', module.name);
	container.setAttribute(ATTR_MENUICONCONTAINER, '');
	if (module.disabled) {
		container.setAttribute('disabled', '');
	}

	icon.setAttribute(ATTR_MENUICONIMAGE, '');
	if (module.icon!=null) {
		icon.setAttribute(ATTR_MENUICONIMAGE, '');
		icon.style.backgroundImage = `url('${module.icon}')`;
	} else {
		icon.innerHTML = ModuleData.ICON_DEFAULT;
	}

	text.innerHTML = module.title;
	text.setAttribute(ATTR_MENUICONTEXT, '');


	container.appendChild(icon);
	container.appendChild(text);

	icon.addEventListener(EVT_CLICK, ()=>{
		self.OpenModule(module);
		icon.style.animation = 'iconClicked 0.2s forwards';
		setTimeout(()=>{
			icon.style.animation = 'unset';
			AppManager_closeMenu(self);
		}, 300);
	});
	return container
}


function AppManager_CreateGroupIcon(self, group) {
	const container = document.createElement('div');
	const icon = document.createElement('div');
	const text = document.createElement('div');
	
	container.setAttribute(ATTR_MENUICONCONTAINER, '');
	if (group.disabled) {
		container.setAttribute('disabled', '');
	}


	icon.setAttribute(ATTR_MENUICONIMAGE, '');
	if (group.icon!=null) {
		// tampilkan icon sesuai data
		icon.style.backgroundImage = `url('${group.icon}')`;
	} else {
		// tampilkan icon standard
		icon.style.backgroundImage = `url('data:image/svg+xml,${encodeURIComponent(Icons.DIRDEF)}')`;
	}

	text.innerHTML = group.title;
	text.setAttribute(ATTR_MENUICONTEXT, '');


	container.appendChild(icon);
	container.appendChild(text);

	icon.addEventListener(EVT_CLICK, ()=>{
		icon.style.animation = 'iconClicked 0.4s forwards';
		
		setTimeout(()=>{
			icon.style.animation = 'unset';
		}, 400);

		setTimeout(()=>{
			AppManager_PopulateMenuIcons(self, group.icons, group.parent);
		}, 200);
	});



	return container
}


function AppManager_SetMenu(self, data) {
	self.RootIcons = AppManager_ReadMenu(self, data);
	AppManager_PopulateMenuIcons(self, self.RootIcons);
}


function AppManager_ResetMenu(self) {
	AppManager_PopulateMenuIcons(self, self.RootIcons);

}

function AppManager_ReadMenu(self, data) {
	let icons = [];
	for (var node of data) {
		if (node instanceof $fgta5.ModuleData) {
			// module
			let module = node;
			let mi = AppManager_CreateModuleIcon(self, module);
			icons.push(mi);

			// set keyword
			var keyword;
			if (node.keyword!=null) {
				keyword = `${node.name} : ${node.keyword}`;
			} else {
				keyword = node.name;
			}

			// add moduledata to library
			self.Modules[node.name] = {
				keyword: keyword,
				data: node
			};
		} else {
			// direktory
			var groupicons = AppManager_ReadMenu(self, node.items);
			var di = AppManager_CreateGroupIcon(self, {
				title: node.title,
				icon: node.icon,
				icons: groupicons,
				parent: icons
			});
			if (node.border!==false) {
				di.classList.add('fgta5-icongroup');
			}
			icons.push(di);
		}
		
	}
	return icons
}

function AppManager_PopulateMenuIcons(self, icons, parent) {
	const menuboard = self.Nodes.MenuBoard;
	const menureset = self.Nodes.MenuResetButton;

	/* tambahkan back icon jika belum ada */
	if (parent!=null) {
		if (icons[0].isbackIcon!==true) {
			var backicon = {
				title: '',
				icon: `data:image/svg+xml,${encodeURIComponent(Icons.BACK)}`,
				icons: parent,
				parent: parent.parent
			};
			var di = AppManager_CreateGroupIcon(self, backicon);
			di.isbackIcon = true;
			icons.unshift(di);
		}

		// munculkan tombol reset menu kiri atas
		menureset.classList.remove(CLS_HIDDEN$1);

	} else {
		// sembunyikan tombol reset menu kiri atas
		menureset.classList.add(CLS_HIDDEN$1);

	}
	

	menuboard.style.animation = "fadeOutLeft 0.05s forwards";
	setTimeout(()=>{
		menuboard.innerHTML = '';
		menuboard.style.animation = "fadeInRight 0.3s forwards";
		for (var icon of icons) {
			menuboard.appendChild(icon);
		}
	}, 50);
} 

async function AppManager_searchModule(self, searchtext) {
	if (searchtext.trim()=='') {
		if (self.previousSearch===undefined) {
			self.previousSearch='';
			return
		}

		if (searchtext==self.previousSearch) {
			return
		}

		self.previousSearch='';
		AppManager_ResetMenu(self);
		return
	}

	self.previousSearch=searchtext;

	const menuboard = self.Nodes.MenuBoard;
	const modules = self.Modules;

	menuboard.innerHTML = '';
	var i = 0;
	for (var modulename in modules) {
		if (modulename.toLowerCase().includes(searchtext)) {
			i++;
			var module = modules[modulename];
			if (module!=null) {
				var mi = AppManager_CreateModuleIcon(self, module.data);
				mi.style.animation = 'dropped 0.3s forwards';
				menuboard.appendChild(mi);
				if (i<10) {
					await Component.Sleep(100);
				}
				
			}
		}
	}
}

function AppManager_SetUser(self, data) {
	const btnprofile = self.Nodes.ProfileButton;
	const btnlogout = self.Nodes.LogoutButton;

	// munculkan footer menu untuk logout
	self.Nodes.MenuFooter.classList.remove(CLS_HIDDEN$1);

	// munculkan profile icon
	btnprofile.classList.remove(CLS_HIDDEN$1);
	btnprofile.addEventListener(EVT_CLICK, (evt)=>{
		AppManager_profileClick(self);
	});


	btnlogout.addEventListener(EVT_CLICK, (evt)=>{
		AppManager_logout(self);
	});
	// munculkan nama di home
	self.Nodes.Currentuser.innerHTML = data.displayname;

}

function AppManager_profileClick(self) {
	self.Listener.dispatchEvent(OpenProfileEvent({
		detail: {
			user: self.User,
		}
	}));
}

async function AppManager_logout(self) {
	var ret = await $fgta5.MessageBox.Confirm("are you sure to log out ?");
	if (ret=='ok') {
		self.Listener.dispatchEvent(LogoutEvent({
			detail: {
				user: self.User,
			}
		}));
	}
}

async function AppManager_openSetting(self) {
	self.Listener.dispatchEvent(OpenSettingEvent({
		detail: {
			user: self.User,
		}
	}));
}

function AppManager_createOpenedBoard(self, main) {
	const opened = main.querySelector(`div[${ATTR_OPENEDMODULE}]`);
	const title = document.createElement('div');
	

	opened.classList.add('fgta5-openedmodule');

	title.innerHTML = `${TXT_OPENED}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
	title.classList.add('fgta5-appmanager-home-subtitle');
	title.classList.add(CLS_HIDDEN$1);

	opened.classList.add(CLS_HIDDEN$1);
	opened.before(title);
	opened.hide = () => {
		title.classList.add(CLS_HIDDEN$1);
		opened.classList.add(CLS_HIDDEN$1);
	};

	opened.show = () => {
		title.classList.remove(CLS_HIDDEN$1);
		opened.classList.remove(CLS_HIDDEN$1);
	};

	return {
		Opened: opened
	}
}

function AppManager_addOpenedModule(self, iframe, module) {
	const opened = self.Nodes.Opened;
	const id = `${C_SHORTCUT_PREFIX}-${module.name}`;
	const shortcut = document.getElementById(id);
	if (shortcut==null) {
		// tambahkan di awal
		const newshortcut = AppManager_createOpenedShortcut(self, module, iframe, id);
		opened.prepend(newshortcut);
	} else {
		// geser di awal
		opened.prepend(shortcut);
	}

	opened.show();
}


function AppManager_createOpenedShortcut(self, module, iframe, id) {
	const opened = self.Nodes.Opened;
	const shortcut = document.createElement('div');
	const icon = document.createElement('div'); 
	const title = document.createElement('div');
	const info = document.createElement('div');
	const closebutton = document.createElement('a');

	shortcut.id = id;
	shortcut.classList.add('fgta5-openedmodule-shortcut');
	shortcut.setAttribute(ATTR_DRAGGABLE, 'true');
	shortcut.appendChild(icon);
	shortcut.appendChild(title);
	shortcut.appendChild(info);
	shortcut.appendChild(closebutton);
	shortcut.addEventListener(EVT_CLICK, async (evt)=>{ await AppManager_OpenModule(self, module); });
	shortcut.addEventListener(EVT_DRAGSTART, (evt)=>{ AppManager_DragModule(self, evt, module); });


	icon.setAttribute(ATTR_SHORTCUT_ICON, '');
	if (module.icon!=null) {
		icon.style.backgroundImage = `url('${module.icon}')`;
	} else {
		icon.innerHTML = ModuleData.ICON_DEFAULT;
	}

	title.setAttribute(ATTR_SHORTCUT_TITLE, '');	
	title.innerHTML = module.title;

	info.setAttribute(ATTR_SHORTCUT_INFO, '');
	info.innerHTML = 'idle';


	var btn = Component.CreateSvgButton(Icons.CLOSE, CLS_SHORTCUTBUTTONCLOSE, (evt)=>{
		evt.stopPropagation();
		iframe.remove();
		shortcut.remove();

		if (opened.childNodes.length==0) {
			opened.hide();
		}
	});

	closebutton.setAttribute(ATTR_SHORTCUT_CLOSE, '');
	closebutton.appendChild(btn);

	return shortcut
}

function AppManager_DragModule(self, evt, module) {
	current_drag_action = 'addtofave';
	evt.dataTransfer.setData('modulename', module.name);
	current_dragged_modulename = module.name;
}

function AppManager_FavouriteDragOver(self, evt, favourite) {
	if (current_drag_action=='addtofave') {
		var exist = favourite.querySelector(`[name="${current_dragged_modulename}"]`);
		if (exist==null) {
			evt.preventDefault();
			favourite.setAttribute(ATTR_DRAGOVER, '');
		}
	} 
	// else if (current_drag_action=='removefromfave') {
	// 	favourite.setAttribute(ATTR_DRAGOVER, '')
	// }

}

function AppManager_FavouriteDragLeave(self, evt, favourite) {
	favourite.removeAttribute(ATTR_DRAGOVER);
}

function AppManager_FavouriteDrop(self, evt, favourite) {
	favourite.removeAttribute(ATTR_DRAGOVER);

	const modulename = evt.dataTransfer.getData('modulename');
	if (modulename=='') {
		return
	}

	var exist = favourite.querySelector(`[name="${modulename}"]`);
	if (exist==null) {
		evt.preventDefault();
		const module = self.Modules[modulename];
		let mi = AppManager_CreateModuleIcon(self, module.data);
		AppManager_setAsFavouriteIcon(self, mi, modulename, favourite);
		favourite.prepend(mi);
		self.Listener.dispatchEvent(AddToFavouriteEvent({
			detail: {
				modulename: modulename,
			}
		}));
	}
}

function AppManager_setAsFavouriteIcon(self, mi, modulename, favourite) {
	const trahsbox = self.Nodes.TrashBox;
	const trashbutton = trahsbox.querySelector(`[${ATTR_MAINBUTTON}]`);

	mi.setAttribute(ATTR_DRAGGABLE, 'true');
	mi.addEventListener(EVT_DRAGSTART, (evt)=>{
		current_drag_action = 'removefromfave';
		evt.dataTransfer.setData('modulename', modulename);
		trahsbox.classList.remove(CLS_HIDDEN$1);
	});

	mi.addEventListener('dragend', (evt)=>{
		setTimeout(()=>{
			trahsbox.classList.add(CLS_HIDDEN$1);
			trashbutton.removeAttribute(ATTR_DRAGOVER);
		}, 100);
	});
	

	trashbutton.addEventListener('dragover', (evt)=>{
		if (current_drag_action=='removefromfave') {
			evt.preventDefault();
			trashbutton.setAttribute(ATTR_DRAGOVER, '');
		}
	});

	trashbutton.addEventListener('dragleave', (evt)=>{
		trashbutton.removeAttribute(ATTR_DRAGOVER);
	});

	trashbutton.addEventListener('drop', (evt)=>{
		if (current_drag_action=='removefromfave') {
			const modulename = evt.dataTransfer.getData('modulename');
			if (modulename=='') {
				return
			}

			var icon = favourite.querySelector(`[name="${modulename}"]`);
			if (icon!=null) {
				icon.style.animation = 'removing 0.3s forwards';
				setTimeout(()=>{
					icon.remove();
				}, 300);
				
				self.Listener.dispatchEvent(RemoveFromFavouriteEvent({
					detail: {
						modulename: modulename,
					}
				}));
			}
			evt.preventDefault();
			current_drag_action = '';
		}
	});	
}

const CLS_HIDDEN = 'hidden';
const CLS_SECTION = 'fgta5-app-section';


const ATTR_ACTIVE = 'data-active';
const ATTR_TITLE = 'data-title';
const ATTR_TOPBAR = 'data-topbar';
const ATTR_BACKBUTTON = 'data-backbutton';

const DIR_LEFT = 0;
const DIR_RIGHT = 1;

const EVT_BACKBUTTONCLICK = 'backbuttonclick';
const EVT_SECTIONSHOWING$1 = 'sectionshowing';

const BackButtonClickEvent = (data) => { return new CustomEvent(EVT_BACKBUTTONCLICK, data) };
const SectionShowingEvent$1 = (data) => { return new CustomEvent(EVT_SECTIONSHOWING$1, data) };


class Section {
	#id
	#element
	#index
	#name
	#title
	#previoussection
	#carousell
	#fn_getActiveSection
	#listener = new EventTarget()

	static get ATTR_ACTIVE() { return ATTR_ACTIVE }
	static get DIR_LEFT() { return DIR_LEFT }
	static get DIR_RIGHT() { return DIR_RIGHT }
	static get EVT_BACKBUTTONCLICK() { return EVT_BACKBUTTONCLICK }
	static get EVT_SECTIONSHOWING() { return EVT_SECTIONSHOWING$1 }


	get Id() { return this.#id } 
	get Index() { return this.#index }
	get Name() { return this.#name }
	get Title()  { return this.#title }
	get Element() { return this.#element }
	get PreviousSection() { return this.#previoussection}
	get getActiveSection() { return this.#fn_getActiveSection }
	get Listener() { return this.#listener }
	get Carousell() { return this.#carousell } 

	set Title(v) {
		this.#title = v;
		Section_SetTitle(this, v);
	}


	constructor(el, args) {
		const id = el.id;
		const name = id;
		const title = el.getAttribute(ATTR_TITLE);

		this.#element = el;
		this.#id = id;
		this.#name = name;
		this.#title = title ?? 'section';
		
		if (args!=null) {
			if (args.index!=null) {
				this.#index = args.index;
			}

			this.#carousell = args.carousell;

			if (typeof args.fn_getActiveSection === 'function') {
				this.#fn_getActiveSection = args.fn_getActiveSection;
			} else {
				this.#fn_getActiveSection = ()=>{return null};
			}
		}
		SectionConstruct(this); 
	}




	async Show(args, fn_callback) {
		const currSection = this.getActiveSection();
		this.#previoussection = currSection; // set current session ke previous untuk keperluan back
		await Section_Show(this, args, fn_callback);
	}

	addEventListener(eventname, callback) {
		this.Listener.addEventListener(eventname, callback);
	}	
}



function SectionConstruct(self, args) {
	const el = self.Element;
	
	el.setAttribute('name', self.Name);
	el.classList.add(CLS_SECTION);
	if (self.Index==0) {
		// jadikan index section pertama yang active
		el.setAttribute(ATTR_ACTIVE, '');
	} else {
		// sembunyikan semua section berikutnya
		el.classList.add(CLS_HIDDEN);
	}


	// set title
	const topbar = document.createElement('div');
	const title = document.createElement('div');
	const backbutton = Component.CreateSvgButton(Icons.BACK, '', ()=>{
		// back ke previous section
		Section_BackButtonClick(self);
	});


	topbar.setAttribute(ATTR_TOPBAR, '');
	topbar.appendChild(backbutton);
	topbar.appendChild(title);
	

	backbutton.setAttribute(ATTR_BACKBUTTON, '');
	if (self.Index==0) {
		backbutton.classList.add('hidden');
	}

	title.setAttribute(ATTR_TITLE, self.Title);
	title.innerHTML = self.Title;


	
	el.prepend(topbar);

	self.Nodes = {
		BackButton: backbutton,
		Title: title
	};

}


async function Section_Show(self, args, fn_callback) {
	if (typeof fn_callback==='function') {
		await fn_callback();
	}

	let direction = DIR_LEFT; // Geser ke kiri
	if (args!=undefined) {
		direction = args.direction ?? DIR_LEFT;
	}

	let moving = [
		{curr:'fadeOutLeft 0.1s forwards', comming:'fadeInRight 0.3s forwards'}, // geser kiri
		{curr:'fadeOutRight 0.1s forwards', comming:'fadeInLeft 0.3s forwards'} // geser kanan
	];
	

	const commingSection = self;
	const comming = commingSection.Element;
	const currSection = self.PreviousSection;
	if (currSection!=null) {
		if (commingSection.Name==currSection.Name) {
			return
		}

		// CATATAN:
		// untuk showing section, selalu arah akan ke kiri (arah kanan digunakan saat back)
		// curr: fadeOutLeft // yang saat ini muncul, buang ke kiri
		// comming: fadeInRight // yang baru akan muncul dari kanan

		const curr = currSection.Element;


		// trigger event showing
		self.Carousell.SetCurrentSection(commingSection);
		self.Carousell.DispatchSectionShowing(currSection, commingSection);
		self.Listener.dispatchEvent(SectionShowingEvent$1({
			data: {
				currSection: currSection,
				commingSection: commingSection
			}
		}));
		

		// taruh dulu yang akan data ke kanan, posisi hiden
		comming.style.animation = 'unset';

		// lalu keluarkan curr, buang ke kiri (fadeOutLeft)
		curr.style.animation = moving[direction].curr; // `fadeOutLeft 0.3s forwards` 
		setTimeout(()=>{
			curr.classList.add(CLS_HIDDEN); // sembunyikan current
			curr.style.animation = 'unset';
			curr.removeAttribute(ATTR_ACTIVE);

			// tarik comming masuk dari kanan
			comming.classList.remove(CLS_HIDDEN);
			comming.style.animation = moving[direction].comming; //  'fadeInRight 0.3s forwards' 
			setTimeout(()=>{
				comming.style.animation = 'unset';
				comming.setAttribute(ATTR_ACTIVE, '');
			}, 300);
		}, 100);		


	} else {
		// langsung munculkan tanpa animasi
		comming.classList.remove(CLS_HIDDEN);
		comming.setAttribute(ATTR_ACTIVE, '');
	}
	
}


function Section_BackButtonClick(self) {
	// back to self.PreviousSection
	self.Listener.dispatchEvent(BackButtonClickEvent({
		cancelable: true,
		detail: {
			fn_ShowNextSection: ()=>{
				self.PreviousSection.Show({direction:DIR_RIGHT});
			}
		}
	}));
}


function Section_SetTitle(self, v) {
	self.Nodes.Title.innerHTML = v;
}

const CLS_BUTTONHEAD = 'fgta5-button-head';


const ID_TITLE = 'application-title';
const ATTR_WITHFOOTER = 'data-withfooter';


class App extends Component {
	constructor(id) {
		super(id);
		App_construct(this);
	}

	// #sections = {}
	// get Sections() { return this.#sections}
	// RenderSection() {
		// App_RenderSection(this)
	// }
	SetTitle(title) {
		App_SetTitle(this, title);
	}


	ShowFooter(show) {
		App_ShowFooter(this, show);
	}
}

function App_construct(self) {
	console.log('constructiong application');

	const main = self.Element;  
	const head = document.createElement('header');
	const footer = document.createElement('footer');

	main.after(head);
	head.after(footer);

	head.classList.add('fgta5-app-head');

	main.classList.add('fgta5-app-main');

	footer.classList.add('fgta5-app-footer');
	footer.classList.add('hidden');

	App_createHeader(self, head);
	App_createFooter(self, footer);

	self.Nodes = {
		Head: head,
		Main: main,
		Footer: footer
	};

	window.addEventListener("load", (event) => {
		console.log('application loaded.');
		window.parent.postMessage({
			action: Component.ACTION_APPLICATIONLOADED
		}, '*');

	});

	window.addEventListener("message", (evt) => {
		const args = evt.data;
		if (args.action!=undefined) {
			var action = args.action;
			if (action==Component.ACTION_APPLICATIONLOADED) {
				if (args.module!=null) {
					if (args.module.title!=null) {
						App_SetTitle(self, args.module.title);
					}
				}
				
			}
		}
	});
}

function App_SetTitle(self, title) {
	document.title = title;
	document.getElementById(ID_TITLE).innerHTML =  title;
}

function App_createHeader(self, head) {
	const divleft = document.createElement('div');
	const title = document.createElement('span');

	const btnmenu = Component.CreateSvgButton(Icons.MENU, CLS_BUTTONHEAD, ()=>{
		App_ShowMenu();
	});

	const btnhome = Component.CreateSvgButton(Icons.HOME, CLS_BUTTONHEAD, ()=>{
		App_ShowHome();
	});

	divleft.appendChild(btnhome);

	title.id = ID_TITLE;
	title.innerHTML = 'loading ...';

	head.appendChild(divleft);
	head.appendChild(title);
	head.appendChild(btnmenu);
}

function App_createFooter(self, footer) {
	footer.innerHTML = 'empty footer content';
}


function App_ShowFooter(self, show) {
	const main = self.Nodes.Main;
	const footer = self.Nodes.Footer;
	if (show) {
		main.setAttribute(ATTR_WITHFOOTER, '');
		footer.classList.remove('hidden');
	} else {
		main.removeAttribute(ATTR_WITHFOOTER);
		footer.classList.add('hidden');
	}
}

function App_ShowMenu(self) {
	window.parent.postMessage({
		action: Component.ACTION_SHOWMENU
	}, '*');
}

function App_ShowHome(self) {
	window.parent.postMessage({
		action: Component.ACTION_SHOWHOME
	}, '*');	
}

const EVT_SECTIONSHOWING = 'sectionshowing';

const SectionShowingEvent = (data) => { return new CustomEvent(EVT_SECTIONSHOWING, data) };


class SectionCarousell {
	#items = {}
	#listener = new EventTarget()
	#currentsection 

	static get EVT_SECTIONSHOWING() { return EVT_SECTIONSHOWING }

	constructor(el) {
		SectionCarousell_Construct(this, el);
	}

	get Items() { return this.#items}
	get Listener() { return this.#listener }
	get CurrentSection() { return this.#currentsection }

	addEventListener(eventname, callback) {
		this.Listener.addEventListener(eventname, callback);
	}	

	SetCurrentSection(section) {
		this.#currentsection = section;
	}

	DispatchSectionShowing(currSection, commingSection) {
		this.Listener.dispatchEvent(SectionShowingEvent({
			currSection: currSection,
			commingSection: commingSection
		}));
	}
}

function SectionCarousell_Construct(self, el) {

	el.classList.add('fgta5-carousellcontainer');

	// ambil semua section yang terdapat di element
	const nodes = el.querySelectorAll('section[class="fgta5-carousell"]'); 
	let i = 0;
	for (let node of nodes) {
		const section = new Section(node, {
			index: i,
			carousell: self,
			fn_getActiveSection: ()=>{
				return SectionCarousell_getActiveSection(self, el)
			}
		});
		const name = section.Name;

		if (self.CurrentSection==null) {
			self.SetCurrentSection(section);
		}

		// masukkan panel ini ke items
		self.Items[name] = section;
		++i;
	}
}


function SectionCarousell_getActiveSection(self, el) {
	// ambil section yang sedang aktif yang ada di el
	const cs = el.querySelector(`section[${Section.ATTR_ACTIVE}]`);

	// name dari section yang aktif
	const name = cs.getAttribute('name');

	// kembalikan object section yang saat ini aktif
	return self.Items[name]
}

function getInvalidMessage(name, input, defaultMessage) {
	var msg = input.getAttribute(`invalid-message-${name}`);
	if (msg == null || msg === '') {
		msg = defaultMessage;
	}
	return msg;
}


function parseFunctionParam(paramString) {
	const [fnName, ...fnParams] = paramString.split(":");
	const fnParamsString = fnParams.length > 0 ? fnParams.join(":") : null;
	
	return {
		fnName,
		fnParams: fnParamsString !== null 
			? (!isNaN(fnParamsString) ? Number(fnParamsString) : fnParamsString) 
			: null
	};
}


function required(value) {
	if (value === null || value === undefined || value === '') {
		return false;		
	}
	return true;
}

function minlength(value, minLength) {
	if (minLength == null || minLength === 0) {
		return true; // no minimum length specified, so always valid
	}
	if (value == null || value.length < minLength) {
		return false; // value is too short
	}
	return true; // value meets the minimum length requirement
}

function maxlength(value, maxLength) {
	if (maxLength == null || maxLength === 0) {
		return true; // no maximum length specified, so always valid
	}
	if (value == null || value.length > maxLength) {
		return false; // value is too long
	}
	return true; // value meets the maximum length requirement
}

function pattern(value, strpattern) {
	return true; // TODO: implement pattern validation
}

function email(value, minLength) {
	return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}

function min(value, minValue) {
	if (minValue == null || minValue === 0) {
		return true; // no minimum value specified, so always valid
	}
	if (value == null || value < minValue) {
		return false; // value is less than minimum
	}
	return true; // value meets the minimum requirement
}

function max(value, maxValue) {
	if (maxValue == null || maxValue === 0) {
		return true; // no maximum value specified, so always valid
	}
	if (value == null || value > maxValue) {
		return false; // value is greater than maximum
	}
	return true; // value meets the maximum requirement
}


function parseDate(value, boundaryDate) {
	var dtparsed = new Date(value);
	var dt = new Date(dtparsed.getFullYear(), dtparsed.getMonth(), dtparsed.getDate());
	var boundary = new Date(boundaryDate.getFullYear(), boundaryDate.getMonth(), boundaryDate.getDate());
	return {
		dt: dt,
		boundary: boundary
	}
}

function mindate(value, minDate) {
	var {dt, boundary} = parseDate(value, minDate);
	if (dt<boundary) {
		return false
	} else {
		return true
	}
}

function maxdate(value, maxDate) {
	var {dt, boundary} = parseDate(value, maxDate);
	if (dt>boundary) {
		return false
	} else {
		return true
	}
	
}


function mintime(value, minTime) {
	if (value<minTime) {
		return false
	} else {
		return true
	}
}

function maxtime(value, maxTime) {
	if (value>maxTime) {
		return false
	} else {
		return true
	}
}

var Validators = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getInvalidMessage: getInvalidMessage,
	parseFunctionParam: parseFunctionParam,
	required: required,
	minlength: minlength,
	maxlength: maxlength,
	pattern: pattern,
	email: email,
	min: min,
	max: max,
	mindate: mindate,
	maxdate: maxdate,
	mintime: mintime,
	maxtime: maxtime
});

const fgta5 = {
	Component: Component,
	Form: Form,
	Button: Button,
	Textbox: Textbox,
	Numberbox: Numberbox,
	Checkbox: Checkbox,
	Datepicker: Datepicker,
	Timepicker: Timepicker,
	Combobox: Combobox,
	Filebox: Filebox,
	MessageBox: MessageBox,
	MessageBoxButton: MessageBoxButton,
	Modal: Modal,
	Dataloader: Dataloader,
	Gridview: Gridview,
	AppManager: AppManager,
	Application: App,
	ModuleData: ModuleData,
	Section: Section,
	SectionCarousell: SectionCarousell,
	Icons: Icons
};


// install to window.$validators
if (window.$validators === undefined) {
	window.$validators = Validators;
} else {
	Object.assign(window.$validators, Validators);
}

// install to window.$fgta5
if (window.$fgta5===undefined || window.$fgta5===null) {
	window.$fgta5 =  fgta5;
} else {
	Object.assign(window.$fgta5, fgta5);
}
