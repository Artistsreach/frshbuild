Project Info
get
https://api.mintology.app/v1/{projectId}
Retrieve project information such as name and contract_address.
Alternative : Use “Project Retrieve” from backend if you need a more in-depth project details.

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

name
string
required
The project name.

used_quantity
number
required
The quantity of NFTs that have been minted for this project.

contract_address
string
required
The NFT smart contract address associated with your project ID.

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.metaInfo({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));