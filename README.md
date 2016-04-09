best-effort-concurrent-cache
============================

Sometimes you want to cache things using the filesystem due to an expensive process, especially when developing build tools or other utilities. A perfect example is caching transpiled code. Another might simply be making no changes to the file contents, but instead using the cache to know if a file has changed between runs of a process.

NOTE: This package is not meant as a high-performance, bullet-proof caching utility. It is meant as a "best effort" to provide failsafe caching. In the best case, caching will happen. In the worst case, caching will not happen but your program won't fail.

Why?
----

[Babel's require hook](https://babeljs.io/docs/usage/require/#environment-variables), for example, caches transpiled code, but does so as a monolithic JSON file. Another example is [browserify-incremental](https://www.npmjs.com/package/browserify-incremental). These monolithic JSON caches work well, but break down if multiple independent processes attempt to access the same cache. The cache is easily clobbered, corrupted, or made irrelevant by concurrent processes all reading an empty cache at startup, and writing multiple copies of the cache at process end.

When would you have multiple processes transpiling code? Perhaps when trying to speed up mocha unit tests by running them in parallel via separate processes. Or building multiple JS bundles from the same shared local libraries but different entry points.

Usage
-----

```js
var fs = require('fs');
var path = require('path');
var becc = require('best-effort-concurrent-cache');

// Ensure cache folder exists
var cachePath = path.join(process.cwd(), '.cache');
try {
  fs.mkdirSync(cachePath);
} catch (e) {}

var babel = require('babel-core');

var f = path.join(process.cwd(), './myfile.es6');

// Get a cached version
// This checks the file's mtime compared to the cached hash.
var retrieved = becc.retrieve(cachePath, f);

if (!retrieved) {
  // We didn't find a cached version, or the cached version has expired due
  // to a differing mtime.
  // Perform the expensive work and cache it!
  retrieved = babel.transform(fs.readFileSync(f, 'utf8'), { presets: ['es2015'] }).code;
  becc.cache(cachePath, f, retrieved);
}

// Do something with retrieved
```

A similar example is located in [examples/babel-cache.js](examples/babel-cache.js), which can be executed using:

```sh
$ node -r ./examples/babel-cache.js examples/babel-cache-input.js
```

TODO
----

- [ ] Add a concurrent mocha example.

License
-------

UNLICENSED
