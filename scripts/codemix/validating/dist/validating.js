!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Validating=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
var OBLIGATIONS = _dereq_('obligations');
/**
 * The validator base class.
 * @type {Function}
 */
exports.Validator = _dereq_('./validator');
/**
 * A list of builtin validators.
 * @type {Object}
 */
exports.validators = Object.create(null);
/**
 * Define a validator with the given name.
 *
 * @param  {String}    name        The name of the validator.
 * @param  {Object}    descriptors The descriptors for the validator.
 * @return {Function}              The created validator class.
 */
exports.define = function (name, descriptors) {
    if (typeof descriptors === 'function') {
        exports.validators[name] = descriptors;
    } else {
        exports.validators[name] = exports.Validator.extend(descriptors);
    }
    return exports.validators[name];
};
/**
 * Create an instance of a validator with the given name.
 *
 * @param  {String}    name       The name of the validator to create.
 * @param  {Object}    properties The properties / configuration for the validator.
 * @return {Validator}            The created validator instance.
 */
exports.create = function (name, properties) {
    return exports.validators[name].create(properties);
};
/**
 * Create a function which can validate objects based on the given descriptor.
 *
 * @param  {String}   name        The name of the descriptor.
 * @param  {Object}   descriptor  The descriptor to validate against.
 * @return {Function|null}        The validation function, or null if the descriptor has no rules.
 */
exports.forDescriptor = function (name, descriptor) {
    OBLIGATIONS.precondition(name && typeof name === 'string', 'Name must be specified.');
    OBLIGATIONS.precondition(descriptor && typeof descriptor === 'object', 'Descriptor must be an object.');
    if (!Array.isArray(descriptor.rules)) {
        return null;
    }
    var validators = [], accessor = /^([\w|_|$]+)$/.test(name) ? '.' + name : '["' + name + '"]', lines;
    lines = descriptor.rules.map(processRule).map(function (validator) {
        var index = validators.push(validator) - 1;
        return 'if ((result = validators[' + index + '].validate(value)) !== true) {\n' + '  isValid = false;\n' + '  error = result;\n' + '}\n';
    });
    var body = 'var isValid = true,\n' + '    error, result;\n\n' + lines.join('else ') + '\n' + 'return {valid: isValid, error: error};';
    var fn = new Function('validators', 'value', body);
    // jshint ignore: line
    return fn.bind(undefined, validators);
};
/**
 * Create a function which can validate objects based on the given descriptors.
 *
 * @param  {Object}   descriptors The descriptors to validate against.
 * @return {Function}             The validation function.
 */
exports.forDescriptors = function (descriptors) {
    OBLIGATIONS.precondition(descriptors && typeof descriptors === 'object', 'Descriptors must be an object.');
    var __result;
    var names = Object.keys(descriptors).sort(), total = names.length, validators = {}, lines = [], descriptor, name, items, i, accessor;
    for (i = 0; i < total; i++) {
        name = names[i];
        descriptor = descriptors[name];
        if (/^([\w|_|$]+)$/.test(name)) {
            accessor = '.' + name;
        } else {
            accessor = '["' + name + '"]';
        }
        if (descriptor.rules) {
            validators[name] = this.forDescriptor(name, descriptor);
            lines.push('if (!(result = validators' + accessor + '(obj' + accessor + ')).valid) {', '  isValid = false;', '  errors' + accessor + ' = result.error;', '}');
        }
    }
    var body = 'var isValid = true,\n' + '    errors = {},\n' + '    result;\n\n' + lines.join('\n') + '\n' + 'return {valid: isValid, value: obj, errors: errors};';
    var fn = new Function('validators', 'obj', body);
    // jshint ignore: line
    __result = fn.bind(undefined, validators);
    OBLIGATIONS.postcondition(typeof __result === 'function');
    return __result;
};
/**
 * Process a rule for a descriptor.
 *
 * @param  {Array|Function|Object} rule The validation rule, or inline function.
 * @return {Validator}                  The validator instance.
 */
