/**
 * class Spah
 * 
 * For cleanliness, Spah is wrapped entirely in the <code>window.Spah</code> object
 * on the client side, and <code>exports.spah</code> on the server side.
 *
 * See [Default client behaviour](../../index.html#default_client_behaviour) to learn what actions Spah performs on initialisation.
 * For more information on Spah, see the main [Readme](../index.html) ([also available on Github](https://github.com/danski/spah#readme))
 **/
Spah = function() {};

/**
 * Spah.logMessages -> Array
 * A stored array of all messages generated by Spah's logging system.
 **/
Spah["logMessages"] = [];

/**
 * Spah.verbose -> Boolean
 * Set to <true>true</true> if you wish Spah to produce debug output in the browser's console.
 **/
Spah["verbose"] = false;

/**
 * Spah.init([options]) -> Null
 * 
 * Initialises the Spah client. See [Default client behaviour](../../index.html#default_client_behaviour) to learn what actions
 * Spah performs on initialisation.
 **/
Spah["init"] = function(options) {
  // Instantiate state object
};

/**
 * Spah.createServer([options]) -> Spah.StateServer
 * options (Object): An optional hash used to configure the server
 *
 * Create a new Spah.StateServer instance, with options passed to the server
 * for configuration. See Spah.StateServer's constructor for information on configuring the server.
 **/
Spah["createServer"] = function(options) {
  return new Spah.StateServer(options);
};

/**
 * Spah.createClient([options]) -> Spah.StateClient
 * options (Object): An optional hash used to configure the client
 *
 * Creates a new Spah.StateClient instance, with options passed to the client
 * for configuration. See Spah.StateClient's constructor for information on configuring the client.
 **/
Spah["createClient"] = function(options) {
  return new Spah.StateClient(options);
};

/**
 * Spah.log(message, objects) -> String message
 * Logs debug output to Spah's internal logger. If Spah.verbose is set to true, the message will appear in the browser's console.
 **/
Spah["log"] = function(message) {
  this.logMessages.push(message);
  if(this.verbose && typeof(console) != "undefined") {
    console.log.apply(console, arguments);
  }
  return message;
};

/**
 * Spah.inBrowser() -> Boolean
 *
 * Returns true if the runtime environment is identified as being in-browser.
 **/
Spah["inBrowser"] = function() {
  return (typeof(window) != "undefined" && typeof(window.location) == "object");
}

/**
 * Spah.isHeadless() -> Boolean
 *
 * Returns true if the runtime environment is identified as being headless e.g. a Node.js runtime.
 **/
Spah["isHeadless"] = function() {
  return !this.inBrowser();
}

Spah["inCommonJS"] = function() {
  return (typeof(exports) == "object");
}

Spah["Class"] = function(name) {
  this.name = name;
}
Spah["Class"].prototype = {
  super: function() { return this.prototype },
}

/**
 * Spah.classRegister(name, klass) -> void
 * - name (String): The name for the new Spah class, e.g. "Spah.Foo.Bar"
 * - klass (Function): The class constructor being registered.
 *
 * Registers a created class with the Spah package using both CamelCase and commonJs-style naming schemes.
 * The Spah package is already registered with the window or the commonJS exports object automatically.
 **/
Spah["classRegister"] = function(name, klass) {
  // Register on the Spah constant
  var nameNS = name.split(".");
  var targetBrowser = this;
  var targetCommonJS = this;
  for(var n=1; n<nameNS.length; n++) {
    var browserName = nameNS[n];
    var commonJSName = browserName.toLowerCase();
    if(n < nameNS.length-1) {
      // intermediary key
      targetBrowser[browserName] = targetBrowser[browserName] || {};
      targetBrowser = targetBrowser[browserName];
      targetCommonJS[commonJSName] = targetCommonJS[commonJSName] || {};
      targetCommonJS = targetCommonJS[commonJSName]
    }
    else {
      // final key
      targetBrowser[browserName] = klass;
      targetCommonJS[commonJSName] = klass;
    }
  }
}

/**
 * Spah.classCreate(name[, constructor][, klassProps][, instanceProps]) -> Function
 * - name (String): The name for the new Spah class, e.g. "Spah.Foo.Bar"
 * - constructor (Function): The constructor function for this class. If not provided, will search the prototype chain for "init"
 * - klassProps (Object): A hash of class-level properties and functions
 * - instanceProps (Object): A hash of instance-level properties and functions to be applied to the class' prototype.
 *
 * Creates a class internal to the Spah library and namespace.
 **/
Spah["classCreate"] = function(name, constructor, klassProps, instanceProps) {
  // Make the class constructor
  return Spah.classExtend(name, Object, constructor, klassProps, instanceProps)
};

/**
 * Spah.classExtend(name, superKlass[, constructor][, klassProps][, instanceProps]) -> Function
 * - name (String): The name for the new Spah class without the "Spah" namespace. E.g. to create Spah.Foo.Bar, use classCreate("Foo.Bar")
 * - superKlass (Function): The class to be extended non-destructively.
 * - constructor (Function): The constructor function for this class. If not provided, will search the prototype chain for "init"
 * - klassProps (Object): A hash of class-level properties and functions
 * - instanceProps (Object): A hash of instance-level properties and functions to be applied to the class' prototype.
 *
 * Creates a new class that extends another class. Follows the same rules as Spah.classCreate. The superclass does not 
 * need to be a part of the Spah package.
 **/
Spah["classExtend"] = function(name, superKlass, constructor, klassProps, instanceProps) {
  // Massage args
  var con, kP, iP;

  if(typeof(constructor) == "function") {
    // Taking custom constructor arg pattern
    kP = klassProps || {};
    iP = instanceProps || {};
    con = constructor;
  }
  else {
    // Taking optional constructor arg pattern
    // Transpose module arguments
    kP = constructor || {};
    iP = klassProps || {};
    con = iP.init;
  }

  var klass;  
  // Treat instance properties - create proto
  var proto = Object.create(superKlass.prototype);
  for(var i in iP) {
    Object.defineProperty(proto, i, {
      value: iP[i],
      enumerable: false
    });
    //proto[i] = iP[i];
  }

  // Find constructor
  if(con) {
    // Found local constructor on instance props
    klass = con;
  }
  else if(proto.init) {
    // Found constructor up the proto chain
    // Wrap function - TODO make this faster
    klass = function() {
      if(this.init) this.init.apply(this, arguments);
    }
  }
  else {
    // No constructor found, give a blank one. This is probably a singleton class.
    klass = function() {};
  }
  klass.prototype = proto;

  // Treat superclass class properties
  for(var s in superKlass) { 
    klass[s] = superKlass[s];
  }
  // Treat class properties
  for(var k in kP) {
    klass[k] = kP[k];
  }

  Spah.classRegister(name, klass);
  return klass;
}

// Finally, register the Spah constant with the environment
if(Spah.inBrowser()) {
  // Export master class if running in the client
  window["Spah"] = Spah;
}
else {
  // Do CommonJS module export otherwise
  exports = Spah;
}
