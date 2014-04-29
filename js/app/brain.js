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
    });    
    
    $('#show').click(function() {
        var html =  '<div id="popup" class="row-fluid">'+
                        '<h2 class="offset1">Your XMLs will be validated after import</h2><br />'+
                        '<div class="row-fluid">'+
                        '   <input type="file" id="sourceHide"  class="hide" />'+
                        '   <label class="span2 offset1">Source XML file</label>'+
                        '   <input type="text" class="span5" id="source" placeholder="Your XML File" />'+
                        '   <button type="button" class="span3" id="findSource" style="margin-left: 10px;">Find</button>'+
                        '</div>' + 
                        '<div class="row-fluid">'+
                        '   <input type="file" id="updateHide"  class="hide" />'+
                        '   <label class="span2 offset1">Updated XML file</label>'+
                        '   <input type="text" class="span5" id="update" placeholder="Your XML File" />'+
                        '   <button type="button" class="span3" id="findUpdate" style="margin-left: 10px;">Find</button>'+
                        '</div>'+
                        '<div class="row-fluid">'+
                            '<br />'+
                            '<button class="span4 offset3" id="versionningButton">Run versionning</button>'+
                        '</div>'+
                    '</div>';
            
        $(html).dialog({
            
            modal       : true,
            width       : 750,
            resizable   : false,
            draggable   : false,
            position    : 'center',
            
            create: function() {
                
                $(this).find('#findSource, #findUpdate').bind('click', function() {
                    $('#' + $(this).prop('id').replace('find', '').toLowerCase() + 'Hide' ).trigger('click');
                });
                
                $(this).find('input[type="file"]').bind('change', function() {
                    var id      = $(this).prop('id').replace('Hide', '');
                    var split   = $(this).val().split('\\');                    
                    $('#' + id).val( split[ split.length - 1] );
                });
                
                $(this).find('#versionningButton').bind('click', _.bind(function() {
                    
                    $(this).dialog('close');
                    
                    var source = $(this).find('#sourceHide')[0].files[0];
                    var update = $(this).find('#updateHide')[0].files[0];
                    
                    var srcName = source['name'], updName = update['name'];
                    
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
                                                   $('.dropArea').append ( formBuilder.GetXMLDiff(source, update, srcName, updName)).switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
                                               })
                                            }
                                                
                                        };
                                    }
                                    
                                } catch(exp) {
                                    formBuilder.displayError("Error");
                                }
                            };
                            
                            reader.onerror = function(evt) {
                                formBuilder.displayError ("Reading error", 'An error was occure during reading file');
                            };
                            
                        } else {
                            formBuilder.displayError ('File mime type error', "You must choose only XML files");
                        }
                        
                    } else {
                        formBuilder.displayError ("Error durring XML loading ! ");
                    }

                }, this));
            }
        });

    });


});