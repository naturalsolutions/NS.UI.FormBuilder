define([
    'jquery',
    'editionPageModule/views/fieldViews/BaseView'
], function($, BaseView) {

    return BaseView.extend({
        render: function() {
            var realChildFormName = $("#settingFieldPanel .tab-content .field-childForm option:selected").text();
            if (arguments['0'] && realChildFormName && realChildFormName.length > 0)
                arguments['0'].attributes.childFormName = realChildFormName;
            BaseView.prototype.render.apply(this, arguments);
        }
    });
});