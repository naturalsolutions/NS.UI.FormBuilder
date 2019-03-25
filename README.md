# FormBuilder Front-End

Installation
------------

```
npm install -g yarn
yarn install
cp assets/app-config.example.js assets/app-config.js
grunt
```

Configuration
-------------

main config file: `assets/app-config.js`

  * portalAuth : if set to true, use portalURL for authentification, leave to false if not sure
  * portalURL : "http://path/to/your/portal/"
  * thesaurusWSPath : "http://path/to/thesaurus/webservices/"
  * positionWSPath : "http://path/to/position/webservices/"
  * other stuff: see app-config.example.js for reference

Context options
---------------
  * topcontext: "reneco" or something else (reneco hardwires)
  * defaults: provide default value-sets for context-specific config. if none is specified below context options, value-set from default will be used.
    * editColumns
    * [...] (see app-config.example.js)
  * contexts: list of available contexts (by object key). Every absent context option implies defaults will be used for missing option key

Available input types
---------------------
See app-config.example.js
