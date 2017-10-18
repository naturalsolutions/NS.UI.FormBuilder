/**
* @fileOverview utilies.js
*
* Contains some useful function for the application
*
* @author          MICELI Antoine (miceli.antoine@gmail.com)
* @version         1.0
*/

define(['jquery', 'lodash'], function($, _) {

    var utilities = {};

    utilities.ReadFile = function(input, callback) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                callback(e.target.result)
            };
            reader.onerror = function(e) {
                callback(e);
            }
            reader.readAsText(input.files[0], "UTF-8");
        } else {
            callback(false);
        }
    };

    return utilities;

});
