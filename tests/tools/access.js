#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var Becc = require('../../index');

var becc = Becc(fs);
var dir = path.join(__dirname, '..', '..', '.cache');

fs.mkdir(dir, function (err) {
  fs.statSync(dir); // if this throws, our test will fail.
  var aPath = path.join(__dirname, '../fixtures/file-a.js');

  var retrieved = becc.retrieve(dir, aPath);
  if (!retrieved) {
    retrieved = fs.readFileSync(aPath, 'utf8') + 'cached!';
    becc.cache(dir, aPath, retrieved);
  }

  process.stdout.write(retrieved);
});
