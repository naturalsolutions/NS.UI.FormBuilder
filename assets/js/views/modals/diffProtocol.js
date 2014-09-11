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

            if (source === null || update === null) {
                formBuilder.displayNotification("Reading error", 'error', 'Error durring XML loading ! ');
                return;
            }

            if (source.type !== "text/xml" || update.type !== "text/xml") {
                formBuilder.displayNotification("File mime type error", 'error', 'You must choose only XML files');
                return;
            }

                    reader = new FileReader();
            reader.readAsText(source, "UTF-8");

            reader.onload = function(evt) {
                try {
                    if (formBuilder.XMLValidation(evt.target.result) !== true) {
                        formBuilder.displayNotification(result.error, 'error', 'Your XML don\'t matches with XML Schema');
                        return;
                    }

                    source = evt.target.result;
                    reader = new FileReader();
                    reader.readAsText(update, "UTF-8");

                    reader.onload = function(evt) {

                        if (formBuilder.XMLValidation(evt.target.result) === true) {
                            update = evt.target.result;
                            $('.widgetsPanel').switchClass('span3', 'span0', 250, function() {
                                $('.dropArea').append(formBuilder.GetXMLDiff(source, update, srcName, updName));
                                $('.dropArea').switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
                                var acts = {
                                    quit: new NS.UI.NavBar.Action({
                                        handler: function() {
                                            $('.widgetsPanel').switchClass('span0', 'span3', 250, function() {
                                                $('.dropArea').switchClass('span2', 'span9', 250).find('table').remove();
                                                navbar.setActions(actions);
                                                addIcon();
                                            });
                                        },
                                        allowedRoles: ["reader"],
                                        title: "Quit"
                                    })
                                };
                                navbar.setActions(acts);
                            });
                        }
                    };

                } catch (exp) {
                    new NS.UI.Notification({
                        type: 'error',
                        title: "An error occured",
                        message: 'One of giles can\'t be read'
                    });
                }
            };
            reader.onerror = function(evt) {
                new NS.UI.Notification({
                    type: 'error',
                    title: "Reading error",
                    message: 'An error was occure during reading file'
                });
            };
        },

        inputFileValueChange: function(e) {
            var id      = $(e.target).prop('id').replace('Hide', ''),
                split    = $(this).val().split('\\');
            //  Set input text value from input file value
            $('#' + id).val(split[ split.length - 1]);
        },

        triggerInputFile : function (e) {
            $('#' + $(e.target).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
        }

    });

    return DiffProtocolModalView;

});