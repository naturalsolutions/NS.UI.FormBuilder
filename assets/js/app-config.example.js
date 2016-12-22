
//
//  Configuration file
//
//  This configuration file specifies some rules for the app.
//  Each rule is executed when a user try to save or import a form.
//  Each rule must have an error object with a title and a content. You can have as many rules as you want.
//


define([
    'jquery', 'underscore', 'backbone', 'Translater'
], function($, _, Backbone, Translater) {

    var AppConfiguration = {
        readonlyMode : false,								// Defines whether the app has to be displayed in Read Only mode or not
        displayUserFilter : false,        					// Defines whether you display the User filter on the main page or not
		authmode : 'classic',								// Authentication mode (portal or anything)
		portalURL : 'http://localhost/nsportal/front/',		// Portal local URL
		securityKey : '',									// JWT security secret word key

        paths : {
            // Path to the thesaurus Web Services
            thesaurusWSPath : 'http://localhost/ThesaurusCore/api/thesaurus/fastInitForCompleteTree',
			// POST(@lng, @StartNodeId)
            positionWSPath : 'http://localhost/positionCore/api/PositionAction/GetTree'
        },

        // Defines the list of rules that will apply to the forms
        rules : [
            {
                error : {
                    'title' : 'Form size exceeded',
                    'content' : 'Form can\'t have more than 666 fields'
                },

                /**
                 * @param form
                 **/
                execute : function(form) {
                    return form.length < 667;
                }
            }
        ],

        config : {
            startID : {
				// Thesaurus startID
				thesaurus :{
					default : 0,
					track : 0,
					ecoreleve : 0,
					ecollection : 0
				},
				// Position startID
				position :{
					default : 0,
					track : 0,
					ecoreleve : 0,
					ecollection : 0
				}
            },
			
			options : {

				// Specify URL for formBuilder configuration
				// Replace this URL with your own

				URLOptions : {
					// ***********************************************************************
					// The app needs the following nodes to have a proper path to the server :
					// ***********************************************************************

					formAutocomplete 		: '/FormbuilderWS/autocomplete/forms',
					forms 					: '/FormbuilderWS/forms',
                    allforms 				: '/FormbuilderWS/forms/allforms',
					formSaveURL  			: '/FormbuilderWS/forms',							//  Get all form name for autocomplete, does not work if you are in client side mode only
                    preConfiguredField    	: '/FormbuilderWS/configurations', 					//  Returns all pre-configurated fields, they are fields saved by use for a future use, ex: an user create a firstName field because it will be present in many forms
					fieldConfigurationURL 	: '/FormbuilderWS/configurations',					//  Allow to send a pre-configurated field to the server. Send a POST request, won't work on client side, you need the back-end
					childforms              : '/FormbuilderWS/childforms',						// Child forms can get selected passing a parent form ID
					sqlAutocomplete			: '/FormbuilderWS/sqlAutocomplete', 				// Used to get values for autocomplete field
					unities            		: '/FormBuilderWS/unities',							// Get all unities for autocomplete 
					
					// ***********************************************************************
					// RENECO Specific Paths :
					// ***********************************************************************
					
					security				: '/FormbuilderWS/Security',						// Used for security chekings purpose (jwt among others ?)
                    track					: '/FormbuilderWS/Track',							// Used for track data linking
                    trackTypes				: '/FormbuilderWS/TrackTypes',						// Used to get track types (THIS PATH SHOULD BE TEMPORARY)

                    // ************************************************
					// Still don't know what those nodes are used for :
					// ************************************************
					
					autocompleteURL       	: 'ressources/autocomplete/', 						//  Allow to get some topic for autocomplete functionnalities
					translationURL        	: 'ressources/locales/__lng__/__ns__.json', 		//  Allows to get translation ressources (use i18nnext : http://i18next.com/ )
					keywordAutocomplete   	: 'ressources/autocomplete/keywords.json', 			//  Get form keywords autocomplete values
					usersAutocomplete 		: 'ressources/autocomplete/users.json',
					linkedFields 			: 'ressources/linkedFields/linkedFields.json',		//  Allow to get linked fields list
					templateUrl 			: 'ressources/templates/templates.json'				//  URL for form templates
				},

				//  Wich parent HTML element for the application
				el 						: '#formBuilder'
			}
        },

		/* DEPRECATED
        // Defines the list of allowed sizes for the different kind of types
        sizes : {
            // Returns an Array of JSON Objects containing possible sizes for a specific type (varType)
            getSizesFromType : function(varType){
                var toret = [];
                $.each(this[varType], function(range, label){
                    if (label.indexOf(";") >= 0){
                        toret.push({"val" : label, "label" : label.replace(";", " - ")});
                    }
                });
                return (toret);
            },

            getStringSizes : function(){
                return (this.getSizesFromType('strings'));
            },

            strings : {
                MINIMUM : "1",
                MAXIMUM : "255",
                defaultsize : "1;255",
                fromminto10 : "1;10",
                fromminto20 : "1;20",
                fromminto50 : "1;50",
                fromminto100 : "1;100"
            },

            getNumericSizes : function(){
                return (this.getSizesFromType('numerics'));
            },

            numerics : {
                MINIMUM : "0",
                MAXIMUMINT : "2147483647",
                defaultsize : "0;2147483647",
                fromminto50 : "0;50",
                fromminto100 : "0;100",
                fromminto365 : "0;365"
            }
        },
		*/

        // Defines a list of allowed kind of fields that will be displayed when adding / editing Forms
        appMode : {
            // List of all existing generic types :
            // Hidden, HorizontalLine, Autocomplete, Text, File, TreeView, Date, TextArea, Number, Decimal,
            // NumericRange, Pattern, CheckBox, Radio, Select, ChildForm, Thesaurus, AutocompleteTreeView
            //
            // If you want to display all the types, just set anything but an existing mode (for example 'all')
			// Modes with "demo" inside their names will not be displayed as a context (so won't the minimalist mode)
			//
            topcontext : 'classic',

            classic : [
                Hidden,
				HorizontalLine,
				Autocomplete,
				Text,
				File,
				TreeView,
				Date,
				TextArea,
				Number,
				Decimal,
				NumericRange,
				Pattern,
				CheckBox,
				Radio,
				Select,
				ChildForm,
				Thesaurus,
				AutocompleteTreeView
            ],

			/***************
			/* RENECO APPS *
			/***************
			
            // List of ecoreleve dependant types :
			// 'ObjectPicker', 'SubFormGrid'
            ecoreleve : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Thesaurus',
                'CheckBox',
                'ChildForm',

				'ObjectPicker',
                'SubFormGrid'
            ],

            ecollection : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Thesaurus',
                'CheckBox',
                'ChildForm'
            ],

            // List of track dependant types :
			// 'Position'
            track : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Thesaurus',
                'CheckBox',
                'ChildForm',

                'Position'
            ]
			
			***************/
        },
		
		allowedConvert : {
			default : [
				['Text', 'TextArea', 'Date', 'Pattern'],
				['Number', 'Decimal', 'NumericRange'],
				['Select', 'CheckBox', 'Radio']
			],
			allOpen : [
				['Autocomplete', 'File', 'TreeView', 'Thesaurus', 'AutocompleteTreeView',
				'ChildForm', 'ObjectPicker', 'SubFormGrid', 'Position', 'Text', 'TextArea',
				'Date', 'Pattern', 'Number', 'Decimal', 'NumericRange', 'Select', 'CheckBox',
				'Radio']
			]
		}
    };

    return AppConfiguration;

});