var child_process = require('child_process');
var path = require('path');

var exec = child_process.exec;

var mochaBin = path.join(process.cwd(), 'node_modules', '.bin', 'mocha');

var a = exec(mochaBin + ' --timeout 10000 -r examples/babel-cache.js examples/mocha-test-a.js');
var b = exec(mochaBin + ' --timeout 10000 -r examples/babel-cache.js examples/mocha-test-b.js');

a.stdout.pipe(process.stdout);
a.stderr.pipe(process.stderr);

b.stdout.pipe(process.stdout);
b.stderr.pipe(process.stderr);
