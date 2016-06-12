/*global location */
sap.ui.define([
		"com/csw/iotui5v3/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"com/csw/iotui5v3/model/formatter"
	], function (BaseController, JSONModel, formatter) {
		"use strict";

		return BaseController.extend("com.csw.iotui5v3.controller.Detail", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
				// Initialize Model for the Date-Range Selector
                this.dateFrom = new Date();
                this.dateFrom.setHours(0, 0, 0, 0);
        
                this.dateTo = new Date();
                this.dateTo.setHours(0, 0, 0, 0);
                this.dateTo.setDate(this.dateFrom.getDate() + 1 );
        
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                  delimiterDRS1: "@",
                  dateValueDRS1: this.dateFrom,
                  secondDateValueDRS1: this.dateTo,
                  dateFormatDRS1: "yyyy-MM-dd"
                });
                this.getView().setModel(oModel, "drs1");				
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},


			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView");

				// only update the counter if the length is final
				if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
					if (iTotalItems) {
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
					} else {
						//Display 'Line Items' instead of 'Line items (0)'
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
					}
					oViewModel.setProperty("/lineItemListTitle", sTitle);
				}
			},
	
        	setFilter: function (sFrom, sTo) {
                var oFilter = new sap.ui.model.Filter({
                                path: 'measuredAt', 
                                operator: 'BT', 
                                value1: sFrom, 
                                value2: sTo 
                });
            
                this.getView().byId('flData').getBinding('data').filter(
                	[oFilter], 
                	'Application'
            	);
        	},
        
        	handleChange: function (oEvent) {
                var sFrom  = oEvent.getParameter("from");
                var sTo    = oEvent.getParameter("to");
                var bValid = oEvent.getParameter("valid");
            
                this._iEvent++;
                
                var data = this.getView().byId('flData').getBinding('data');
                
                var currentFrom = new Date(data.aApplicationFilters[0].oValue1);
                var currentTo   = new Date(data.aApplicationFilters[0].oValue2);
                
                // as DateRangeSelection fires change event (alling handleChange)
                // we check for changes and only if selection is different from 
                // current filter we apply this new filter.
                if( 
                	 sFrom.getTime() !== currentFrom.getTime() 
                	|| sTo.getTime() !== currentTo.getTime() 
                	) {
                	this.setFilter(sFrom, sTo);
                }
        
                var oDRS = oEvent.oSource;
                if (bValid) {
                  oDRS.setValueState(sap.ui.core.ValueState.None);
                } else {
                  oDRS.setValueState(sap.ui.core.ValueState.Error);
                }
            },

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("sensors", {
						id :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			/**
			 * Binds the view to the object path. Makes sure that detail view displays
			 * a busy indicator while data for the corresponding element binding is loaded.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound to the view.
			 * @private
			 */
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.id,
					sObjectName = oObject.description,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView"),
					oLineItemTable = this.byId("lineItemsList"),
					iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

				// Make sure busy indicator is displayed immediately when
				// detail view is displayed for the first time
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/lineItemTableDelay", 0);

				oLineItemTable.attachEventOnce("updateFinished", function() {
					// Restore original busy indicator delay for line item table
					oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
				});

				// Binding the view will set it to not busy - so the view is always busy if it is not bound
				oViewModel.setProperty("/busy", true);
				// Restore original busy indicator delay for the detail view
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			}

		});

	}
);