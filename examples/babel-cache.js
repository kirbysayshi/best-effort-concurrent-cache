var fs = require('fs');
var path = require('path');
var Becc = require('../index');

var becc = Becc(fs);

// Ensure cache folder exists
var cachePath = path.join(process.cwd(), '.cache');
try {
  fs.mkdirSync(cachePath);
} catch (e) {}

var babel = require('babel-core');

var oldExt = require.extensions['.js'];
require.extensions['.js'] = function (module, filename) {

  // Normally you'd want to do an exclusion list, such as not compiling
  // node_modules at least. Babel has an `only` field in it's babelrc
  // that is useful for this, but for demonstration purposes we're going
  // to Babel transpile everything so there is a noticeable performance
  // difference.

  // Get a cached version
  // This checks the file's mtime compared to the cached hash.
  var retrieved = becc.retrieve(cachePath, filename);

  if (!retrieved) {
    // We didn't find a cached version, or the cached version has expired due
    // to a differing mtime.
    // Perform the expensive work and cache it!
    var contents = fs.readFileSync(filename, 'utf8');
    retrieved = babel.transform(contents, { presets: ['es2015'] }).code;
    becc.cache(cachePath, filename, retrieved);
  }

  return module._compile(retrieved, filename);
}
