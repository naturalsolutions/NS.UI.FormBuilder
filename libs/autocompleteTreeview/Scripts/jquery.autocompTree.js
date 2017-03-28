﻿/*
*   Plugin autocompTree 1.0
*   Permet l'affichage d'un autocomplete de donnée organisée en arbre
*   Dépendance :
*       - JQuery (min 1.8.*)
*       - JQuery UI (min 1.8.*)
*       - Fancytree (importé la bibliothèque jquery.fancytree-all ainsi que son css)
*/
(function ($) {
    $.fn.autocompTree = function (methodOrOptions) {
        //On définit nos paramètres par défaut
        var _self = $(this);
        var defauts =
        {
            //Les webservices doivent renvoyer une chaine au format JSON contenant au moins ces information:
            /*
            *   treeElt {
            *       title : string
            *       key : int
            *       lazy : false //L'autocomplete n'étant pas du tout efficace en lazy loading
            *       //Enfin toues les information qui seront utile a son utilisation
            *       //Notamment la valeur a afficher (et ou stocké si isDisplayDifferent = false)
            *       //Eventuellement la valeur à stocké (si isDisplayDifferent = true)
            *   }
            */
            //URL des webservices
            wsUrl: 'http://' + window.location.hostname + '/Thesaurus/App_WebServices/wsTTopic.asmx',
            //Webservices pour un affichage en arborescence
            webservices: 'initTreeByIdWLanguageWithoutDeprecated',
            //si l'affichage est différent de la valeur renvoyée
            display: {
                isDisplayDifferent: true,
                //Stocke la valeur dans un input hidden d'id = _self.attr("id") + suffixeId
                suffixeId: '_value',
                //Nom des paramètres a récupéré dans les noeuds de l'arbre
                //Si isDisplayDifferent = false -> la valeur sera displayValueName
                //Affichage
                displayValueName: 'fullpathTranslated',
                //Valeur cachée
                storedValueName: 'fullpath'
            },
            //Si l'arbre utilise un langage différent
            language: {
                hasLanguage: false,
                //Préféré un majuscule en première lettre
                lng: "En"
            },
            //Si l'arbre possède déjà une valeur
            inputValue: '',
            //idServant à l'initialisation de l'arbre
            //TODO service de paramètrage dynamique ou tous les paramètres ainsi que leur valeur sont généré a la volée
            startId: '',
            //Fonction appelé a chaque fin d'éxécution
            callback: '',
            //Fonction s'éxecutant après un clique
            onItemClick: '',
            //Fonction s'éxécutant après le focus sur l'input
            onInputFocus: '',
            //Fonction s'éxécutant après la perte de focus de l'input et de l'arbre
            onInputBlur: '',
            //Fonction s'éxécutant après l'initialisation de l'objet autocompTree
            onInputInitialize: '',
            //Enregistrement de l'item en elle même
            thisItem: $(this)
        }

        var methods = {
            init: function (parametres) {                
                //Fusion des paramètres envoyer avec les params par defaut
                if (parametres) {
                    var parametres = $.extend(defauts, parametres);
                };
                //Information à envoyer 
                var dataToSend = '';
                if (parametres.language.hasLanguage) {
                    dataToSend = "{'id':'" + parametres.startId + "', language: '" + parametres.language.lng + "'}"
                } else {
                    dataToSend = "{'id':'" + parametres.startId + "'}"
                }

                _self.each(function () {
                    var $me = $(this);
                    //On encapsule l'input ainsi que tous les éléments dans un div afin de les contrôlés
                    $me.wrapAll('<div id="divAutoComp_' + $me.attr("id") + '">');
                    var htmlInsert = '';
                    //Si isDisplayDifferent = true on crée un input hidden afin de stocker la valeur 
                    if (parametres.display.isDisplayDifferent) {
                        //htmlInsert = '<input type="hidden" id="' + $me.attr("name") + parametres.display.suffixeId + '" name="' + $me.attr("name") + parametres.display.suffixeId + '" runat="server" enabled="true"/>'
                    }
                    //Div qui sera le conteneur du treeview
                    htmlInsert += '<div class="fancytreeview" id="treeView' + $me.attr('id') + '" style="display:none"></div>';
                    $me.parent().append(htmlInsert);

                    //Insertion de la valeur dans l'input
                    $me.val(parametres.inputValue);

                    //Initialisation de l'arbre
                    tree = $('#treeView' + $me.attr("id")).fancytree({
                        debugLevel: 0,
                        extensions: ["filter"],
                        autoActivate: false,
                        keyboard: true,
                        filter: {
                            mode: "hide"
                        },
                        hideExpand: {
                            isHide: false,
                            nbExpand: 0
                        },
                        //defini la source pour les elts parents
                        source: {
                            type: "POST",
                            url: parametres.wsUrl + "/" + parametres.webservices,
                            datatype: 'json',
                            contentType: "application/json; charset=utf-8",
                            data: dataToSend
                        },
                        //Permet si l'arbre et en mode filter d'afficher les enfants des termes filtrés -> submatch
                        renderNode: function (event, data) {
                            var node = data.node;
                            if (data.tree.options.hideExpand.isHide) {
                                data.tree.options.hideExpand.nbExpand--;
                                var $span = $(node.span);
                                var strClass = $span[0].className;
                                strClass = strClass.replace("fancytree-hide", "fancytree-submatch");
                                $span[0].className = strClass;
                                if (data.tree.options.hideExpand.nbExpand == 0) {
                                    data.tree.options.hideExpand.isHide = false;
                                }
                            }
                        },
                        //Servant ici a afficher les termes enfants des termes filtré
                        click: function (event, data) {
                            var node = data.node,
                                tt = $.ui.fancytree.getEventTargetType(event.originalEvent);
                            //Bubbles permet de déterminer si l'evt vient d'un click souris oud'un faux clique setExpand
                            if (tt === "expander" && event.bubbles) {
                                var tree = data.tree.$div;
                                if (tree.hasClass("fancytree-ext-filter")) {
                                    data.tree.options.hideExpand.isHide = true;
                                    data.tree.options.hideExpand.nbExpand = node.getChildren().length;
                                    node.span.className = node.span.className.replace("fancytree-node", "fancytree-node fancytree-expanded");
                                }
                            }
                        },
                        //evenement d'activation de l'arbre (au clique)
                        activate: function (event, data) {
                            var tree = $("#treeView" + $me.attr("id")).fancytree('getTree');
                            if (parametres.display.isDisplayDifferent) {
                                $me.val(data.node.data[parametres.display.displayValueName]);
                                $('#' + $me.attr('id') + parametres.display.suffixeId).val(data.node.data[parametres.display.storedValueName]);
                                $("#treeView" + $me.attr("id")).css('display', 'none');
                                tree.activateKey(false);
                                //On désactive le pseudo blur afin qu'il ne s'éxécute plus si l'arbre a disparu et que le vrai focus n'est plus l'input
                                $(document).undelegate();
                            } else {
                                $me.val(data.node.data[parametres.display.displayValueName]);
                                $("#treeView" + $me.attr("id")).css('display', 'none');
                                tree.activateKey(false);
                                $(document).undelegate();
                            }
                            if (parametres.onItemClick) {
                                try {
                                    $.proxy(parametres.onItemClick(), $me);
                                } catch (e) {
                                    throw ('An error occured during onItemClick -> ' + e);
                                }
                            }
                        }
                    });
                    //Permet l'affichage du treeview au focus sur l'input
                    $me.focus(function () {
                        $("div[id^=treeView]").each(function () {
                            $(this).css('display', 'none');
                        });
                        var treeContainer = $("#treeView" + $me.attr("id"));
                        treeContainer.css('display', 'block').css('width', $me.outerWidth() - 2).css('border', 'solid 1px').css('position', 'absolute').css('z-index', '100');
                        treeContainer.offset({ left: $(this).offset().left, top: $(this).position().top + $(this).outerHeight() });
                        //Fonction qui permet d'effectuer un "blur" sur l'ensemble des éléments (input et arbre)
                        $(document).delegate("body", "click", function (event) {                            
                            if (!$(event.target).is("#" + $me.attr("id") + ",span[class^=fancytree], div[id^=treeView], ul")) {
                                var treeContainer = $("#treeView" + $me.attr("id"));
                                treeContainer.css('display', 'none');
                                $(document).undelegate();
                                if (parametres.onInputBlur) {
                                    try {
                                        $.proxy(parametres.onInputBlur(), $me);
                                    } catch (e) {
                                        throw ('An error occured during onInputBlur -> ' + e);
                                    }
                                }
                            }
                        });
                        if (parametres.onInputFocus) {
                            try {
                                parametres.onInputFocus();
                            } catch (e) {
                                throw ('An error occured during onInputFocus -> ' + e);
                            }
                        }
                    });
                    //Fonction de recherche et de filtration
                    $me.keyup(function (e) {
                        var treeHtml = $("#treeView" + $me.attr("id"));
                        var fancytree = treeHtml.fancytree("getTree");
                        //Si le nombrte d'élément est < a 100 on oblige l'utilisation d'au moins trois caractère pour des raisons de performances
                        if (fancytree.count() < 100 || $me.val().length >= 3) {
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
                            match = $me.val();
                            var n,
                                match = $me.val();

                            if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                                resetResearch(id);
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
                        if ($me.val().length == 0) {
                            fancytree.clearFilter();
                            treeHtml.fancytree("getRootNode").visit(function (node) {
                                node.setExpanded(false);
                            });
                        }
                    });

                    if (parametres.display.isDisplayDifferent) {
                        $me.change(function () {
                            $("#" + $me.attr('id') + parametres.display.suffixeId).val($me.val());
                        });
                    }

                    if (parametres.onInputInitialize) {
                        try {
                            parametres.onInputInitialize();
                        } catch (e) {
                            throw ('An error occured during onInputInitialize -> ' + e);
                        }
                    }
                });
                return _self;
            },
            reload: function (source) {
                var tree = $("#treeView" + _self.attr('id')).fancytree('getTree');
                if (source) {
                    //Possibilité de modifier la source de l'arbre
                    console.log(source);
                }
                tree.reload();
                return tree;
            },
            getTree: function () {
                return $("#treeView" + _self.attr('id')).fancytree('getTree');
            }
        }
        if (methods[methodOrOptions])
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof methodOrOptions === 'object' || !methodOrOptions)
            return methods.init.apply(this, arguments);
        else
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.autocompTree');
    }
})(jQuery);