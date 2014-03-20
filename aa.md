FormBuilder 1.0
================

Allows to create form, specify field setting and export them to XML Format.

>>>Dependancies :
----------------------------------------
    + jQuery
    + jQuery UI
    + Underscore
    + Backbone
    + Bootstrap 2.3.2
    + Metro-bootstrap
    + Less JS
------------------------------------------

How two import the formBuilder
------------------------------

The simpliest HTML example is : 

<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="formBuilder/public_html/bootstrap/css/bootstrap-responsive.min.css" />
        <link rel="stylesheet" type="text/css" href="formBuilder/public_html/metro-bootstrap/css/metro-bootstrap.css" />
        <link rel="stylesheet" type="text/css" href="formBuilder/public_html/metro-bootstrap/docs/font-awesome.css" />
        <link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
        
        <link rel="stylesheet/less" type="text/css" href="formBuilder/public_html/stylesheet/styles.less" />
        <script type="text/javascript" src="formBuilder/public_html/js/libs/less/less.min.js"></script>
        
        <script type="text/javascript" src="formBuilder/public_html/js/libs/jquery/jquery.min.js"></script>
        <script type="text/javascript" src="formBuilder/public_html/js/libs/jquery/jquery-ui.min.js"></script>
        <script type="text/javascript" src="formBuilder/public_html/js/libs/backbone/underscore/underscore-min.js"></script>
        <script type="text/javascript" src="formBuilder/public_html/js/libs/backbone/backbone-min.js"></script>
        
        <script type="text/javascript" src="formBuilder/public_html/js/app/formBuilder.js"></script>
        <script type="text/javascript" src="formBuilder/public_html/js/app/model.js"></script>
        <script type="text/javascript" src="formBuilder/public_html/js/app/collection.js"></script>
        <script type="text/javascript" src="formBuilder/public_html/js/app/views.js"></script>
    </head>
    <body>
        <section id="formBuilder" class="container-fluid">            
        </section>
        <script type="text/javascript">
            $(document).ready( function() {
                formBuilder.init();
            });
        </script>
    </body>
</html>
