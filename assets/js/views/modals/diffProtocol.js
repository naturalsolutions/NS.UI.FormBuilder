define(['underscore', 'backbone', 'text!../../../templates/modals/diffProtocol.html', 'NS.UI.Notification'], function(_, Backbone, diffProtocolTemplate) {

    var DiffProtocolModalView = Backbone.View.extend({

        events : {
            'click .btn-primary'             : 'showDiff',
            'click #findSource, #findUpdate' : 'triggerInputFile',
            'change input[type="file"]'      : 'inputFileValueChange'
        },

        initialize : function (options) {
            this.template   = _.template(diffProtocolTemplate);
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });

            return this;
        },

        showDiff: function() {
            $('#compareModal').modal('hide');

            var source  = $('#compareModal').find('#sourceHide')[0].files[0],
                update  = $('#compareModal').find('#updateHide')[0].files[0],
                srcName = source['name'],
                updName = update['name'],
                reader  = null;

            if (source === null) {
                $(this.el).find('#sourceError').text('Aucun fichier sélectionné')
            } else if (update === null) {
                $(this.el).find('#updateError').text('Aucun fichier sélectionné')
            } else {
                $(this.el).modal('hide').removeData();
            }
        },

        getData : function() {
            return {
                source  : $('#compareModal').find('#sourceHide')[0],
                update  : $('#compareModal').find('#updateHide')[0],
                srcName : source['name'],
                updName : update['name'],
            };
        },

        inputFileValueChange: function(e) {
            var id      = $(e.target).prop('id').replace('Hide', ''),
                split    = $('#' + id + 'Hide').val().split('\\');
            //  Set input text value from input file value
            $('#' + id).val(split[ split.length - 1]);
        },

        triggerInputFile : function (e) {
            $('#' + $(e.target).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
        }

    });

    return DiffProtocolModalView;

});