function processRule(rule) {
    if (typeof rule !== 'function' && typeof rule !== 'string') {
        OBLIGATIONS.precondition(Array.isArray(rule) && rule[0] || rule.name, 'Validator name must be specified.');
    }
    var __result;
    main: {
        if (typeof rule === 'string') {
            __result = exports.create(rule);
            break main;
        } else if (typeof rule === 'function') {
            __result = new exports.Validator({ validate: rule });
            break main;
        } else if (Array.isArray(rule)) {
            __result = exports.create.apply(exports, rule);
            break main;
        } else {
            __result = exports.create(rule.name, rule);
            break main;
        }
    }
    OBLIGATIONS.postcondition(__result instanceof exports.Validator);
    return __result;
}
// define the builtin validators
var validators = _dereq_('./validators'), names = Object.keys(validators), total = names.length, name, i;
for (i = 0; i < total; i++) {
    name = names[i];
    exports.define(name, validators[name]);
}
},{"./validator":2,"./validators":3,"obligations":6}],2:[function(_dereq_,module,exports){
'use strict';
var OBLIGATIONS = _dereq_('obligations');
var Class = _dereq_('classing');
/**
 * Base class for Validators.
 */
module.exports = Class.create({
    /**
   * Defines the error messages for the validator.
   *
   * @type {Object} an object containing the error messages.
   */
    messages: {
        default: function () {
            return { default: 'Invalid value.' };
        }
    },
    /**
   * Accessors for the default message.
   */
    message: {
        get: function () {
            return this.messages.default;
        },
        set: function (value) {
            this.messages.default = value;
        }
    },
    /**
   * Whether to allow empty values.
   *
   * @type {Boolean}
   */
    allowEmpty: { value: true },
    /**
   * Determine whether the given value is empty.
   *
   * @param  {mixed}  value  The value to examine.
   * @return {Boolean}       true if the value is empty, otherwise false.
   */
    isEmpty: function (value) {
        if (value == null || value === '') {
            return true;
        } else if (Array.isArray(value) && value.length === 0) {
            return true;
        } else if (typeof value === 'object' && Object.keys(value).length === 0) {
            return !value.constructor || value.constructor === Object;
        } else {
            return false;
        }
    },
    /**
   * Prepare the given error message.
   *
   * @param  {String} message    The message to prepare.
   * @param  {Object} references The tokens to replace in the message.
   * @return {String}            The prepared error message.
   */
    prepare: function (message, references) {
        OBLIGATIONS.precondition(typeof message === 'string', 'Message must be a string.');
        if (references) {
            OBLIGATIONS.precondition(typeof references === 'object', 'References must be an object.');
        }
        references = references || this;
        return message.replace(/\{\{(\w+)\}\}/g, function (token, item) {
            return references[item] || '';
        });
    },
    /**
   * Validate the given value.
   *
   * > Note: child classes should override this.
   *
   * @return {Boolean|String} If the value is valid, then `true`, otherwise a string containing
   *                          the error message.
   */
    validate: function (value) {
        return true;
    }
});
},{"classing":5,"obligations":6}],3:[function(_dereq_,module,exports){
'use strict';
var OBLIGATIONS = _dereq_('obligations');
/**
 * # Required Validator
 *
 * Ensures that a given value is present.
 *
 * @type {Validator}
 */
exports.required = {
    allowEmpty: { value: false },
    messages: {
        default: function () {
            return { default: 'Cannot be empty.' };
        }
    },
    validate: function (value) {
        if (this.isEmpty(value)) {
            return this.prepare(this.message);
        } else {
            return true;
        }
    }
};
/**
 * # Type Validator
 *
 * Ensures that a given value has the correct JavaScript type.
 *
 * @type {Validator}
 */
exports.type = {
    messages: {
        default: function () {
            return { default: 'Expected {{expected}}, got {{got}}.' };
        }
    },
    type: { value: 'string' },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        var expected = this.type, got = typeof value;
        // hack around `typeof null === 'object'`
        if (expected === 'null' && value === null) {
            return true;
        } else if (expected === got) {
            return true;
        } else {
            return this.prepare(this.message, {
                got: got,
                expected: expected
            });
        }
    }
};
/**
 * # InstanceOf Validator
 *
 * Ensures that a given value is an object that is an instance of the given class.
 *
 * @type {Validator}
 */
exports.instanceOf = {
    messages: {
        default: function () {
            return { default: 'Expected {{expected}}, got {{got}}.' };
        }
    },
    class: {},
    className: {
        get: function () {
            OBLIGATIONS.precondition(this.class, 'Class must be specified');
            OBLIGATIONS.precondition(typeof this.class === 'string' || typeof this.class === 'function', 'Class must be a string or a function.');
            return typeof this.class === 'string' ? this.class : this.class.name;
        }
    },
    validate: function (value) {
        OBLIGATIONS.precondition(this.class, 'Class must be specified');
        OBLIGATIONS.precondition(typeof this.class === 'string' || typeof this.class === 'function', 'Class must be a string or a function.');
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        var className = this.className, references;
        if (!value || typeof value !== 'object' || !value.constructor) {
            references = {
                expected: className,
                got: value === null ? 'null' : typeof value
            };
        } else {
            if (typeof this.class === 'function') {
                if (value instanceof this.class) {
                    return true;
                }
            } else if (value.constructor.name === className) {
                return true;
            }
            references = {
                expected: className,
                got: value.constructor.name
            };
        }
        return this.prepare(this.message, references);
    }
};
/**
 * # Length Validator
 *
 * Validates the length of the given string, array or object.
 *
 * @type {Validator}
 */
exports.length = {
    messages: {
        default: function () {
            return {
                invalid: 'The value is invalid.',
                tooShortString: 'Too short, should be at least {{min}} character(s).',
                tooLongString: 'Too long, should be at most {{max}} character(s).',
                tooShortArray: 'Too short, should contain at least {{min}} item(s).',
                tooLongArray: 'Too long, should contain at most {{max}} item(s).',
                tooShortObject: 'Too short, should contain at least {{min}} key(s).',
                tooLongObject: 'Too long, should contain at most {{max}} key(s).'
            };
        }
    },
    min: {},
    max: {},
    validate: function (value) {
        OBLIGATIONS.precondition(this.min || this.max, 'No constraints specified for length validator.');
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (typeof value === 'string') {
            return this.validateString(value);
        } else if (Array.isArray(value)) {
            return this.validateArray(value);
        } else if (value && typeof value === 'object') {
            return this.validateObject(value);
        } else {
            return this.prepare(this.messages.invalid);    // invalid type
        }
    },
    validateString: function (value) {
        OBLIGATIONS.precondition(typeof value === 'string', 'Value must be a string.');
        if (this.min && value.length < this.min) {
            return this.prepare(this.messages.tooShortString);
        } else if (this.max && value.length > this.max) {
            return this.prepare(this.messages.tooLongString);
        } else {
            return true;
        }
    },
    validateArray: function (value) {
        OBLIGATIONS.precondition(Array.isArray(value), 'Value must be an array.');
        if (this.min && value.length < this.min) {
            return this.prepare(this.messages.tooShortArray);
        } else if (this.max && value.length > this.max) {
            return this.prepare(this.messages.tooLongArray);
        } else {
            return true;
        }
    },
    validateObject: function (value) {
        OBLIGATIONS.precondition(value && typeof value === 'object', 'Value must be an object.');
        var keys = Object.keys(value);
        if (this.min && keys.length < this.min) {
            return this.prepare(this.messages.tooShortObject);
        } else if (this.max && keys.length > this.max) {
            return this.prepare(this.messages.tooLongObject);
        } else {
            return true;
        }
    }
};
/**
 * # Number Validator
 *
 * Ensures that a given value is a number within the specified range.
 *
 * @type {Validator}
 */
exports.number = {
    messages: {
        default: function () {
            return {
                invalid: 'Expected a number.',
                tooSmall: 'Must be at least {{min}}.',
                tooLarge: 'Must be at most {{max}}.'
            };
        }
    },
    min: {},
    max: {},
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (typeof value !== 'number' || isNaN(value)) {
            return this.prepare(this.messages.invalid);
        } else if (this.min && value < this.min) {
            return this.prepare(this.messages.tooSmall);
        } else if (this.max && value > this.max) {
            return this.prepare(this.messages.tooLarge);
        } else {
            return true;
        }
    }
};
/**
 * # Boolean Validator
 *
 * Ensures that the given value is true or false.
 *
 * @type {Function}
 */
