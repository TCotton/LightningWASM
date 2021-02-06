LIGHTNING.View.Worker = Backbone.View.extend(
    _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {

        initialize: function () {

            this.template = this.newTemplate('outputWrapper');
            this.webWorker();
            this.model.on('change:image', this.runWebWorker, this);

        },

        runWebWorker: function () {

            // if PNG file then run the web worker and use the FileReader API

            "use strict";

            if (this.model.get('image') == undefined) return;

            if (this.model.get('image') !== null && this.model.get('image').type !== 'image/png') return;

            if(document.getElementById('nopng').checked) return;

            var fileReader = new FileReader();

            var onloadend = function (event) {

                var data = new Uint8Array(event.target.result);

                this.worker.postMessage({
                    'type': 'file',
                    'data': data
                });

                this.worker.postMessage({
                    'type': 'command',
                    'command': 'go'
                });

            }.bind(this);

            if (fileReader.addEventListener) {
                fileReader.addEventListener('loadend', onloadend, false);
            } else {
                fileReader.onloadend = onloadend;
            }

            fileReader.readAsArrayBuffer(this.model.get('image'));

        },


        webWorker: function () {

            "use strict";

            this.worker.onmessage = function (event) {

                var message = event.data;

                switch (message.type) {
                    case 'stdout':

                        if (message.line.indexOf('filesize reduction') !== -1) {

                            this.model.set('fileSizeReduction', message.line.trim().replace(/\((.+)\)/g, "$1"));

                        }

                        break;
                    case 'start':

                        console.log('start');

                        document.body.classList.add('holding');

                        break;
                    case 'done':

                        document.body.classList.remove('holding');

                        this.model.set('dataURI', this.getImage(message.data));

                        this.render();

                        break;
                    default:

                        console.log('I am ready');

                }

            }.bind(this);

        },

        render: function () {

            this.model.set('end', new Date().getTime());

            this.resetHTML();

            document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));

            return this;

        }



    }));