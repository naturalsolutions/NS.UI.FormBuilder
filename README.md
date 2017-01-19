# FormBuilder Front-End

What does the Front of the Formbuilder needs to work ?
-----

- npm
- bower
- grunt
- the "thesaurus" application


--------------------------------------------------
Installation
-----

Clone the repository

	git clone https://github.com/NaturalSolutions/NS.UI.FormBuilder.git

Install npm developpement tools

    npm install

Install library dependancies

    bower install

Compile with grunt

	grunt build


--------------------------------------------------
Configuration
-----

Rename and edit as following :

**App-config.js**

	assets/js/app-config.example.js

Must be renamed into

	assets/js/app-config.js
	
You'll have to rewrite the paths for the server calls with proper values (for the **URLOptions** item)

You'll also have to set the configuration rules for the app :

- Weather the application interface is readonly or not
		
		readonlyMode : true OR false

- Display advanced filters on the left pannel

		displayUserFilter : true OR false
		
- Set the authentication mode

		authMode : "portal" OR anything else
		
- If portal authentication mode is set, indicate the URL linking to the portal

		portalURL : "http://path/to/your/portal/"

- If portal authentication mode is set, the JWT security key 

		securityKey : "yourSecurityKey"
		
- Some paths to reach various webservices :

	- Path leading to thesaurs webservices
		
			thesaurusWSPath : "http://path/to/thesaurus/webservices/"
			
	- Path leading to position webservices
		
			thesaurusWSPath : "http://path/to/thesaurus/webservices/"
		

- The list of all application contexts you want to find in the formbuilder

	**See next chapter** for a full description of what you should put there

- The start ID of the thesaurus for each of your contexts

		startID : {context1 : 0, context2 : 508, ...}


--------------------------------------------------
Contexts Configuration
-----

For the **appMode** option, you will have to indicate the list of contexts you want to see in your formbuilder application.

- First you have to set a topcontext value

		topcontext : "classic"

- Then simply indicate the list of your contexts associated with an array of all the kind of inputs you want to link with your contexts 

		context1 : ['Text', 'Date', 'Number'],
		context2 : ['Select', 'Thesaurus', 'CheckBox', 'Autocomplete'],
		contextZ : ['File', 'Radio']


**Here is the list of existing generic types :**

- Hidden
- HorizontalLine
- Autocomplete
- Text
- File
- TreeView
- Date
- TextArea
- Number
- Decimal
- NumericRange
- Pattern
- CheckBox
- Radio
- Select
- ChildForm
- Thesaurus
- AutocompleteTreeView
