'use strict';
var program = require('commander');
var getCalatog = require('./');

let endpointUrl;

program
  .version('0.0.1')
  .arguments('<url>')
  .option('--include-layers', 'Should it harvest layer level metadata?', false)
  .action(function (url) {
     endpointUrl = url;
  });

program.parse(process.argv);

getCalatog(endpointUrl, { includeLayers: program.includeLayers } , function (err, catalog) {
    if (err) console.log(err)
    else console.log(JSON.stringify(catalog));
});