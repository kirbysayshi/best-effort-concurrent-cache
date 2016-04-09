var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var debug = require('debug');
var dbg = debug('best-effort-concurrent-cache');

exports.cache = cache;
exports.retrieve = retrieve;

function cache (cacheDir, filename, contents) {
  var s = fs.statSync(filename);
  var h = hash(filename, s.mtime);
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

function retrieve (cacheDir, filename) {
  var s = fs.statSync(filename);
  var h = hash(filename, s.mtime);
  var lock = path.join(cacheDir, h + '-lock');
  var p = path.join(cacheDir, h);

  // If the lock file exists, count this as a miss. This will likely
  // create a cascade of cache misses if it's a "popular" file.
  try {
    fs.statSync(lock);
    return null;
  } catch (e) {}

  try {
    return fs.readFileSync(p, { encoding: 'utf8' });;
  } catch (e) {
    return null;
  }
}

function hash (filename, mtime) {
  var hmac = crypto.createHmac('sha256', 'SECRET NOT REALLY');
  hmac.update(filename + mtime);
  return hmac.digest('hex');
}
