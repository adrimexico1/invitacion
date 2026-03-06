const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');
console.log(css.split('.location-card {')[1].split('}')[0]);
