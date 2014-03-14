/**
 * @fileOverview brain.js
 * Main javascript file, instance main formbuilder object
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */
function appendToDrop(type, form) {
    switch (type) {
        case "text" :
            var f = new app.TextField({
                id          : "textField[" + form.getSize() + "]",
                name        : "textField[" + form.getSize() + "]",
                placeholder : "Write some text...",
                label       : 'My Text field',
                value       : 'aa',
                order       :   form.getSize()
            });
            form.add(f);
            break;

        case "options" :
            var f = new app.OptionsField({
                id: "optionsField[" + form.getSize() + "]",
                name: "optionsField[" + form.getSize() + "]",
                label: 'My options field',
                options : [
                    {value : "1", label: "My first option", selected : false},
                    {value : "2", label: "My second option", selected: true}
                ]
            });
            form.add(f);
            break;

        case "longText" :
            var f = new app.LongTextField({
                id          : "longTextField[" + form.getSize() + "]",
                name        : "longTextField[" + form.getSize() + "]",
                placeholder : "My long text field",
                label       : 'My long text',
                resizable   : false
            });
            form.add(f);
            break;

        case "numeric" :
            var f = new app.NumericField({
                id          : "numericField[" + form.getSize() + "]",
                name        : "numericField[" + form.getSize() + "]",
                placeholder : "My numeric field ",
                label       : 'My numeric field',
            });
            form.add(f);
            break;

        case "check" :
            var f = new app.CheckBoxField({
                id              : "checkboxField[" + form.getSize() + "]",
                name            : "checkboxField[" + form.getSize() + "]",
                label           : 'My checkbox',
                options : [
                    {value : "1", label: "My first checkbox", selected : false},
                    {value : "2", label: "My second checkbox", selected: true}
                ]
            });
            form.add(f);
            break;

        case "radio" :
            var f = new app.RadioField({
                id          : "radioField[" + form.getSize() + "]",
                name        : "radioField[" + form.getSize() + "]",
                label       : 'My radio field',
                options : [
                    {value: "1", label: "First radio", selected: true},
                    {value: "2", label: "Second radio", selected:false}
                ]
            });
            form.add(f);
            break;

        case "date" :
            var f = new app.DateField({
                id          : "dateField[" + form.getSize() + "]",
                name        : "dateField[" + form.getSize() + "]",
                placeholder : "Click to choose a date",
                label       : 'My date',
                format      : "dd/mm/yyy"
            });
            form.add(f);
            break;
    }
}

$(document).ready(function() {
    var form = new app.Form({
    }, {
        name: "My form"
    }),
    FormView = new app.FormView({
        collection: form,
        el: $('.dropArea')
    }).render();

    $('.fields').dblclick(function() {
        appendToDrop($(this).data("type"), form);
    }).disableSelection();

    $('#export').click (function() {
        FormView.downloadXML();
    });

    $('#import').click( function() {
        FormView.importXML();
    });
});