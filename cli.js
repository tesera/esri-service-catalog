'use strict';
var getCalatog = require('./');

const url = process.argv[2];
getCalatog(url, function (err, catalog) {
    console.log(JSON.stringify(catalog));
});
