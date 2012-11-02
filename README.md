# Traversty &mdash; headache-free DOM collection management and traversal

Traversty is a library-agnostic DOM utility for traversal and element collection manipulation. Traversty doesn't provide any DOM manipulation features, instead, Traversty is used for managing collections of DOM elements and navigating the DOM.

<a href="#api"><i>Just show me the API!</i></a>

## Traversal

The core DOM traversal methods are inspired by [Prototype](http://prototypejs.org)'s excelent "DOM traversal toolkit", you get <a href="#up"><code>up()</code></a>, <a href="#down"><code>down()</code></a>, <a href="#next"><code>next()</code></a> and <a href="#previous"><code>previous()</code></a> with optional `selector` and `index` arguments, all in a multi-element environment&mdash;jQuery-like rather than Prototype's single-element implementation.

In addition, jQuery-compatible traversal methods extend this functionality: <a href="#parents"><code>parents()</code></a>, <a href="#closest"><code>closest()</code></a>, <a href="#children"><code>children()</code></a>, <a href="#siblings"><code>siblings()</code></a> and <a href="#prev"><code>prev()</code></a> a simple alias for <a href="#previous"><code>previous()</code></a>.

## Collection filtering

Traversty operates on DOM element collections, jQuery-style, so it also gives you methods to filter and manipulate that collection. The filtering methods are designed to be jQuery-compatible. You get: <a href="#first"><code>first()</code></a>, <a href="#last"><code>last()</code></a>, <a href="#eq"><code>eq()</code></a>, <a href="#not"><code>not()</code></a>, <a href="#slice"><code>slice()</code></a>, <a href="#filter"><code>filter()</code></a>, <a href="#has"><code>has()</code></a> and <a href="#is"><code>is()</code></a> (this last method returns a boolean rather than a collection).

Traversty emulates an Array and includes additional methods to help you manage it as if it were one: <a href="#get"><code>get()</code></a>, <a href="#toArray"><code>toArray()</code></a>, <a href="#size"><code>size()</code></a>, <a href="#push"><code>push()</code></a>, <a href="#sort"><code>sort()</code></a>, <a href="#splice"><code>splice()</code></a>.

### Ender integration

Traversty is designed to be integrated in an [Ender](http://ender.no.de/) build, to augment what's already available in [Bonzo](https://github.com/ded/bonzo) but can just as easily be used as a stand-alone utility.

```
$ ender build jeesh traversty
```

### Component integration

You can also install Traversty as a [component](https://github.com/component/component):

```
$ component install rvagg/traversty
```

Wiring up a selector engine is let to you in your component build. You'll need to make one-off call to `setSelectorEngine()` once you have a selector engine to inject, otherwise Traversty will simply use native `querySelectorAll()` and `matchesSelector()` if available. See the <a href="#setSelectorEngine"><code>setSelectorEngine()</code></a> for more details on how this works.

```js
var zest = require('zest')
  , $ = require('traversty').setSelectorEngine(zest)
```

## Example usage

This bit of crazyness comes from Traversty's integration tests. The bulk of this code is used to test Traversty's integration with Ender where the `css()` method is provided by [Bonzo](https://github.com/ded/bonzo) but there is also a [vanilla version](https://github.com/rvagg/traversty/blob/master/test/integration/traversty_css_qwery.html) with only [Qwery](https://github.com/ded/qwery) for the selector engine and a `css()` method added using Traversty's <a href="#aug"><code>aug()</code></a> method (see the [/examples/aug-css.js](https://github.com/rvagg/traversty/blob/master/examples/aug-css.js) file for how this is done).

```js
var $ = traversty
$.setSelectorEngine(qwery)
$('#fixtures > ul') // Traversty operates on collecitons of elements
  .down(0).css('color', 'red')
  .next('li', 1).css('color', 'green')
  .next().down('li', 2).css('color', 'blue')
  .next().down().css('color', 'yellow')
  .up(2).next().css('color', 'purple')
  .siblings(3).css('fontWeight', 'bold')
  .children().css('textDecoration', 'underline')
  .children(1).css('borderLeft', 'solid 5px red')
  .parents('*').filter('ul').css('borderTop', 'dashed 2px green')
  .not('.second').css('borderBottom', 'solid 3px blue')
  .down('.second li').has('span').css('marginTop', '10px')
  .up('ul').eq(-1).css('borderLeft', 'solid 5px orange')
  .closest('#fixtures').down('li').slice(-10,-9).css('fontSize', '25px')
  // Note: the css() method is not native to Traversty but is added with aug()
```

The return type from the `traversty()` method is not a true `Array` but can be used like an array in almost all respects, it has `.length` and `[]` subscript element access and other standard `Array` methods.

<a href="#api"></a>
## API

  * <a href="#ctor"><code><b>traversty()</b></code></a>
  * <a href="#next"><code>traversty().<b>next()</b></code></a>
  * <a href="#previous"><code>traversty().<b>previous()</b></code></a>
  * <a href="#previous"><code>traversty().<b>prev()</b></code></a>
  * <a href="#up"><code>traversty().<b>up()</b></code></a>
  * <a href="#parents"><code>traversty().<b>parents()</b></code></a>
  * <a href="#closest"><code>traversty().<b>closest()</b></code></a>
  * <a href="#down"><code>traversty().<b>down()</b></code></a>
  * <a href="#children"><code>traversty().<b>children()</b></code></a>
  * <a href="#siblings"><code>traversty().<b>siblings()</b></code></a>
  * <a href="#first"><code>traversty().<b>first()</b></code></a>
  * <a href="#last"><code>traversty().<b>last()</b></code></a>
  * <a href="#eq"><code>traversty().<b>eq()</b></code></a>
  * <a href="#slice"><code>traversty().<b>slice()</b></code></a>
  * <a href="#filter"><code>traversty().<b>filter()</b></code></a>
  * <a href="#not"><code>traversty().<b>not()</b></code></a>
  * <a href="#has"><code>traversty().<b>has()</b></code></a>
  * <a href="#is"><code>traversty().<b>is()</b></code></a>
  * <a href="#get"><code>traversty().<b>get()</b></code></a>
  * <a href="#each"><code>traversty().<b>each()</b></code></a>
  * <a href="#toArray"><code>traversty().<b>toArray()</b></code></a>
  * <a href="#size"><code>traversty().<b>size()</b></code></a>
  * <a href="#push"><code>traversty().<b>push()</b></code></a>
  * <a href="#sort"><code>traversty().<b>sort()</b></code></a>
  * <a href="#splice"><code>traversty().<b>splice()</b></code></a>
  * <a href="#aug"><code>traversty.<b>aug()</b></code></a>
  * <a href="#setSelectorEngine"><code>traversty.<b>setSelectorEngine()</b></code></a>
  * <a href="#noConflict"><code>traversty.<b>noConflict()</b></code></a>

--------------------------------------------------------
<a name="ctor"></a>
### traversty(element | elements | selector)
<code>traversty()</code> gives you a new Traversty instance containing the elements you provide.

Once you have a collection, you can call any of the Traversty methods on that collection. You can give a single DOM element or an array of DOM elements. If you provide a string argument it will be used as a selector to either query the DOM via the browser's native `querySelectorAll()` implementation or use a selector engine which you provide (see <a href="#setSelectorEngine"><code>setSelectorEngine()</code></a>).

You can pluck individual elements with array accessors (subscript), e.g. `traversty(document.body)[0] // → document.body` 

When included in an Ender build, `$(element | elements | selector)` does the same thing and all the Traversty methods will be available on the resulting Ender object.

--------------------------------------------------------
<a name="next"></a>
### next([selector [, index = 0]])
<code>traversty(elements).next()</code> returns a new Traversty instance containing *nextSibling* elements according to the arguments provided.

 * `selector` *(String)* is an optional CSS selector
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

You will get elements that match the given *selector* (if provided) starting from the *nextSibling* of the starting element(s), all the way across to the last *nextSibling*.

If no `index` or `selector` is given then you get just the *nextSibling*s of the elements; i.e. you shift *across* by one.

If just an `index` is provided then you'll get the `index+1` *nextSibling*s of the element(s). i.e. `index` is 0-based, like arrays, 0 is *nextSibling* and 1 is *nextSibling.nextSibling*, unless you provide a `selector` of course, in which case it'll skip over non-matching elements.

If just a `selector` is provided then no `index` will be assumed, you'll get **all** matching *nextSibling* elements.

#### Examples ####

```js
traversty('li:first-child').next();
  // →  returns the second `<li>` of every list in the document
traversty('li.allstarts').next('li', 1);
  // →  returns the `nextSibling` of the `nextSibling` of the starting elements
traversty('li:first-child').next('li');
  // →  returns all `<li>` elements, except for the first-children of every lits in the document
```

--------------------------------------------------------
<a name="previous"></a>
### previous([selector [, index = 0]])
<code>traversty(elements).previous()</code> returns a new Traversty instance containing *previousSibling* elements according to the arguments provided.

 * `selector` *(String)* is an optional CSS selector
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

Exactly the same as <a href="#next"><code>next()</code></a> except it works on *previousSibling*, so you move *backwards* amongst sibling elements.

#### Examples ####

```js
traversty('li:nth-child(20)').previous();
  // →  returns 19th child of the every list in the document (where it exists)
traversty('li.allstarts').previous('li', 1);
  // →  returns the `previousSibling` of the `previousSibling` of the starting element
traversty('li:nth-child(20)').previous('.interesting');
  // →  returns all `<li>` elements with class "interesting" up to the 19th child of every list
  //     in the document where there are at least 20 children.
```

--------------------------------------------------------
<a name="prev"></a>
### prev([selector [, index = 0]])
<code>traversty(elements).prev()</code> is a simple alias for <a href="#previous"><code>previous()</code></a>, provided mainly for jQuery compatibility.

--------------------------------------------------------
<a name="up"></a>
### up([selector [, index = 0]])
<code>traversty(elements).up()</code> returns a new Traversty instance containing *parentNode* elements according to the arguments provided.

 * `selector` *(String)* is an optional CSS selector
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

Similar to <a href="#next"><code>next()</code></a> and <a href="#previous"><code>previous()</code></a> except that it works on *parentNode*s and will continue all the up to the document root depending on what you're asking for.

If no `index` or `selector` is given then you get just the `parentNode*s of the elements.

If just an `index` is provided then you'll get the `index+1` *parentNode*s of the element. i.e. `index` is 0-based, like arrays, 0 is *parentNode* and 1 is *parentNode.parentNode*, unless you provide a `selector` of course, in which case it'll skip over non-matching elements.

If just a `selector` is provided then no `index` will be assumed, you'll get **all** matching ancestor elements.

#### Examples ####

```js
traversty('li#start').up();
  // →  returns the `<ul>` parent element
traversty('li.allstarts').up('ul', 1);
  // →  returns the grandparent `<ul>` elements if the start elements are nested at two levels
traversty('li.allstarts').up('ul');
  // →  returns all ancestor `<ul>` elements, no matter how deep the nesting
```

--------------------------------------------------------
<a name="parents"></a>
### parents([selector = '*' [, index ]])
<code>traversty(elements).parents()</code> returns a new Traversty instance containing *parentNode* elements according to the arguments provided, similar, but not identical to <a href="#up"><code>up()</code></a>.

 * `selector` *(String)* is an optional CSS selector (defaults to `'*'`, i.e. match *all* ancestor elements)
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

Performs exactly the same as <a href="#up"><code>up()</code></a>, *except*, the `'selector'` argument defaults to `'*'` which has the effect of matching *all* ancestor elements, not just the first one. `parents()` will return exactly the same collection as `up('*')`. Provided mainly for jQuery compatibility.

--------------------------------------------------------
<a name="closest"></a>
### closest([selector = '*' [, index = 0]])
<code>traversty(elements).closest()</code> returns a new Traversty instance containing the elements and/or *parentNode* elements according to the arguments provided, similar, but not identical to <a href="#parents"><code>parents()</code></a>.

 * `selector` *(String)* is an optional CSS selector (defaults to `'*'`, i.e. match *all* ancestor elements)
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. the current element)

Performs exactly the same operation as <a href="#parents"><code>parents()</code></a> except for two important differences:

 * Matching starts at the **current** elements rather than the direct parent elements. So a `closest('*')` will return the current elements because they match the selector `'*'`.
 * The `index` argument defaults to `0`, just like <a href="#up"><code>up()</code></a>, so you will only get the first match. An index of `n`, you will get the *nth* match, start with the current elements.

--------------------------------------------------------
<a name="down"></a>
### down([selector [, index = 0]])
<code>traversty(elements).down()</code> returns a new Traversty instance containing descendent elements according to the arguments provided.

 * `selector` *(String)* is an optional CSS selector
 * `index` *(Number)* is an optional array-ish index argument (defaults to `0`, i.e. first match)

While `down()` is very similar to the other methods, it's perhaps best to think of it as what you might get with a `find()` method from a selector engine.

`down()` works on elements **in document-order**, so it operates on child elements and children of children but it also moves through child-siblings on the way to children of children.

The following fragment should illustrate the `index`ing you get when you use `down()`:

```html
<ul id="root">
  <li>first</li>   <!-- 0 -->
  <li>second</li>  <!-- 1 -->
  <li>third        <!-- 2 -->
    <ul>           <!-- 3 -->
      <li>i</li>   <!-- 4 -->
      <li>ii</li>  <!-- 5 -->
      <li>iii</li> <!-- 6 -->
    </ul>
  </li>
  <li>fourth</li>  <!-- 7 -->
</ul>
```

So

```js
traversty('#root').down(5)
  // →  will give you `<li>ii</li>`
traversty('#root').down('li', 5)
  // →  will give you `<li>i</li>` because the `<ul>` is ignored
```

Of course `down()` works on multiple elements simultaneously just like the other methods.


--------------------------------------------------------
<a name="children"></a>
### children([selector [, index = 0]])
<code>traversty(elements).children()</code> returns a new Traversty instance containing direct descendent (child) elements according to the arguments provided.

```html
<ul id="root">
  <li>first
    <ul>
      <li><a href="#">i</a></li>
      <li>ii
        <ul>
          <li>a</li>
          <li>b</li>
        </ul>
      </li>
      <li>iii</li>
      <li>iv</li>
    </ul>
  </li>
  <li>second</li>
</ul>
```

```js
traversty('#root > li').children()
  // →  will give you *only* the second level `<ul>` element as it's
  //    the only direct descendent of the top `<li>` elements
traversty('#root > li').children().children()
  // →  will give you *only* the second level `<li>` elements and none
  //    of their children
```

--------------------------------------------------------
<a name="siblings"></a>
### siblings([selector [, index = 0]])
<code>traversty(elements).siblings()</code> returns a new Traversty instance containing *previousSibling* and *nextSibling* elements according to the arguments provided. It's important to note that the resulting collection **will not** include the original elements unless they are siblings of each other. To illustrate:

```html
<ul id="root">
  <li>first</li>
  <li>second</li>
  <li>third</li>
  <li>fourth</li>
</ul>
```

```js
traversty('#root :nth-child(2)').siblings()
  // →  will give you all `<li>` elements except the second
traversty('#root :nth-child(2n)').siblings()
  // →  will give you all `<li>` elements because they are all siblings of
  //    the original collection's elements
```

`siblings()` is the only method in Traversty that is not guaranteed to return a collection of elements in document-order (i.e. in the order they appear in the HTML). If you call `siblings()` on elements that are already siblings then the collection mechanism may mean that the results are out of order. Generally this shouldn't matter but you are warned if order matters to you for some reason.


--------------------------------------------------------
<a name="first"></a>
### first()
<code>traversty(elements).first()</code> returns a new Traversty instance containing *only* the first element in the original collection.

--------------------------------------------------------
<a name="last"></a>
### last()
<code>traversty(elements).last()</code> returns a new Traversty instance containing *only* the last element in the original collection.

--------------------------------------------------------
<a name="eq"></a>
### eq(index)
<code>traversty(elements).eq()</code> returns a new Traversty instance containing *only* the element at the index specified.

Indexes are zero-based and can also be negative. A negative index will count backwards from the end of the collection.

```html
<ul id="root">
  <li>first</li>
  <li>second</li>
  <li>third</li>
  <li>fourth</li>
</ul>
```

```js
traversty('#root li').eq(1)
  // →  will give you `<li>second</li>`
traversty('#root li').eq(-2)
  // →  will give you `<li>third</li>`
```

--------------------------------------------------------
<a name="slice"></a>
### slice(start [, end])
<code>traversty(elements).slice()</code> returns a new Traversty instance containing *only* the elements between the `start` and `end` indexes. The `end` is optional, if left out then elements from `start` to the end of the collection are included.

Indexes are zero-based and can also be negative. A negative index will count backwards from the end of the collection. See the example above for <a href="#eq"><code>eq()</code></a> for how this works.

--------------------------------------------------------
<a name="filter"></a>
### filter(selector | function | element)
<code>traversty(elements).filter()</code> returns a new Traversty instance containing *only* the elements that satisfy the filter condition.

A `selector` string argument will simply check each element against the selector and return only elements that match.

A `function` argument will execute that function for each element in the collection and return only elements for which it receives a *truthy* response from the function. `this` within the function will be the element being checked and the single argument to the function will be the index within the collection.

An `element` argument will return a collection containing only that DOM element *only if * it exists within the collection.

```html
<ul id="root">
  <li>first
    <ul>
      <li><a href="#">i</a></li>
      <li>ii
        <ul>
          <li>a</li>
          <li>b</li>
        </ul>
      </li>
      <li>iii</li>
      <li>iv</li>
    </ul>
  </li>
  <li>second</li>
</ul>
```

```js
var els = traversty('#root *')
  // →  start off with all 12 descendent elements under #root
els = els.filter('li')
  // →  returns only the 8 `<li>` elements within the collection
els = els.filter(function () { return /^i/.test(this.innerHTML) })
  // →  returns only the 3 `<li>` elements start have content starting with 'i'
  //    i.e. only 'ii', 'iii' and 'iv' (not 'i')
els = els.filter(traversty('#root ul > li')[1])
  // →  we're using `traversty()` here as a simple selector to fetch the 'iii' element
  //    which we pass in to `filter()`. Because this element is in the collection we get
  //    back a collection with only this element.
```

--------------------------------------------------------
<a name="not"></a>
### not(selector | function | element)
<code>traversty(elements).not()</code> returns a new Traversty instance containing *only* the elements that **do not** satisfy the filter condition.

`not()` is the exact inverse of <a href="#filter"><code>filter()</code></a>, it takes the same arguments but returns only elements that don't match your conditions.

--------------------------------------------------------
<a name="has"></a>
### has(selector | element)
<code>traversty(elements).has()</code> returns a new Traversty instance containing *only* the elements that have descendent elements that match the provided `selector` argument, or have `element` as a descendent element.

If a `selector` string argument is provided, each element in the collection effectively has a `find(selector)`-type operation performed on it, if any matching descendent elements are found, the parent element is retained for the new collection; otherwise it is not included.

If an `element` argument is provided then the only element included in the resulting collection is an ancestor of that `element`, if the `element` is not a descendent of any of the elements in the collection then the resulting collection will be empty.

```html
<ul id="root">
  <li>first
    <ul>
      <li><a href="#">i</a></li>
      <li>ii
        <ul>
          <li>a</li>
          <li>b</li>
        </ul>
      </li>
      <li>iii</li>
      <li>iv</li>
    </ul>
  </li>
  <li>second</li>
</ul>
```

```js
var els = traversty('#root *')
  // →  start off with all 12 descendent elements under #root
els = els.has('li')
  // →  returns a collection of 4 elements which have `<li>` descendents: the 'first' `<li>`,
  //    the `<ul>` directly under it, the 'ii' `<li>` and the `<ul>` directly under that.
els.has(traversty('#root a')[0])
  // →  we're using `traversty()` here as a simple selector to fetch the `<a>` element
  //    which we pass in to `has()`. There are two elements that have this single element
  //    as a descendent, the 'first' `<li>` element and the `<ul>` directly under it.
```

--------------------------------------------------------
<a name="is"></a>
### is(selector | function | element)
<code>traversty(elements).is()</code> returns a **boolean** indicating whether at least one of the elements within the collection matches the condition. The method should be thought of as a version of <a href="#filter"><code>filter()</code></a> that returns a boolean if the resulting collection has at least one element; i.e. `traversty(elements).filter(condition).length > 0`.


--------------------------------------------------------
<a name="each"></a>
### each(function [, thisContext])
<code>traversty(elements).each()</code> will execute the provided `function` on each of the elements in the current collection. `each()` will return the original collection so you can continue chaining method calls.

Your `function` will be called with `this` equal to the individual elements or the `thisContext` argument if supplied. The arguments provided to the function are:

1. `element`: the current element in the collection
2. `index`: the index of the current element in the collection
3. `collection`: the entire Traversty object for this collection

Note the ordering of arguments 1 and 2 are different to the <a href="http://api.jquery.com/each/"><code>jQuery().each()</code></a>, instead Traversty is closer to ES5 <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach"><code>Array.prototype.forEach</code></a>.

```js
traversty('li').each(function (el, i) {
  this.innerHTML += ' (I am ' + i + ')'
})
```

--------------------------------------------------------
<a name="get"></a>
### get(index)
<code>traversty(elements).get()</code> returns a single DOM element at the specified index of the collection. Indexes are zero-based and can be negative. See <a href="#eq"><code>eq()</code></a> for specifics.


--------------------------------------------------------
<a name="toArray"></a>
### toArray()
<code>traversty(elements).toArray()</code> returns a true `Array` object containing elements within the collection. See [MDN](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array) for details on what you get.


--------------------------------------------------------
<a name="size"></a>
### size()
<code>traversty(elements).size()</code> returns an number indicating the number of elements in the collection. Works exactly the same as `.length` on an `Array` (indeed, you can call `.length` on a Traversty object and get the same value).


--------------------------------------------------------
<a name="push"></a>
### push(element1 [, element2 [...]])
<code>traversty(elements).push()</code> reuses `Array.prototype.push`. See [MDN](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/push) for details.

Beware of pushing non-DOM elements onto a Traversty object! This is not supported behaviour.


--------------------------------------------------------
<a name="sort"></a>
### sort([compareFunction])
<code>traversty(elements).sort()</code> reuses `Array.prototype.sort` to sort the collection. See [MDN](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/sort) for details.


--------------------------------------------------------
<a name="splice"></a>
### splice(index, howMany [, element1 [...]])
<code>traversty(elements).splice()</code> reuses `Array.prototype.splice` to splice the collection. See [MDN](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/splice) for details.


--------------------------------------------------------
<a name="aug"></a>
### aug(methodMap)
<code>traversty.aug()</code> extends Traversty's functionality with custom methods off the main Traversty prototype. The `methodMap` is simply a map of method names to functions. The functions will respond when called off a collection: `traversty().method(args)`.

```js
traversty.aug({ append: function (element) {
  // make sure we return 'this', which we can get from each()
  return this.each(function (el, i) {
    // append original to first element, append a clone to the rest
    el.appendChild(i > 0 ? element.cloneNode(true) : element)
  })
}})

var span = document.createElement('span')
span.innerHTML = 'BOOM!'
traversty('li').append(span)
```


--------------------------------------------------------
<a name="setSelectorEngine"></a>
### setSelectorEngine(selectorEngine)
<code>traversty.setSelectorEngine()</code> injects a selector engine for Traversty to use. See the next section for details. Returns the main `Traversty` object for chainability, e.g.: `var $ = traversty.setSelectorEngine(qwery)`.

## Selector engines

Traversty should work out-of-the-box on modern browsers as it leverages native `querySelectorAll()` and `matchesSelector()` where they exist. This means that you should be able to use Traversty without a selector engine on most smartphone browsers without any problems.

Unfortunately, this doesn't work with older browsers, particularly IE8 and below. While IE8 has a CSS2-compliant `querySelectorAll()`, it doesn't have a `matchesSelector()` which Traversty makes heavy use of.

Traversty allows you to plug in your favourite selector engine so it can work on whatever browsers your engine supports. Traversty is tested to support [Qwery](https://github.com/ded/qwery), [Sel](https://github.com/amccollum/sel), [Sizzle](https://github.com/jquery/sizzle), [NWMatcher](https://github.com/dperini/nwmatcher) and [Zest](https://github.com/chjj/zest).

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


## I want a demo!

You'll have to make do with the integration tests:

### Ender

[Here](http://rvagg.github.com/traversty/test/integration/ender_qwery.html) is Traversty running in an Ender build with Qwery and Bonzo. You can also see it running with [Sel](http://rvagg.github.com/traversty/test/integration/ender_sel.html), [Sizzle](http://rvagg.github.com/traversty/test/integration/ender_sizzle.html), [NWMatcher](http://rvagg.github.com/traversty/test/integration/ender_nwmatcher.html) and [without a selector engine](http://rvagg.github.com/traversty/test/integration/ender_sel.html) (works in modern browsers, including IE9+).

View-source to see what it's doing, note that it's operating on 2 lists at the same time.

### Vanilla

[Here](https://github.com/rvagg/traversty/blob/master/test/integration/traversty_css_qwery.html) is Traversty bundled with Qwery as the selector engine and the `css()` augmenting example code [/examples/aug-css.js](https://github.com/rvagg/traversty/blob/master/examples/aug-css.js) performing the same integration tests. There is also the same example using Zest instead [here](https://github.com/rvagg/traversty/blob/master/test/integration/traversty_css_zest.html)

## Things to note

 * Traversty always does a **uniqueness** check on its collection of elements so you should never end up with duplicates. If you do a `traversty('body,ul').down('li')` you would still only get a unique list of all *<li>* elements in the document.

 * Traversty ignores text and comment nodes and should only ever operate on the DOM element nodes you would expect (i.e. with `.nodeType === 1`).

 * Traversty currently orders results (for each element in the starting list) in document-order, so `previous('*')` will give you results starting from the *firstChild* of the parent element up to the *previousSibling* of the starting element, rather than starting with the *previousSibling* and listing backwards (this doesn't impact on indexing, which still works backwards, only the order of result lists). The single **exception** to this is <a href="#siblings"><code>siblings()</code></a>, see the note in that section for details.

## Supported browsers

Traversty is tested with IE6+, Firefox 3+, Safari 4+, Opera current and Chrome current. You'll need a supported selector engine to operate on some of these older browsers.


## Ender integration

Traversty is designed to be inserted into an Ender build. It's in npm so simply include it in your build command, something like: `ender build sel bonzo traversty`

Traversty will attempt to use whatever selector engine you've included in your Ender build.

### What about Bonzo?

Traversty is designed to add to the goodness you get in Bonzo, although Bonzo isn't a dependency. Bonzo has `next()` and `previous()` and a few other methods already and it is intended that Traversty replace these in your Ender build (because they are way-better!). Argument-less they should do exactly the same thing but Traversty adds the extra arguments for greater flexibility. If you are using Bonzo in Ender along with Traversty then you should make sure Traversty is included *after* Bonzo. Unfortunately, [Ender doesn't guarantee order](https://github.com/ender-js/Ender/issues/63) so you may have to fiddle a bit. The Ender 1.0 CLI does correct ordering but that's not formally released yet, you can use it by installing ender via npm with `npm install ender@dev`.


## Contributing

Awesome! Just do it, fork and submit your pull requests and they will be promptly considered.

I'd also love it if you could contribute tests for bugs you find or features you add.

### Tests

Traversty uses [Buster](http://busterjs.org) for unit testing.

Since Buster is still in Beta, the capture-server/client is a bit buggy and can be frustrating. So, instead, simply run *index.html* file in the *tests* directory in each of the browsers you need to test. It'll load and run all of the tests.


## Credits

 * Firstly, much credit should go to the awesome Prototype guys and their excellent API that I've ripped off.
 * Thanks to [@ded](http://github.com/ded) and [@fat](http://github.com/fat) for Ender, particularly @ded for Bonzo, upon which Traversty is designed to build.


## Licence

Traversty is Copyright (c) 2012 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.
