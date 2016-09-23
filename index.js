'use strict';
let co = require('co');
let request = require('co-request');

function* get (url) {
    const res = yield request(url, { qs: { f: 'json' } });
    return JSON.parse(res.body);
}

function getCatalog(url, callback) {
    co(function* () {
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

        const servicesByFolder = folderUrls.reduce((byFolder, folderUrl) => {
            byFolder[folderUrl] = serviceUrls.filter(url => url.startsWith(folderUrl));
            return byFolder;
        }, {});

        const layersByService = serviceUrls.reduce((byService, serviceUrl) => {
            byService[serviceUrl] = layerUrls.filter(url => url.startsWith(serviceUrl));
            return byService;
        }, {});

        const getLayerNamebyUrl = (url) => {
            const layerId = url.substring(url.lastIndexOf('/') + 1);
            const serviceUrl = url.substring(0, url.lastIndexOf('/'));
            const service = index[serviceUrl];
            const layer = service.layers.filter((l) => l.id == layerId);
            return layer[0] && layer[0].name ? layer[0].name : '';
        }

        const namesByUrl = Object.keys(index).reduce((byUrl, url) => {
            const parts = url.split('/');
            switch(parts.length) {
                case 7:
                    byUrl[url] = parts[6];
                    return byUrl;
                case 9:
                    byUrl[url] = parts[7];
                    return byUrl;
                case 10:
                    byUrl[url] = getLayerNamebyUrl(url);
                    return byUrl;
                default:
                    return byUrl;
            }
            
        }, {});
        
        const catalog = {
            servicesByFolder: servicesByFolder,
            layersByService: layersByService,
            namesByUrl: namesByUrl,
            folder: folderUrls,
            service: serviceUrls,
            layer: layerUrls,
            metaByUrl: index,
        };
        
        callback(null, catalog);
    }).catch(callback);
}

module.exports = getCatalog;