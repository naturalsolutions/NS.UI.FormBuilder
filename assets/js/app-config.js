
//
//  Configuration file
//
//  This configuration file specifies some rules for the app.
//  Each rule is executed when a user try to save or import a form.
//  Each rule must have an error object with a title and a content. You can have as many rules as you want.
//


define([

], function() {

    var AppConfiguration = {

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
                    return form.length < 5;
                }
            }

        ]

    };

    return AppConfiguration;

});