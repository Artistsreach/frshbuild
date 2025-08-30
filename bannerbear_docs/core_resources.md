Images
Images are the main resource on Bannerbear.

You generate images by sending a POST request with a template uid and a list of template modifications you want to apply. These modifications can be things like: changing the text, changing the images or changing the colors.

Bannerbear will respond with JPG and PNG (and PDF, if requested) formats of the new Image you have requested.

Endpoints
post	/v2/images
get	/v2/images/:uid
get	/v2/images
The image object
Attributes
These attributes are populated by Bannerbear. All other attributes of the object are set by the user at the time of creation.

uid string
The unique ID for this object.
status string
The current status of the image; pending, completed or failed.
self string
The permalink to this object.
image_url string
The final, rendered image url. This will be null to begin with and populates when the image has the status completed
pdf_url string
Url to the generated PDF, if render_pdf was set to true.
webhook_response_code integer
The HTTP response code received by the webhook_url.
Sample Object
{
  "created_at": "2020-02-20T07:59:23.077Z",
  "status": "pending",
  "self": "https://api.bannerbear.com/v2/images/kG39R5XbvPQpLENKBWJj",
  "uid": "kG39R5XbvPQpLENKBWJj",
  "image_url": null,
  "template": "6A37YJe5qNDmpvWKP0",
  "modifications": [
    {
      "name": "title",
      "text": "Lorem ipsum dolor sit amed",
      "color": null,
      "background": null
    },
    {
      "name": "avatar",
      "image_url": "https://www.bannerbear.com/assets/sample_avatar.jpg"
    }
  ],
  "webhook_url": null,
  "webhook_response_code": null,
  "transparent": false,
  "metadata": null,
  "render_pdf": false,
  "pdf_url": null,
  "width": 1000,
  "height": 1000
}
Create an image
Creating an image on Bannerbear is achieved via this endpoint.

This endpoint responds with 202 Accepted after which your image will be queued to generate. Images are usually rendered within a few seconds. When completed, the status changes to completed.

You can poll the GET endpoint for status updates or use a webhook to get the final image posted to you.

This endpoint supports synchronous generation.

