
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
        // Defines the list of rules that will appli to the forms
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
                    return form.length < 666;
                }
            }
        ],

        config : {
            //  Thesaurus startID
            startID : {
                ecoreleve : '204082',
                track : '167920',
                ecollection : '167920'
                },
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
                MINIMUM : "0",
                MAXIMUM : "255",
                defaultsize : "0;255",
                fromminto10 : "0;10",
                fromminto20 : "0;20",
                fromminto50 : "0;50",
                fromminto100 : "0;100"
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
            // Hidden, HorizontalLine, Autocomplete, Text, File, TreeView, Date, TextArea, Number,
            // NumericRange, Pattern, CheckBox, Radio, Select, ChildForm, Thesaurus, AutocompleteTreeView
            //
            // If you want to display all the types, just set anything but an existing mode (for example 'all')
			// Modes with "demo" inside their names will not be displayed as a context (so won't the minimalist mode)
			//
            currentmode : 'demo',
            alltypes : [
                'Hidden',
                'HorizontalLine',
                'Autocomplete',
                'Text',
                'File',
                'TreeView',
                'Date',
                'Number',
                'NumericRange',
                'Pattern',
                'CheckBox',
                'Radio',
                'Select',
                'ChildForm',
                'Thesaurus',
				'AutocompleteTreeView'
			],
            demo : [
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
			// 'ObjectPicker' type is ecoreleve dependent
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
				'ObjectPicker'
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
            track : [
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
            minimalist : [
                'Text',
                'Date',
                'TextArea',
                'Number'
            ],
        }
    };

    return AppConfiguration;

});