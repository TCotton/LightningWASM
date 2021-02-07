var Module = {
    'noInitialRun': true,
    'noFSInit': true
};
//const pngCrush = './pngcrush.js';
//importScripts('../static/pngcrush.js');

let line = '';

Module.preRun = function () {

    FS.init(function () {
        return null;
    }, function (data) {
        if (data == 10) {
            postMessage({
                'type': 'stdout',
                'line': line
            });

            line = '';
        } else {
            line += String.fromCharCode(data);
        }
    });
};

function getFileData(fileName) {
    const data = FS.root.contents[fileName].contents;
    return new Uint8Array(data).buffer;
}

onmessage = function (event) {

    var message = event.data;

    switch (message.type) {
        case 'file':
            FS.createDataFile('/', '../img/input.png', message.data, true, false);
            break;

        case 'command':
            if (message.command == "go") {

                postMessage({'type': 'start'});

                Module.run(['-reduce', '-rem', 'alla', '-rem', 'text', 'input.png', 'output.png']);

                postMessage({
                    'type': 'done',
                    'data': getFileData('output.png')
                });
                FS.init.initialized = false;
            }
            break;
    }

};

postMessage({
    'type': 'ready'
});
