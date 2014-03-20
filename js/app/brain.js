/**
 * @fileOverview brain.js
 * Main javascript file, instance main formbuilder object
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

$(document).ready(function() {

    formBuilder.init();

    $('#export').click (function() {
        formBuilder.formView.downloadXML();
    });

    $('#import').click( function() {
        formBuilder.formView.importXML();
    });

});