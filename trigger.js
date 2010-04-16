(function(context) {

    function Rule(sourceType, source, name, callback) {
        this.enabled = true;
        this.sourceType = sourceType;
        this.source = source;
        if (name !== null) {
            name = name.replace(/\?/g, '[a-z0-9_-]+')
                       .replace(/\*/g, '[a-z0-9_-]+(.[a-z0-9_-]+)*')
                       .replace(/\./g, '\\.');
            name = new RegExp('^' + name + '$', 'i');
        }
        this.name = name;
        this.callback = callback;
    }
    
    Rule.prototype.enable = function() { this.enabled = true; };
    Rule.prototype.disable = function() { this.enabled = false; };
    
    Rule.prototype.tryInvoke = function(source, name, arguments) {
        if ((!this.enabled) ||
            (this.sourceType !== null && !(source instanceof this.sourceType)) ||
            (this.source !== null && this.source != source) ||
            (this.name !== null && !this.name.exec(name))) return arguments;
        return this.callback(arguments);
    }
    
    function EventObject(source, name, args) {
        this.source = source;
        this.name = name;
        this.args = args || {};
        this.handled = false;
    };
    
    EventObject.prototype.handled = function() { this.handled = true; }
    EventObject.prototype.isHandled = function() { return this.handled; }
    
    function Trigger() {
        this.events = [];
        this.filters = [];
    }
    
    Trigger.prototype = {
        registerEventHandler: function(sourceType, source, eventName, callback) {
            var handler = new Rule(sourceType, source, eventName, callback);
            this.events.push(handler);
            return handler
        },
        
        observeType: function(sourceType, callback) {
            this.registerEventHandler(sourceType, null, null, callback);
        },
        
        observeObject: function(source, callback) {
            this.registerEventHandler(null, source, null, callback);
        },
        
        observeEvent: function(eventName, callback) {
            this.registerEventHandler(null, null, eventName, callback);
        },
        
        registerFilter: function(eventName, callback) {
            var handler = new Rule(null, null, eventName, callback)
            this.filters.push(handler);
            return handler;
        },
        
        fire: function(source, eventName, args) {
            var event = new EventObject(source, eventName, args);
            for (var i = 0, c = this.events.length; i < c; i++) {
                this.events[i].tryInvoke(source, eventName, event);
                if (event.isHandled()) break;
            }
        },
        
        filter: function(filterName, args) {
            for (var i = 0, c = this.filters.length; i < c; i++) {
                args = this.filters[i].tryInvoke(null, filterName, args);
            }
            return args;
        }
    }
    
    Trigger.mixin = function(object, trigger) {
        trigger = trigger || context.trigger;
        object.fire = function(event, args) {
            trigger.fire(this, event, args || {});
        }
        object.filter = function(filter, args) {
            return trigger.filter(filter, args || {});
        }
    }
    
    context.Trigger = Trigger;
    context.trigger = new Trigger();
    
})(this);