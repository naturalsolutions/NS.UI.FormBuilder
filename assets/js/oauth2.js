define(['jquery', 'app-config'],
    function ($, AppConfig) {
        return new Promise(function (resolve, reject) {
            /****** STARTING define function ****/
            function checkCode() {
                var keyToFind = "code"
                var toRet = null
                var qs = window.location.search.substring(1)
                if (qs != '') {
                    var pairs = qs.split('&')
                    for (var i = 0; i < pairs.length; i++) {
                        var tmp = pairs[i].split('=');
                        var key = tmp[0];
                        var value = tmp[1]
                        if (decodeURIComponent(key) == keyToFind) {
                            toRet = value
                        }
                    }
                }
                return toRet
            }

            function storeTokens(data) {
                localStorage.setItem("NSFBAccess_token", data.access_token);
                localStorage.setItem("NSFBRefresh_token", data.refresh_token);
            }

            function getTokenWithCode(codeToSend) {
                console.log('getTokenWithCode');
                $.ajax({
                    context: this,
                    type: 'POST',
                    url: AppConfig.portalApiUrl + 'security/oauth2/v1/token',
                    data: JSON.stringify({
                        'grant_type': "code",
                        "code": codeToSend
                    }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data) {
                        storeTokens(data)
                        window.location.href = window.location.origin + window.location.pathname
                    },
                    error: function () {

                    },
                    complete: function () {

                    }
                })
            }

            /****** ENDING define function ******/

            /******  STARTING FLOW    ******/
            var qsCode = checkCode();
            if (!qsCode) {
                console.log('OK');
                return resolve();
            }
            getTokenWithCode(qsCode);
            reject();
            /******  ENDING FLOW    ******/
        });
    });