exports.boolean = {
    messages: {
        default: function () {
            return { default: 'Must be true or false.' };
        }
    },
    trueValues: {
        default: function () {
            return [true];
        }
    },
    falseValues: {
        default: function () {
            return [false];
        }
    },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (~this.trueValues.indexOf(value)) {
            return true;
        } else if (~this.falseValues.indexOf(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Regular Expression Validator
 *
 * Ensures that the given value matches the specified pattern.
 *
 * @type {Validator}
 */
exports.regexp = {
    messages: {
        default: function () {
            return {
                default: 'Does not match the required pattern.',
                badType: 'Should be a text value.'
            };
        }
    },
    pattern: {
        get: function () {
            return this._pattern || new RegExp();
        },
        set: function (value) {
            if (typeof value === 'string') {
                value = new RegExp(value);
            }
            this._pattern = value;
        }
    },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (typeof value !== 'string') {
            return this.prepare(this.messages.badType);
        } else if (this.pattern.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Range Validator.
 *
 * Asserts that the given value is either *between* 2 values (inclusive), or
 * *in* a list of acceptable values.
 *
 * @type {Validator}
 */
exports.range = {
    messages: {
        default: function () {
            return {
                between: 'Must be between {{start}} and {{stop}}.',
                in: 'Not in the list of valid options.'
            };
        }
    },
    in: {},
    between: {},
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (this.between) {
            return this.validateBetween(value);
        } else if (this.in) {
            return this.validateIn(value);
        } else {
            return true;
        }
    },
    validateBetween: function (value) {
        OBLIGATIONS.precondition(Array.isArray(this.between) && this.between.length === 2, '`between` must be an array containing two values.');
        if (value >= this.between[0] && value <= this.between[1]) {
            return true;
        } else {
            return this.prepare(this.messages.between, {
                start: this.between[0],
                stop: this.between[1]
            });
        }
    },
    validateIn: function (value) {
        OBLIGATIONS.precondition(Array.isArray(this.in), '`in` must be an array');
        if (~this.in.indexOf(value)) {
            return true;
        } else {
            return this.prepare(this.messages.in);
        }
    }
};
/**
 * # URL Validator
 *
 * Ensures that the given value is a URL.
 *
 * @type {Validator}
 */
exports.url = {
    messages: {
        default: function () {
            return { default: 'Not a valid URL.' };
        }
    },
    schemes: {
        default: function () {
            return [
                'http',
                'https'
            ];
        }
    },
    strict: { value: true },
    pattern: {
        get: function () {
            if (!this._pattern) {
                this._pattern = this.createPattern();
            }
            return this._pattern;
        },
        set: function (value) {
            if (typeof value === 'string') {
                value = new RegExp(value, 'i');
            }
            this._pattern = value;
        }
    },
    createPattern: function () {
        var pattern = '^(({schemes}):\\/\\/)?(([A-Z0-9][A-Z0-9_-]*)(\\.[A-Z0-9][A-Z0-9_-]*)+)'.replace('{schemes}', this.schemes.join('|'));
        return new RegExp(pattern, 'i');
    },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (!(matches = this.pattern.exec(value))) {
            return this.prepare(this.message);
        }
        if (this.strict && !matches[1]) {
            return this.prepare(this.message);
        } else {
            return true;
        }
    }
};
/**
 * # Email Address Validator
 *
 * Ensures that the given value is a valid email address.
 *
 * > Note: The only really viable way of testing whether an email address is valid
 * > is to send an email to it. This validator uses a very simple and permissive pattern by default.
 *
 * @type {Validator}
 */
exports.email = {
    messages: {
        default: function () {
            return { default: 'Not a valid email address.' };
        }
    },
    pattern: { value: /@(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)$/i },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (this.pattern.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # IP Address Validator.
 *
 * Ensures that the given value is a valid IPv4 or IPv6 address.
 *
 * @type {Validator}
 */
exports.ip = {
    messages: {
        default: function () {
            return { default: 'Not a valid IP address.' };
        }
    },
    v4: { value: true },
    v6: { value: true },
    patterns: {
        default: function () {
            return {
                v4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                // jshint ignore: line
                v6: /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/    // jshint ignore: line
            };
        }
    },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (this.v4 && this.patterns.v4.test(value)) {
            return true;
        } else if (this.v6 && this.patterns.v6.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Hostname Validator.
 *
 * Ensures that the given value is a valid hostname.
 *
 * @type {Validator}
 */
exports.hostname = {
    messages: {
        default: function () {
            return { default: 'Not a valid hostname.' };
        }
    },
    pattern: {
        value: /^(?:(?:(?:(?:[a-zA-Z0-9][-a-zA-Z0-9]{0,61})?[a-zA-Z0-9])[.])*(?:[a-zA-Z][-a-zA-Z0-9]{0,61}[a-zA-Z0-9]|[a-zA-Z])[.]?)$/    // jshint ignore: line
    },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        value = '' + value;
        if (value.length > 0 && value.length <= 255 && this.pattern.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Date Validator
 *
 * Ensures that the given value is a valid date.
 *
 * @type {Validator}
 */
exports.date = {
    messages: {
        default: function () {
            return { default: 'Not a valid date.' };
        }
    },
    pattern: { value: /^(\d{4})-(\d{2})-(\d{2})$/ },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        if (value instanceof Date) {
            return true;
        }
        if (matches = this.pattern.exec(value)) {
            if (+matches[2] < 13 && +matches[3] < 32) {
                return true;
            }
        }
        return this.prepare(this.message);
    }
};
/**
 * # Time Validator
 *
 * Ensures that the given value is a valid time.
 *
 * @type {Validator}
 */
exports.time = {
    messages: {
        default: function () {
            return { default: 'Not a valid time.' };
        }
    },
    pattern: { value: /^(\d{2}):(\d{2}):(\d{2})$/ },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        if (value instanceof Date) {
            return true;
        }
        if (matches = this.pattern.exec(value)) {
            if (+matches[1] < 24 && +matches[2] < 60 && +matches[3] < 60) {
                return true;
            }
        }
        return this.prepare(this.message);
    }
};
/**
 * # Date / Time Validator
 *
 * Ensures that the given value is a valid date / time.
 *
 * @type {Validator}
 */
exports.datetime = {
    messages: {
        default: function () {
            return { default: 'Not a valid date / time.' };
        }
    },
    pattern: { value: /^(\d{4})-(\d{2})-(\d{2})[\s|T]?(\d{2}):(\d{2}):(\d{2})(?:.\d{1,3})?Z?$/ },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (value instanceof Date) {
            return true;
        } else if (matches = this.pattern.exec(value)) {
            if (+matches[2] < 13 && // month
                +matches[3] < 32 && // day
                +matches[4] < 24 && // hours
                +matches[5] < 60 && // minutes
                +matches[6] < 60) {
                return true;
            }
        }
        return this.prepare(this.message);
    }
};
},{"obligations":6}],4:[function(_dereq_,module,exports){
'use strict';

function ClassFactory () {}

module.exports = ClassFactory;

var prototype = ClassFactory.prototype;

/**
 * Extend the ClassFactory class.
 *
 * @param  {Object} methods     The methods for the class factory.
 *
 * @return {Function} The child class factory.
 */
ClassFactory.extend = function (methods) {
  var ChildFactory = function ClassFactory () {};

  each(this, function (value, key) {
    ChildFactory[key] = value;
  });

  ChildFactory.prototype = Object.create(this.prototype);
  ChildFactory.prototype.constructor = ChildFactory;

  if (methods) {
    each(methods, function (value, key) {
      ChildFactory.prototype[key] = value;
    });
  }
  ChildFactory.__super__ = this;
  ChildFactory.prototype.__super__ = this.prototype;
  return ChildFactory;
};

/**
 * Create a new class.
 *
 * @param  {String} name              The name of the new class.
 * @param  {Object} descriptors       The instance property descriptors.
 * @param  {Object} staticDescriptors The static property descriptors.
 *
 * @return {Function} The class function.
 */
prototype.create = function (name, descriptors, staticDescriptors) {
  if (name && typeof name === 'object') {
    staticDescriptors = descriptors;
    descriptors = name;
    name = 'Class';
  }
  else if (!name) {
    name = 'Class';
    descriptors = descriptors || {};
    staticDescriptors = staticDescriptors || {};
  }
  descriptors = this.normalizeDescriptors(descriptors || {});
  staticDescriptors = this.normalizeDescriptors(staticDescriptors || {});
  var Class = this.createConstructor(name);
  Object.defineProperties(Class, this.createStatic(Class, descriptors, staticDescriptors));
  Class.prototype = {};
  Object.defineProperties(Class.prototype, this.createPrototype(Class, descriptors));
  Class.prototype.constructor = Class;
  return Class;
};


/**
 * Normalize the given descriptors
 *
 * @param  {Object} descriptors The raw descriptors.
 *
 * @return {Object} The normalized descriptors.
 */
prototype.normalizeDescriptors = function (descriptors) {
  var normalized = {},
      self = this;
  each(descriptors, function (descriptor, name) {
    normalized[name] = self.normalizeDescriptor(name, descriptor);
  });
  return normalized;
};

/**
 * Normalize a descriptor.
 *
 * @param  {String} name        The name of the descriptor.
 * @param  {mixed}  descriptor  The raw descriptor or value.
 *
 * @return {Object} The normalized descriptor.
 */
prototype.normalizeDescriptor = function (name, descriptor) {
  var normalized = {};

  if (descriptor === null || typeof descriptor !== 'object') {
    descriptor = {
      value: descriptor
    };
  }

  each(descriptor, function (value, key) {
    normalized[key] = value;
  });

  if (normalized.value === undefined &&
      normalized.get === undefined &&
      normalized.set === undefined
  ) {
    normalized.value = null;
  }

  if (normalized.enumerable === undefined &&
      typeof normalized.value !== 'undefined' &&
      typeof normalized.value !== 'function'
  ) {
    normalized.enumerable = true;
  }

  if (normalized.configurable === undefined) {
    normalized.configurable = true;
  }

  if (normalized.writable === undefined &&
      normalized.get === undefined &&
      normalized.set === undefined
  ) {
    normalized.writable = true;
  }

  return normalized;
};


/**
 * Create a constructor function for a class.
 *
 * @param  {String} name The name of the class.
 *
 * @return {Function} The constructor function.
 */
prototype.createConstructor = function (name) {
  var body = 'return function ' + name + ' (config) {\n\
                "use strict";\n\
                if (!(this instanceof ' + name + ')) {\n\
                  return new ' + name + '(config);\n\
                }\n\
                this.applyDefaults();\n\
                if (config) { this.configure(config); }\n\
                this.initialize();\n\
              };';
  return (new Function(body))(); // jshint ignore: line
};

/**
 * Create the prototype for a given class + descriptors.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Object} The descriptors for the prototype.
 */
prototype.createPrototype = function (Class, descriptors) {
  var proto = this.createDefaultPrototype(Class, descriptors);
  each(descriptors, function (descriptor, name) {
    proto[name] = descriptor;
  });
  return proto;
};

/**
 * Create a prototype for the given Class + descriptors.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Object} The descriptors for the default prototype.
 */
prototype.createDefaultPrototype = function (Class, descriptors) {
  return {
    initialize: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createInitialize(Class, descriptors)
    },
    applyDefaults: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createApplyDefaults(Class, descriptors)
    },
    configure: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createConfigure(Class, descriptors)
    },
    toJSON: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: this.createToJSON(Class, descriptors)
    }
  };
};

/**
 * Create a dynamic function, accepts the same arguments as
 * the `Function` constructor, but marks it as an auto-generated function.
 *
 * @return {Function} The autogenerated function.
 */
prototype.createDynamicFunction = function () {
  var fn = Function.apply(undefined, arguments);
  fn.isAutoGenerated = true;
  return fn;
};


/**
 * Create an `initialize()` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The initialize function.
 */
prototype.createInitialize = function (Class, descriptors) {
  return this.createDynamicFunction('"use strict";');
};

/**
 * Create an `applyDefaults` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The applyDefaults function.
 */
prototype.createApplyDefaults = function (Class, descriptors) {
  var body = '';
  each(descriptors, function (descriptor, name) {
    var accessor = createAccessor(name),
        value;
    if (typeof descriptor.default === 'function') {
      body += 'this' + accessor + ' = descriptors' + accessor + '.default(this, ' + JSON.stringify(name) + ');\n';
    }
    else if (typeof descriptor.default !== 'undefined') {
      body += 'this' + accessor + ' = descriptors' + accessor + '.default;\n';
    }
    else if (typeof descriptor.bind !== 'undefined') {
      if (descriptor.bind === true) {
        value = 'this';
      }
      else {
        value = 'descriptors' + accessor + '.bind';
      }
      body += 'this' + accessor + ' = this' + accessor + '.bind(' + value + ');\n';
    }
  });

  if (body.length) {
    body = 'var descriptors = this.constructor["[[descriptors]]"];\n' + body;
  }
  return this.createDynamicFunction('"use strict";\n' + body);
};


/**
 * Create a `configure` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The configure function.
 */
prototype.createConfigure = function (Class, descriptors) {
  var body = '"use strict";\n';
  each(descriptors, function (descriptor, name) {
    if (descriptor.writable || typeof descriptor.set === 'function') {
      var accessor = createAccessor(name);
      body += 'if (config' + accessor + ' !== undefined) {\n\
                  this' + accessor + ' = config' + accessor + ';\n\
               }\n';
    }
  });
  return this.createDynamicFunction('config', body);
};

/**
 * Create a `toJSON` function for a class.
 *
 * @param  {Function} Class       The class.
 * @param  {Object}   descriptors The property descriptors.
 *
 * @return {Function} The toJSON function.
 */
prototype.createToJSON = function (Class, descriptors) {
  var body = [];
  each(descriptors, function (descriptor, name) {
    if (descriptor.enumerable) {
      var accessor = createAccessor(name);
      body.push('  ' + JSON.stringify(name) + ': this' + accessor);
    }
  });

  return this.createDynamicFunction('"use strict";\nreturn {\n  ' + body.join(',\n  ') + '};\n');
};

/**
 * Create the static methods / properties for a class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Object} The static descriptors.
 */
prototype.createStatic = function (Class, descriptors, staticDescriptors) {
  var context = this.createDefaultStatic(Class, descriptors, staticDescriptors),
      self = this;
  each(staticDescriptors, function (descriptor, name) {
    context[name] = descriptor;
  });

  return context;
};

/**
 * Create the default static methods / properties for a class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Object} The default static descriptors.
 */
prototype.createDefaultStatic = function (Class, descriptors, staticDescriptors) {
  return {
    '[[descriptors]]': {
      enumerable: false,
      configurable: false,
      writable: true,
      value: descriptors
    },
    create: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticCreate(Class, descriptors, staticDescriptors)
    },
    inherits: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticInherits(Class, descriptors, staticDescriptors)
    },
    extend: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticExtend(Class, descriptors, staticDescriptors)
    },
    mixin: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticMixin(Class, descriptors, staticDescriptors)
    },
    defineProperty: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticDefineProperty(Class, descriptors, staticDescriptors)
    },
    defineProperties: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticDefineProperties(Class, descriptors, staticDescriptors)
    },
    getOwnPropertyDescriptor: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: this.createStaticGetOwnPropertyDescriptor(Class, descriptors, staticDescriptors)
    }
  };
};

