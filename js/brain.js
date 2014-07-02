/**
 * @fileOverview brain.js
 * Main javascript file, instance main formbuilder object
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

function show() {
    
     $('#compareModal').modal('show')
             
        .on('click', '.btn-primary', function() {        
            //  run versionning        
        })        
        .on('click', '#findSource, #findUpdate', function() {
            $('#' + $(this).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
        })
        .on('change', 'input[type="file"]', function() {
            var id = $(this).prop('id').replace('Hide', ''), 
                split = $(this).val().split('\\');
            $('#' + id).val(split[ split.length - 1]);
        })
        .on('click', '.btn-primary', function() {
            
            $('#compareModal').modal ('hide');
            var source  = $('#compareModal').find('#sourceHide')[0].files[0], 
                update  = $('#compareModal').find('#updateHide')[0].files[0],
                srcName = source['name'], 
                updName = update['name'];
                
                if (source !== null && update !== null) {

                    if (source.type === "text/xml" && update.type === "text/xml") {

                        var reader = new FileReader();

                        reader.readAsText(source, "UTF-8");

                        reader.onload = function(evt) {

                            try {

                                var result = formBuilder.XMLValidation(evt.target.result);

                                if (result !== true) {
                                    //  error
                                } else {
                                    source = evt.target.result;

                                    reader = new FileReader();
                                    reader.readAsText(update, "UTF-8");

                                    reader.onload = function(evt) {

                                        result = formBuilder.XMLValidation(evt.target.result);
                                        if (result === true) {
                                            update = evt.target.result;

                                            $('.widgetsPanel').switchClass('span3', 'span0', 250, function() {
                                                $('.dropArea').append(formBuilder.GetXMLDiff(source, update, srcName, updName)).switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
                                            })
                                        }

                                    };
                                }

                            } catch (exp) {
                                formBuilder.displayError("Error");
                            }
                        };

                        reader.onerror = function(evt) {
                            formBuilder.displayError("Reading error", 'An error was occure during reading file');
                        };

                    } else {
                        formBuilder.displayError('File mime type error', "You must choose only XML files");
                    }

                } else {
                    formBuilder.displayError("Error durring XML loading ! ");
                }
        })
        
    .removeClass('hide').css('width', '700px');

}

$(document).ready(function() {
      
    //  Create main view
    formBuilder.mainView = new formBuilder.MainView({
        el : '#formBuilder'
    });
    
    //  init modal windows
    $('#saveModal').modal({
        show: false
    }).on('click', '.btn-primary', function() {
        var dataS = JSON.stringify({
            name    : $('#formName').val(),
            content : formBuilder.mainView.formView.getXML(),
            comment : $('#commentText').val()
        }, null, 2);

        $.ajax({
            url         : '/protocols',
            contentType : 'application/json',
            type        : 'POST',
            data        : dataS,
            success: function(res) {
                $('#saveModal').modal('hide').removeData();
                new NS.UI.Notification({
                    type: 'success',
                    title: 'Protocol saved : ',
                    message: 'your protocol has been saved correctly !'
                });
            },
            error: function( jqXHR,  textStatus,  errorThrown) {
                $('#saveModal').modal('hide').removeData();
                new NS.UI.Notification({
                    type: 'error',
                    title: 'An error occured :',
                    message: jqXHR.responseText,
                    delay : 15
                });
            }
        });
    });
                
    var users = {
        anonymous: {roles: ['reader']},
        roger: {nickname: 'Roger', roles: ['reader', 'writer']},
        gaston: {nickname: 'Gaston', roles: ['reader', 'writer', 'moderator']}
    };

    var navbar = new NS.UI.NavBar({
        tiles: [
            {title: 'Home', tileClass: 'tile-home', url: '#', allowedRoles: ['reader']},
            {title: 'Forum', tileClass: 'tile-forum', url: '#forum', allowedRoles: ['reader']},
            {title: 'Administration', tileClass: 'tile-admin tile-double', url: '#admin', allowedRoles: ['moderator']}
        ],
        roles: users.gaston.roles,
        username: users.gaston.nickname,
        title: 'Form Builder'
    });

    var actions = {
        save : new NS.UI.NavBar.Action({
            handler : function() {
                $('#saveModal').modal('show').find('#formName').val ( $('#protocolName').val() ).typeahead({
                    source: function(query, process) {
                        return $.getJSON('/protocols', {query : query}, function(data) {
                            return process(data.options);
                        });
                    }
                });              
            },
            allowedRoles : ['reader'],
            title: "Save to the repo"
        }),
        export: new NS.UI.NavBar.Action({
            handler: function() {
                formBuilder.mainView.formView.downloadXML();
            },
            allowedRoles: ["reader"],
            title: "Export in XML"
        }),
        import: new NS.UI.NavBar.Action({
            handler: function() {
                formBuilder.mainView.formView.importXML();
            },
            allowedRoles: ["reader"],
            title: "Import XML File"
        }),
        clear: new NS.UI.NavBar.Action({
            handler: function() {
                formBuilder.mainView.clear();
            },
            allowedRoles: ["reader"],
            title: "Clear protocol"
        }),
        show: new NS.UI.NavBar.Action({
            handler: function() {
                show();
            },
            allowedRoles: ["reader"],
            title: "Compare XML Files"
        })       
        
    };

    navbar.setActions(actions);

    navbar.$el.prependTo('body');
    navbar.render();
    
    $('[data-key="export"]').prepend('<i class="fa fa-file"></i>'   );
    $('[data-key="import"]').prepend('<i class="fa fa-upload"></i>' );
    $('[data-key="clear"]').prepend ('<i class="fa fa-trash-o"></i>');
    $('[data-key="show"]').prepend  ('<i class="fa fa-bars"></i>'   );

});