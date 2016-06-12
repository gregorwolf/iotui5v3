sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the temperature value to 1 digit
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted temperature value with 1 digit
			 */
			temperatureValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(1);
			},
            dateIso : function (value) {
            	if(value !== null && value !== undefined) {
        			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(
        			        {
        			            pattern: "yyyy-MM-dd HH:mm"
        			        }
        			    );
        			var formatted = oDateFormat.format(value, false);
        			return formatted.toString();
            	}
            },
            unitIcon : function (value) {
			    if(value === "°C") {
			        return "sap-icon://temperature";
			    } else if(value === "%RH") {
			        return "sap-icon://umbrella";
			    } else {
			        return "sap-icon://measuring-point";
			    }
			}			
		};

	}
);