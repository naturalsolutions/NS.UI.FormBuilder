/**
 * @fileOverview brain.js
 * Main javascript file, instance main formbuilder object
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

$(document).ready(function() {

    formBuilder.init();

    $('#export').click(function() {
        formBuilder.formView.downloadXML();
    });

    $('#import').click(function() {
        formBuilder.formView.importXML();
    });

    $('#clear').click (function() {
        formBuilder.clear();
    })

    $('#run').click (function() {
        gremlins.createHorde()
            .gremlin(gremlins.species.formFiller())
            .gremlin(gremlins.species.clicker().clickTypes(['click']))
            .gremlin(gremlins.species.scroller())
            .gremlin(function() {
                $('.fields').each(function(el, idx) {
                    $(idx).dblclick();
                });
                var things = $('.fa-trash-o');
                $(things[Math.floor(Math.random()*things.length)]).click()
                things = $('.fa-wrench');
                $(things[Math.floor(Math.random()*things.length)]).click()
            })
            .unleash();
    });


});