Claim
post
https://api.mintology.app/v1/{projectId}/claim
This endpoint will mint a free NFT to your user's wallet (which can be a Mintable Wallet, or their existing crypto wallet). This is the endpoint you should use for discount coupons, proof of attendance, and in general NFTs which you do not intend to sell.
Note: Separating the mint and claim endpoints will allow you to clearly identify the purpose of each call in your analytics.

Body Params
wallet_address
string
Wallet address of the user to mint the token to if you don't pass in a user name.

email
string
Optional Mintable wallet or Mintable's user email for minting the NFT to that wallet.

premint_id
string
The premint_id is an optional field. It represents the unique identifier for a premint, which is used to mint a NFT. If the user provides a premint_id, it will be used to identify the specific premint to be used for NFT minting. The premint_id can be obtained from the list premint APIs.

metadata
object
Optional metadata to associate with minted token, if you don't have a preminted NFT in the dashboard, you need to pass in your own metadata to use.


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

token_id
string
required
Token id of the minted token

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.mintClaim({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));