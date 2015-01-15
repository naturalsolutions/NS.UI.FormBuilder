/**
* @fileOverview utilies.js
*
* Contains some useful function for the application
*
* @author          MICELI Antoine (miceli.antoine@gmail.com)
* @version         1.0
*/

define(['jquery', 'underscore', 'difflib', 'diffview'], function($, _, difflib, diffview) {

    var utilities = {};

    /**
    *
    * @param {type} baseTText
    * @param {type} newText
    * @param {type} selector
    * @param {type} contextSize
    * @param {type} baseTextName
    * @param {type} newTextName
    * @param {type} inline
    * @returns {diffview.buildView.ctelt.e|Element|diffview.buildView.celt.e}
    */
    utilities.GetXMLDiff = function (baseText, newText, baseTextName, newTextName, inline, contextSize) {
        var base    = difflib.stringAsLines(baseText),
        newtxt  = difflib.stringAsLines(newText),
        sm      = new difflib.SequenceMatcher(base, newtxt),
        opcodes = sm.get_opcodes();

        // build the diff view and add it to the current DOM
        return diffview.buildView({
            baseTextLines   : base,
            newTextLines    : newtxt,
            opcodes         : opcodes,
            // set the display titles for each resource
            baseTextName    : baseTextName  || 'Source file',
            newTextName     : newTextName   || 'Updated file',
            contextSize     : contextSize   || null,
            viewType        : inline        ||  0
        });
    };

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
