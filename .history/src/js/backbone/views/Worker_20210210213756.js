LIGHTNING.View.Worker = Backbone.View.extend(
  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {

    initialize: function () {
      this.template = this.newTemplate('outputWrapper');
      this.webWorker();
      this.model.on('change:image', this.runWebWorker, this);
    },

    runWebWorker: function () {
      // if PNG file then run the web worker and use the FileReader API
      if (this.model.get('image') == null) return;
      if (this.model.get('image') !== null && this.model.get('image').type !== 'image/png') return;
      let fileReader = new FileReader();

      let onloadend = function (event) {
        const result = event.target.result;
        let data = new Uint8Array(result);
        this.currentTask = {};
        this.currentTask.fileSize = data.length;
        this.canvasRender(data);
        this.worker.onmessage = e => {
          switch (e.data.type) {
            case 'log':
              debugger;
              console.log(e.data.msg);
              break;
            case 'logError':
              debugger;
              console.error(e.data.msg);
              break;
            case 'result':
              debugger;
              console.dir(e.data.result);
              break;
            case 'error':
              debugger;
              console.dir(e.data.error);
              break;
          }
        }
      }.bind(this);

      if (fileReader.addEventListener) {
        fileReader.addEventListener('loadend', onloadend, false);
      } else {
        fileReader.onloadend = onloadend;
      }
      fileReader.readAsArrayBuffer(this.model.get('image'));
    },

    canvasRender: function (img) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const i = new Image;
      this.currentTask = {};
      const connected = new Promise((resolve) => {
        i.onload = (e) => {
          canvas.width = i.naturalWidth;
          canvas.height = i.naturalHeight;
          context.drawImage(e.path[0], 0, 0);
          this.myData = context.getImageData(0, 0, i.naturalWidth, i.naturalWidth).data;
          this.currentTask.width = i.naturalWidth;
          this.currentTask.height = i.naturalHeight;
          this.currentTask.rgbData = this.myData;
          resolve()
        }
      })

      connected.then(() => {
        console.dir(this.currentTask);
        this.worker.postMessage({
          'type': 'command',
          'command': 'go',
          rgbData: this.currentTask.rgbData,
          width: this.currentTask.width,
          height: this.currentTask.height,
          fileSize: this.currentTask.fileSize,
          whatever: 'here',
          options: {
            maxColors: 256,
            dithering: 1,
          }
        });
      });
      i.src = window.URL.createObjectURL(new Blob([img], {type: "image/png"}));
    },

    webWorker: function () {
      this.worker.onmessage = function (event) {
        let message = event.data;
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
          case 'result':
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
