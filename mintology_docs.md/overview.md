Mintology API Overview
Here's a overview of the Mintology API, covering various endpoints and processes:

Authorization
Authorize:
Purpose: Validates the legitimacy of token ownership.
Parameters: Utilizes Mintology API Key and Project ID for validation.
Reference: Documentation Source.
List Authorized Tokens:
Purpose: This endpoint is used to get the list of tokens that a user owns from a particular collection.
Parameters: Utilizes Mintology API Key and Project ID for validation.
Reference: Documentation Source.
Projects Management
List Projects:
Action: Enumerates all created projects.
Reference: Documentation Source.
Create Projects:
Action: Generates a new project with designated details.
Reference: Documentation Source.
Retrieve Projects:
Action: Fetches project specifics identified by its Project ID.
Reference: Documentation Source.
Update Projects:
Action: Modifies a specific project with new details.
Reference: Documentation Source.
Remove Projects:
Action: Deletes a specified project from the platform.
Reference: Documentation Source.
Mint Config Update:
Action: This operation allows enabling or disabling minting (see mint endpoint). However, this can only be toggled after the project has been successfully deployed.
Reference: Documentation Source.
Claim Config Update:
Action: This operation allows enabling or disabling claiming (see claim endpoint). However, this can only be toggled after the project has been successfully deployed.
Reference: Documentation Source.
Deploy Projects:
Action: Launches a specified project for token minting.
Reference: Documentation Source.
Mintable Wallets
Create Mintable Wallet:
Action: Creates a new Mintable Wallet and Mintable account, enabling users to claim private key custody.
Reference: Documentation Source.
Request To Export:
Action: Commences the process for user custody claim of their Mintable Wallet.
Reference: Documentation Source.
Approve Export:
Action: Transmits the Mintable wallet private key to the user, necessitating a request_id and OTP for authorization.
Reference: Documentation Source.
Remove Mintable Wallet:
Action: Irrevocably deletes the private key from Mintology's systems post user custody claim of their Mintable Wallet.
Reference: Documentation Source.
Preminting NFTs
List Premints:
Action: Yields a list of premint items, arrayed by updated date with latest premints at the forefront.
Reference: Documentation Source.
Create Premints:
Action: Generates token details like name, image, animation_url, etc. for premint items.
Reference: Documentation Source.
Retrieve Premints:
Action: Fetches premint details like 'name', 'image', animation_url, etc. for specified premint items.
Reference: Documentation Source.
Remove Premints:
Action: Extinguishes a specified premint entity.
Reference: Documentation Source.
Import Premints:
Action: Import token details like name, image, animation_url and etc.
Reference: Documentation Source.
IMX (Immutable X) Endpoints
Register IMX User:
Action: Constructs an Immutable X layer 2 user account for an Ethereum layer 1 account.
Reference: Documentation Source​.
Mint IMX Item:
Action: Mints a distinct digital asset on an IMX blockchain, typically on the Ethereum network.
Reference: Documentation Source.
Transfer IMX Item:
Action: Transfers an NFT, sending ownership of the digital asset from one address on the IMX blockchain to another.
Reference: Documentation Source​.
Info Endpoints
Project Info:
Usage: Procures project information such as details and configuration.
Reference: Documentation Source​​.
Metadata Endpoints
Update NFT Metadata:
Usage: Alters NFT metadata encompassing details like token name, image, animation_url, etc., recommended to be invoked from the back-end.
Reference: Documentation Source.
Mint Endpoints
Mint:
Purpose: Facilitates the minting process of NFTs directly into a user's wallet.
Compatibility: Supports both custom Mintable Wallets and standard cryptocurrency wallets.
Reference: Documentation Source.
Claim Endpoints
Claim:
Purpose: Grants a complimentary NFT to the user's wallet.
Use Cases: Suitable for purposes like discount vouchers or proof of attendance tokens.
Reference: Documentation Source.


