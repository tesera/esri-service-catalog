ESRI Service Catalog

This tool is shipped with a module and a CLI. You can import the module directly in your project or use the CLI directly. The library will walk an ArcGIS endpoint and harvest metadata into a single JSON file.

###Install
```terminal
npm install tesera/esri-service-catalog --global
```

###Usage
```terminal
$ esri-catalog --help
Usage: cli [options] <url>

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
    --include-layers  Should it harvest layer level metadata?
    
$ esri-catalog http://your-server.com/arcgis.rest/services > meta.json
$ cat meta.json
{
  "folderServices": {
    "http://your-server.com/rest/services/your-folder": [
      "http://your-server.com/rest/services/your-folder-1/your-service-1/MapServer"
    ],
    "http://your-server.com/rest/services/your-folder-2": [
      "http://your-server.com/rest/services/your-folder-2/your-service-1/MapServer",
      "http://your-server.com/rest/services/your-folder-2/your-service-2/MapServer"
    ]
  },
  "folders": [
    "http://your-server.com/rest/services/your-folder-1",
    "http://your-server.com/rest/services/your-folder-2"
  ],
  "services": [
    "http://your-server.com/rest/services/your-folder-1/your-service-1/MapServer",
    "http://your-server.com/rest/services/your-folder-2/your-service-1/MapServer",
    "http://your-server.com/rest/services/your-folder-2/your-service-2/MapServer"
  ],
  "metadata": {
    "http://your-server.com/rest/services/your-folder-1": {
      "currentVersion": 10.4,
      "folders": [],
      "services": [
        {
          "name": "your-folder-1/your-service-1",
          "type": "MapServer"
        },
        {
          "name": "your-folder-1/your-service-2",
          "type": "MapServer"
        },
      ]
    }
    ...
  }
}
```
