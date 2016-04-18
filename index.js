var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var debug = require('debug');
var dbg = debug('best-effort-concurrent-cache');

module.exports = function (fs, extractProps) {
  if (!extractProps) extractProps = defaultExtractProps;

  ['writeFileSync', 'renameSync', 'statSync']
  .forEach(function validateFSImplementation (prop) {
    if (!fs[prop]) throw new Error(''
      + 'fs implementation is missing required '
      + '`' + prop + '` function.');
  });

  return {
    cache: cache.bind(null, fs, extractProps),
    retrieve: retrieve.bind(null, fs, extractProps)
  }
}

function defaultExtractProps (stat) {
  return stat.mtime;
}

function cache (fs, extractProps, cacheDir, filename, contents) {
  var s = fs.statSync(filename);
  var h = hash(filename, extractProps(s));
  var lock = path.join(cacheDir, h + '-lock');
  var p = path.join(cacheDir, h);
  try {
    fs.writeFileSync(lock, contents, 'utf8');
    fs.renameSync(lock, p);
    dbg('cache store %s', filename);
  } catch (e) {
    // someone else is writing the lockfile
    dbg('bailed cache store %s, %s', filename, e.message);
  }
}

function retrieve (fs, extractProps, cacheDir, filename) {
  var s = fs.statSync(filename);
  var h = hash(filename, extractProps(s));
  var lock = path.join(cacheDir, h + '-lock');
  var p = path.join(cacheDir, h);

  // If the lock file exists, count this as a miss. This will likely
  // create a cascade of cache misses if it's a "popular" file.
  try {
    fs.statSync(lock);
    return null;
  } catch (e) {}

  try {
    dbg('cache read %s', filename);
    return fs.readFileSync(p, { encoding: 'utf8' });;
  } catch (e) {
    return null;
  }
}

function hash (filename, extra) {
  var hmac = crypto.createHmac('sha256', 'SECRET NOT REALLY');
  hmac.update(filename + extra);
  return hmac.digest('hex');
}