Pre-requisites
Suggest Edits
Pre-requisites
This are the the things you will need to do before using the APIs seamlessly. There is only one endpoint (Project Info) that can be called without the need for an API Key, the rest require an API Key.

How do I get an API key?
On Mintology web app, click on your profile at the top left corner and select "Settings", your Mintology Key will be present in the Settings page. You can copy and also refresh your key if you need to directly from there.

IMPORTANT: Make sure you have choosen the appropriate billing plan for your projects.

Other Pre-requisites
The following section outlines the other essential pre-requisites you'll require to hit the ground running. Acquiring and understanding these elements will equip you with a solid foundation to explore, test, and implement our APIs seamlessly into your projects. Let's dive in and get you set up!

Project ID:

Description: A unique identifier for a project within the Mintology platform.
How to Obtain: Go to your Dashboard at Mintology web app, click on the project for the project_id you want. On your Project Dashboard, go to NFT Details, your "Project ID" will be there.
Wallet Address:

Description: The public address of an Ethereum wallet.
How to Obtain: Available within the cryptocurrency wallet application.
Mintable Wallet (If utilizing Mintable Wallets feature):

Description: A wallet managed and secured by Mintology; it is mapped to the user's email address, and the user can interact with it through Mintable.
How to Obtain: Generated via the Mintable Wallets endpoint of the Mintology API. A Mintable wallet will also be automatically created when a user tried to mint or claim an NFT, if they do not already have one.
Ethereum Layer 1 Account (If utilizing IMX Endpoints):

Description: An account on the main Ethereum blockchain.
How to Obtain: Available within the cryptocurrency wallet application.
Immutable X Layer 2 Account (If utilizing IMX Endpoints):

Description: An account on the Immutable X Layer 2 scaling solution for Ethereum.
How to Obtain: Created via the Register IMX User endpoint of the Mintology API.
Metadata (If pre-minting or updating metadata):

Description: Information describing the NFTs including attributes like name, image, animation_url, etc.
How to Prepare: As per the Preminting NFTs and Update NFT Metadata endpoints documentation.
OTP (One-Time Password) (If exporting Mintable Wallet):

Description: A single-use password required for certain authorization processes such as exporting a Mintable Wallet.
How to Obtain: Typically sent to the registered email or phone number during the export process.
Request ID (If exporting Mintable Wallet):

Description: A unique identifier for the export request, used to approve the export of a Mintable Wallet.
How to Obtain: Generated during the Request To Export process.

Quickstart Guide
Getting Started with Mintology APIs
Welcome to the Mintology APIs! As you embark on your journey to integrate and interact with our robust suite of APIs, there are some key items and information you'll need to have on hand. We've designed our APIs with ease of use in mind, ensuring a smooth onboarding process for developers.

Getting started
Basic Pre-requisites
Before making any API calls, ensure you're authorized. Include the following headers in your API requests.

JSON

{
  "Api-Key": "YOUR_API_KEY"
}
To find out how to get your API Key and other pre-requisites, look through Pre-requisites:

Creating Projects
Creating a project is the initial step to operate on the Mintology platform. A project acts as a container for your NFTs and associated operations.

In your project, you can use three types of Smart Contract:

Shared
Mint to the Mintology shared contract. Your NFTs will be visible in the shared Mintology store.
Dedicated
Create dedicated contract for your NFTs. You will have your own store on our marketplace.
Existing
Mint your NFTs to your existing smart contracts created on Mintology (applicable only if you already created another project with a dedicated contract).
Creating a project using API
Create a project using the Create Projects endpoint, this method of creating a project gives more options that can be customised.

Endpoint
URL: https://api.mintology.app/v1/projects
Method: POST
Headers:
JSON

