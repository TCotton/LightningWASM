const jquery = require("jquery")
window.$ = window.jQuery = jquery;
import Backbone from "backbone";
Backbone.$ = window.$;
import _ from 'underscore';

LIGHTNING.View.ProcessImage = Backbone.View.extend(
  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {
      initialize: function () {
          this.template = this.newTemplate('outputWrapper');
          this.model.on('change:image', this.getImageDetails, this);
      },

      this.


      render: function () {
        this.model.set('end', new Date().getTime());
        this.resetHTML();
        document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));
        return this;
      }

    }));
