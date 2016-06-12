jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"com/csw/iotui5v3/test/integration/NavigationJourneyPhone",
		"com/csw/iotui5v3/test/integration/NotFoundJourneyPhone",
		"com/csw/iotui5v3/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});