{
  "Api-Key": "YOUR_API_KEY"
}
Request Body:
{
  "name": "Your Project Name",  // required
  "description": "Description of your project",  // required
  "mint_limit_per_address": 10,  // optional
  "contract_type": "Shared",  // required
  "wallet_type": "Both",  // required
  "base_uri": "https://yourbaseuri.com",  // optional
  "contract_name": "YourContractName",  // required if contract_type is "Dedicated"
  "symbol": "YCN",  // required if contract_type is "Dedicated"
  "royalty": 10,  // optional
  "total_supply": 100,  // optional
  "contract_address": "0xYourExistingContractAddress",  // optional
  "owner_address": "0xYourAddress",  // required if contract_type is "Dedicated"
  "network": 1,  // required
  "chain": "eth"  // required
}

Returns:

{
  "project_id": "your-project-id"
}


-> Replace parameter description parts
Response:
Upon successful project creation, you'll receive a response containing the project_id, which is crucial for further interactions with the Mintology API.

JSON

{
  "project_id": "your-project-id"
}
Creating a project using Dashboard:
You can also create a project though the Mintology web app.

Using Mintology
With a project created, you can now proceed to do any of the following, you can follow the recommended flow in the given order:

Premint NFTs
Mint and Claim NFTs
NFT Metadata
Token Gating (you will need claimed or minted NFTs for this)
Optional (if you intend to deploy your NFTs on Immutable X's layer 2): Immutable X Integration

Preminting NFTs
Suggest Edits
Preminting NFTs
Pre-minting is the process of preparing NFT metadata and assets, before the actual on-chain minting happens.

IMPORTANT: Please note that your users will not be able to mint or claim more items than what you have preminted. You can add more items anytime, even after the project has been deployed.

Why Premint?
There are several benefits to preminting NFTs:

It allows you to prepare and organize all the NFT metadata ahead of time. This includes properties like name, description, image, attributes etc.
The preminted metadata can be reviewed and validated before minting. This prevents errors in the actual on-chain NFT data.
It separates the metadata preparation from the blockchain minting. The metadata can be prepared offline and uploaded in bulk.
Pre-minting enables features like white-listing and pre-sale for NFT drops by assigning slots to users before minting.
It provides more flexibility in the actual on-chain minting process. The metadata can be uploaded in batches based on priorities.
How Pre-Minting Works
The preminting process typically involves uploading NFT metadata like name, description, images to Mintology: this can be done using the Mintology web app, or the API. When ready to mint, the preminted metadata is retrieved and used to mint NFTs on-chain.

How to use the API
NFT Metadata
Please note that the metadata will either need to be self-hosted or you can create or add it via the platform and we will store the metadata on our end. The NFT metadata includes name, image url, animation url (optional), description (optional), other attributes (optional).

Note: We also offer a 10 year guarantee for data hosted on our server.

Preminting NFT
You can find the API documentation under Premints.

Here's how you can create a premint NFT:

Endpoint:
URL: https://api.mintology.dev/{projectId}/premints
Method: POST
Path Parameters:
projectId (required, string): The Project ID from your Mintology dashboard.
Body Parameters:
premint_id (optional, string): Creates a new preminted NFT data set.
quantity (required, number): Specifies the number of NFTs to create with this data set.
metadata (required, object): The metadata for the NFT pre-mint data.
Metadata Object:
name (required, string): Name of the item.
image (required, string): URL to the image of the item. Supports various image types, including SVG.
animation_url (optional, string): URL to a multimedia attachment for the item. Supported file extensions include GLTF, GLB, WEBM, MP4, M4V, OGV, OGG, MP3, WAV, and OGA. HTML pages are also supported for rich experiences and interactive NFTs.
description (optional, string): A human-readable description of the item. Markdown is supported.
attributes (optional, array of objects): Attributes for the item, displayed on the item page on Mintology and other marketplaces.
title (optional, string): Title of the NFT, used for listing the item for sales.
subtitle (optional, string): Short description or subtitle of the NFT, used for listing the item for sales.
Example Request (Node.js):
JavaScript

const axios = require("axios");

async function createPremint() {
  const response = await axios.post(
    "https://api.mintology.app/v1/{projectId}/premints",
    {
      quantity: 10,
      metadata: {
        name: "Exclusive Artwork",
        image: "https://example.com/image.png",
        description: "Limited edition digital artwork",
        title: "Exclusive Artwork",
        subtitle: "Limited edition digital artwork by renowned artist",
      },
    },
    {
      headers: {
        "Api-Key": "Your API Key",
      },
    }
  );

  console.log(response.data);
}

createPremint();
You can either create items one by one, using the Create endpoint above, or in bulk, using the Import endpoint. The latter allows you to use a file (JSON or CSV) with all the details, or send all the parameters when you call the endpoint.

Once you have created (or imported) all the required premints, you can enable minting on your project. When your users mint or claim one of your NFTs, a random item among the premints will be selected.

Let us know if you have any other questions!

Mintable Wallets
Once you have preminted NFTs, you are ready to start minting NFTs for your users. If your users don't have an Ethereum wallet, Mintology provides an easy way to create custodial wallets. This process also creates a Mintable account for the users, where they can see all their NFTs.

What are Mintable Wallets
The Issue
A crypto wallet is basically at its core is a set of keys that need to be kept secret, and are used to sign transactions. There several non-custodial wallets (like Metamask, Coinbase, and others) out there, but they demand your users to be crypto-savvy and take the whole responsibility of keeping their private key under wraps.

Mintology's solution
Mintology allows you to offer custodial wallets to your users. No crypto jargon, no extra knowledge needed, it's just like having an extra account. They can stick to their fave login methods (Google, Apple, you name it) and they’re good to go.

The User’s Journey
Some users might get curious and want to dive deeper, deciding to take charge of their assets by themselves. They can do this right from their profile page on Mintable, or you can control the entire process from your own website using the Mintology API. Designed with security at its core, the API ensures your users have truly taken control of their key before it gets deleted from our system.

How to use the APIs
IMPORTANT: Before you start using the APIs, make sure that you have enabled Mintable Wallets on your Mintology Settings page.

Below are the steps to create a custodial wallet:

Endpoint:
URL:https://api.mintology.app/v1/custodial-wallets
Method: POST
Important: Make this call from the back-end.
Body Parameters:
email (required, string): The email address of the user for whom the wallet is being created.

username (optional, string): The username associated with a Mintable.com account. If omitted, a random username will be generated, which the user can later change on Mintable.com.

Example Request (Node.js):
JavaScript

const axios = require("axios");

async function createWallet() {
  const response = await axios.post(
    "https://api.mintology.app/v1/custodial-wallets",
    {
      email: "user@example.com",
      username: "user123", // Optional
    },
    {
      headers: {
        "Api-Key": "Your API Key",
      },
    }
  );
  console.log(response.data);
}

createWallet();
Response:
Upon a successful wallet creation, a response will be received with the following data:

email (string): The email address tied to the wallet.

username (string): The username tied to this wallet, generated randomly if not provided.

wallet_address (string): The created wallet address.

With the wallet created, you can now proceed to either mint or claim NFTs into these wallets.

Helping a User to take custody of their wallet
If you choose to let your users take control of their key from your website, here’s the path to follow:

Kickstart the private key claim process with the Request To Export endpoint: Doing this sends an email from Mintable to the user with an OTP. This OTP is our safety check to ensure your user genuinely wants to take control of their key.

Get the user to share the OTP received from Mintable, and pass it to the Approve Export endpoint.

Hand over the key to your user, making sure they grasp the big deal of taking control and have jotted down their key somewhere safe. Remember, it's crucial to spell this out to them clearly, and this is your responsibility!

A Peek into Encryption Technicalities 🔐
To amp up the security, we’ll hand you an encrypted private key. You’ll need to decrypt it before showing it to the user. Your decryption process will need your Mintology API Key (a secret you already know) and the encrypt_iv parameter (a fresh secret), which is returned to you by the Approve Export endpoint. Here's a little code snippet to show you how to decrypt the key.

ts

const { createDecipheriv } = require("crypto");

const IV_INPUT = "YOUR_IV";

const PRIVATEKEY_INPUT = "ENCRYPTED_PRIVATE_KEY";

const ENCRYPTION_SECRET_INPUT = "YOUR_API_KEY";

const iv = Buffer.from(IV_INPUT);

const encryptedText = Buffer.from(PRIVATEKEY_INPUT);

const encryptionSecret = Buffer.from(ENCRYPTION_SECRET_INPUT);

const decipher = createDecipheriv("aes-256-cbc", encryptionSecret, iv);

let decrypted = decipher.update(encryptedText);

decrypted = Buffer.concat([decrypted, decipher.final()]);

console.log("decrypted private key", decrypted.toString());
To tie up loose ends, you’ll need to provide a SHA256 hash (a variant of SHA-2) of the last 8 characters of the private key. This ensures that if you goof up the decryption, the key won't be deleted from the Mintable database by mistake.

Letting a user claim custody of their wallet is a bit complex, do reach out to Mintology support anytime!

Minting and Claiming NFTs
Suggest Edits
Minting and Claiming NFTs
IMPORTANT: Before you start using the APIs, make sure that you have deployed your project and enabled Claiming and Minting through the Claim Config Update and Mint Config Update endpoints or through your Project Dashboard page on Mintology web app.

How Minting and Claiming Works
Both mint and claim are designed to mint an NFT directly into a user's wallet. If you have enabled Mintable Wallets, you can mint into an email address: the system will check if the user already have a Mintable wallet, otherwise it will create one for them automatically.

Mint
Use the Mint endpoint to mint the NFT, including metadata as an object in the request body. Ideal for selling NFTs, targeted airdrops, or minting collectibles. Supports both custom Mintable Wallets and standard crypto wallets.

Claim
Use the Claim endpoint to mint a free NFT. This is the endpoint you should use for discount coupons, proof of attendance, and in general NFTs which you do not intend to sell.

Note: Keeping 'mint' and 'claim' endpoints separate simplifies analytics, making it easier to track each call's specific purpose.

How to use the API
If you don't pass in a metadata object—the system will create a random NFT using your pre-mint data you've set up through the API endpoints or dashboard.
If you pass in a metadata object, it will mint a new NFT with the new metadata object you passed in.
Minting NFTs
Endpoint
URL: https://api.mintology.app/v1/{projectId}/mint
Method: POST
Path Parameters
projectId (string, required): Your project ID found on your dashboard.
Body Parameters
metadata (object, optional): If absent, the metadata defined in the project will be used. Otherwise, it will mint a new NFT with the new metadata object you passed in.
name (string, required): Name of the item.
image (string, required): URL to the image of the item (350 x 350 recommended).
animation_url (string, optional): URL to a multimedia attachment for the item.
description (string, optional): A human-readable description of the item (Markdown supported).
attributes (array of objects, optional): Attributes for the item.
title (optional, string): Title of the NFT, used for listing the item for sales.
subtitle (optional, string): Short description or subtitle of the NFT, used for listing the item for sales.
wallet_address (string, required): Wallet address to mint the token to.
Example Request
cURL

curl -X POST https://api.example.com/mint   -H "api-key: YOUR_API_KEY"   -d '{
    "project_id": "YOUR_PROJECT_ID",
    "wallet_address": "WALLET_ADDRESS",
    "metadata": {
      "name": "NFT_NAME",
      "description": "NFT_DESCRIPTION",
      "image": "IMAGE_URL",
      "attributes": [
        {
          "trait_type": "color",
          "value": "blue"
        }
      ],
      ....
    }
  }'
