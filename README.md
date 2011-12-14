Traversty &mdash; headache-free DOM traversal
=============================================

Traversty is a library-agnostic DOM traversal utility giving you 4 flexible methods for moving around the DOM.

Inspired by [Prototype](http://prototypejs.org)'s excelent "DOM traversal toolkit", you get `up()`, `down()`, `next()` and `previous()` with optional `selector` and `index` arguments, all in a multi-element environment (jQuery-like rather than Prototype's single-element implementation).

Traversty is designed primarily to be integrated in an [Ender](http://ender.no.de/) build, to augment what's already available in [Bonzo](https://github.com/ded/bonzo) but can just as easily be used as a stand-alone utility. 

Example usage
-------------

*This code is used Traversty Ender integration tests and depends on Bonzo*

```js
$('#root > ul') // can match multiple elements
  .down(0).css('color', 'red')
  .next('li', 1).css('color', 'green')
  .next().down('li', 2).css('color', 'blue')
  .next().down().css('color', 'yellow')
  .up(2).next().css('color', 'purple');
```


API
---

### Main: `traversty(elements || selector)` ###

Gives you a new Traversty instance containing the DOM elements you provide, allowing you to call any of the following methods. You can give a single DOM element or an array of DOM elements. If you provide a string argument it will be used as a selector to either query the DOM via the browser's native `querySelectorAll()` implementation or use a selector engine which you provide (see below).

Individual elements are available with array accessors, e.g. `traversty(document.body)[0] // → document.body` 

When included in an Ender build, `$(elements || selector)` does the same thing.

### Next: `traversty(elements).next([selector = "*"[, index = 0]])` ###

 * `selector` *(String)* is an optional CSS selector (defaults to `'*'`, i.e. match all elements)
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

Returns a new Traversty instance wrapped around the resulting DOM elements. You will get elements that match the given *selector* (or '*') starting from the *nextSibling* of the starting element(s), all the way across to the last *nextSibling*.

If no `index` or `selector` is given then you get just the *nextSibling*s of the elements.

If just an `index` is provided then you'll get the `index+1` *nextSibling*s of the element(s). i.e. `index` is 0-based, like arrays, 0 is *nextSibling* and 1 is *nextSibling.nextSibling*, unless you provide a `selector` of course, in which case it'll skip over non-matching elements.

If just a `selector` is provided then no `index` will be assumed, you'll get **all** matching *nextSibling* elements.

#### Examples ####

```js
traversty('li:first-child').next(); // →  returns the second `<li>` of every list in the document
traversty('li.allstarts').next('li', 1); // →  returns the `nextSibling` of the `nextSibling` of the starting elements
traversty('li:first-child').next('li'); // →  returns all `<li>` elements, except for the first-children of every lits in the document
```


### Previous: `traversty(elements).previous([selector = "*"[, index = 0]])` ###

 * `selector` *(String)* is an optional CSS selector (defaults to `'*'`, i.e. match all elements)
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

Exactly the same as `.next()` except it works on *previousSibling*, so you move backwards amongst sibling elements.

#### Examples ####

```js
traversty('li:nth-child(20)').previous(); // →  returns 19th child of the every list in the document (where it exists)
traversty('li.allstarts').previous('li', 1); // →  returns the `previousSibling` of the `previousSibling` of the starting element
traversty('li:nth-child(20)').previous('.interesting'); // →  returns all `<li>` elements with class "interesting" up to the 19th child of every list in the document where there are at least 20 children.
```

### Up: `traversty(elements).up([selector = "*"[, index = 0]])` ###

 * `selector` *(String)* is an optional CSS selector (defaults to `'*'`, i.e. match all elements)
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

Similar to `next()` and `previous()` except that it works on *parentNode*s and will continue all the up to the document root depending on what you're asking for.

If no `index` or `selector` is given then you get just the `parentNode*s of the elements.

If just an `index` is provided then you'll get the `index+1` *parentNode*s of the element. i.e. `index` is 0-based, like arrays, 0 is *parentNode* and 1 is *parentNode.parentNode*, unless you provide a `selector` of course, in which case it'll skip over non-matching elements.

If just a `selector` is provided then no `index` will be assumed, you'll get **all** matching ancestor elements.


#### Examples ####

```js
traversty('li#start').up(); // →  returns the `<ul>` parent element
traversty('li.allstarts').up('ul', 1); // →  returns the grandparent `<ul>` elements if the start elements are nested at two levels
traversty('li.allstarts').up('ul'); // →  returns all ancestor `<ul>` elements, no matter how deep the nesting
```

### Down: `traversty(elements).down([selector = "*"[, index = 0]])` ###

 * `selector` *(String)* is an optional CSS selector (defaults to `'*'`, i.e. match all elements)
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

While `down()` is very similar to the other methods, it's perhaps best to think of it as what you might get with a `find()` method from a selector engine.

`down()` works on elements **in document-order**, so it operates on child elements and children of children but it also moves through child-siblings on the way to children of children.

The following fragment should illustrate the `index`ing you get when you use `down()`:

```html
<ul id="root">
  <li>fisrt</li>   <!-- 0 -->
  <li>second</li>  <!-- 1 -->
  <li>third        <!-- 2 -->
    <ul>           <!-- 3 -->
      <li>i</li>   <!-- 4 -->
      <li>ii</li>  <!-- 5 -->
      <li>iii</li> <!-- 6 -->
    </ul>
  </ul>
  <li>fourth</li>  <!-- 7 -->
</ul>
```

So

```js
traversty('#root').down(5) // →  will give you `<li>ii</li>`
traversty('#root').down('li', 5) // →  will give you `<li>i</li>` because the `<ul>` is ignored:w
```

Of course `down()` works on multiple elements simultaneously just like the other methods.


I want a demo!
--------------

You'll have to make do with the integration tests. [Here](http://rvagg.github.com/traversty/test/integration/ender_qwery.html) is Traversty running in an Ender build with Qwery and Bonzo and [here](http://rvagg.github.com/traversty/test/integration/ender_sel.html) is the same but with Sel instead of Qwery as the selector engine.

View-source to see what it's doing, note that it's operating on 2 lists at the same time.


Things to note
--------------

 * Traversty always does a **uniqueness** check on its collection of elements so you should never end up with duplicates. If you did a `traversty('body,ul').down('li')` you would still only get a unique list of all *<li>* elements in the document.

 * Traversty ignores text and comment nodes and should only ever operate on the DOM element nodes you would expect (i.e. with *nodeType==1*).

 * Traversty currently orders results (for each element in the starting list) in document-order, so `previous('*')` will give you results starting from the *firstChild* of the parent element up to the *previousSibling* of the starting element, rather than starting with the *previousSibling* and listing backwards (this doesn't impact on indexing, which still works backwards, only the order of result lists). This may change, I haven't decided yet!

### Supported browsers ###

Traversty is tested with IE6+, Firefox 3+, Safari 4+, Opera current and Chrome current. You'll need a supported selector engine to operate on some of these older browsers. See below.


Selector engines
----------------

Traversty should work out-of-the-box on modern browsers as it leverages native `querySelectorAll()` and `matchesSelector()` where they exist. This means that you should be able to use Traversty without a selector engine on most smartphone browsers without any problems.

Unfortunately, this doesn't work with older browsers, particularly IE8 and below. While IE8 has a CSS2-compliant `querySelectorAll()`, it doesn't have a `matchesSelector()` which Traversty makes heavy use of.

### `traversty.setSelectorEngine(engine)` ###

Traversty allows you to plug in your favourite selector engine so it can work on whatever browser your engine supports. Out of the box, Traversty is tested to support [Qwery](https://github.com/ded/qwery), [Sel](https://github.com/amccollum/sel), [Sizzle](https://github.com/jquery/sizzle) and [NWMatcher](https://github.com/dperini/nwmatcher).

Traversty uses *feature detection* to figure out how to use your selector engine, it tries to find the method used to *find* elements given a element root and the method used to determine if an element *matches* a given selector. If it can't figure out how to use your selector engine then you just need to pretend that it works like one of the supported ones and it should be OK.

For example:

```js
traversty.setSelectorEngine({
    select: function(selector, root) {
      return MyEngine(selector, root);
    }
  , is: function(selector, root) {
      return MyEngine(root).isTheSameAs(selector);
    }
});
```

Traversty will also do some trickery to make up for deficiencies in some selector engines, such as out-of-order results when selecting on groups ('a,b').

If you have a new selector engine that you want Traversty to support then either let me know or fork, patch and submit.


Ender integration
-----------------

Traversty is designed to be inserted into an Ender build. It's in NPM so simply include it in your build command, something like: `ender build sel bonzo traversty`

Traversty will attempt to use whatever selector engine you've included in your Ender build.

### What about Bonzo? ###

Traversty is designed to add to the goodness you get in Bonzo, although Bonzo isn't a dependency. Bonzo has `next()` and `previous()` already and it is intended that Traversty replace these in your ender build. Argument-less they should do exactly the same thing but Traversty adds the extra arguments for greater flexibility. If you are using Bonzo in Ender along with Traversty then you should make sure Traversty is included *after* Bonzo. Unfortunately, [Ender doesn't guarantee order](https://github.com/ender-js/Ender/issues/63) so you may have to fiddle a bit. 


Contributing
------------

Awesome! Just do it, fork and submit your pull requests and they will be promptly considered.

I'd also love it if you could contribute tests for bugs you find or features you add.

While I'm not a coding-style nazi but I do like consistency. I've chosen a particular style for this project (not my usual style, I have a Java background, I'm experimenting with style!) and I'd prefer to keep it consistent.

### Tests ###

Traversty uses [Buster](http://busterjs.org) for unit testing. It works by running a server for you to attach browsers to so you can submit all tests to be run in all of the attached browsers right from the command-line.

Simply do this:

```
$ sudo npm install buster -g  # install Buster if you haven't already got it
$ make server                 # will start the Buster server for you on port 1111.
$                             # point a bunch of browsers to that server, including older versions of IE (start your VMs!)
$ make test                   # will submit the tests to the Buster server to be run on those browsers
```

You'll see a nice output with the results of the tests as they happen.

### Where are your semi-colons? ###

Oh, you noticed that? Just think of this as my [The Cat in the Hat](http://en.wikipedia.org/wiki/The_Cat_in_the_Hat) project. It's an experiment in how difficult it is to write valid JavaScript devoid of semi-colons. There's only a couple of awkward constructions that could do with a `for` loop, but I don't think it's a big deal. 


Credits
-------

 * Firstly, much credit should go to the awesome Prototype guys and their excellent API that I've ripped off.
 * Thanks to [@ded](http://github.com/ded) and [@fat](http://github.com/fat) for Ender, particularly @ded for Bonzo, upon which Traversty is designed to build.

The bulk of the work is done by me, Rod Vagg, [@rvagg](http://twitter.com/rvagg)

Licence
-------

Blah, Blah, MIT
