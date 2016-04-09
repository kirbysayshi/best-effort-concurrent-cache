var fs = require('fs');
var path = require('path');
var becc = require('../index');

// Ensure cache folder exists
var cachePath = path.join(process.cwd(), '.cache');
try {
  fs.mkdirSync(cachePath);
} catch (e) {}

var babel = require('babel-core');

var oldExt = require.extensions['.js'];
require.extensions['.js'] = function (module, filename) {

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
