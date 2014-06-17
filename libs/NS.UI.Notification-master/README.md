Notification
============


## Dependencies ##

* Backbone
* Twitter Bootstrap

## Usage ##

In your HTML, include script and stylesheet:

```html
<link rel="stylesheet" type="text/css" href="path/to/notification.css" />
<script type="text/javascript" src="path/to/notification.js"></script>
```

During initialization (DOM must be ready), add a NotificationList like so:

```javascript
$(document).ready(function() {
    new NS.UI.NotificationList();
});
```

Then, whenever you want to notify the user, create a new Notification:

```javascript
new NS.UI.Notification({
    type: 'error',
    title: 'Error:',
    message: 'Bla bla bla',
    delay: 10
});
```

All parameters are optional.

The notification will stay on screen for `delay` seconds. If ``delay`` is not a
positive number, the notification will remains until the user hits the close
button.

The `type` parameter controls the nature of the notifications. Possible values are:
`error`, `success`, `info` or `warning`. See [the Bootstrap doc]
(http://twitter.github.io/bootstrap/components.html#alerts) to get an
illustration of how each one looks.

## Contributors ##

Gilles Bassière, Natural Solutions