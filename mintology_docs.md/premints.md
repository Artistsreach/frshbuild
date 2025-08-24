List Premints
get
https://api.mintology.app/v1/{projectId}/premints
Returns a list of premint items. The premints are returned sorted by updated date, with the most recent premints before.

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

Responses

200
Returns a list of premint objects with attributes like id, name, image_url etc

Response body
object
data
array of objects
required
Data of the response

object
premint_id
string
required
Premint_id can be found by calling premint/list to get all the preminted NFT's IDs and then you can pass it in here to modifiy that preminted NFT data set. If you do not pass in a premint_id, we will create a new preminted NFT data set.

quantity
number
required
Number of NFTs to be created with this data set. Example, you want to create 100 NFTs that are all the same, or only 1, quantity will determine that count.

metadata
object
required
The metadata for the NFT pre-mint data, such as image, url, and additional properties to be on the NFT.


metadata object
project_id
string
required
base_uri
string
required
contract_slug
string
required
collection_slug
string
required
generator_type
string
required
Generative Others

disable_on_mintable
boolean
required
meta
object
required
Metadata of the response

count
number
required
last_evaluated_key
string
If last_evaluated_key exists, it indicates that all the requested results don't fit in a single page, last_evaluated_key is provided in the response and you can include it in a subsequent request to fetch the next page of results.

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.premintsList({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Create Premints
post
https://api.mintology.app/v1/{projectId}/premints
Create token details like name, image, animation_url and etc...

Body Params
premint_id
string
Premint_id can be found by calling premint/list to get all the preminted NFT's IDs and then you can pass it in here to modifiy that preminted NFT data set. If you do not pass in a premint_id, we will create a new preminted NFT data set.

quantity
number
required
Number of NFTs to be created with this data set. Example, you want to create 100 NFTs that are all the same, or only 1, quantity will determine that count.

metadata
object
required
The metadata for the NFT pre-mint data, such as image, url, and additional properties to be on the NFT.


metadata object
name
string
required
Name of the item.

image
string
required
This is the URL to the image of the item. Can be just about any type of image (including SVG, which will be converted into PNG), and can be IPFS URLs or paths. We recommend using a 350 x 350 image.

animation_url
string
A URL to a multimedia attachment for the item.The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA.

Animation_url also supports HTML pages, allowing you to build rich experiences and interactive NFTs using JavaScript canvas WebGL, and more. Scripts and relative paths within the HTML page are now supported. However, access to browser extensions is not supported.

description
string
A human-readable description of the item. Markdown is supported.

attributes
array of objects
These are the attributes for the item, which will show up on the item page on Mintable and other marketplaces.


object

trait_type
string
required
value
string
required

ADD object
title
string
Title of this NFT, can be same as name, this is used to list item for sales.

subtitle
string
Short description or subtitle of NFT, can be same as description, this is used to list item for sales.

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

Responses

201
Response body
object
data
object
required
Data of the response

premint_id
string
required
Premint_id can be found by calling premint/list to get all the preminted NFT's IDs and then you can pass it in here to modifiy that preminted NFT data set. If you do not pass in a premint_id, we will create a new preminted NFT data set.

quantity
number
required
Number of NFTs to be created with this data set. Example, you want to create 100 NFTs that are all the same, or only 1, quantity will determine that count.

metadata
object
required
The metadata for the NFT pre-mint data, such as image, url, and additional properties to be on the NFT.


metadata object
project_id
string
required
base_uri
string
required
contract_slug
string
required
collection_slug
string
required
generator_type
string
required
Generative Others

disable_on_mintable
boolean
required
pk
string
required
sk
string
required

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.premintsCreate({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Retrieve Premints
get
https://api.mintology.app/v1/{projectId}/premints/{premintId}
Retrieve premint details like name, image, animation_url and etc...

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

premintId
string
required
premintId

Responses

200
Response body
object
data
object
required
Data of the response

premint_id
string
required
Premint_id can be found by calling premint/list to get all the preminted NFT's IDs and then you can pass it in here to modifiy that preminted NFT data set. If you do not pass in a premint_id, we will create a new preminted NFT data set.

quantity
number
required
Number of NFTs to be created with this data set. Example, you want to create 100 NFTs that are all the same, or only 1, quantity will determine that count.

metadata
object
required
The metadata for the NFT pre-mint data, such as image, url, and additional properties to be on the NFT.


metadata object
project_id
string
required
base_uri
string
required
contract_slug
string
required
collection_slug
string
required
generator_type
string
required
Generative Others

disable_on_mintable
boolean
required
pk
string
required
sk
string
required

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.premintsShow({projectId: 'projectId', premintId: 'premintId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Remove Premints
delete
https://api.mintology.app/v1/{projectId}/premints/{premintId}
Remove premint entity.

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

premintId
string
required
premintId

Responses

200
Response body
object
success
boolean
required

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.premintsRemove({projectId: 'projectId', premintId: 'premintId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Update Premints
put
https://api.mintology.app/v1/{projectId}/premints/{premintId}
Update token details like name, image, animation_url and etc...

Body Params
quantity
number
required
Number of NFTs to be created with this data set. Example, you want to create 100 NFTs that are all the same, or only 1, quantity will determine that count.

metadata
object
required
The metadata for the NFT pre-mint data, such as image, url, and additional properties to be on the NFT.


metadata object
Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

premintId
string
required
premintId

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.premintsUpdate({projectId: 'projectId', premintId: 'premintId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Import Premints
post
https://api.mintology.app/v1/{projectId}/premints/import
Import token details like name, image, animation_url and etc...

Body Params
You can use either the url or the items field to provide the data to import to pre-mints, but not both. If you use both, the service will use items. If you use neither, the service will also give an error. You need to use at least one of them to import your pre-mints successfully.

url
string
This is an optional field that specifies the URL of the data source that you want to import. The URL should be a valid and accessible web address that contains the data in a compatible format. For example, you can use a URL that points to a CSV file, a JSON file, or an API endpoint that returns the data as JSON. The url field is optional, which means that you can either provide a URL or an array of input items to import data. If you provide a URL, the service will import data from the specified URL.

items
array of objects
This is also an optional field that specifies an array of pre-mint user input items. These are objects that contain the information and metadata for each item that you want to mint. The items field is also optional, which means that you can either provide an array of input items or a URL to import data. If you provide an array of input items, each item in the array should have the following properties such as quantity, and metadata.


object

premint_id
string
Premint_id can be found by calling premint/list to get all the preminted NFT's IDs and then you can pass it in here to modifiy that preminted NFT data set. If you do not pass in a premint_id, we will create a new preminted NFT data set.

quantity
number
required
Number of NFTs to be created with this data set. Example, you want to create 100 NFTs that are all the same, or only 1, quantity will determine that count.

metadata
object
required
The metadata for the NFT pre-mint data, such as image, url, and additional properties to be on the NFT.


metadata object
name
string
required
Name of the item.

image
string
required
This is the URL to the image of the item. Can be just about any type of image (including SVG, which will be converted into PNG), and can be IPFS URLs or paths. We recommend using a 350 x 350 image.

animation_url
string
A URL to a multimedia attachment for the item.The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA.

Animation_url also supports HTML pages, allowing you to build rich experiences and interactive NFTs using JavaScript canvas WebGL, and more. Scripts and relative paths within the HTML page are now supported. However, access to browser extensions is not supported.

description
string
A human-readable description of the item. Markdown is supported.

attributes
array of objects
These are the attributes for the item, which will show up on the item page on Mintable and other marketplaces.


object

trait_type
string
required
value
string
required

ADD object
title
string
Title of this NFT, can be same as name, this is used to list item for sales.

subtitle
string
Short description or subtitle of NFT, can be same as description, this is used to list item for sales.


ADD object
Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

Responses

200
Response body
object
success
boolean
required

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.premintsImport({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));