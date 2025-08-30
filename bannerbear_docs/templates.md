Templates
Templates are the reusable designs that you create in the Bannerbear editor. You can list a project's templates via the API.

You can design a template using the Bannerbear template editor, or you can add one from the template library (and modify it as needed).

Every template has a list of modifications available, for example text boxes that you can populate with different text, or image placeholders that you can replace with different images.

Endpoints
post	/v2/templates
post	/v2/templates?source=:uid
get	/v2/templates/:uid
patch	/v2/templates/:uid
get	/v2/templates
post	/v2/templates/import
delete	/v2/templates/:uid
The template object
Attributes
uid string
The unique ID for this object.
name string
The name of this template.
self string
The permalink to this object.
preview_url string
A thumbnail of the latest version of the template.
available_modifications list
A list of available modifications.
tags list
An array of tags for this template.
Sample Object
{
  "created_at": "2020-03-17T01:58:07.358Z",
  "name": "Twitter Demo",
  "self": "https://api.bannerbear.com/v2/templates/04PK8K2bctXHjqB97O",
  "uid": "04PK8K2bctXHjqB97O",
  "preview_url": null,
  "width": 1000,
  "height": 1000,
  "available_modifications": [
    {
      "name": "avatar",
      "image_url": null
    },
    {
      "name": "name",
      "text": null
    },
    {
      "name": "handle",
      "text": null
    },
    {
      "name": "body",
      "text": null
    }
  ],
  "tags": [
    "shoes",
    "instagram"
  ]
}
Create a template
This endpoint allows you create blank templates, which you can then use with the Sessions API to provide your users a blank canvas plus editor environment to design their own templates from scratch.

Parameters
name stringrequired
The name of the new blank template.
width integerrequired
The width of the new blank template.
height integerrequired
The height of the new blank template.
metadata string
Any metadata that you need to store e.g. ID of a record in your DB.
tags list
An array of tags for this template.
post	/v2/templates
Sample Request
var data = {
  "name" : "My Template",
  "width": 1000,
  "height": 900
}
fetch('https://api.bannerbear.com/v2/templates', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Duplicate a template
You can duplicate templates with this endpoint, which is useful if you are using the Sessions API. Let your users select templates from your custom library, then duplicate the template and create a Session so that they can customize it.

Parameters
uid stringquery string
The uid of the template you want to duplicate (must be from the same Project).
post	/v2/templates?source=:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/templates?source=${UID}`, {
  method: 'POST',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Retrieve a template
Parameters
uid stringrequired
The template uid that you want to retrieve.
extended booleanquery string
Set to true to return an extended response including current layer defaults.
get	/v2/templates/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/templates/${UID}`, {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Update a template
You can edit some basic attributes of a Template via the API.

Parameters
name string
The name of the template.
metadata string
Any metadata that you need to store e.g. ID of a record in your DB.
tags list
An array of tags for this template.
width integer
The new width of the template.
height integer
The new height of the template.
patch	/v2/templates/:uid
Sample Request
var data = {
  "tags" : [
    "Tag1",
    "Tag2"
  ],
  "name" : "My template"
}
fetch(`https://api.bannerbear.com/v2/templates/${UID}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
List all templates
Parameters
page integerquery string
The page of results you would like to retrieve. The API returns 25 items per page.
tag stringquery string
List items only with this tag.
limit integerquery string
The API returns 25 items per page by default but you can request up to 100 using this parameter.
name stringquery string
List items that partially match this name.
extended booleanquery string
Set to true to return an extended response including current layer defaults.
get	/v2/templates
Sample Request
fetch('https://api.bannerbear.com/v2/templates', {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Import templates
You can import templates to a project from the public library, or any templates that have been shared publicly in your account or other accounts.

The parameters in this request should be Publication IDs. These are the IDs of publicly-available templates either from the library or shared by other users. This request will not work with private template IDs.

This endpoint does not attempt to de-dupe, if you call it twice with the same payload, templates will be imported twice.

If you are looking for a JSON feed of all templates (publications) in the Bannerbear template library, you can find that here.

Parameters
publications listrequired
An array of Publication IDs to import into this project.
post	/v2/templates/import
Sample Request
var data = {
  "publications" : [
    "ao9gyzedjlb3bw0j7m",
    "ewmqrbyd5vqoj9xz7z"
  ]
}
fetch(`https://api.bannerbear.com/v2/templates/import`, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Delete a template
Permanently delete a template from your project. This action cannot be undone.

Parameters
uid stringrequired
The template uid that you want to delete.
delete	/v2/templates/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/templates/${UID}`, {
  method: 'DELETE',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Template Sets
Templates Sets are sets of Templates that you group together in the Bannerbear dashboard. You can create, modify and list a project's template sets via the API.

Endpoints
post	/v2/template_sets
patch	/v2/template_sets/:uid
get	/v2/template_sets/:uid
get	/v2/template_sets
The template set object
Attributes
uid string
The unique ID for this object.
name string
The name of this template set.
self string
The permalink to this object.
available_modifications list
A list of available modifications.
templates list
A list of templates inside this set.
Sample Object
{
  "name": "My Template Set",
  "created_at": "2020-11-11T02:48:54.472Z",
  "self": "http://api.bannerbear.com/v2/template_sets/VymBYa7gMjW6JQ2njM",
  "uid": "VymBYa7gMjW6JQ2njM",
  "available_modifications": [
    {
      "name": "tweet",
      "text": null,
      "color": null,
      "background": null
    },
    {
      "name": "avatar",
      "image_url": null
    },
    {
      "name": "name",
      "text": null,
      "color": null,
      "background": null
    }
  ],
  "templates": [
    //array of Template objects
  ]
}
Create a template set
Parameters
name string
A name for this template set.
templates list required
A list of template UIDs to add to this template set.
post	/v2/template_sets
Sample Request
var data = {
  "name": "My Template Set",
  "templates": [
    "p4KnlWBbK1V5OQGgm1",
    "r6anBGWDA1EDO38124",
    "RPowdyxbdM8ZlYBAgQ",
  ],
}
fetch('https://api.bannerbear.com/v2/template_sets', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Update a template set
Parameters
name string
A name for this template set.
templates list required
An updated list of template UIDs to include in this template set. When using the PATCH operation the template set will be cleared first and the new list of templates applied. This allows for removing templates and adding templates depending on your array of UIDs.
patch	/v2/template_sets/:uid
Sample Request
var data = {
  "templates": [
    "p4KnlWBbK1V5OQGgm1",
    "r6anBGWDA1EDO38124"
  ],
}
fetch(`https://api.bannerbear.com/v2/template_sets/${UID}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Retrieve a template set
Parameters
uid stringrequired
The template set uid that you want to retrieve.
extended booleanquery string
Set to true to return an extended response including current layer defaults.
get	/v2/template_sets/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/template_sets/${UID}`, {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
List all template sets
Parameters
page integerquery string
The page of results you would like to retrieve. The API returns 25 items per page.
extended booleanquery string
Set to true to return an extended response including current layer defaults.
get	/v2/template_sets
Sample Request
fetch('https://api.bannerbear.com/v2/template_sets', {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})