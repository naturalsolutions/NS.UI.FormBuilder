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

  * readonlyMode : true OR false (todo, partial implementation)
  * authMode : "portal" OR something else (no auth) (todo change this to bool or just portalURL)
  * portalURL : "http://path/to/your/portal/"
  * securityKey : "yourSecurityKey" (used for portal (todo check if this is true, there are bugs with portal auth i think))
  * thesaurusWSPath : "http://path/to/thesaurus/webservices/"
  * positionWSPath : "http://path/to/position/webservices/"
  * backendUrls: (see app-config.example.js)

Context options
---------------
  * topcontext : "reneco" or something else (reneco hardwires)
  * defaults: provide default value-sets for context-specific config. if none is specified below context options, value-set from default will be used.
    * editColumns
    * [...] (see app-config.example.js)
  * contexts: list of available contexts (by object key). Every absent context option implies defaults will be used for missing option key.

Available input types
---------------------
See app-config.example.js
