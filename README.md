ESRI Service Walker

Walks an ESRI ARCGIS REST service and returns a service index.

```
    'use strict';
    var getCalatog = require('./');

    getCalatog('http://myserver.com/arcgis/rest/service', function (err, catalog) {
        console.log(JSON.stringify(catalog));
    });

```
