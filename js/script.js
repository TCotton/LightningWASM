LIGHTNING = window.LIGHTNING || {};

LIGHTNING = (function () {

    var _private = {

        URL: null,
        worker: null,
        imageType: null,
        imageName: null,
        originalImageSize: null,
        fileSizeReduction: null,
        dataURIsize: null,
        arrayBuffer: null,

        get: function () {

        },
        set: function (args) {
            this.URL = args.URL;
            this.worker = args.worker;
        },
        initWorker: function () {

            var consoleElement = document.querySelector(".console");
            var outputElement = document.querySelector(".output").children[0];

            _private.worker.onmessage = function (event) {

                var message = event.data;

                switch (message.type) {
                    case 'stdout':

                        consoleElement.innerHTML += message.line + '\n';

                        if(message.line.indexOf('filesize reduction') !== -1) {

                            return console.log(message.line.trim().replace(/\((.+)\)/g,"$1"));

                        }

                        break;
                    case 'start':

                        consoleElement.innerHTML = '';

                        break;
                    case 'done':

                        consoleElement.innerHTML += "Done!";

                        var imageElement = _private.getImage(message.data);

                        outputElement.appendChild(imageElement);

                        var downloadLinkElement = document.createElement('a');

                        downloadLinkElement.className = 'download';
                        downloadLinkElement.download = _private.imageName;
                        downloadLinkElement.innerHTML = 'Download';
                        downloadLinkElement.href = imageElement.src;

                        document.body.appendChild(downloadLinkElement);

                        console.log('_private.originalImageSize: ' + _private.originalImageSize);
                        console.log('_private.dataURIsize: ' + _private.dataURIsize);

                        //var cloneObject = document.getElementsByName('#wrapper');
                        //closeObject.parentNode.removeChild(cloneObject);
                        //document.body.appendChild(closeObject);

                        break;
                    default:

                        consoleElement.innerHTML = "I'm ready! ...";

                }

            };

        },
        getImage: function (fileData, imageType) {

            var src, view, binary, i;

            if (imageType !== 0) {

                view = new Uint8Array(fileData);

                binary = '';
                for (i = 0, l = view.length; i < l; i += 1) {
                    binary += String.fromCharCode(view[i]);
                }

                src = 'data:' + this.imageType + ';base64,' + btoa(binary);

            } else {

                src = fileData;

            }

            this.dataURIsize = encodeURI(src).split(/%..|./).length - 1;

            var imageElement = document.createElement('img');

            imageElement.src = src;

            return imageElement;

        },

        findImageType: function () {

            var inputElement = document.getElementById('input');

            var mimeArray = ['image/png', 'image/jpeg', 'image/jpg' ,'image/gif'];

            inputElement.addEventListener('change', function (event) {

                //if (this.files[0].size > 65536) return;

                console.log(mimeArray.indexOf(this.files[0].type));

                switch (this.files[0].type) {
                    case 'image/png':

                        console.log('png');
                        _private.originalImageSize = this.files[0].size;
                        _private.imageType = this.files[0].type;
                        _private.imageName = this.files[0].name;

                        break;
                    case 'image/jpeg':
                    case 'image/jpg':

                        console.log('jpeg');
                        _private.originalImageSize = this.files[0].size;
                        _private.imageType = this.files[0].type;
                        _private.imageName = this.files[0].name;
                        _private.processImageNonPNG(this.files[0]);

                        break;
                    case 'image/gif':

                        console.log('gif');
                        _private.originalImageSize = this.files[0].size;
                        _private.imageType = this.files[0].type;
                        _private.imageName = this.files[0].name;
                        _private.processImageNonPNG(this.files[0]);

                        break;
                    default:

                        console.log('only jpegs, gifs or pngs');

                }

                event.preventDefault();

            }, false);
        },

        imageAfterOptimization: function() {

            var outputElement = document.querySelector(".output").children[0];

            outputElement.addEventListener("change", function (event) {

                //console.log(this.files[0]);

            });


        },


        processImageNonPNG: function (image) {

            var Reader = new FileReader();

            var outputElement = document.querySelector('.output').children[0];

            Reader.onload = function (readerEvent) {

                var imageElement = _private.getImage(readerEvent.target.result, 0);

                outputElement.appendChild(imageElement);

                var downloadLinkElement = document.createElement('a');

                downloadLinkElement.className = 'download';
                downloadLinkElement.download = _private.imageName;
                downloadLinkElement.href = imageElement.src;
                downloadLinkElement.innerHTML = 'Download';

                document.body.appendChild(downloadLinkElement);

                console.log('_private.originalImageSize: ' + _private.originalImageSize);
                console.log('_private.dataURIsize: ' + _private.dataURIsize);

            };

            Reader.readAsDataURL(image);


        },

        processImage: function () {

            var inputElement = document.getElementById("input");

            inputElement.addEventListener("change", function (event) {

                var file = this.files[0];

                if (file.type !== 'image/png') return;
                // if (file.size > 65536) return;

                var fileReader = new FileReader();

                function onloadend(event) {

                    _private.arrayBuffer = event.target.result;

                    console.log(event.target.result);

                    var data = new Uint8Array(_private.arrayBuffer);

                    _private.worker.postMessage({
                        'type': 'file',
                        'data': data
                    });

                    _private.worker.postMessage({
                        'type': 'command',
                        'command': 'go'
                    });
                }

                if (fileReader.addEventListener) {
                    fileReader.addEventListener('loadend', onloadend, false);
                } else {
                    fileReader.onloadend = onloadend;
                }

                fileReader.readAsArrayBuffer(file);

                event.preventDefault();

            }, false);

        }
    };
    return {
        init: function (args) {
            _private.set(args);
            _private.initWorker();
            _private.processImage();
            _private.findImageType();
            _private.imageAfterOptimization();
            console.log(performance);
        }
    };
}());

if (window.File && window.FileList && window.FileReader && window.Worker) {

    LIGHTNING.init({
        URL: window.URL || window.webkitURL,
        worker: new Worker('worker.js')
    });

}
