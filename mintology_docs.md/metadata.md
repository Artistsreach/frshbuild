Update NFT Metadata
put
https://api.mintology.app/v1/{projectId}/metadata/{tokenId}
IMPORTANT: Call from the back-end.
Update your NFT metadata that consist of things like: token name, image, animation_url and etc...
The URL where you can access the metadata is https://metadata.mintology.app/{projectId}/{tokenId} (for production), or https://metadata.mintology.dev/{projectId}/{tokenId} (for the testing environment).

Body Params
metadata
object
required
Required: The new metadata (will replace the existing metadata)


metadata object
Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

tokenId
string
required
tokenId

Responses

200
Response body
object
success
boolean
required

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.metadataUpdate({projectId: 'projectId', tokenId: 'tokenId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));