Example Request (Node.js)
JavaScript

const axios = require("axios");

async function mintNFT() {
  const response = await axios.post(
    "https://api.mintology.app/v1/{projectId}/mint",
    {
      metadata: {
        name: "Unique NFT",
        image: "https://example.com/image.png",
      },
      wallet_address: "0x12345...",
    },
    {
      headers: {
        "Api-key": "YOUR_API_KEY",
      },
    }
  );
  console.log(response.data);
}

mintNFT();
After minting, check the event logs to confirm the NFT's status on the Mintology dashboard.

Claiming NFTs
plaintext

POST https://api.mintology.app/v1/{projectId}/claim
This endpoint will mint a free NFT to your user's wallet, which can be a Mintable Wallet or their existing crypto wallet. The mint and claim endpoints are kept separate to simplify analytics and track each call's specific purpose.

Path Parameters
projectId (string, required): Your project ID found on your dashboard.
Body Parameters
wallet_address (string, required): Wallet address to mint the token to.
Example Request (Node.js)
JavaScript

const axios = require("axios");

async function claimNFT() {
  const response = await axios.post(
    "https://api.mintology.app/v1/{projectId}/claim",
    {
      wallet_address: "0x12345...",
    },
    {
      headers: {
        "Api-key": "YOUR_API_KEY",
      },
    }
  );
  console.log(response.data);
}

