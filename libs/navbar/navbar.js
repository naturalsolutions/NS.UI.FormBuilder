var NS = window.NS || {};

NS.UI = (function(ns) {
    "use strict";

    /*
     * Utility method to test a user's permissions
     */
    var isAllowedFor = function(allowed, current) {
        var i, j, authorized = false;
        if (allowed && current) { // Prevent TypeError when evaluting length if a parameter is null or undefined
            for (i = 0; i < allowed.length; i++) {
                for (j = 0; j < current.length; j++) {
                    if (current[j] === allowed[i]) {
                        authorized = true;
                        i = allowed.length;  // will break outer loop as well
                        break; // break inner loop
                    }
                }
            }
        }
        return authorized;
    };

    /*
     *  Action class will let users declare their contextual action.
     */
    var Action = function (options) {
        this.title = options.title;
        // Permission
        if (options.allowedRoles) {
            this.roles = options.allowedRoles;
        } else {
            this.roles = [];
        }
        // Action type (link, button or group)
        if (options.url) {
            this.url = options.url;
        }
        if (options.handler) {
            this.handler = options.handler;
        }
        if (options.actions) {
            this.actions = options.actions;
        }
        this.divider = Boolean(options.divider);
    };
    Action.prototype.isGroup = function () {
        return ('actions' in this);
    };
    Action.prototype.isLink = function () {
        return ('url' in this);
    };
    Action.prototype.isButton = function () {
        return ('handler' in this);
    };
    Action.prototype.allowedFor = function (roles) {
        return isAllowedFor(this.roles, roles);
    };

    
    /*
     * Main NavBar view
     */
    ns.NavBar = Backbone.View.extend({
        tagName: 'header',
        className: 'navbar',

        events: {
            'submit .navbar-search': 'onSearch',
            'click .navbar-actions a[data-key]': 'clickOnAction',
            'click .navbar-switcher': 'clickOnContextSwitcher',
            'click .navbar-tiles .tile-wrapper': 'clickCancelNav',
            'click .navbar-tiles a': 'clickOnTile'
        },

        initialize: function (options) {
            this.tiles = options.tiles || [];
            this.username = options.username;
            this.roles = options.roles;
            this.context = options.context || '';
            this.appName = options.title;
            this.enableSearchBox = ('enableSearchBox' in options) ? Boolean(options.enableSearchBox) : true;
            Backbone.View.prototype.initialize.apply(this, arguments);
            this.templates = {
                navbar: _.template(this.constructor.templates.navbar, null, {variable: 'data'}),
                userbox: _.template(this.constructor.templates.userbox, null, {variable: 'data'}),
                breadcrumbs: _.template(this.constructor.templates.breadcrumbs, null, {variable: 'data'}),
                tileItem: _.template(this.constructor.templates.tileItem, null, {variable: 'data'}),
                actionItem: _.template(this.constructor.templates.actionItem, null, {variable: 'data'}),
                actionHeader: _.template(this.constructor.templates.actionHeader, null, {variable: 'data'}),
                actionDivider: _.template(this.constructor.templates.actionDivider, null, {variable: 'data'}),
                actionGroup: _.template(this.constructor.templates.actionGroup, null, {variable: 'data'})
            };
        },

        /*
         * Rendering logic
         */

        render: function () {
            this.$el.html(this.templates.navbar({
                enableSearchBox: this.enableSearchBox
            }));
            this.$actions = this.$el.find('.navbar-actions');
            this.renderActions();
            this.$breadcrumbs = this.$el.find('.navbar-context');
            this.renderBreadcrumbs();
            this.$contextSwitcherTiles = this.$el.find('.navbar-tiles ul');
            this.$contextSwitcherWrapper = this.$el.find('.navbar-tiles .tile-wrapper');
            this.renderContextSwitcher();
            this.$userbox = this.$el.find('.navbar-user');
            this.renderUserDetails();
            this.setupSearchBox();
        },

        renderActions: function () {
            if (this.$actions) {
                this.$actions.empty();
                _.each(this.actions, function(action, key) {
                    // Render top-level actions
                    if (isAllowedFor(action.roles, this.roles)) {
                        var $content = this.renderAction(action, key),
                            $group;
                        if (action.isGroup()) {
                            $content.addClass('dropdown')
                            $content.find('a').attr('data-toggle', 'dropdown').addClass('dropdown-toggle');
                            $group = $(this.templates.actionGroup());
                            _.each(action.actions, function(action, key) {
                                // Render secondary-level actions
                                if (isAllowedFor(action.roles, this.roles)) {
                                    if (action.isGroup()) {
                                        $group.append($(this.templates.actionHeader({title: action.title})));
                                        _.each(action.actions, function(action, key) {
                                            // Render tertiary-level actions
                                            if (isAllowedFor(action.roles, this.roles)) {
                                                $group.append(this.renderAction(action, key));
                                            }
                                        }, this);
                                    } else {
                                        $group.append(this.renderAction(action, key));
                                    }
                                }
                            }, this);
                            $content.append($group);
                        }
                        this.$actions.append($content);
                    }
                }, this);
            }
        },

        renderAction: function (action, key) {
            if (action.divider) {
                return $(this.templates.actionDivider());
            }
            var data = {
                key: key,
                title: action.title
            };
            if (action.isLink()) {
                data.url = action.url;
            }
            return $(this.templates.actionItem(data));
        },

        renderBreadcrumbs: function () {
            if (this.$breadcrumbs) {
                this.$breadcrumbs.html(this.templates.breadcrumbs({
                    context: this.context,
                    appName: this.appName
                }));
            }
        },

        renderContextSwitcher: function () {
            if (this.$contextSwitcherTiles) {
                this.$contextSwitcherTiles.empty();
                var tiles = [], tile;
                for (var i=0; i<this.tiles.length; i++) {
                    tile = this.tiles[i];
                    if (isAllowedFor(tile.allowedRoles, this.roles)) {
                        this.$contextSwitcherTiles.append($(this.templates.tileItem({
                            title: tile.title,
                            tileClass: tile.tileClass + (this.context === tile.title ? ' active' : ''),
                            url: tile.url
                        })));
                    }
                }
            }
        },

        renderUserDetails: function () {
            if (this.$userbox) {
                this.$userbox.html(
                    this.username ? this.templates.userbox({username: this.username}) : ''
                );
            }
        },

        setupSearchBox: function () {
            this.constructor.setupSearchBox(this.$el.find('.navbar-search'));
        },

        /*
         * UI event handler
         */

        clickOnAction: function (e) {
            // TODO: Crappy code, refactoring would be much appreciated...
            var action, parts,
                key = $(e.target).data('key');
            if (key.indexOf('.') >= 0) {
                parts = key.split('.');
                if (parts.length === 3) {
                    action = this.actions[parts[0]].actions[parts[1]].actions[key];
                } else {
                    action = this.actions[parts[0]].actions[key];
                }
            } else {
                action = this.actions[key];
            }
            if (action.isButton()) {
                e.preventDefault();
                action.handler();
            }
        },

        clickOnContextSwitcher: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.showContextSwitcher();
        },

        hideContextSwitcher: function () {
            this.$contextSwitcherWrapper.hide();
            this.$contextSwitcherTiles.hide();
        },

        showContextSwitcher: function () {
            this.$contextSwitcherWrapper.show();
            this.$contextSwitcherTiles.slideDown(800);
        },

        clickOnTile: function (e) {
            e.stopPropagation();
            this.hideContextSwitcher();
        },

        clickCancelNav: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.hideContextSwitcher();
        },

        onSearch: function (e) {
            e.preventDefault();
            this.trigger('search', $(e.target).find('.search-query').val());
        },

        /*
         * Setters
         */

        setRoles: function (roles) {
            this.roles = roles;
            this.renderActions();
            this.renderContextSwitcher();
        },

        setUsername: function (name) {
            this.username = name;
            this.renderUserDetails();
        },

        setActions: function (actions) {
            this.actions = actions || {};
            this.renderActions();
        },

        setContext: function (context) {
            this.context = context;
            this.renderBreadcrumbs();
            this.renderContextSwitcher();
        }
    }, {
        Action: Action,
        setupSearchBox: function ($form) {},
        templates: {
            navbar:
                '<div class="navbar-inner">' +
                '    <p class="navbar-logo navbar-text pull-left"></p>' +
                '    <ul class="nav navbar-context"></ul>' +
                '    <ul class="nav navbar-switcher"><li><a href="#" title="Go to..."></a></li></ul>' +
                '    <ul class="nav navbar-actions"></ul>' +
                '    <form class="navbar-search pull-right" action="#"><% if (data.enableSearchBox) { %>' +
                '        <input type="text" class="search-query span2">' +
                '    <% } %></form>' +
                '    <p class="navbar-text navbar-user pull-right"></p>' +
                '</div>' +
                '<div class="navbar-tiles"><div class="tile-wrapper"><ul class="tiles"></ul></div></div>',
            userbox:
                '<span class="username"><%= data.username %></span>',
            breadcrumbs:
                '<li><a href="#"><%= data.appName %></a></li>' +
                '<li><p class="navbar-text"><%= data.context %></p></li>',
            tileItem:
                '<li class="tile <%= data.tileClass %>"><a href="<%= data.url %>"><i class="icon"></i><h2><%= data.title %></h2></a></li>',
            actionItem:
                '<li>' +
                '    <a href="<% if (data.url) { %><%= data.url %><% } else { %>#<% } %>" data-key="<%= data.key %>">' +
                '        <%= data.title %>' +
                '    </a>' +
                '</li>',
            actionHeader:
                '<li class="nav-header"><%= data.title %></li>',
            actionDivider:
                '<li class="divider"></li>',
            actionGroup:
                '<ul class="dropdown-menu"></ul>'
        }
    });

    return ns;
})(NS.UI || {});
