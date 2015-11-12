define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/ChildFormFieldView.html',
    'text!editionPageModule/templates/fields/readonly/ChildFormFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO) {

    var ChildFormFieldView = BaseView.extend({

        events: function() {
            console.log("go1");
            return _.extend( {}, BaseView.prototype.events, {

            });
        },

        initialize : function(options, readonly) {
            console.log("go2");
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render: function() {
            console.log("go3");
            console.log("id = " + this.model.get('id'));
            console.log(arguments);
            console.log(this);
            BaseView.prototype.render.apply(this, arguments);
            /*
            if ($("select[name='childFormName']").length > 0)
                $(".childFormNameEdit").html(this.model.attributes.help +
                    "<a target=_blank href='#form/" + $("select[name='childFormName']").val() + "' >" +
                    $("select[name='childFormName'] option:selected").text() + "</a>");
            else
                $(".childFormNameEdit").html($(".childFormNameEdit").text() +
                    "<span style='color:darkred;font-weight:bold;'>???</span>");
            */
        },

    });

	return ChildFormFieldView;

});