
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
        // Defines whether the app has to be displayed in Read Only mode or not
        readonlyMode : false,
        // Defines whether you display the User filter on the main page or not
        displayUserFilter : false,
		// Authentication mode (portal or anything)
		authmode : 'classic',
		// Portal local URL
		portalURL : 'http://localhost/nsportal/front/',
		// JWT security secret word key
		securityKey : 'R@n#(0k3Y!-B7N8=',
		
        paths : {
            // Path to the thesaurus Web Services
            thesaurusWSPath : 'http://localhost/ThesaurusCore/api/thesaurus/fastInitForCompleteTree',
            forms : '/FormbuilderWS/forms/allforms'
        },

        // Defines the list of rules that will apply to the forms
        rules : [
            {
                error : {
                    'title' : 'Form size exceeded',
                    'content' : 'Form can\'t have more than 666 fields'
                },

                /**
                 *
                 * @param form
                 */
                execute : function(form) {
                    return form.length < 667;
                }
            }
        ],

        config : {
            //  Thesaurus startID
            startID : {
                default : 0,
                track : 0,
                ecoreleve : 0,
                ecollection : 0
            }
        },

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
                'Select',
                'Thesaurus',
                'CheckBox',
                'ChildForm',

                'Position'
            ]
			
			***************/
        }
    };

    return AppConfiguration;

});