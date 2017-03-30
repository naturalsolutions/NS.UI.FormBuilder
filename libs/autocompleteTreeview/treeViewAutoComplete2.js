﻿pageUrl = "http://" + window.location.hostname + "/ThesaurusCore/api/thesaurus";

/*try{
    var language = parent.frames['frmNavBar'].$('#CtrNavBar1_hndLanguage').val();
} catch (err) {
    language = parent.frames['frmContent'].frames[0].$("#hndCurrentLanguage").val();
}*/
var language = 'fr'

$.support.cors = true;
function generateTree(id, inputid, type) {
    $('body').append('<div class="fancytreeview" id="treeView' + inputid + '" style="display:none"></div>');
    if (type == 0) {
        tree = $('#treeView' + inputid).fancytree({
            debugLevel: 0,
            extensions: ["filter"],
            autoActivate: true,
            keyboard: true,
            filter: {
                mode: "hide"
            },

            hideExpand : {
                isHide: false,
                nbExpand: 0
            },
            //defini la source pour les elts parents
            source: {
                type: "POST",
                url: pageUrl + "/fastInitForCompleteTree",
                datatype: 'json',
                contentType: "application/json; charset=utf-8",                
                data: '{"StartNodeID":"' + id + '", "lng": "fr"}'
            },

            currentInputId: {
                id: ""
            },

            focus: function (event, node) {

            },
            //Permet si l'arbre et en mode filter d'afficher les enfants des termes filtrés -> submatch
            renderNode: function (event, data) {
                var node = data.node;
                if (data.tree.options.hideExpand.isHide) {
                    data.tree.options.hideExpand.nbExpand--;
                    var $span = $(node.span);
                    console.log($span);
                    var strClass = $span[0].className;
                    strClass = strClass.replace("fancytree-hide", "fancytree-submatch");
                    $span[0].className = strClass;
                    if (data.tree.options.hideExpand.nbExpand == 0) {
                        data.tree.options.hideExpand.isHide = false;
                    }
                }
            },

            click: function (event, data) {
                var node = data.node,
                    tt = $.ui.fancytree.getEventTargetType(event.originalEvent);
                console.log("tt", tt)
                console.log(event);

                //Bubbles permet de déterminer si l'evt vient d'un click souris oud'un faux clique setExpand
                if( tt === "expander" && event.bubbles) {
                    var tree = data.tree.$div;
                    if (tree.hasClass("fancytree-ext-filter")) {
                        data.tree.options.hideExpand.isHide = true;
                        data.tree.options.hideExpand.nbExpand = node.getChildren().length; 
                        node.span.className = node.span.className.replace("fancytree-node", "fancytree-node fancytree-expanded");
                    }
                }
            },
            //Evenement en fin d'expand on applique un filtre si celui ci existe
            expand: function (event, node) {

            },
            //evenement d'activation de l'arbre
            activate: function (event, data) {
                var curInputId = data.tree.$div.attr('id').split('treeView')[1];
                if (!boolExpand) {
                    $('#' + $("#treeView" + curInputId).fancytree("option", "currentInputId").id).val(data.node.data.fullpathTranslated);
                    $('#' + $("#treeView" + curInputId).fancytree("option", "currentInputId").id + "_value").val(data.node.data.fullpath);                                                            
                    $("#treeView" + curInputId).css('display', 'none');
                }
            },
            //Chargement ponctuel et définition de sa source
            lazyLoad: function (e, data) {
                var node = data.node;
                data.result = {
                    type: 'POST',
                    url: pageUrl + "/getTreeChildWLanguageWithoutDeprecated",
                    datatype: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: "{ 'id' : '" + node.key + "', 'language','" + language + "' }",
                }
            },
            select: function (event, data) {

            }
        });
    } else {
        tree = $('#treeView' + inputid).fancytree({
            debugLevel: 0,
            extensions: ["filter"],
            autoActivate: true,
            keyboard: true,
            filter: {
                mode: "hide"
            },
            //defini la source pour les elts parents
            source: {
                type: "POST",
                url: pageUrl + "/fastInitForCompleteTree",
                datatype: 'json',
                contentType: "application/json; charset=utf-8",
                data: '{"StartNodeID":"' + id + '", "lng": "fr"}'
            },

            currentInputId: {
                id: ""
            },

            focus: function (event, node) {

            },
            //Evenement en fin d'expand on applique un filtre si celui ci existe
            expand: function () {
                if ($("#research").val() != undefined && $("#research").val() != "") {
                    var nMatch = $("#treeView").fancytree("getTree").applyFilter($("#research").val());
                    $("span#matches").text("(" + nMatch + " correspondance(s))");

                }
            },
            //evenement d'activation de l'arbre
            activate: function (event, data) {
                var curInputId = data.tree.$div.attr('id').split('treeView')[1];
                if (!boolExpand) {
                    $('#' + $("#treeView" + curInputId).fancytree("option", "currentInputId").id).val(data.node.title);
                    $('#' + $("#treeView" + curInputId).fancytree("option", "currentInputId").id + '_value').val(data.node.data.value);
                    $("#treeView" + curInputId).css('display', 'none');
                }

                ////console.log(this);
            },
            //Chargement ponctuel et définition de sa source
            lazyLoad: function (e, data) {
                var node = data.node;
                data.result = {
                    type: 'POST',
                    url: pageUrl + "/getTreeChildWLanguageWithoutDeprecated",
                    datatype: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: "{ 'id' : '" + node.key + "','language':'" + language + "' }",
                }
            },
            select: function (event, data) {

            }
        });
    }
}

var buttonReset = $('button');
var inputResearch = $("input[type=text]");
var reschValueOld = "";
var ultimatch = "";
var boolExpand = false;
buttonReset.click(function (e) {
    resetResearch();
}).attr("disabled", true);
inputResearch.keyup(function (e) {

}).focus()

function genericSearch(id, e) {
    var match = $("#" + id).val();
    ultimatch = $("#" + id).val();
    $("#treeView").fancytree("getTree").clearFilter();
    //si l'input text de recherche est vide on affiche l'arbre comme au premier chargement
    if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
        resetResearch(id);
        return;
    }

    if (match.length >= 4) {
        //On lance l'ajax qui va recupérer les elts rechercher
        var result = $.ajax({
            type: 'POST',
            url: pageUrl + "/researchTopicWLanguageWithoutDeprecated",
            datatype: 'json',
            contentType: "application/json; charset=utf-8",
            data: "{ 'rsch' : '" + match + "', 'language':'" + language + "' }",
            //Une fois obtenu :
        }).success(function (data) {
            if (data.d != null) {
                if (data.d.length > 0) {
                    var result = data.d;
                    if (result !== undefined) {
                        $("#research").val(match);
                        expandAllSelected(result, 0)
                        $.when(expandAllSelected()).done(function () {
                            $("#treeView").fancytree("getTree").filterNodes(match, false);
                        });
                    }
                } else {
                    $.growl.error({ title: "Erreur", message: "La recherche n'a retournée aucun résultats" });
                }
            }
        });
        buttonReset.attr("disabled", false);
    }
}

//Fonction qui va vider l'input de recherche et recharger l'arbre
function resetResearch(id) {
    $("#treeContainer").find("input[type=text]").val("");
    $("span#matches").text("");
    $("#treeView" + id).fancytree("getTree").clearFilter();
    $("#research").val("");
    $('#' + id).val("");
    $("#treeView" + id).fancytree("getRootNode").visit(function (node) {
        node.setExpanded(false);
    });
}
