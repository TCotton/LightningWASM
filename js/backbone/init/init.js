import LIGHTNING from '../config/config';

if (window.File && window.FileList && window.FileReader && window.Worker) {

  LIGHTNING.newModel = new LIGHTNING.Model.parent();

  if (!LIGHTNING.View.AddImage) {
    new LIGHTNING.View.AddImage({model: LIGHTNING.newModel});
  }

  if (!LIGHTNING.View.Worker) {
    new LIGHTNING.View.Worker({model: LIGHTNING.newModel});
  }

  if (!LIGHTNING.View.ImageDetails) {
    new LIGHTNING.View.ImageDetails({model: LIGHTNING.newModel});
  }

}