claimNFT();
After claiming, check the event logs to confirm the NFT's status on the Mintology dashboard.

NFT Metadata
IMPORTANT: Please note that NFT Metadata endpoints work on tokens already minted on the blockchain, for premit NFT please refer to Premint endpoints.

What it is?
Use the NFT metadata endpoints to update your NFT metadata. The metadata is publicly accessible from this URL schema: https://metadata.mintology.app/{projectId}/{tokenId}

How to use the API
Update NFT Metadata endpoint alters NFT metadata encompassing details like token name, image, animation_url, etc. You will need the Project ID and Token ID of the NFT metadata you want to update.

URL: https://api.mintology.dev/{projectId}/metadata/{tokenId}
Method: PUT
Important: Make this call from the back-end.
Path Parameters:
projectId (string, required): Your project ID found on your dashboard.
Body Parameters:
metadata (object)
name (string, required): Name of the item.
image (string, required): URL to the image of the item (350 x 350 recommended).
animation_url (string, optional): URL to a multimedia attachment for the item.
description (string, optional): A human-readable description of the item (Markdown supported).
attributes (array of objects, optional): Attributes for the item.
title (optional, string): Title of the NFT, used for listing the item for sales.
subtitle (optional, string): Short description or subtitle of the NFT, used for listing the item for sales.
Example Request (Node.js):
JavaScript

