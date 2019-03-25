'use strict';

const Hapi = require('hapi');
const Vision = require('vision');
const Ejs = require('ejs');
const request = require('request');
const _ = require('lodash');

function getFixitStuff() {
    return new Promise((resolve, reject) => {
        request('https://seeclickfix.com/api/v2/issues?place_url=can_vancouver&per_page=10&page=1', (err, response, body) => {
            if (err) {
                console.log('error:', err);
            }
            resolve(JSON.parse(body));
        });
    });
}

function getIssues(body) {
    return new Promise((resolve, reject) => {
        const issues = _.map(body.issues, 'summary');
        resolve(issues);
    });
}

function getLatLong(body) {
    return new Promise((resolve, reject) => {
        const lat = _.map(body.issues, 'lat');
        const lng = _.map(body.issues, 'lng');
        const latLng = { lat, lng };
        resolve(latLng);
    });
}

function getImages(body) {
    return new Promise((resolve, reject) => {
        const images = _.map(body.issues, 'media.image_square_100x100');
        resolve(images);
    });
}

const internals = {
    templatePath: 'basic'
};

const today = new Date();
internals.thisYear = today.getFullYear();


const rootHandler = async(request, h) => {

    const body = await getFixitStuff();
    const issues = await getIssues(body);
    const latLng = await getLatLong(body);
    const images = await getImages(body);
    return h.view('index', {
        title: `NorfolkJS Presentation`,
        message: issues,
        latLng: latLng,
        images: images,
        year: internals.thisYear
    });
};

const healthHandler = async(req, h) => {
    console.log('GOOD');
    return h.response(200);
};

internals.main = async() => {

    const server = Hapi.Server({ port: 8080 });

    await server.register(Vision);

    server.views({
        engines: { ejs: Ejs },
        relativeTo: __dirname,
        path: `templates/${internals.templatePath}`
    });

    server.route({ method: 'GET', path: '/', handler: rootHandler });
    server.route({ method: 'GET', path: '/health', handler: healthHandler });
    await server.start();
    console.log(`Server is running at ${server.info.uri}`);
};


internals.main();
