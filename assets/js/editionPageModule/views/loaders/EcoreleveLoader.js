define([], function () {
    var EcorelevetLoader = {

        initializeLoader: function (form, URLoptions) {
            this.form = form;
            this.options = URLoptions;

            return(true);
        },

        loadFormDatas: function(){
            return(true);
        },

        getThisLoader : function(){
            return (this);
        }
    };

    return EcorelevetLoader.getThisLoader();
});