/**
 * Create a function which can create new instances of the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticCreate = function (Class, descriptors, staticDescriptors) {
  return function create (config) {
    return new this(config);
  };
};

/**
 * Create a function which can add another class to the given class's inheritance chain.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticInherits = function (Class, descriptors, staticDescriptors) {
  var factory = this;
  return function inherits (Super) {
    var self = this;
    each(Super, function (value, key) {
      if (!self.hasOwnProperty(key)) {
        self[key] = value;
      }
    });
    if (Super['[[descriptors]]'] && typeof Super['[[descriptors]]'] === 'object') {
      each(Super['[[descriptors]]'], function (descriptor, name) {
        if (self['[[descriptors]]'][name] === undefined) {
          self['[[descriptors]]'][name] = descriptor;
        }
      });
    }
    self.__super__ = Super;
    self.prototype = Object.create(Super.prototype, self['[[descriptors]]']);
    self.prototype.constructor = self;
    self.prototype.__super__ = Super.prototype;
    factory.updateDynamicFunctions(self, self['[[descriptors]]']);
    return self;
  };
};

/**
 * Create a function which can create a new class extending from this one.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticExtend = function (Class, descriptors) {
  var factory = this;
  return function extend (name, descriptors, staticDescriptors) {
    if (name && typeof name === 'object') {
      staticDescriptors = descriptors || {};
      descriptors = name;
      name = this.name || 'Class';
    }
    else if (!name) {
      name = 'Class';
      descriptors = descriptors || {};
      staticDescriptors = staticDescriptors || {};
    }
    var Class = factory.create(name, descriptors, staticDescriptors);
    Class.inherits(this);
    return Class;
  };
};

/**
 * Create a function which can mix properties from an object into the prototype of the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticMixin = function (Class, descriptors, staticDescriptors) {
  return function mixin (source) {
    var self = this,
        combined = {};
    each(source, function (value, key) {
      combined[key] = {
        value: value
      };
    });
    this.defineProperties(combined);
    return this;
  };
};


/**
 * Create a `defineProperties()` function for the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticDefineProperties = function (Class, descriptors, staticDescriptors) {
  return function defineProperties (obj) {
    if (!obj) {
      return this;
    }
    var self = this;
    each(obj, function (descriptor, name) {
      self.defineProperty(name, descriptor);
    });
    return this;
  };
};


/**
 * Create a `defineProperty()` function for the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticDefineProperty = function (Class, descriptors, staticDescriptors) {
  var factory = this;
  return function defineProperty (name, descriptor) {
    this['[[descriptors]]'][name] = factory.normalizeDescriptor(name, descriptor);
    Object.defineProperty(this.prototype, name, this['[[descriptors]]'][name]);
    factory.updateDynamicFunctions(Class, Class['[[descriptors]]']);
    return this;
  };
};

/**
 * Create a `getOwnPropertyDescriptor()` function for the class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 *
 * @return {Function} The generated function.
 */
