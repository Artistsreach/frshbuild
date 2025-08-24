List Projects
get
https://api.mintology.app/v1/projects
IMPORTANT: Call from the back-end.

Requires: API KEY in the header. Returns a list of all projects you have created.

Responses

200
Response body
object
data
array of objects
required
Data of the response

object
status
string
required
Draft Disabled Failed Published Suspended Deploying

slug
string
required
project_id
string
required
used_quantity
number
organization_id
string
required
non_sub_pk
string
imx_project_id
number
contract_deployment_tx_hash
string
domain
string
required
name
string
required
description
string
required
mint_limit_per_address
string
required
contract_type
string
required
wallet_type
string
required
base_uri
string
required
contract_name
string
required
symbol
string
required
royalty
string
required
total_supply
string
required
contract_address
string
required
owner_address
string
required
network
string
required
chain
string
required
total_volume
string
required
total_non_generative_premints
string
required
allow_claim_on_mintable
string
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

mintology.projectsList()
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Create Projects
post
https://api.mintology.app/v1/projects
IMPORTANT: Call from the back-end.

Requires: API KEY in the header. Creates a new project under your account with the specified details.

Body Params
name
string
required
The name of your NFT project that is displayed on the Mintology dashboard. This cannot be changed once the contract is deployed.

description
string
required
The description of your NFT project.

mint_limit_per_address
number
This field represents the maximum number of NFTs that a single wallet can mint. It sets a limit to prevent any single wallet from minting an excessive number of NFTs. This limit should be less than or equal to the total supply of NFTs if the total supply is set.

contract_type
string
required
Whether its a shared contract that multiple brands can mint under (no deployment costs), a dedicated contract you control and deploy, or an existing contract you've already deployed and used on another project. This cannot be changed once the contract is deployed.


Shared
wallet_type
string
required
Select Non-custodial if you expect your users to already have a crypto wallet. Or if your users most likely don't have a crypto wallet, then select custodial. If a few users have a wallet, they can use their existing wallet and not need to create a custodial wallet.


Both
base_uri
string
Base URI for metadata, if you want to use your own storage. If you leave this blank, we will handle this for you.

contract_name
string
required
The contract name that will appear in the blockchain. When creating the Project through Dashboard, this is set from the "name" parameter input. This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

symbol
string
The shortened term or ticker symbol unique to your contract (for example "XYZ"). This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

royalty
number
Royalty for secondary sales, in % - this uses ERC-2981 for on-chain royalties so that when any NFT is sold on a marketplace that supports on-chain royalties you will get this percentage of the sale. This cannot be changed once the contract is deployed.

total_supply
number
This is an optional field that specifies the total supply of your NFTs in your dedicated smart contract. You can provide the value if you choose dedicated smart contract or existing smart contracts as your contract type, This cannot be changed once the contract is deployed.. If you leave this empty, it will set unlimited number of NFTs that can be minted If you enter 100, only 100 NFTs can ever be minted under this contract.

contract_address
string
If you want to reuse one of your existing smart contract (example using the same contract that was created for a different project).

owner_address
string
This field is optional and is used when the contract type is set to "Dedicated". The user can provide their wallet address which will be set as the owner of the deployed smart contract. It's important that this address is not a public address of someone else, as it's like taking ownership of the contract. If left empty, Mintology's address will be set as the owner. Users can later request Mintology to transfer the ownership after the contract deployment.

network
number
required
This is your network you want to deploy it to on Ethereum, your options are MAINNET = 1, SEPOLIA = 11155111 This cannot be changed once the contract is deployed.


1
chain
string
required
The blockchain you want to use, either Ethereum or IMX. This cannot be changed once the contract is deployed.


eth
total_volume
number
total_non_generative_premints
number
allow_claim_on_mintable
boolean

Responses

201
Response body
object
data
object
required
Data of the response

domain
string
required
name
string
required
The name of your NFT project that is displayed on the Mintology dashboard. This cannot be changed once the contract is deployed.

description
string
required
The description of your NFT project.

mint_limit_per_address
number
This field represents the maximum number of NFTs that a single wallet can mint. It sets a limit to prevent any single wallet from minting an excessive number of NFTs. This limit should be less than or equal to the total supply of NFTs if the total supply is set.

