'use strict';
let co = require('co');
let request = require('co-request');

function* get (url) {
    const res = yield request(url, { qs: { f: 'json' } });
    return JSON.parse(res.body);
}

co(function* () {
    const url = 'http://gisonline.abmi.ca:6080/arcgis/rest/services';
    let index = {};
    
    const root = yield get(url);

    // INDEX FOLDERS
    const folders = root.folders;
    const folderUrls = folders.map(f => url + `/${f}`);
    const foldersMeta = yield folderUrls.map(url => get(url));
    folderUrls.forEach((f, i) => index[f] = foldersMeta[i] );

    // INDEX SERVICES
    const serviceUrls = folderUrls.reduce((urls, folder) => 
        urls.concat(index[folder].services.map(s => url + `/${s.name}/${s.type}`)), []);
    const servicesMeta = yield serviceUrls.map(url => get(url));
    serviceUrls.forEach((url, i) => index[url] = servicesMeta[i] );

    // INDEX LAYERS
    const layerUrls = serviceUrls.reduce((layerUrls, serviceUrl) => {
        let urls = [];
        if (index[serviceUrl].layers)
            urls = index[serviceUrl].layers.map(l => serviceUrl + `/${l.id}`);
        return layerUrls.concat(urls);
    }, []);
    const layersMeta = yield layerUrls.map(url => get(url));
    layerUrls.forEach((l, i) => index[l] = layersMeta[i] );

    
    const catalog = {
        folders: folderUrls,
        services: serviceUrls,
        layers: layerUrls,
        index: index,
    };

    console.log(JSON.stringify(catalog));
}).catch(console.error;