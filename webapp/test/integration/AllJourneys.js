jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 sensors in the list
// * All 3 sensors have at least one last_measurement

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/csw/iotui5v3/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/csw/iotui5v3/test/integration/pages/App",
	"com/csw/iotui5v3/test/integration/pages/Browser",
	"com/csw/iotui5v3/test/integration/pages/Master",
	"com/csw/iotui5v3/test/integration/pages/Detail",
	"com/csw/iotui5v3/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.csw.iotui5v3.view."
	});

	sap.ui.require([
		"com/csw/iotui5v3/test/integration/MasterJourney",
		"com/csw/iotui5v3/test/integration/NavigationJourney",
		"com/csw/iotui5v3/test/integration/NotFoundJourney",
		"com/csw/iotui5v3/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});