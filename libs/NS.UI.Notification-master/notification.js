/*
 * Notification system for Backbone applications.
 * 
 * Depends on:
 * - Twitter Bootstrap
 */

var NS = window.NS || {};

NS.UI = (function(ns) {
    "use strict";

    ns.NotificationList = Backbone.View.extend({
        tagName: 'ul',
        className: 'notification-list',

        initialize: function(options) {
            $('body').append(this.el);
        }
    });

    ns.Notification = Backbone.View.extend({
        templateSrc: '<li class="alert alert-<%- data.type %>"><button type="button" class="close" data-dismiss="alert">&times;</button><strong><%= data.title %></strong> <span class="message"><%= data.message %></span></li>',

        initialize: function(options) {
            this.options = _.defaults(options || {}, {
                type: 'error',
                title: 'Error',
                message: 'An error occured',
                delay: 7
            });
            this.render();
        },

        render: function() {
            var data = _.pick(this.options, 'type', 'title', 'message');
            var $html = $(_.template(this.templateSrc, data, {variable: 'data'}));
            this.setElement($html);
            $('ul.notification-list').append(this.el);
            if (typeof(this.options.delay) === 'number' && this.options.delay > 0)
                this.$el.slideDown().delay(this.options.delay*1000).slideUp(400, function () {$(this).remove();});
            else
                this.$el.slideDown();
        }
    });

    return ns;
})(NS.UI || {});