prototype.createStaticGetOwnPropertyDescriptor = function (Class, descriptors, staticDescriptors) {
  var factory = this;
  return function getOwnPropertyDescriptor (name) {
    return this['[[descriptors]]'][name];
  };
};

/**
 * Update the dynamic auto-generated functions for a class.
 *
 * @param  {Function} Class             The class.
 * @param  {Object}   descriptors       The property descriptors.
 * @param  {Object}   staticDescriptors The static property descriptors.
 */
prototype.updateDynamicFunctions = function (Class, descriptors) {
  if (!Class.prototype.initialize || Class.prototype.initialize.isAutoGenerated) {
    Class.prototype.initialize = this.createInitialize(Class, descriptors);
  }

  if (!Class.prototype.applyDefaults || Class.prototype.applyDefaults.isAutoGenerated) {
    Class.prototype.applyDefaults = this.createApplyDefaults(Class, descriptors);
  }

  if (!Class.prototype.configure || Class.prototype.configure.isAutoGenerated) {
    Class.prototype.configure = this.createConfigure(Class, descriptors);
  }

  if (!Class.prototype.toJSON || Class.prototype.toJSON.isAutoGenerated) {
    Class.prototype.toJSON = this.createToJSON(Class, descriptors);
  }
};

function each (obj, visitor) {
  var keys = Object.keys(obj),
      length = keys.length,
      key, i;
  for (i = 0; i < length; i++) {
    key = keys[i];
    visitor(obj[key], key, obj);
  }
}

