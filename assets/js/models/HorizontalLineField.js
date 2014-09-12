define(['backbone'], function(Backbone) {

    var HorizontalLineField = Backbone.Model.extend({}, {
        type: 'HorizontalLine',
        xmlTag: 'field_horizontalLine',
        i18n: 'line'
    });

    return HorizontalLineField;

});