
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
        readonlyMode : false,
        rules : [
            {
                error : {
                    'title' : 'Form size exceeded',
                    'content' : 'Form can\'t have more than 5 fields'
                },

                /**
                 *
                 * @param form
                 */
                execute : function(form) {
                    return form.length < 15;
                }
            }
        ],

        config : {
            //  Thesaurus startID
            startID : 85263
        },

        sizes : {

            getStringSizes : function(){
                //var translater = Translater.getTranslater();
                var toret = [];
                _.each(this.strings, function(range, label){
                    if (range.indexOf(";") >= 0){
                        toret.push({"val" : range, "label" : range.replace(";", " - ")});//[translater.getValueFromKey('schema.sizes.string.'+label)]});
                    }
                })
                return (toret);
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
                var translater = Translater.getTranslater();
                var toret = [];
                _.each(this.numerics, function(label, range){
                    if (range.contains(";")){
                        toret.push({"val" : range, "label" : [translater.getValueFromKey('schema.sizes.numeric.'+label)]});
                    }
                })
                return (toret);
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
        allowedFields : {
            // List of all existing types :
            // Hidden, HorizontalLine, Autocomplete, Text, File, TreeView, Date, TextArea, Number,
            // NumericRange, Pattern, CheckBox, Radio, Select, Subform, Thesaurus, AutocompleteTreeView
            //
            // If you want to display all the types, just set anything but an existing mode (for example 'all')
            currentmode : 'all',
            demo : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Subform',
                'Thesaurus'
            ],
            ecoreleve : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Subform',
                'Thesaurus'
            ],
            ecollection : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Subform',
                'Thesaurus'
            ],
            track : [
                'Autocomplete',
                'Text',
                'Date',
                'TextArea',
                'Number',
                'Select',
                'Subform',
                'Thesaurus'
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