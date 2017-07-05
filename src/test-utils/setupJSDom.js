const jsdom = require('jsdom');

const defaultHtml = '<!doctype html><html><head><meta charset="utf-8">' +
   '</head><body></body></html>';

const { window } = new jsdom.JSDOM(defaultHtml);
const document = window.document;

global.document = document;
global.window = window;

global.navigator = window.navigator;
global.useUTC = true;