const axios = require('axios');

async function updateNFT() {
  const response = await axios.post(
    'https://api.mintology.app/v1/{projectId}/metadata/{tokenId}',
    {
      metadata: {
        name: 'Unique NFT',
        image: 'https://example.com/image.png',
      },
    },
    {
      headers: {
        'Api-Key': 'Your API Key',
      },
    }
  );
  console.log(response.data);
}

updateNFT();

Token Gating
IMPORTANT: Before you start using the APIs for Token Gating, make sure that you have a Wallet ready with the token to test it out, if not follow the flow mentioned at the end of Quickstart

How Token Gating Works
Using these APIs, developers can restrict access to specific content, ensuring only those with a particular NFT (or any NFT from a specific collection) can view it. This functionality can be leveraged for exclusive content, premium experiences, and more.

How to use the API
In order to demonstrate authorization based on NFT ownership and grant access accordingly, we'll be utilizing the Authorize endpoint. This endpoint validates token ownership using the Mintology API Key and Project ID. The guide will walk through a scenario where a developer needs to check if a certain email address has been minted a specific NFT, and if so, grant access to a special page, product, or discount.

Authorization Based on NFT Ownership
Please note that this is just an example. Check the endpoint documentation for more details (like checking external contracts, or using NFT attributes).

Step 1: Set up the Authorization Check
Firstly, you'll need to make a request to the Authorize endpoint to check for NFT ownership based on the user's email or wallet address.

Endpoint:
URL: https://api.mintology.app/v1/{projectId}/authorize
Method: POST
Important: Make this call from the back-end.
Path Parameters:
projectId (string, required): Your project ID found on your dashboard.
Body Parameters:
walletAddress or email (string, required): The wallet address or email of the user you want to check NFT ownership for.
token_id (string, optional): This is the token id of the specific NFT token within the contract and it is optional; if absent, any token in the contract will authorize the wallet.
Example Request (Node.js):
JavaScript

