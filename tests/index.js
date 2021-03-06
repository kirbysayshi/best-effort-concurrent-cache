var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var test = require('tape');
var rimraf = require('rimraf');
var Becc = require('../index');

test('before', cleanup);

test('caches', function (t) {
  var becc = Becc(fs);
  var dir = path.join(process.cwd(), '.cache');
  fs.mkdirSync(dir);
  var filea = path.join(process.cwd(), 'tests', 'fixtures', 'file-a.js');
  becc.cache(dir, filea, 'cached');
  t.equal(becc.retrieve(dir, filea), 'cached');
  rimraf.sync(dir);
  t.end();
});

test('caches and invalidates', function (t) {
  var becc = Becc(fs);
  var dir = path.join(process.cwd(), '.cache');
  fs.mkdirSync(dir);
  var filea = path.join(process.cwd(), 'tests', 'fixtures', 'file-a.js');
  becc.cache(dir, filea, 'cached');
  t.equal(becc.retrieve(dir, filea), 'cached');
  fs.utimesSync(filea, Date.now(), Date.now());
  t.equal(becc.retrieve(dir, filea), null);
  rimraf.sync(dir);
  t.end();
});

test('stat extractor', function (t) {
  var becc1 = Becc(fs, function (stat) {
    return '' + stat.mtime + stat.size;
  });
  var becc2 = Becc(fs);
  var dir = path.join(process.cwd(), '.cache');
  fs.mkdirSync(dir);
  var filea = path.join(process.cwd(), 'tests', 'fixtures', 'file-a.js');
  becc1.cache(dir, filea, 'cached');
  becc2.cache(dir, filea, 'cached');
  var files = fs.readdirSync(dir);
  t.equal(files.length, 2, 'two separate cache entries');
  rimraf.sync(dir);
  t.end();
});

test('two processes', function (t) {
  t.plan(5);
  var dir = path.join(process.cwd(), '.cache');
  var access = path.join(__dirname, 'tools', 'access.js');
  var mtimes = [];

  exec('node ' + access, asserts);
  exec('node ' + access, asserts);

  function asserts (err, stdout, stderr) {
    t.ifErr(err);
    t.equal(stdout, 'contents\ncached!');
    var caches = fs.readdirSync(dir);
    if (!mtimes.length) {
      // first one to finish
      var cpath = path.join(dir, caches[0]);
      mtimes.push(fs.statSync(cpath).mtime);
    } else {
      var cpath = path.join(dir, caches[0]);
      var mtime = fs.statSync(cpath).mtime;
      t.equal(mtime.getTime(), mtimes[0].getTime(), 'cache was written once');
    }
  }
});

test('after', cleanup);

function cleanup(t) {
  var dir = path.join(process.cwd(), '.cache');
  rimraf.sync(dir);
  t.end();
}
