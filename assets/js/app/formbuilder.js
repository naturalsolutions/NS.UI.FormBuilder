/**
 * @fileOverview formbuilder.js
 *
 * This file init formbuilder application using require JS
 * Create and run backbone router
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(['jquery', 'underscore', 'backbone', 'app/router'], function($, _, Backbone, Router){

    var formbuilder = {
        initialize : function(options) {
            //  Init router
            this.router = new Router(this);
            Backbone.history.start();
        }
    };

  return formbuilder;

});