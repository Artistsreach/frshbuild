Authorize
post
https://api.mintology.app/v1/{projectId}/authorize
IMPORTANT: Call from the back-end.

This endpoint is used to check if a user owns a particular token (or any token of a particular collection). You will need to authenticate using your Mintology API Key, and also the Project ID that you set for one of your projects. If you do not specify a contract_address, we will use the contract associated with your project ID. If you do not specify a token_id, we will check if the wallet contain any tokens from the contract.

Path Params
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

Query Params
nextToken
string
When there are more than 15 tokens returned, pagination occurs and you are returned 'next_token' which you can include in the subsequent request to fetch the next page of results in this parameter.

Body Params
Request description

contract_address
string
The NFT smart contract address to check. This is the address of the NFT contract on the blockchain. If you do not specify a contract_address, we will use the contract associated with your project ID.

token_id
string
NFT token ID to check. This is the token id of the specific NFT token within the contract and it is optional; if absent, any token in the contract will authorize the wallet.

wallet_address
string
required
Wallet address of the user to authorize the token to if you don't pass in a user name.

email
string
Optional Mintable wallet or Mintable's user email for authorize the NFT to that wallet.

Responses

200
Success response description

Response body
object
data
object
required
Data of the response

authorized
boolean
required
Whether the wallet address has the NFT and is authorized (the wallet address contains the specified NFT or any NFT from the collection)

next_token
string
If next_token exists, it indicates that all the requested results don't fit in a single page, next_token is provided in the response and you can include it in a subsequent request to fetch the next page of results.

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.authorize({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  List Authorized Tokens
post
https://api.mintology.app/v1/{projectId}/authorize/inventory
IMPORTANT: Call from the back-end.

This endpoint is used to get the list of tokens that a user owns from a particular collection. You will need to authenticate using your Mintology API Key, and also the Project ID that you set for your project. If you do not specify a contract_address, we will use the contract associated with your project.

Body Params
Request description

wallet_address
string
The wallet address of a user to return the information from this wallet.

email
string
Optional Mintable wallet or Mintable's user email for authorize the NFT to that wallet.

contract_address
string
The NFT smart contract address to check. This is the address of the NFT contract on the blockchain. Optional: If you do not specify a contract_address, we will use the contract associated with your project ID.

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

exclusiveStartKey
string
When there are more than 15 tokens returned, pagination occurs and you are returned 'last_evaluated_key' which you can include in the subsequent request to fetch the next page of results in this parameter.

Responses

200
Success response description

Response body
object
data
object
required
Data of the response

token_ids
array of strings
required
A list of owned NFT token IDs

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
mintology.authorizeInventory({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));