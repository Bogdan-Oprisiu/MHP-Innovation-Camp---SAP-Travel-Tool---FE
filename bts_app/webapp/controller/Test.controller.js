sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
  "use strict";

  return BaseController.extend("bts.btsapp.controller.Test", {
    onInit: function () {},
    onPressHelloThere: function () {
      sap.m.MessageToast.show("General Kenobi!");
    },
  });
});