const axios = require("axios");

async function checkNFTOwnership() {
  const response = await axios.post(
    "https://api.mintology.app/v1/{projectId}/authorize",
    {
      walletAddress: "walletAddress",
    },
    {
      headers: {
        "Api-Key": "Your API Key",
      },
    }
  );
  return response.data;
}

checkNFTOwnership();
Step 2: Grant Access Based on Authorization Result
The response from the Authorize endpoint will tell you if the specified email address has a specific NFT. Based on the response, you can then program your application to grant or deny access to the special page, product, or discount.

JavaScript

async function grantAccess() {
  const ownershipData = await checkNFTOwnership();

  if (ownershipData.authorized) {
    // User has the NFT, grant access
    console.log("Access granted");
    // Redirect to special page, grant discount, etc.
  } else {
    // User does not have the NFT, deny access
    console.log("Access denied");
    // Redirect to a different page, show an error message, etc.
  }
}

grantAccess();
Alternatives
You can also use the List Authorised Tokens endpoint to get the list of tokens that a user owns from a particular collection and control what is accessible for the user through that information.

Immutable X Integration
What is IMX?
Immutable X (IMX) is a layer-2 scaling solution for Ethereum, aimed at ensuring instant trade confirmation, massive scalability, and no gas fees without compromising user custody. Please check the official pages by Immutable to understand the differences and implications of using this platform rather than Ethereum.

How to use the API
You can find the API documentation under IMX.

The integration involves registering an IMX user, minting, and transferring IMX items. Below are the steps to achieve this integration:

Step 1: Register IMX User
Registering a user on Immutable X is the initial step for IMX integration. This is done through the Register IMX User endpoint.

Endpoint:
URL: https://api.mintology.app/v1/{projectId}/imx/register
Method: POST
Important: Make this call from the back-end.
Path Parameters:
projectId (string, required): Your project ID found on your dashboard.
Body Parameters:
email (string, required): The email of the user you want to register for.
username (string, optional): The username that will be tied to this private key/wallet.
Example:
JavaScript

const axios = require('axios');

async function registerIMXUser() {
  const response = await axios.post(
    'https://api.mintology.app/v1/{projectId}/imx/register',
    {
      username: 'optionalUsername', // Optional username
      email: 'user@example.com', // replace with the user's email
    },

    {
      headers: {
        'Api-Key': 'Your API Key',
      },
    }
  );
  console.log(response.data);
}

registerIMXUser();
Step 2: Mint IMX Item
Once the user is registered on IMX, the next step is to mint an IMX item using the Mint IMX Item endpoint.

Example:
JavaScript

async function mintIMXItem() {
  const response = await axios.post(
    'https://api.mintology.app/v1/{projectId}/imx/mint',
    {
      metadata: {
        // Add other metadata properties as needed
      },
      token_id: 'uniqueTokenId', // Token id of the NFT being minted
      wallet_address: 'walletAddress', // The wallet address of the user minting the NFT
    },
    {
      headers: {
        'Api-Key': 'Your API Key',
      },
    }
  );
  console.log(response.data);
}

mintIMXItem();
Step 3: Transfer IMX Item
The final step in IMX integration is transferring the minted IMX item to another user using the Transfer IMX Item endpoint.

Example:
JavaScript

async function transferIMXItem() {
  const response = await axios.post(
    'https://api.mintology.app/v1/{projectId}/imx/transfer',
    {
      from_wallet_address: 'fromWalletAddress', // The wallet address owns the token at the contract address
      to_wallet_address: 'toWalletAddress', // The recipient of the token
      token_id: 'uniqueTokenId', // The token id to transfer, must exist and belong to from_wallet_address
    },
    {
      headers: {
        'Api-Key': 'Your API Key',
      },
    }
  );
  console.log(response.data);
}

transferIMXItem();