contract_type
string
required
Whether its a shared contract that multiple brands can mint under (no deployment costs), a dedicated contract you control and deploy, or an existing contract you've already deployed and used on another project. This cannot be changed once the contract is deployed.

Shared Dedicated Existing

wallet_type
string
required
Select Non-custodial if you expect your users to already have a crypto wallet. Or if your users most likely don't have a crypto wallet, then select custodial. If a few users have a wallet, they can use their existing wallet and not need to create a custodial wallet.

Both Custodial NonCustodial

base_uri
string
Base URI for metadata, if you want to use your own storage. If you leave this blank, we will handle this for you.

contract_name
string
required
The contract name that will appear in the blockchain. When creating the Project through Dashboard, this is set from the "name" parameter input. This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

symbol
string
The shortened term or ticker symbol unique to your contract (for example "XYZ"). This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

royalty
number
Royalty for secondary sales, in % - this uses ERC-2981 for on-chain royalties so that when any NFT is sold on a marketplace that supports on-chain royalties you will get this percentage of the sale. This cannot be changed once the contract is deployed.

total_supply
number
This is an optional field that specifies the total supply of your NFTs in your dedicated smart contract. You can provide the value if you choose dedicated smart contract or existing smart contracts as your contract type, This cannot be changed once the contract is deployed.. If you leave this empty, it will set unlimited number of NFTs that can be minted If you enter 100, only 100 NFTs can ever be minted under this contract.

contract_address
string
If you want to reuse one of your existing smart contract (example using the same contract that was created for a different project).

owner_address
string
This field is optional and is used when the contract type is set to "Dedicated". The user can provide their wallet address which will be set as the owner of the deployed smart contract. It's important that this address is not a public address of someone else, as it's like taking ownership of the contract. If left empty, Mintology's address will be set as the owner. Users can later request Mintology to transfer the ownership after the contract deployment.

network
number
required
This is your network you want to deploy it to on Ethereum, your options are MAINNET = 1, SEPOLIA = 11155111 This cannot be changed once the contract is deployed.

1 11155111

chain
string
required
The blockchain you want to use, either Ethereum or IMX. This cannot be changed once the contract is deployed.

eth imx

total_volume
number
total_non_generative_premints
number
allow_claim_on_mintable
boolean
status
string
required
Draft Disabled Failed Published Suspended Deploying

slug
string
required
project_id
string
required
parent_id
string
used_quantity
number
organization_id
string
required
non_sub_pk
string
imx_project_id
number
contract_deployment_tx_hash
string

import mintology from '@api/mintology';

