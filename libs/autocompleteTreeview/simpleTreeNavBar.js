pageUrl = "http://" + window.location.hostname + "/ThesaurusCore/ThesaurusReadServices.svc/json";
$.support.cors = true;
var boolExpand = false;
var isForCompletion = false;
var language;

$(document).ready(function () {
    language = $('#CtrNavBar1_hndLanguage').val();
    /*
$('.treeviewdiv').fancytree({
        debugLevel: 3,
        extensions: ["filter"],
        autoActivate: false,
        keyboard: true,
        filter: {
            mode: "dimm"
        },
        //defini la source pour les elts parents
        source:{
            //$.ajax({
            url: pageUrl + "/fastInitForCompleteTree",
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            dataType: 'json',
            //data: '{"lng" : "' + language[0].toUpperCase() + language.toLowerCase() + '", "wDeprecated":"false"}',
            data: '{"StartNodeID":"0","lng" : "'+language+'"}',
            success: function (data) { console.log(data); }
            //}),
        },
        //Evenement en fin d'expand on applique un filtre si celui ci existe
        expand: function () {
            if ($("#research").val() != undefined && $("#research").val() != "") {
            }
        },
        //evenement d'activation de l'arbre
        activate: function (event, data) {
            var nodeInfo = data;
            if (!boolExpand) {
                if (event.handleObj !== undefined && ($('.hideElement', parent.frames['frmContent'].document).val() == "" || $('.hideElement', parent.frames['frmContent'].document).val() === undefined)) {

                    if (parent.frames['frmContent'].document.getElementsByName('TreeMode')[0]) {
                        parent.frames['frmContent'].document.forms('MainForm').item(parent.frames['frmContent'].document.getElementsByName('TreeMode')[0].value).value = data.node.fullpath;
                        parent.frames['frmContent'].checkok('ACcontrol');
                    }
                    else {
                        var strUrl = window.location.href;
                        if (strUrl.indexOf("NavBar.aspx")) {
                            var pathUrl = strUrl.split("NavBar.aspx");
                        }
                        parent.frames['frmContent'].location.href = pathUrl[0] + "App_pages/AllIndividus.aspx?ContainerID=" + data.node.key;
                    }
                } else if (parent.frames['frmContent'].$(".hideElement") !== undefined) {
                    if (parent.frames['frmContent'].$(".hideElement").val() != '') {
                        var value = parent.frames['frmContent'].$(".hideElement").val();
                        value = value.replace("btninput", "input");
                        var inpputId = parent.frames['frmContent'].$('#' + value);
                        $.ajax({
                            url: "./App_WebServices/ServiceTypeForm.asmx/GetInputType",
                            timeout: 10000,
                            data: "{ 'iTTyp_pk_id' : '" + inpputId.attr("startingNode") + "' }",
                            dataType: "json",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            success: function (inputInfo) {
                                $.ajax({
                                    type: 'POST',
                                    url: pageUrl + "/isAChildOf",
                                    datatype: 'json',
                                    contentType: "application/json; charset=utf-8",
                                    data: "{ 'clickedId' : '" + data.node.key + "', 'startingNode':'" + inputInfo.d[1] + "' }",
                                }).done(function (data) {
                                    if (!data.d) {
                                        return;
                                    } else {
                                        parent.frames['frmContent'].$('#' + value).val(nodeInfo.node.data.fullpathTranslated);
                                        parent.frames['frmContent'].$('#' + value + "_value").val(nodeInfo.node.data.fullpath);
                                        if (inpputId.val() != "" && inpputId.attr('controltype') == 'Thesaurus') {
                                            console.log('thesaurus');
                                            $.ajax({
                                                type: 'POST',
                                                url: pageUrl + "/existByFullpathWLanguage",
                                                datatype: 'json',
                                                contentType: "application/json; charset=utf-8",
                                                data: "{ 'fullpath' : '" + inpputId.val() + "', 'language':'" + language + "' }",
                                            }).done(function (data) {
                                                if (!data.d) {
                                                    //input.css('background', 'yellow');
                                                    parent.frames['frmContent'].errorfound(inpputId.attr('id'), 'ACcontrol');
                                                } else {
                                                    //input.css('background', 'white');
                                                    parent.frames['frmContent'].checkok(inpputId.attr('id'));
                                                }
                                                parent.frames['frmContent'].SetRowsNumberForAutocomplete();
                                            });
                                        } else if (inpputId.val() != "" && inpputId.attr('controltype') == 'Thesaurus_DDL') {
                                            console.log('thesaurus_ddl');
                                            $.ajax({
                                                type: 'POST',
                                                url: pageUrl + "/existByNameWLanguage",
                                                datatype: 'json',
                                                contentType: "application/json; charset=utf-8",
                                                data: "{ 'name' : '" + $('#' + inpputId).val() + "', 'language':'" + language + "'}",
                                            }).done(function (data) {
                                                if (!data.d) {
                                                    //input.css('background', 'yellow');
                                                    parent.frames['frmContent'].errorfound(inpputId.attr('id'), 'ACcontrol');
                                                } else {
                                                    //input.css('background', 'white');
                                                    parent.frames['frmContent'].checkok(inpputId.attr('id'));
                                                }
                                                parent.frames['frmContent'].SetRowsNumberForAutocomplete();
                                            });
                                        }
                                        else {
                                            inpputId.css('background', 'white');
                                        }
                                    }
                                })
                            }
                        });
                        
                        parent.frames['frmContent'].$(".ACcontrol").each(function () {
                            while (this.scrollHeight != this.clientHeight) {
                                if (this.scrollHeight > this.clientHeight) {
                                    this.rows++;
                                }
                                else {
                                    this.rows--;
                                }

                            }
                        });
                    }
                }
            }
        },
        //Chargement ponctuel et définition de sa source
        lazyLoad: function (e, data) {
            var node = data.node;
            data.result = {
                type: 'POST',
                url: pageUrl + "/getTreeChild",
                datatype: 'json',
                contentType: "application/json; charset=utf-8",                
                data: '{"parentId":"' + node.key + '","lng":"' + language + '","wDeprecated":"false"}'
            }
        },
        select: function (event, data) {

        }
});
*/
    var buttonReset = $('button');
var inputResearch = $("#search");
var tree = $(".treeviewdiv").fancytree("getTree");
var checkboxHideMode = $('input[type=chechbox');
var reschValueOld = "";
var ultimatch = "";

checkboxHideMode.change(function (e) {
    tree.options.filter.mode = $(this).is(":checked") ? "hide" : "dimm";
    tree.clearFilter();
    inputResearch.keyup();
    $(".treeviewdiv").fancytree("getTree").applyFilter($("#research").val());
    if (!(inputResearch.val() != "" && inputResearch.val().length > 3)) {
        tree.clearFilter();
    }
    //}
});
buttonReset.click(function (e) {
    resetResearch();
}).attr("disabled", true);

   inputResearch.keyup(function (e) {
      $('#reinit').removeAttr('disabled');
   var treeHtml = $(".treeviewdiv");
      var fancytree = treeHtml.fancytree("getTree");
      //Si le nombrte d'élément est < a 100 on oblige l'utilisation d'au moins trois caractère pour des raisons de performances
      if (fancytree.count() < 100 || inputResearch.val().length >= 3) {
         treeHtml.find('ul.fancytree-container li').css("padding", "1px 0 0 0");
         treeHtml.fancytree("getRootNode").visit(function (node) {
            if (node.span) {
               var className = node.span.className;
               if (className.indexOf('fancytree-hide') != -1) {
                  node.setExpanded(false);
               }
            } else {
               node.setExpanded(false);
            }
         });
         match = inputResearch.val();
         var n,
             match = inputResearch.val();

         if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
            fancytree.clearFilter();
            treeHtml.fancytree("getRootNode").visit(function (node) {
               node.setExpanded(false);
            });
            return;
         }
         n = fancytree.filterNodes(match, false);
         while (treeHtml.find('.fancytree-submatch:not(.fancytree-expanded)').find('.fancytree-expander').length) {
            treeHtml.find('.fancytree-submatch:not(.fancytree-expanded)').find('.fancytree-expander').click();
         }
         if (treeHtml.find('.fancytree-match').length < 3 && treeHtml.find('.fancytree-match').find('.fancytree-match').length)
            treeHtml.find('.fancytree-match').find('.fancytree-expander').click()
         treeHtml.find('ul.fancytree-container li').css("padding", "0px 0 0 0");
      }
      if (inputResearch.val().length == 0) {
         fancytree.clearFilter();
         $('#reinit').attr('disabled', 'disabled');
         treeHtml.fancytree("getRootNode").visit(function (node) {
            node.setExpanded(false);
         });
         return;
      }            
}).focus()


});

//Fonction qui va vider l'input de recherche et recharger l'arbre
function resetResearch(id) {
    $("#search").val("");
    $(".treeviewdiv").fancytree("getTree").clearFilter();
    $(".treeviewdiv").fancytree("getRootNode").visit(function (node) {
        node.setExpanded(false);
    });
}
