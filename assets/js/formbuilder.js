/**
 * Run the application
 * At start we run HomePageRouter to display homepage
 */

define([
    'backbone',
    'oauth2',
    'lodash',
    'jquery',
    'marionette',
    './router',
    'app-config',
    'auth',
    'tools',
    'i18n'
], function (Backbone, OAuth2, _, $, Marionette, Router, AppConfig, auth, tools) {

    function redirectToAuht() {
        redirect_uri = window.location.origin + window.location.pathname
        client_id = AppConfig.client_id
        encodedRedirectUri = encodeURIComponent(redirect_uri)
        url = AppConfig.portalFrontUrl
        search = '?redirect_uri=' + encodedRedirectUri + '&client_id=' + client_id
        urlToRedirect = url + search
        window.location.href = urlToRedirect
    }

    var xhrRefeshToken;

    function checkValidityToken(keyToken) {

        var token = localStorage.getItem(keyToken);
        var toRet = false;
        try {
            var tmp = token.split('.');
            var payload = JSON.parse(atob(tmp[1]));
        } catch (error) {
            localStorage.removeItem(keyToken);
            return toRet;
        }

        var now = new Date().getTime();
        //js timestamp is in milliseconds
        var dateExp = new Date(payload['exp'] * 1000).getTime();

        if (now - 5000 < dateExp) {
            toRet = token;
        }
        return toRet;
    }

    $(document).bind("ajaxSend", function (a, b, c) {
        console.log('ajaxStart', c.url);
    });

    // $( document ).ajaxStart(function() {
    //   console.log('ajaxStart');
    // })
    $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
        //TODO
    });
    $.ajaxSetup({
        error: function (jqxhr, options) {
            if (jqxhr.status == 401) {

                console.log(arguments, "you are not logged or the api could not identify you, you will be redirected to the portal")
                // document.location.href = AppConfig.portalFrontUrl;
            }
            if (jqxhr.status == 403) {
                Swal({
                    heightAuto: false,
                    title: 'Unauthorized',
                    text: "You don't have permission",
                    type: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: 'rgb(240, 173, 78)',
                    confirmButtonText: 'OK'
                });
            }
            if (jqxhr.status == 409) {
                Swal({
                    heightAuto: false,
                    title: 'Data conflicts',
                    text: jqxhr.responseText,
                    type: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: 'rgb(240, 173, 78)',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
    var xhrRefeshToken
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (options.url.indexOf('http://') > -1) {
            options.url = options.url;
        } else {
            options.url = AppConfig.fbApiUrl + options.url;
        }
        console.log('option.url ' + options.url);
        if (options.url.indexOf(AppConfig.fbApiUrl) > -1) {
            console.log('if (options.url.indexOf(AppConfig.fbApiUrl) > -1)');
            if (options.refreshRequest) {
                return;
            }

            // our own deferred object to handle done/fail callbacks
            var dfd = $.Deferred();

            // if the request works, return normally
            jqXHR.done(dfd.resolve);

            // if the request fails, do something else
            // yet still resolve
            jqXHR.fail(function () {
                var args = Array.prototype.slice.call(arguments);
                if (jqXHR.status != 401) {
                    dfd.rejectWith(jqXHR, args);
                } else {
                    var refresh_token = checkValidityToken("NSFBRefresh_token")
                    if (!refresh_token) {
                        redirectToAuht();
                    } else {
                        var refresh_token = localStorage.getItem('NSFBRefresh_token');
                        if (!xhrRefeshToken) {
                            xhrRefeshToken = $.ajax({
                                context: this,
                                type: 'POST',
                                url: AppConfig.portalApiUrl + 'security/oauth2/v1/token',
                                data: JSON.stringify({
                                    'grant_type': "refresh_token",
                                    "refresh_token": refresh_token
                                }),
                                dataType: 'json',
                                contentType: 'application/json'
                            }).then(function (data) {
                                    localStorage.setItem('NSFBAccess_token', data.access_token);
                                },
                                function (err) {
                                    redirectToAuht();
                                }
                            ).always(function () {
                                xhrRefeshToken = null;
                            });
                        }
                        xhrRefeshToken.then(function () {
                            // retry with a copied originalOpts with refreshRequest.
                            var newOpts = $.extend({}, originalOptions, {
                                refreshRequest: true,
                                headers: {
                                    Authorization: 'Bearer ' + localStorage.getItem('NSFBAccess_token')
                                }
                            });
                            // pass this one on to our deferred pass or fail.
                            $.ajax(newOpts).then(dfd.resolve, dfd.reject);
                        });
                    }
                }
            });

            // NOW override the jqXHR's promise functions with our deferred
            return dfd.promise(jqXHR);
        } else {
            if ('return')
            return;
        }
    });

    var FormbuilderApp = new Marionette.Application();
    var MainView = Marionette.View.extend({
        el: "#mainRegion",
        template: _.template(
            '<div id="leftSection" class="col-md-6"></div>\n' +
            '<div id="rightSection" class="col-md-6"></div>'),
        regions: {
            leftRegion: {
                el: '#leftSection',
                replaceElement: false
            },
            rightRegion: {
                el: '#rightSection',
                replaceElement: false
            }
        }
    });
    FormbuilderApp.on('start', function () {
        OAuth2.then(function() {

            //Si on est sur la version dev, alors on change la couleur et le texte formbuilder pour pouvoir différencier de la vrai app
            if (window.location.pathname.split('/')[1].length > 11) {
                $('a.title').text('(DevMode)' + $('a.title').text())
                $('header').css('background-color', 'rgb(189, 33, 0);')
                $('#contextSwitcher').css('background-color', 'rgb(154, 34, 8);')
            }
/*
            if (auth.error) {
                var redirectHome = function () {
                    window.location.href = AppConfig.portalFrontUrl;
                };

                switch (auth.error.status) {
                    case 400:
                        tools.swal("error", "error.cookieCheck", "error.serverAvailable", null, redirectHome);
                        break;
                    case 502:
                    default:
                        tools.swal("error", "error.cookieCheck", "error.serverDown", null, redirectHome);
                        break;
                }
                return;
            }

            if (auth.username) {
                $("header .user").text(auth.username);
                $("header .icons.last").removeClass("hidden");
            }
            if (auth.userlanguage) {
                $("header .lang").text(auth.userlanguage.toUpperCase());
            }
*/
            // start main view & router
            this.rootView = new MainView();
            this.router = new Router(
                this.rootView.getRegion('leftRegion'),
                this.rootView.getRegion('rightRegion'));

            // start routing
            Backbone.history.start();

            $.ajax({
                data: JSON.stringify({'securityKey': AppConfig.securityKey}),
                type: 'POST',
                url: AppConfig.config.options.URLOptions.security + "/haveToken",
                contentType: 'application/json',
                crossDomain: true,
                async: false
            }).done(function(data) {
                console.log(data);
              });

            $(".logout").click(function () {
                var delete_cookie = function (name) {
                    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                };

                delete_cookie(AppConfig.cookieName);
                setTimeout(function () {
                    window.location.replace(AppConfig.portalFrontUrl);
                }, 200)
            });

            /* TODO position needs to specify GetTree now, so the loop has been removed ...
            // preload trees
            $.each(AppConfig.paths, function(key, url){
                tools.loadTree(url);
            });
            */
            tools.loadTree(AppConfig.paths.thesaurusWSPath);
            tools.loadTree(AppConfig.paths.positionWSPath + "/GetTree")

            // preload form names
            $.each(AppConfig.contexts, function (ctx) {
                tools.loadForms(ctx);
            });

            // replace all <img src="*svg"> with inline <svg> tags
            tools.inlineSvg('img.svg');

            // translate header
            $("body > header").i18n();
        }, function (err) {
            //
        });
    });

    return FormbuilderApp;
});