import jquery from "jquery";
window.$ = window.jQuery = jquery;
import Backbone from "backbone";
Backbone.$ = window.$;
import {LIGHTNING} from '../config';

if (window.File && window.FileList && window.FileReader && window.Worker) {

  LIGHTNING.newModel = new LIGHTNING.Model.parent();
  Backbone.$(function () {
    // Create an instance of our view
    new LIGHTNING.View.AddImage({model: LIGHTNING.newModel});
    //new LIGHTNING.View.Worker({model: LIGHTNING.newModel});
    new LIGHTNING.View.ImageDetails({model: LIGHTNING.newModel});
    new LIGHTNING.View.ProcessImage({model: LIGHTNING.newModel});
  });
}