var safeIdentifier = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

function createAccessor (name) {
  if (safeIdentifier.test(name)) {
    return '.' + name;
  }
  else {
    return '[' + JSON.stringify(name) + ']';
  }
}

ClassFactory.each = each;
ClassFactory.createAccessor = createAccessor;
},{}],5:[function(_dereq_,module,exports){
'use strict';


var Factory = _dereq_('./factory'),
    factory = new Factory();

module.exports = exports = function (name, descriptors, staticDescriptors) {
  return factory.create(name, descriptors, staticDescriptors);
};

exports.create = function (name, descriptors, staticDescriptors) {
  return factory.create(name, descriptors, staticDescriptors);
};

exports.extend = function (methods) {
  return Factory.extend(methods);
};

exports.Factory = Factory;

},{"./factory":4}],6:[function(_dereq_,module,exports){
/**
 * # Precondition Error
 * Thrown when a precondition fails.
 *
 * @param {String}   message The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function PreconditionError(message, caller) {
  this.name = 'PreconditionError';
  this.message = message || 'Precondition failed';
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, caller || PreconditionError);
  }
}
PreconditionError.prototype = Object.create(Error.prototype);
PreconditionError.prototype.constructor = PreconditionError;

/**
 * # Postcondition Error
 * Thrown when a postcondition fails.
 *
 * @param {String} message   The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function PostconditionError(message, caller) {
  this.name = 'PostconditionError';
  this.message = message || 'Postcondition failed';
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, caller || PreconditionError);
  }
}
PostconditionError.prototype = Object.create(Error.prototype);
PostconditionError.prototype.constructor = PreconditionError;


/**
 * # Invariant Error
 * Thrown when an invariant fails.
 *
 * @param {String} message   The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function InvariantError(message, caller) {
  this.name = 'InvariantError';
  this.message = message || 'Invariant failed';
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, caller || InvariantError);
  }
}
InvariantError.prototype = Object.create(Error.prototype);
InvariantError.prototype.constructor = InvariantError;


/**
 * # Precondition
 * Asserts that a precondition is truthy.
 *
 * @param  {Mixed}              subject  The subject to assert.
 * @param  {String}             message  The optional message for the assertion.
 * @throws {PreconditionError}           If the subject is falsey.
 */
function precondition(subject, message) {
  if (!subject) {
    throw new PreconditionError(message, precondition);
  }
}

/**
 * # Postcondition
 * Asserts that a postcondition is truthy.
 *
 * @param  {Mixed}               subject  The subject to assert.
 * @param  {String}              message  The optional message for the assertion.
 * @throws {PostconditionError}           If the subject is falsey.
 */
function postcondition(subject, message) {
  if (!subject) {
    throw new PostconditionError(message, postcondition);
  }
}

/**
 * # Invariant
 * Asserts that an invariant is truthy.
 *
 * @param  {Mixed}              subject  The subject to assert.
 * @param  {String}             message  The optional message for the assertion.
 * @throws {PreconditionError}           If the subject is falsey.
 */
function invariant(subject, message) {
  if (!subject) {
    throw new InvariantError(message, invariant);
  }
}



exports.PreconditionError = PreconditionError;
exports.PostconditionError = PostconditionError;
exports.InvariantError = InvariantError;
exports.precondition = precondition;
exports.postcondition = postcondition;
exports.invariant = invariant;
},{}]},{},[1])
(1)
});