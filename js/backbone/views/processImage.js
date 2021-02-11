const jquery = require("jquery")
window.$ = window.jQuery = jquery;
import Backbone from "backbone";
Backbone.$ = window.$;
import _ from 'underscore';
console.log('here');
LIGHTNING.View.ProcessImage = Backbone.View.extend(

  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {
      initialize: function () {
          this.template = this.newTemplate('outputWrapper');
          this.model.on('change:image', this.getImageDetails, this);
      },

      getImageDetails: function () {
        console.log('THIS IS RUN');
        if (this.model.get('image') == null) return;
        if (this.model.get('image') !== null && this.model.get('image').type !== 'image/png') return;

        let onloadend = function (event) {
          const result = event.target.result;
          let data = new Uint8Array(result);
          this.currentTask = {};
          console.log('THIS IS RUN');
          //this.currentTask.fileSize = data.length;
          //this.canvasRender(data);
        }.bind(this);

        if (fileReader.addEventListener) {
          fileReader.addEventListener('loadend', onloadend, false);
        } else {
          fileReader.onloadend = onloadend;
        }
        fileReader.readAsArrayBuffer(this.model.get('image'));
      },

      render: function () {
        this.model.set('end', new Date().getTime());
        this.resetHTML();
        document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));
        return this;
      }

    }));
