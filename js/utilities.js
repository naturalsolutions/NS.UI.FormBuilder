
var formBuilder = (function(formBuild) {

    /**
     * Return if the XML Content is valid
     * 
     * @param {string} xmlContent xml content to check
     * @returns {array|Boolean} a boolean if everything is ok or an array with the errors
     */
    formBuild.XMLValidation = function(xmlContent) {
            var result;
            $.ajax({                
                url         : 'xml/NS_Schema.xsd',
                dataType    : 'html',
                async       : false                
            }).done(function(data) {
                
                var Module = {
                    xml         : xmlContent,
                    schema      : data,
                    arguments   : ["--noout", "--schema", 'NS_Schema.xsd', 'output.xml']
                }, xmllint = validateXML(Module);

                if (xmllint.indexOf('validates') > 0) {
                    result = true;
                } else {
                    var split   = xmllint.split(':');
                    result      = {
                        error   : split[3],
                        element : split[2],
                        message : split[split.length - 1].split('.', 1)[0]
                    };
                }

            }).error(function(jqXHR, textStatus, errorThrown) {
                throw errorThrown.message;
            });

            return result;
    };
    
    /**
     * 
     * @param {type} baseTText
     * @param {type} newText
     * @param {type} selector
     * @param {type} contextSize
     * @param {type} baseTextName
     * @param {type} newTextName
     * @param {type} inline
     * @returns {diffview.buildView.ctelt.e|Element|diffview.buildView.celt.e}
     */
    formBuild.GetXMLDiff = function (baseText, newText, baseTextName, newTextName, inline, contextSize) {
        
        var base    = difflib.stringAsLines(baseText), 
            newtxt  = difflib.stringAsLines(newText),
            sm      = new difflib.SequenceMatcher(base, newtxt),
            opcodes = sm.get_opcodes();

        // build the diff view and add it to the current DOM
        return diffview.buildView({
            baseTextLines   : base,
            newTextLines    : newtxt,
            opcodes         : opcodes,
            // set the display titles for each resource
            baseTextName    : baseTextName  || 'Source file',
            newTextName     : newTextName   || 'Updated file',
            contextSize     : contextSize   || null,
            viewType        : inline        ||  0
        });
    };
    
    formBuild.XmlToJson = function(element, index) {
        
        var jsonObject = {};
        
        _.each($(element).children(), function(el, idx) {
            
            jsonObject[$(el).prop('tagName')] = {};
            
            if ($(el).get(0).attributes.length > 0) {
                $.each($(el).get(0).attributes, function(index, attr) {
                    jsonObject[$(el).prop('tagName')][attr.nodeName] = attr.nodeValue;
                });
            }         
            
           if ($(el).children().length > 0) {
               //   recursive
               _.each(formBuild.XmlToJson(el, idx), function(subEl, subId) {
                   jsonObject[$(el).prop('tagName')][subId] = subEl;
               });
           } else {
               //   simple text
               if (_.isEmpty(jsonObject[$(el).prop('tagName')])) {
                   jsonObject[$(el).prop('tagName')] = $(el).text();
               } else {
                   jsonObject[$(el).prop('tagName')]['value'] = $(el).text();
               }
           }
           
        });

        return jsonObject;        
    };


    return formBuild;

})(formBuilder);
