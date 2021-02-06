if (window.File && window.FileList && window.FileReader && window.Worker) {

    LIGHTNING.newModel = new LIGHTNING.Model.parent();

    new LIGHTNING.View.AddImage({model: LIGHTNING.newModel});
    new LIGHTNING.View.Worker({model: LIGHTNING.newModel});
    new LIGHTNING.View.ImageDetails({model: LIGHTNING.newModel});

}
