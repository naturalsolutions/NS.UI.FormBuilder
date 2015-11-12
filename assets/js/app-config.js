
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

        paths : {
            // Path to the thesaurus Web Services
            thesaurusWSPath : 'http://localhost/ThesaurusCore/ThesaurusReadServices.svc/json/fastInitForCompleteTree',
            forms : '/FormbuilderWS/childforms/0'
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
            startID : 167920
        },

        // Defines the list of allowed sizes for the different king of
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
        allowedFields : {
            // List of all existing types :
            // Hidden, HorizontalLine, Autocomplete, Text, File, TreeView, Date, TextArea, Number,
            // NumericRange, Pattern, CheckBox, Radio, Select, Subform, Thesaurus, AutocompleteTreeView
            //
            // If you want to display all the types, just set anything but an existing mode (for example 'all')
            currentmode : 'demo',
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
            ecoreleve : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Thesaurus',
                'CheckBox'
            ],
            ecollection : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Thesaurus',
                'CheckBox'
            ],
            track : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Thesaurus',
                'CheckBox'
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