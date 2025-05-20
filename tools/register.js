// Mock Browser for unit testing of Leaflet and Pixi
const MockBrowser = require('mock-browser').mocks.MockBrowser;
const mock = new MockBrowser();
const mockDocument = mock.getDocument();
mockDocument.createElement = function () {
    return {
        getContext: function () {
            return {
                fillRect: function () {
                }
            };
        }
    };
};

mockDocument['mocked'] = true;
global['window'] = mock.getWindow();
global['document'] = mockDocument;
global['navigator'] = mock.getNavigator();

// Mock CSS imports
require.extensions['.css'] = function (module, filename) {
    module.exports = {};
};

// Config of Mocha Ts
const tsNode = require('ts-node');
tsNode.register({
    files: true,
    transpileOnly: true,
    project: 'specs/tsconfig.json',
});