mintology.projectsCreate({contract_type: 'Shared', wallet_type: 'Both', network: 1, chain: 'eth'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Retrieve Projects
get
https://api.mintology.app/v1/projects/{projectId}
IMPORTANT: Call from the back-end.

Requires: API KEY in the header. This will return all of the projects details of the project that is specified by its project ID.
Alternative : Use “Project Info” you need a just the contract_address and the name, “Project Info” can be called from front-end too

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

status
string
required
Draft Disabled Failed Published Suspended Deploying

slug
string
required
project_id
string
required
used_quantity
number
organization_id
string
required
non_sub_pk
string
imx_project_id
number
contract_deployment_tx_hash
string
domain
string
required
name
string
required
description
string
required
mint_limit_per_address
string
required
contract_type
string
required
wallet_type
string
required
base_uri
string
required
contract_name
string
required
symbol
string
required
royalty
string
required
total_supply
string
required
contract_address
string
required
owner_address
string
required
network
string
required
chain
string
required
total_volume
string
required
total_non_generative_premints
string
required
allow_claim_on_mintable
string
required
mint
object

mint object
enabled
boolean
required
project_id
string
required
claim
object

claim object
enabled
boolean
required
use_code
boolean
encrypted
boolean
button_size
string
button_name
string
email_entry
string
button_color
string
button_alignment
string
button_shadow
string
border_radius
string
background_color
string
terms_conditions
string
project_id
string
required
generative
object

generative object
project_id
string
required
total_images
number
required
status
string
required
Draft Generated Generating

layers
array of objects
required
object
frequency
number
required
name
string
required
percentage
number
required
images
array of objects
required
object
percentage
number
required
url
string
required
name
string
required
x
number
y
number
frequency
number
required
marketplace
object

marketplace object
name
string
required
description
string
icon
string
cover
string
royalty
number
category
string
sub_category
string
external_url
string
reddit_url
string
youtube_url
string
twitter_url
string
instagram_url
string
is_claimable
boolean
contract_address
string
required
project_id
string
required

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.projectsShow({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Update Projects
put
https://api.mintology.app/v1/projects/{projectId}
IMPORTANT: Call from the back-end.

Requires: API KEY in the header. Updates the project with the specified ID with the specified details. Please check /Projects/Create for a description of the parameters.

Body Params
domain
string
required
name
string
required
The name of your NFT project that is displayed on the Mintology dashboard. This cannot be changed once the contract is deployed.

description
string
required
The description of your NFT project.

mint_limit_per_address
number
This field represents the maximum number of NFTs that a single wallet can mint. It sets a limit to prevent any single wallet from minting an excessive number of NFTs. This limit should be less than or equal to the total supply of NFTs if the total supply is set.

contract_type
string
required
Whether its a shared contract that multiple brands can mint under (no deployment costs), a dedicated contract you control and deploy, or an existing contract you've already deployed and used on another project. This cannot be changed once the contract is deployed.


Shared
wallet_type
string
required
Select Non-custodial if you expect your users to already have a crypto wallet. Or if your users most likely don't have a crypto wallet, then select custodial. If a few users have a wallet, they can use their existing wallet and not need to create a custodial wallet.


Both
base_uri
string
Base URI for metadata, if you want to use your own storage. If you leave this blank, we will handle this for you.

contract_name
string
required
The contract name that will appear in the blockchain. When creating the Project through Dashboard, this is set from the "name" parameter input. This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

symbol
string
The shortened term or ticker symbol unique to your contract (for example "XYZ"). This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

royalty
number
Royalty for secondary sales, in % - this uses ERC-2981 for on-chain royalties so that when any NFT is sold on a marketplace that supports on-chain royalties you will get this percentage of the sale. This cannot be changed once the contract is deployed.

total_supply
number
This is an optional field that specifies the total supply of your NFTs in your dedicated smart contract. You can provide the value if you choose dedicated smart contract or existing smart contracts as your contract type, This cannot be changed once the contract is deployed.. If you leave this empty, it will set unlimited number of NFTs that can be minted If you enter 100, only 100 NFTs can ever be minted under this contract.

contract_address
string
If you want to reuse one of your existing smart contract (example using the same contract that was created for a different project).

owner_address
string
This field is optional and is used when the contract type is set to "Dedicated". The user can provide their wallet address which will be set as the owner of the deployed smart contract. It's important that this address is not a public address of someone else, as it's like taking ownership of the contract. If left empty, Mintology's address will be set as the owner. Users can later request Mintology to transfer the ownership after the contract deployment.

network
number
required
This is your network you want to deploy it to on Ethereum, your options are MAINNET = 1, SEPOLIA = 11155111 This cannot be changed once the contract is deployed.


1
chain
string
required
The blockchain you want to use, either Ethereum or IMX. This cannot be changed once the contract is deployed.


eth
total_volume
number
total_non_generative_premints
number
allow_claim_on_mintable
boolean

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

domain
string
required
name
string
required
The name of your NFT project that is displayed on the Mintology dashboard. This cannot be changed once the contract is deployed.

description
string
required
The description of your NFT project.

mint_limit_per_address
number
This field represents the maximum number of NFTs that a single wallet can mint. It sets a limit to prevent any single wallet from minting an excessive number of NFTs. This limit should be less than or equal to the total supply of NFTs if the total supply is set.

contract_type
string
required
Whether its a shared contract that multiple brands can mint under (no deployment costs), a dedicated contract you control and deploy, or an existing contract you've already deployed and used on another project. This cannot be changed once the contract is deployed.

Shared Dedicated Existing

wallet_type
string
required
Select Non-custodial if you expect your users to already have a crypto wallet. Or if your users most likely don't have a crypto wallet, then select custodial. If a few users have a wallet, they can use their existing wallet and not need to create a custodial wallet.

Both Custodial NonCustodial

base_uri
string
Base URI for metadata, if you want to use your own storage. If you leave this blank, we will handle this for you.

contract_name
string
required
The contract name that will appear in the blockchain. When creating the Project through Dashboard, this is set from the "name" parameter input. This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

symbol
string
The shortened term or ticker symbol unique to your contract (for example "XYZ"). This is required if you select "Dedicated" as contract type. This cannot be changed once the contract is deployed.

royalty
number
Royalty for secondary sales, in % - this uses ERC-2981 for on-chain royalties so that when any NFT is sold on a marketplace that supports on-chain royalties you will get this percentage of the sale. This cannot be changed once the contract is deployed.

total_supply
number
This is an optional field that specifies the total supply of your NFTs in your dedicated smart contract. You can provide the value if you choose dedicated smart contract or existing smart contracts as your contract type, This cannot be changed once the contract is deployed.. If you leave this empty, it will set unlimited number of NFTs that can be minted If you enter 100, only 100 NFTs can ever be minted under this contract.

contract_address
string
If you want to reuse one of your existing smart contract (example using the same contract that was created for a different project).

owner_address
string
This field is optional and is used when the contract type is set to "Dedicated". The user can provide their wallet address which will be set as the owner of the deployed smart contract. It's important that this address is not a public address of someone else, as it's like taking ownership of the contract. If left empty, Mintology's address will be set as the owner. Users can later request Mintology to transfer the ownership after the contract deployment.

network
number
required
This is your network you want to deploy it to on Ethereum, your options are MAINNET = 1, SEPOLIA = 11155111 This cannot be changed once the contract is deployed.

1 11155111

chain
string
required
The blockchain you want to use, either Ethereum or IMX. This cannot be changed once the contract is deployed.

eth imx

total_volume
number
total_non_generative_premints
number
allow_claim_on_mintable
boolean
status
string
required
Draft Disabled Failed Published Suspended Deploying

slug
string
required
project_id
string
required
parent_id
string
used_quantity
number
organization_id
string
required
non_sub_pk
string
imx_project_id
number
contract_deployment_tx_hash
string

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.projectsUpdate({
  contract_type: 'Shared',
  wallet_type: 'Both',
  network: 1,
  chain: 'eth'
}, {projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Remove Projects
delete
https://api.mintology.app/v1/projects/{projectId}
Delete a project from the platform. But once deployed the smart contract will exist on the blockchain and you will be able to manage it without Mintology. This is a permanent action and cannot be undone.

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.projectsRemove({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Mint Config Update
put
https://api.mintology.app/v1/projects/{projectId}/mint
IMPORTANT: This operation should be initiated from the back-end.

Requires: API KEY in the header. This will update the project mint configuration using the provided ID and details.

Additionally, this operation allows enabling or disabling of the mint. However, this can only be toggled after the project has been successfully deployed.

Body Params
enabled
boolean
required

true
Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.projectsMintUpdate({enabled: true}, {projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Claim Config Update
put
https://api.mintology.app/v1/projects/{projectId}/claim
IMPORTANT: This operation should be initiated from the back-end.

Requires: API KEY in the header. This will update the project claim configuration using the provided ID and details.

Additionally, this operation allows enabling or disabling of the claim. However, this can only be toggled after the project has been successfully deployed.

Body Params
enabled
boolean
required

true
Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.projectsClaimUpdate({enabled: true}, {projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));

  Deploy Projects
post
https://api.mintology.app/v1/projects/{projectId}/deploy
IMPORTANT: Call from the back-end.

Requires: API KEY in the header.

Deploy the project with the specified ID with the specified details. A project must be deployed before tokens can be minted.

IMPORTANT: If you are using Generative NFTs on the dashboard, you need to make the NFTs before deploying.

Metadata
projectId
string
required
Project Id - found on your dashboard on dashboard.mintology.app

import mintology from '@api/mintology';

mintology.server('https://api.mintology.app/v1');
mintology.projectsDeploy({projectId: 'projectId'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));