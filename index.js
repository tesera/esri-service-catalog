'use strict';
let wait = require('co-wait');
let co = require('co');
let request = require('co-request');

let delay = 0;
function* get (url) {
    delay += 500;
    yield wait(delay);
    const res = yield request(url, { qs: { f: 'json' } });
    return JSON.parse(res.body);
}

function getCatalog(url, options, callback) {
    co(function* () {
        let index = {};
        
        const root = yield get(url);

        // INDEX FOLDERS
        const folders = root.folders;
        const folderUrls = folders.map(f => url + `/${f}`);
        const foldersMeta = yield folderUrls.map(url => get(url));
        folderUrls.forEach((f, i) => index[f] = foldersMeta[i] );

        delay = 0;

        // INDEX SERVICES
        const serviceUrls = folderUrls.reduce((urls, folder) => 
            urls.concat(index[folder].services.map(s => url + `/${s.name}/${s.type}`)), []);
        const servicesMeta = yield serviceUrls.map(url => get(url));
        serviceUrls.forEach((url, i) => index[url] = servicesMeta[i] );

        delay = 0;

        const servicesByFolder = folderUrls.reduce((byFolder, folderUrl) => {
            byFolder[folderUrl] = serviceUrls.filter(url => url.startsWith(folderUrl));
            return byFolder;
        }, {});

        const catalog = {
            folderServices: servicesByFolder,
            folders: folderUrls,
            services: serviceUrls,
            metadata: index
        };

        // INDEX LAYERS
        if(options.includeLayers) {
            const layerUrls = serviceUrls.reduce((layerUrls, serviceUrl) => {
                let urls = [];
                if (index[serviceUrl].layers)
                    urls = index[serviceUrl].layers.map(l => serviceUrl + `/${l.id}`);
                return layerUrls.concat(urls || []);
            }, []);
            const layersMeta = yield layerUrls.map(url => get(url));
            layerUrls.forEach((l, i) => index[l] = layersMeta[i] );

            const layersByService = serviceUrls.reduce((byService, serviceUrl) => {
                byService[serviceUrl] = layerUrls.filter(url => url.startsWith(serviceUrl));
                return byService;
            }, {});

            catalog.serviceLayers = layersByService;
            catalog.index = index;
        }

        callback(null, catalog);
    }).catch(callback);
}

module.exports = getCatalog;