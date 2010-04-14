trigger.js
==========

&copy; 2010 Jason Frame [ [jason@onehackoranother.com](mailto:jason@onehackoranother.com) / [@jaz303](http://twitter.com/jaz303) ]  
Released under the MIT License.

`trigger.js` provides a centralised client-side event dispatch and filtering mechanism for web apps.

Events
------

<table>
  <tr>
    <th>Event name</th>
    <td><code>trigger.observeEvent(eventPattern, callback)</code></td>
    <td>
      Event names are namespaced, using `.` as a separator. Wildcards are supported:
      <ul>
        <li><code>?</code> matches a single component e.g.
          <code>foo.?</code> matches <code>foo.bar</code> and <code>foo.baz</code> but
          does not match <code>foo</code> nor <code>foo.bar.baz</code>.
        </li>
        <li><code>*</code> matches one or more components e.g.
          <code>foo.*</code> matches <code>foo.bar</code>, <code>foo.baz</code> and
          <code>foo.bar.baz</code> does not match <code>foo</code>.
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Source object identity</th>
    <td><code>trigger.observeObject(source, callback)</code></td>
    <td>Equality test is performed using <code>==</code>
  </tr>
  <tr>
    <th>Source object type</th>
    <td><code>trigger.observeType(sourceType, callback)</code></td>
    <td>Type check is performed using <code>instanceof</code>
  </tr>
</table>


Filters
-------

A named filter in `trigger.js` is a chain of event handlers, each of which returns a value. The result of each filter is passed back into the next filter, with the final value ultimately being returned to the  caller. Example:

    trigger.registerFilter('myFilter', function(s) { return s.toUpperCase(); });
    trigger.registerFilter('myFilter', function(s) { return 'hello ' + s; });
    
    // displays "hello JASON"
    alert(trigger.filter('myFilter', 'jason'));

Filter names actually support wildcards too, but that doesn't really sound very useful.

Mixin' In
---------

Calling `trigger.fire(this, 'foo.bar', { ... })` sure gets tiresome. Use `Trigger.mixin(object [, triggerRegistry])` to extend arbitrary objects with their own `fire()`/`filter()` methods, within which the implied event source is `this`. The optional second parameter, `triggerRegistry` allows you to specify an alternate trigger registry if you're not using the default `window.trigger`. FGJ:

    var myArray = [];
    Trigger.mixin(myArray);
    myArray.fire("foo.blam", { ... });
    var result = myArray.filter("send.prefilter", { ... });
    
Other Possibly Interesting Stuff
--------------------------------

When an event handler or filter is registered you get back a `Rule` object. This has `enable()` and `disable()` methods for selectively toggling handlers without affecting other handlers in the chain.

By default, you get a single trigger registry, `window.trigger`. This is just an instance of `Trigger` so just create as many as you need.