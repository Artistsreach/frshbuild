Register IMX User
post
https://api.mintology.app/v1/{projectId}/imx/register
Generating an ImmutableX L2 user account for an Ethereum L1 account

Body Params
username
string
Optional username that will be tied to this private key/wallet

email
string
required
Email address that will be tied to this private key/wallet

force_overwrite_linked_wallet
boolean
Overwrite the currently linked wallet address forcefully


Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

Responses

200
Response body
object
message
string
required
Message

data
object
required
Response data

username
string
required
Username

wallet_address
string
required
The wallet address of a user to return the information from this wallet.

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.imxRegister({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Mint IMX Item
post
https://api.mintology.app/v1/{projectId}/imx/mint
Minting an NFT refers to the process of creating a unique digital asset on a IMX blockchain, typically using the Ethereum network.

Body Params
metadata
object
Metadata for the NFT being minted. If absent, the metadata defined in the project will be used.


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


ADD object
title
string
Title of this NFT, can be same as name, this is used to list item for sales.

subtitle
string
Short description or subtitle of NFT, can be same as description, this is used to list item for sales.

token_id
string
A unique token id for the NFT being minted, if its left blank we will assign one which will be returned in the response.

wallet_address
string
Wallet address to mint token to.

email
string
If absent, the wallet_address will be required.

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

transaction_id
number
required
Minting transaction ID

token_id
string
required
Token id of the minted token

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.imxMint({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Transfer IMX Item
post
https://api.mintology.app/v1/{projectId}/imx/transfer
Transferring an NFT, or a non-fungible token, refers to the process of sending ownership of the digital asset from one address on the IMX blockchain to another.

Body Params
token_id
string
required
The token id to transfer, must exist and belong to from_user

from_wallet_address
string
The wallet address owns the token at the contract address

to_wallet_address
string
The recipient wallet address of the token

to_email
string
If absent, the to_wallet_address will be required.

from_email
string
If absent, the from_wallet_address will be required.

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

Responses

200
Response body
object
data
object
required
Data of the response

transfer_id
number
required
Transferring transaction ID

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.imxTransfer({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));