Parameters
template stringrequired
The template uid that you want to use.
modifications listrequired
A list of modifications you want to make.
Child Parameters
name string required
The name of the layer you want to change.
color string
Color in hex format e.g. "#FF0000".
Text Container
text string
Replacement text you want to use.
background string
Background color in hex format e.g. "#FF0000".
background_border_color string
Background border color in hex format e.g. "#FF0000".
font_family string
Change the font.
text_align_h string
Horizontal alignment (left, center, right)
text_align_v string
Vertical alignment (top, center, bottom)
font_family_2 string
Change the secondary font.
color_2 string
Change the secondary font color.
Image Container
image_url string
Change the image.
effect string
Change the effect.
anchor_x string
Change the anchor point (left, center, right).
anchor_y string
Change the anchor point (top, center, bottom).
fill_type string
Change the fill type (fill, fit).
disable_face_detect boolean
Set to true to disable face detect for this request (if the image container is using face detect).
disable_smart_crop boolean
Set to true to disable smart crop for this request (if the image container is using smart crop).
Bar / Line Chart
chart_data string
Comma-delimited list of numbers to use as data.
Star Rating
rating integer
Number from 0 to 100 to use as the rating.
QR Code
target string
URL or text to use as the code target.
Bar Code
bar_code_data string
Text to encode as a bar code.
Any Layer Type
gradient list
Fill with gradient e.g. ["#000", "#FFF"]
shadow string
Add a shadow e.g. "5px 5px 0 #CCC"
border_width integer
Width of the object border.
border_color string
Border color in hex format e.g. "#FF0000".
shift_x integer
Shift layer along the x axis.
shift_y integer
Shift layer along the y axis.
target string
Add a clickable link to a URL on this object when rendering a PDF.
hide boolean
Set to true to hide a layer.
webhook_url string
A url to POST the full Image object to upon rendering completed.
transparent boolean
Render a PNG with a transparent background. Default is false.
render_pdf boolean
Render a PDF. This feature costs 3x quota.
template_version integer
Create image based on a specific version of the template.
metadata string
Any metadata that you need to store e.g. ID of a record in your DB.
post	/v2/images
Sample Request
var data = {
  "template" : "jJWBKNELpQPvbX5R93Gk",
  "modifications" : [
    {
      "name" : "layer1",
      "text" : "This is my text"
    },
    {
      "name" : "photo",
      "image_url" : "https://www.pathtomyphoto.com/1.jpg"
    }
  ]
}
fetch('https://api.bannerbear.com/v2/images', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Retrieve an image
Retrieves a single Image object referenced by its unique ID.

Parameters
uid stringrequired
The image uid that you want to retrieve.
get	/v2/images/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/images/${UID}`, {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
List all images
Lists images inside a project.

Parameters
page integerquery string
The page of results you would like to retrieve. The API returns 25 items per page.
limit integerquery string
The API returns 25 items per page by default but you can request up to 100 using this parameter.
get	/v2/images
Sample Request
fetch('https://api.bannerbear.com/v2/images', {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Examples

Create an image with some text and an image from an external server.

Example Request
var data = {
  "template" : YOUR_TEMPLATE_ID,
  "modifications" : [
    {
      "name": "background",
      "image_url": "https://www.bannerbear.com/images/tools/photos/photo-1568096889942-6eedde686635.jpeg"
    },
    {
      "name": "title",
      "text": "This is a title Hello World"
    }
  ]
}
fetch('https://api.bannerbear.com/images', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})

Create an image with some text and an image from an external server. Change the font and apply an effect to the background image.

Example Request
var data = {
  "template" : YOUR_TEMPLATE_ID,
  "modifications" : [
    {
      "name": "background",
      "image_url": "https://www.bannerbear.com/images/tools/photos/photo-1517446915321-65e972f1b494.jpeg",
      "effect": "Gaussian Blur"
    },
    {
      "name": "title",
      "text": "This is a title Hello World"
      "font_family": "Montserrat"
    }
  ]
}
fetch('https://api.bannerbear.com/images', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})

Create an image with some text and an image from an external server. Activate the secondary font styles set in the template.

Example Request
var data = {
  "template" : YOUR_TEMPLATE_ID,
  "modifications" : [
    {
      "name": "background",
      "image_url": "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1671&q=80"
    },
    {
      "name": "title",
      "text": "Like tacos? *We love tacos*"
    }
  ]
}
fetch('https://api.bannerbear.com/images', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})

Create a PDF.

Example Request
var data = {
  "template" : YOUR_TEMPLATE_ID,
  "render_pdf" : true,
  "modifications" : [
    {
      "name": "background",
      "image_url": "https://www.bannerbear.com/images/tools/photos/photo-1568096889942-6eedde686635.jpeg"
    },
    {
      "name": "title",
      "text": "This is a title *Hello World*"
    }
  ]
}
fetch('https://api.bannerbear.com/images', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Videos
Videos are generated from a Video Template.

Bannerbear can generate 3 types of video:

Overlay a video with a static overlay
Transcribe a video with auto-transcribed subtitles
Multi Overlay a video with a slideshow overlay
These are set at the Video Template level.

You generate videos by sending a POST request with a video template uid, a list of template modifications you want to apply, and a media file.

Bannerbear will respond with an MP4 format of the new Video you have requested.

Endpoints
post	/v2/videos
get	/v2/videos/:uid
patch	/v2/videos
get	/v2/videos
The video object
Attributes
These attributes are populated by Bannerbear. All other attributes of the object are set by the user at the time of creation.

uid string
The unique ID for this object.
status string
The current status of the video; pending, pending_approval, rendering, completed or failed.
self string
The permalink to this object.
video_url string
The final, rendered video url. This will be null to begin with and populates when the video has the status completed
length_in_seconds integer
The measured length in seconds of the input_media_url. Bannerbear will validate the length before rendering videos to prevent going over quota.
render_type string
The name of the Build Pack.
percent_rendered integer
The progress of the video render from 0 to 100.
transcription list
The transcription for the video line by line. This is populated automatically if you are using Bannerbear's auto-transcription feature.
gif_preview_url string
A low frame rate gif preview of the final video. Requires setting create_gif_preview to true.
webhook_response_code integer
The HTTP response code received by the webhook_url.
Sample Object
{
  "input_media_url": "https://www.bannerbear.com/audio/test.m4a",
  "created_at": "2020-09-16T05:30:19.568Z",
  "length_in_seconds": 0,
  "approval_required": true,
  "approved": false,
  "status": "pending",
  "self": "https://api.bannerbear.com/v2/videos/kG39R5XbvPQpLENKBWJj",
  "uid": "kG39R5XbvPQpLENKBWJj",
  "render_type": "overlay",
  "percent_rendered": 0,
  "video_url": null,
  "modifications": [
    {
      "name": "avatar",
      "image_url": "https://cdn.bannerbear.com/sample_images/welcome_bear_photo.jpg"
    }
  ],
  "frames": null,
  "frame_durations": null,
  "webhook_url": null,
  "webhook_response_code": null,
  "metadata": null,
  "transcription": null,
  "width": 1000,
  "height": 1000,
  "create_gif_preview": false,
  "gif_preview_url": null
}
Create a video
Creating a video on Bannerbear is achieved via this endpoint.

This endpoint responds with 202 Accepted after which your video will be queued to generate. Video rendering time depends on length / complexity of the video. It can vary from a few seconds to a few minutes. When completed, the status changes to completed.

You can poll the GET endpoint for status updates or use a webhook to get the final video posted to you.

Parameters
video_template stringrequired
The video template uid that you want to use.
input_media_url string
Full url to a video or audio file you want to import as the background of the video. You can also use a static image, and the zoom parameter will be set automatically. This is required depending on the build pack of the template you are using:
Build Pack
Overlay
input_media_url is required
Transcribe
input_media_url is required
Multi Overlay
input_media_url is optional
modifications list
A list of modifications you want to make. See Create an image for more details on the child parameters. Unlike an Image the modifications list is not always required for a Video.
zoom string
Apply a panning zoom effect to the video or image, can be one of: center, top, right, bottom, left.
zoom_factor float
Amount to zoom in by from 1 to 100. If zoom is set and zoom_factor is left blank, this will default to 10.
blur integer
Apply a blur filter (from 1 to 10) to the incoming video.
trim_start_time string
Trim the input_media_url clip to a specific start point, using HH:MM:SS notation.
trim_end_time string
Trim the input_media_url clip to a specific end point, using HH:MM:SS notation.
trim_to_length_in_seconds integer
Force trim the end video to a specific time. There are two ways to trim videos, either you use trim_to_length_in_seconds to trim from the start point by specifying a desired length.
Or you can use trim_start_time and trim_end_time to specify a part of the video / audio to be used.
webhook_url string
A url to POST the full Video object to upon rendering completed.
metadata string
Any metadata that you need to store e.g. ID of a record in your DB.
frames list
Applies only to videos using the Multi Overlay build pack. A list of modifications lists, each one representing a single graphic overlay on the video.
frame_durations list
Applies only to videos using the Multi Overlay build pack. Custom durations for each frame. When not specified, frames will be spread evenly across the video.
create_gif_preview boolean
Set to true to create a short animated gif preview in addition to the final mp4.
post	/v2/videos
Sample Request
//add a simple text overlay to a video
var data = {
  "video_template" : "9JWBASDKLpQPvbX5R93Gk",
  "input_media_url": "https://www.bannerbear.com/my/video.mp4",
  "modifications" : [
    {
      "name" : "layer1",
      "text" : "This is my text"
    }
  ]
}
fetch('https://api.bannerbear.com/v2/videos', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Retrieve a video
Parameters
uid stringrequired
The video uid that you want to retrieve.
get	/v2/videos/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/videos/${UID}`, {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Update a video
Parameters
uid stringrequired
The video uid that you want to update.
transcription list
A replacement transcription containing your corrected / edited text. Note that each element of the transcription array represents a specific timestamp. For that reason, the number of lines of your patched text must match the original. Bannerbear will not update the record if the number is different. Editing transcriptions is meant for minor corrections, not making major changes.
approved boolean
Set to true to approve the video and start the rendering process.
patch	/v2/videos
Sample Request
//update a transcription and begin rendering
var data = {
  "uid": "ASDKLpQPvbX",
  "transcription" : [
    "This is a replacement for line 1",
    "and this is a replacement for line 2"
  ],
  "approved" : true
}
fetch(`https://api.bannerbear.com/v2/videos`, {
  method: 'PATCH',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
List all videos
Parameters
page integerquery string
The page of results you would like to retrieve. The API returns 25 items per page.
get	/v2/videos
Sample Request
fetch('https://api.bannerbear.com/v2/videos', {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Examples

Click to Play

Create a video using the Overlay build pack with some text, image and background video from an external server.

Example Request
var data = {
  "video_template" : YOUR_TEMPLATE_ID,
  "input_media_url": "https://www.bannerbear.com/video/landscape_short.mp4",
  "modifications" : [
    {
      "name": "subtitle",
      "text": "Lorem ipsum"
    },
    {
      "name": "avatar",
      "image_url": "https://www.bannerbear.com/images/tools/people/51.jpg"
    }
  ]
}
fetch('https://api.bannerbear.com/videos', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})

Click to Play

Create a video using the Transcribe build pack with an image and background video from an external server. The audio is transcribed automatically by Bannerbear.

Example Request
var data = {
  "video_template" : YOUR_TEMPLATE_ID,
  "input_media_url": "https://www.bannerbear.com/video/landscape_short.mp4",
  "modifications" : [
    {
      "name": "avatar",
      "image_url": "https://www.bannerbear.com/images/tools/people/82.jpg"
    }
  ]
}
fetch('https://api.bannerbear.com/videos', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})

Click to Play

Create a video using the Multi Overlay build pack with some text, image and background video from an external server.

Example Request
var data = {
  "video_template" : YOUR_TEMPLATE_ID,
  "input_media_url": "https://www.bannerbear.com/video/landscape_short.mp4",
  "frames": [
    [
      {
        "name": "subtitle",
        "text": "This is frame one..."
      },
      {
        "name": "avatar",
        "image_url": "https://www.bannerbear.com/images/tools/people/51.jpg"
      }
    ],
    [
      {
        "name": "subtitle",
        "text": "This is frame two!"
      },
      {
        "name": "avatar",
        "image_url": "https://www.bannerbear.com/images/tools/people/82.jpg"
      }
    ]
  ]
}
fetch('https://api.bannerbear.com/videos', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})

Click to Play

Create a video using the Multi Overlay build pack with some text and images, with no background video. This is essentially a video slideshow.

Example Request
var data = {
  "video_template" : YOUR_TEMPLATE_ID,
  "frames": [
    [
      {
        "name": "subtitle",
        "text": "This is the 1st frame"
      },
      {
        "name": "avatar",
        "image_url": "https://www.bannerbear.com/images/tools/people/82.jpg"
      }
    ],
    [
      {
        "name": "subtitle",
        "text": "This is the 2nd frame, how's it going?"
      },
      {
        "name": "avatar",
        "image_url": "https://www.bannerbear.com/images/tools/people/82.jpg"
      }
    ],
    [
      {
        "name": "subtitle",
        "text": "This is the last frame, goodbye! 🐻"
      },
      {
        "name": "avatar",
        "image_url": "https://www.bannerbear.com/images/tools/people/82.jpg"
      }
    ]
  ]
}
fetch('https://api.bannerbear.com/videos', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Collections
Sometimes you want to use the same data payload but push to multiple templates at once.

In Bannerbear, you can do this by grouping templates together in a Template Set. Pushing data to a Template Set results in a response that includes multiple images (depending on how many templates were in your set).

This multi-image object is known as a Collection.

Endpoints
post	/v2/collections
get	/v2/collections/:uid
get	/v2/collections
The collection object
Attributes
These attributes are populated by Bannerbear. All other attributes of the object are set by the user at the time of creation.

uid string
The unique ID for this object.
status string
The current status of the collection; pending, completed or failed.
self string
The permalink to this object.
image_urls object
An object of final, rendered image urls. This will be null to begin with and populates when the collection has the status completed
images list
An array of the full Image objects in this collection.
webhook_response_code integer
The HTTP response code received by the webhook_url.
Sample Object
{
  "created_at": "2020-07-31 04:28:32 UTC",
  "uid": "rZdpMYmAnDB1zb3kXL",
  "self": "https://api.bannerbear.com/v2/collections/rZdpMYmAnDB1zb3kXL",
  "template_set": "Dbl5xYVgKRzLwaNdqo",
  "status": "completed",
  "modifications": [
    {
      "name": "text_container",
      "text": "Hello World"
    }
  ],
  "webhook_url": null,
  "webhook_response_code": null,
  "transparent": false,
  "metadata": null,
  "image_urls": {
    "template_EagXkA3DwM1ZW2VBYw_image_url": "https://cdn.bannerbear.com/...",
    "template_197xPQmDnLqZG3E82Y_image_url": "https://cdn.bannerbear.com/..."
  },
  "images": [
    //array of Image objects
  ]
}
Create a collection
Creating a collection on Bannerbear is achieved via this endpoint and behaves the same as creating a single Image except with a different response.

This endpoint responds with 202 Accepted after which your collection will be queued to generate. Collections are usually rendered within a few seconds. When completed, the status changes to completed.

You can poll the GET endpoint for status updates or use a webhook to get the final video posted to you.

This endpoint supports synchronous generation.

Parameters
template_set stringrequired
The template set uid that you want to use.
modifications listrequired
A list of modifications you want to make. See Create an image for more details on the child parameters.
webhook_url string
A url to POST the full Collection object to upon rendering completed.
metadata string
Any metadata that you need to store e.g. ID of a record in your DB.
transparent boolean
Render the collection with a transparent background. Default is false.
post	/v2/collections
Sample Request
var data = {
  "template_set" : "LXk3bz1BDnAmYMpdZr",
  "modifications" : [
    {
      "name" : "layer1",
      "text" : "This is my text"
    },
    {
      "name" : "photo",
      "image_url" : "https://www.pathtomyphoto.com/1.jpg"
    }
  ]
}
fetch('https://api.bannerbear.com/v2/collections', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Retrieve a collection
Parameters
uid stringrequired
The collection uid that you want to retrieve.
get	/v2/collections/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/collections/${UID}`, {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
List all collections
Parameters
page integerquery string
The page of results you would like to retrieve. The API returns 25 items per page.
get	/v2/collections
Sample Request
fetch('https://api.bannerbear.com/v2/collections', {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Animated Gifs
Animated Gifs on Bannerbear take the form of simple slideshows. You can add multiple frames, control the duration of individual frames, control the number of loops and more.

Endpoints
post	/v2/animated_gifs
get	/v2/animated_gifs/:uid
get	/v2/animated_gifs
The animated gif object
Attributes
These attributes are populated by Bannerbear. All other attributes of the object are set by the user at the time of creation.

uid string
The unique ID for this object.
self string
The permalink to this object.
image_url string
The final, rendered image url. This will be null to begin with and populates when the image has the status completed
webhook_response_code integer
The HTTP response code received by the webhook_url.
Sample Object
{
  "created_at": "2020-12-02T05:35:57.364Z",
  "uid": "a46YPx8Z65pwmKrdGE",
  "self": "https://api.bannerbear.com/v2/animated_gifs/a46YPx8Z65pwmKrdGE",
  "template": "1eGqK9b33PxbnaYpP8",
  "status": "pending",
  "input_media_url": null,
  "frames": [
    [], //list of modifications
    [], //list of modifications
    []  //list of modifications
  ],
  "fps": 1,
  "frame_durations": null,
  "loop": true,
  "image_url": null,
  "webhook_url": null,
  "webhook_response_code": null,
  "metadata": null
}
Create an animated gif
This endpoint responds with 202 Accepted after which your animated gif will be queued to generate. Animated gifs are usually rendered within a few seconds. When completed, the status changes to completed.

You can poll the GET endpoint for status updates or use a webhook to get the final animated gif posted to you.

Parameters
template stringrequired
The template uid that you want to use.
frames listrequired
A list of modifications lists to apply in sequence. See Create an image for more details on the child parameters. Animated Gifs can have a maximum of 30 frames.
input_media_url string
An optional movie file that can be used as part of the gif. Depending on the number of frames you pass in, Bannerbear will generate thumbnails of this movie and place them sequentially into an image container in your template named video_frame.
fps integer
Set the frame rate of gif (default is 1 frame per second).
frame_durations list
Custom durations for each frame (overrides fps).
loop boolean
Set the gif to loop or only play once.
metadata string
Any metadata that you need to store e.g. ID of a record in your DB.
webhook_url string
A url to POST the full Animated Gif object to upon rendering completed.
post	/v2/animated_gifs
Sample Request
var data = {
  "template" : "1eGqK9b33PxbnaYpP8",
  "frames" : [
    [ //frame 1 starts here
      {
        "name" : "layer1",
        "text" : "This is my text"
      },
      {
        "name" : "photo",
        "image_url" : "https://www.pathtomyphoto.com/1.jpg"
      }
    ],
    [ //frame 2 starts here
      {
        "name" : "layer1",
        "text" : "This is my follow up text"
      },
      {
        "name" : "photo",
        "image_url" : "https://www.pathtomyphoto.com/2.jpg"
      }
    ]
  ]
}
fetch('https://api.bannerbear.com/v2/animated_gifs', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Retrieve an animated gif
Parameters
uid stringrequired
The animated gif uid that you want to retrieve.
get	/v2/animated_gifs/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/animated_gifs/${UID}`, {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
List all animated gifs
Parameters
page integerquery string
The page of results you would like to retrieve. The API returns 25 items per page.
get	/v2/animated_gifs
Sample Request
fetch('https://api.bannerbear.com/v2/animated_gifs', {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Screenshots
The Bannerbear API includes a screenshot tool if you need to capture screenshots of public webpages.

This endpoint supports synchronous generation.

Endpoints
post	/v2/screenshots
get	/v2/screenshots/:uid
get	/v2/screenshots
The screenshot object
Attributes
These attributes are populated by Bannerbear. All other attributes of the object are set by the user at the time of creation.

uid string
The unique ID for this object.
status string
The current status of the image; pending, completed or failed.
self string
The permalink to this object.
webhook_response_code integer
The HTTP response code received by the webhook_url.
Sample Object
{
  "url": "https://www.apple.com",
  "width": 1200,
  "height": 3000,
  "created_at": "2021-01-05T06:54:52.912Z",
  "mobile": false,
  "self": "https://api.bannerbear.com/v2/screenshots/xwbeAQqO70Y3oyd2WY",
  "uid": "xwbeAQqO70Y3oyd2WY",
  "screenshot_image_url": null,
  "webhook_url": null,
  "webhook_response_code": null,
  "status": "pending"
}
Create a screenshot
This endpoint responds with 202 Accepted after which your screenshot will be queued to generate. Screenshots are usually rendered within a few seconds. When completed, the status changes to completed.

You can poll the GET endpoint for status updates or use a webhook to get the final screenshot posted to you.

Parameters
url stringrequired
The website you want to screenshot.
width integer
Screenshot browser width, defaults to 1200 if not set.
height integer
Screenshot browser height, defaults to full page if not set.
mobile boolean
Use mobile user agent. Default is false.
language string
Set the browser language using a two-letter ISO 639-1 code. Only languages using Latin, Japanese, Korean, Chinese and Thai alphabets are supported.
metadata string
Any metadata that you need to store e.g. ID of a record in your DB.
webhook_url string
A url to POST the full Screenshot object to upon rendering completed.
post	/v2/screenshots
Sample Request
var data = {
  "url" : "https://www.apple.com"
}
fetch('https://api.bannerbear.com/v2/screenshots', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${API_KEY}`
  }
})
Retrieve a screenshot
Parameters
uid stringrequired
The screenshot uid that you want to retrieve.
get	/v2/screenshots/:uid
Sample Request
fetch(`https://api.bannerbear.com/v2/screenshots/${UID}`, {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})
List all screenshots
Parameters
page integerquery string
The page of results you would like to retrieve. The API returns 25 items per page.
get	/v2/screenshots
Sample Request
fetch('https://api.bannerbear.com/v2/screenshots', {
  method: 'GET',
  headers: {
    'Authorization' : `Bearer ${API_KEY}`
  }
})