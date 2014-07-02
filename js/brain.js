/**
 * @fileOverview brain.js
 * Main File of the application
 * This file is specific for our utilisation of Formbuilder you can completly change it
 * 
 * You just need to instanciate a MainView and if you want personnalize the Navbar, see : https://github.com/NaturalSolutions/NS.UI.NavBar
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */
$(document).ready(function() {
      
    //  Create main view
    var mainView = new formBuilder.MainView({
        el : '#formBuilder'
    });
    
    var users = {
        anonymous   : {roles: ['reader']},
        roger       : {nickname: 'Roger', roles: ['reader', 'writer']},
        gaston      : {nickname: 'Gaston', roles: ['reader', 'writer', 'moderator']}
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
            title : '<i class="fa fa-cloud"></i> Save protocol',
            allowedRoles: ["reader"],
            actions : {
                'save.repo' : new NS.UI.NavBar.Action({
                    title : 'Save on the cloud',
                    allowedRoles : ['reader'],
                    handler: function() {
                        $('#saveModal').modal('show');
                        $('#saveProtocolName').typeahead({
                            source: function(query, process) {
                                return $.getJSON('/protocols', {query: query}, function(data) {
                                    console.log (data.options);
                                    return process(data.options);
                                });
                            }
                        });
                        $('#keywordsText').typeahead({
                           source : function (query, process)  {
                               return $.getJSON('/keywords', {query: query}, function(data) {
                                   return process(data.options);
                               });
                           }
                        });
                    }
                }),
                'save.xport': new NS.UI.NavBar.Action({
                    handler: function() {
                        mainView.downloadXML();
                    },
                    allowedRoles: ["reader"],
                    title: "Export as XML"
                })
            },
        }),
        'import' : new NS.UI.NavBar.Action({
            actions : {
                'import.XML' : new NS.UI.NavBar.Action({
                    handler: function() {
                        mainView.importXML();
                    },
                    allowedRoles: ["reader"],
                    title: "Import XML File"
                }),
                'import.load' : new NS.UI.NavBar.Action({
                    title : 'load from cloud',
                    allowedRoles: ["reader"],
                    handler : function () {
                        alert ('I\'m working on it !')
                    }
                })
            },
            title : '<i class="fa fa-upload"></i> Import a protocol',
            allowedRoles: ["reader"],
        }),
        clear: new NS.UI.NavBar.Action({
            handler: function() {
                mainView.clear();
            },
            allowedRoles: ["reader"],
            title: '<i class="fa fa-trash-o"></i> Clear protocol'
        }),
        show: new NS.UI.NavBar.Action({
            handler: function() {
                $('#compareModal').modal('show')
                .on('click', '#findSource, #findUpdate', function() {
                    $('#' + $(this).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
                })
                .on('change', 'input[type="file"]', function() {
                    var id = $(this).prop('id').replace('Hide', ''), split = $(this).val().split('\\');
                    $('#' + id).val(split[ split.length - 1]);
                })
                .on('click', '.btn-primary', function() {
                    $('#compareModal').modal('hide');
                    var source  = $('#compareModal').find('#sourceHide')[0].files[0],
                        update  = $('#compareModal').find('#updateHide')[0].files[0], 
                        srcName = source['name'], 
                        updName = update['name'],
                        reader  = null;

                    if (source !== null && update !== null) {
                         if (source.type === "text/xml" && update.type === "text/xml") {
                            reader = new FileReader();
                            reader.readAsText(source, "UTF-8");
                            reader.onload = function(evt) {
                                try {
                                    if (formBuilder.XMLValidation(evt.target.result) !== true) {
                                        new NS.UI.Notification ({
                                            title : result.error,
                                            type : 'error',
                                            message : 'Your XML don\'t matches with XML Schema'
                                        });
                                    } else {
                                        source = evt.target.result;
                                        reader = new FileReader();
                                        reader.readAsText(update, "UTF-8");
                                        reader.onload = function(evt) {
                                            if (formBuilder.XMLValidation(evt.target.result) === true) {
                                                update = evt.target.result;
                                                $('.widgetsPanel').switchClass('span3', 'span0', 250, function() {
                                                    $('.dropArea').append(
                                                        formBuilder.GetXMLDiff(source, update, srcName, updName)
                                                    ).switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
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
                                                })
                                            }
                                        };
                                    }
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

                        } else {
                            new NS.UI.Notification({
                                type: 'error',
                                title: "File mime type error",
                                message: 'You must choose only XML files'
                            });
                        }
                    } else {
                        new NS.UI.Notification({
                            type: 'error',
                            title: "Reading error",
                            message: 'Error durring XML loading ! '
                        });
                    }
                }).removeClass('hide').css('width', '700px');
            },
            allowedRoles: ["reader"],
            title: '<i class="fa fa-bars"></i> Compare XML Files'
        })        
    };

    navbar.setActions(actions);

    navbar.$el.prependTo('body');
    navbar.render();
    
    //  init modal windows
    $('#saveModal').modal({
        show: false
    }).on('click', '.btn-primary', function() {
        
        var saveProtocolName        = $('#saveProtocolName').val() === "",
            saveProtocolDescription = $('#saveProtocolDescription').val() === "",
            saveProtocolKeywords    = $('#saveProtocolKeywords').val() === "",
            saveProtocolComment     = $('#saveProtocolComment').val() === "";
            
        $('#saveProto, #saveProtocolDescription, #saveProtocolKeywords, #saveProtocolComment, #saveProtocolName').each( function() {
            $(this)[ eval($(this).prop('id')) === true ? 'addClass' : 'removeClass']("error");
        });
        
        if (!saveProtocolName && !saveProtocolDescription && !saveProtocolKeywords && !saveProtocolComment) {
            var dataS = JSON.stringify({
                content     : mainView.getFormXML(),
                name        : $('#saveProtocolName').val(),
                comment     : $('#saveProtocolComment').val(),
                keywords    : $('#saveProtocolKeywords').val(),
                description : $('#saveProtocolDescription').val()
            }, null, 2);

            $.ajax({
                data        : dataS,
                type        : 'POST',
                url         : '/protocols',
                contentType : 'application/json',
                success: function(res) {
                    $('#saveModal').modal('hide').removeData();
                    new NS.UI.Notification({
                        type    : 'success',
                        title   : 'Protocol saved : ',
                        message : 'your protocol has been saved correctly !'
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $('#saveModal').modal('hide').removeData();
                    new NS.UI.Notification({
                        delay   : 15,
                        type    : 'error',
                        message : jqXHR.responseText,
                        title   : 'An error occured :'
                    });
                }
            });
        }        
    });
});