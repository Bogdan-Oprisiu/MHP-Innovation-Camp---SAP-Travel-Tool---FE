/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "bts/btsapp/model/models",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("bts.btsapp.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // // Get the OData model configuration from the manifest
        // var oModelConfig =
        //   this.getMetadata().getManifestEntry("sap.ui5").models
        //     .mainServiceModel;

        // // Create and set the OData model to the component
        // var oModel = new ODataModel(
        //   oModelConfig.dataSource.uri,
        //   oModelConfig.settings
        // );
        // this.setModel(oModel, "mainServiceModel");
      },
    });
  }
);
