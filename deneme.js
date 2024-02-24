const sha256 = require('js-sha256').sha256;

let a = sha256('Hello World');
let b = sha256('HelloWorld');
let c = sha256('Hello world');

console.log(a);
console.log(b);
console.log(c);
console.log(a === b);