const { createCanvas, loadImage } = require("canvas");
const { writeFileSync } = require("fs");
const axios = require("axios");
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const express = require("express");
const bodyParser = require("body-parser");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { ethers } = require("ethers");
const EarnkitABI = require("./Earnkit.json");
const EarnkitToken = require("./EarnkitToken.json");
// const {
//   triggerFollowAirdrop,
//   triggerYapAirdrop,
//   registerToken,
//   replyNeynarCast,
// } = require("./coinviseApis.js");

dotenv.config();

const PROVIDER_URL = process.env.MAINNET_PROVIDER_URL;
const PRIVATE_KEY = process.env.TOKEN_BOT_PRIVATE_KEY;
const EARNKIT_CONTRACT = "0xDF29E0CE7fE906065608fef642dA4Dc4169f924b";
const WETH = "0x4200000000000000000000000000000000000006";
const FEE = 10000;
const TICK = -230400;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function triggerFollowAirdrop(
  txHash,
  tokenAddress,
  tokenImage,
  tokenName
) {
  const data = {
    txHash,
    txStatus: "pending",
    isGnosisSafeTx: false,
    tokenType: "ERC20",
    conditions: [
      {
        type: "FARCASTER_FOLLOW",
        metadata: {
          targetFid: 372043,
          targetUsername: "coinvise",
        },
        required: true,
      },
      {
        type: "FARCASTER_FOLLOW",
        metadata: {
          targetFid: 881415,
          targetUsername: "earnkit",
        },
        required: true,
      },
    ],
    token_addr: tokenAddress,
    amount_per_recipient: 500000,
    number_of_recipients: 5000,
    description:
      "Follow @coinvise and @earnkit to be eligible to claim this airdrop.",
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    minRequirementsCount: 1,
    title: `${tokenName} Airdrop`,
    brandColor: "#ff0000",
    isOpenEdition: false,
    rewards: [],
    metadata: {
      coverImage: tokenImage,
    },
  };

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.coinvise.co/airdrop?chain=8453",
    headers: {
      "x-api-key": process.env.X_API_KEY_COINVISE,
      "X-Authenticated-User": process.env.X_AUTHENTICATED_USER,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  };

  try {
    const response = await axios.request(config);
    console.log("Airdrop triggered successfully:", response.data);
    return response.data.slug;
  } catch (error) {
    console.error("Error triggering airdrop:", error);
  }
}

async function triggerYapAirdrop(txHash, tokenAddress, tokenName, tokenImage) {
  const data = {
    txHash,
    txStatus: "pending",
    isGnosisSafeTx: false,
    tokenType: "ERC20",
    conditions: [
      {
        type: "FARCASTER_TOKEN_YAP",
        metadata: {
          tokenName: tokenName,
          validFrom: new Date(Date.now()).toISOString(),
          validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        required: true,
      },
    ],
    token_addr: tokenAddress,
    amount_per_recipient: 50000,
    number_of_recipients: 5000,
    description:
      "Yap about this token on Warpcast to be eligible to claim this airdrop.",
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    minRequirementsCount: 1,
    title: `${tokenName} Airdrop`,
    brandColor: "#ff0000",
    isOpenEdition: false,
    rewards: [],
    metadata: {
      coverImage: tokenImage,
    },
  };

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.coinvise.co/airdrop?chain=8453",
    headers: {
      "x-api-key": process.env.X_API_KEY_COINVISE,
      "X-Authenticated-User": process.env.X_AUTHENTICATED_USER,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  };

  try {
    const response = await axios.request(config);
    console.log("Airdrop triggered successfully:", response.data);
    return response.data.slug;
  } catch (error) {
    console.error("Error triggering airdrop:", error);
  }
}

async function registerToken(data) {
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.coinvise.co/token?chain=8453",
    headers: {
      "x-api-key": process.env.X_API_KEY_COINVISE,
      "X-Authenticated-User": process.env.X_AUTHENTICATED_USER,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  };

  try {
    const response = await axios.request(config);
    console.log("Token registered successfully:", response.data);
    return response.data.slug;
  } catch (error) {
    console.error("Error registering token:", error);
  }
}

async function triggerNeynarCast(text, frameLink) {
  const data = JSON.stringify({
    signer_uuid: process.env.NEYNR_SIGNER_UUID,
    text: text,
    embeds: [
      {
        url: frameLink,
      },
    ],
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.neynar.com/v2/farcaster/cast",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": process.env.NEYNR_API_KEY,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log("Neynar Cast API Response:", JSON.stringify(response.data));
    return response.data.cast.hash;
  } catch (error) {
    console.error("Error triggering Neynar Cast:", error);
  }
}

async function replyNeynarCast(text, castHash, frameLink) {
  const data = JSON.stringify({
    signer_uuid: process.env.NEYNR_SIGNER_UUID,
    text: text,
    embeds: [
      {
        url: frameLink,
      },
    ],
    parent: castHash,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.neynar.com/v2/farcaster/cast",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": process.env.NEYNR_API_KEY,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log("Neynar Cast API Response:", JSON.stringify(response.data));
    return response.data.cast.hash;
  } catch (error) {
    console.error("Error triggering Neynar Cast:", error);
  }
}

async function uploadToCloudinary(imagePath) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "Casts",
    });
    console.log("Image uploaded to Cloudinary:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
}

function generateTickerFromHash(hash) {
  const hashBuffer = crypto.createHash("sha256").update(hash).digest("hex");
  const lettersOnly = hashBuffer
    .replace(/\d/g, "")
    .substring(0, 4)
    .toUpperCase();
  return lettersOnly;
}

async function generateSaltForAddress(
  name,
  symbol,
  totalSupply,
  fid,
  image,
  castHash,
  poolConfig,
  deployer,
  earnkitContract
) {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber - 1);

  if (!block || !block.hash) {
    throw new Error("Block or block hash is null");
  }
  let saltNum = BigInt(block.hash);
  const EarnkitTokenBytecode = getCreationCode();

  while (true) {
    try {
      const saltBytes = ethers.zeroPadValue(ethers.toBeHex(saltNum), 32);

      const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "string",
          "string",
          "uint256",
          "address",
          "uint256",
          "string",
          "string",
        ],
        [name, symbol, totalSupply, deployer, fid, image, castHash]
      );

      const bytecode = ethers.solidityPacked(
        ["bytes", "bytes"],
        [EarnkitTokenBytecode, constructorArgs]
      );

      const bytecodeHash = ethers.keccak256(bytecode);

      const saltHash = ethers.keccak256(
        ethers.concat([ethers.zeroPadValue(deployer, 32), saltBytes])
      );

      const predictedAddress = ethers.getCreate2Address(
        earnkitContract,
        saltHash,
        bytecodeHash
      );

      const predictedAddressChecksummed = ethers.getAddress(predictedAddress);
      const pairedTokenChecksummed = ethers.getAddress(poolConfig.pairedToken);

      if (
        predictedAddressChecksummed.toLowerCase() <
        pairedTokenChecksummed.toLowerCase()
      ) {
        console.log("Found valid salt:", saltBytes);
        return saltBytes;
      }

      saltNum++;
    } catch (error) {
      console.error("Error in salt generation:", error);
      saltNum++;
    }
  }
}

function getCreationCode() {
  if (!EarnkitToken || !EarnkitToken.bytecode) {
    throw new Error("Bytecode not found in EarnkitToken.json");
  }

  return typeof EarnkitToken.bytecode === "string"
    ? EarnkitToken.bytecode
    : EarnkitToken.bytecode.object;
}

const API_KEY = "3CE9750C-631C-400A-BC5D-DBADBFA791A5";

const eventQueue = [];

const app = express();
app.use(bodyParser.json());
const PORT = 3002;

app.post("/", async (req, res) => {
  try {
    const event = req.body;
    console.log("Received event:", event);
    eventQueue.push(event);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

async function processQueue() {
  while (true) {
    if (eventQueue.length > 0) {
      const event = eventQueue.shift();
      if (event) {
        console.log("Processing event:", event);
        await handleEvent(event);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function handleEvent(event) {
  const hookData = event;
  if (
    hookData.data.text.includes("tokenize") ||
    hookData.data.text.includes("tokenise")
  ) {
    const authorUsername = hookData.data.author.username || "unknown";
    const displayName = hookData.data.author.display_name || "User";
    const profilePic =
      hookData.data.author.pfp_url || "https://via.placeholder.com/80";
    const castText = hookData.data.text || "No text provided";
    const parentHash = hookData.data.parent_hash;
    const firstCastHash = hookData.data.hash;

    let finalText = castText;

    if (parentHash) {
      try {
        const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${parentHash}&type=hash`;
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            "x-api-key": API_KEY,
          },
        };

        const response = await fetch(url, options);
        const json = await response.json();
        if (json.cast && json.cast.text) {
          finalText = json.cast.text;
          console.log("Fetched Original Cast Text:", finalText);
        }
      } catch (err) {
        console.error("Error fetching original cast:", err);
      }
    }

    const castData = {
      username: authorUsername,
      displayName,
      profilePic,
      text: finalText,
      timestamp: new Date().toISOString(),
    };

    const generateImage = await generateTweetImage(castData);
    console.log("Image generated:", generateImage);

    const username = event.data.author.username;
    const hash = event.data.hash;

    const ticker = generateTickerFromHash(hash);
    const tokenName = `cast by @${username}_${ticker}`;

    const tokenSymbol = ticker;
    const description = finalText;
    console.log("Token Name:", tokenName);
    console.log("Token Symbol:", tokenSymbol);
    console.log("Description:", description);
    // const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    // if (!PRIVATE_KEY) {
    //   throw new Error("Private key is not defined");
    // }
    // const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    // const earnkit = new ethers.Contract(
    //   EARNKIT_CONTRACT,
    //   EarnkitABI.abi,
    //   wallet
    // );

    // const totalSupply = ethers.parseUnits("100000000000", 18);
    // const fid = 710451;
    // const castHash = "710451";

    // const poolConfig = {
    //   pairedToken: WETH,
    //   devBuyFee: FEE,
    //   tick: TICK,
    // };

    // const salt = await generateSaltForAddress(
    //   tokenName,
    //   tokenSymbol,
    //   totalSupply,
    //   fid,
    //   generateImage,
    //   castHash,
    //   poolConfig,
    //   wallet.address,
    //   EARNKIT_CONTRACT
    // );
    // const campaigns = [
    //   {
    //     maxClaims: 5000,
    //     amountPerClaim: ethers.parseUnits("500000", 18),
    //     maxSponsoredClaims: 0,
    //   },
    //   {
    //     maxClaims: 5000,
    //     amountPerClaim: ethers.parseUnits("500000", 18),
    //     maxSponsoredClaims: 0,
    //   },
    // ];

    // const tx = await earnkit.deployTokenWithCampaigns(
    //   tokenName,
    //   tokenSymbol,
    //   totalSupply,
    //   FEE,
    //   salt,
    //   wallet.address,
    //   fid,
    //   generateImage,
    //   castHash,
    //   poolConfig,
    //   campaigns,
    //   5
    // );

    // console.log(
    //   `Transaction sent for ${tokenName}. Waiting for confirmation...`
    // );
    // const receipt = await tx.wait();
    // console.log(
    //   `${tokenName} deployed successfully. Transaction Hash:`,
    //   receipt.hash
    // );
    // const tokenAddress = receipt.logs[0]?.address;
    // console.log("Token deployed at:", tokenAddress);

    // const filteredLogs = receipt.logs.filter(
    //   (log) =>
    //     log.topics[0] ===
    //     "0xfc5b9d1c2c1134048e1792e3ae27d4eee04f460d341711c7088000d2ca218621"
    // );

    // if (filteredLogs.length === 0) {
    //   console.log("No logs found with the specified topic.");
    //   return;
    // }
    // const campaignIds = filteredLogs.map((log) => parseInt(log.topics[2], 16));

    // if (campaignIds.length < 2) {
    //   console.error("Insufficient campaign IDs found");
    //   return;
    // }
    // const filteredLog = receipt.logs.find(
    //   (log) => log.address.toLowerCase() === EARNKIT_CONTRACT.toLowerCase()
    // );
    // const positionId = BigInt(filteredLog.topics[2]).toString();
    // console.log("Position ID:-------------", positionId);

    // const followCampaignId = campaignIds[1];
    // const yapCampaignId = campaignIds[0];

    // console.log(`Follow Campaign ID: ${followCampaignId}`);
    // console.log(`Yap Campaign ID: ${yapCampaignId}`);

    // await registerToken({
    //   name: tokenName,
    //   address: tokenAddress,
    //   symbol: tokenSymbol,
    //   decimals: 18,
    //   tokenSupply: "100000000000",
    //   slope: "null",
    //   slopeDecimals: "null",
    //   type: "ERC20",
    //   description: description ?? `${tokenName} on Coinvise`,
    //   imageUrl: generateImage,
    //   lpLockerAddress: positionId,
    // });

    // const followSlug = await triggerFollowAirdrop(
    //   receipt.hash,
    //   tokenAddress,
    //   generateImage,
    //   tokenName
    // );
    // console.log(followSlug);

    // const yapSlug = await triggerYapAirdrop(
    //   receipt.hash,
    //   tokenAddress,
    //   tokenName,
    //   generateImage
    // );
    // console.log(yapSlug);

    // const message = `🚨 Your cast is now tokenized we deployed the token: ${tokenName}.
    //   \n\nToken address: https://basescan.org/address/${tokenAddress}\n\nView on Coinvise:https://coinvise.ai/token/${tokenAddress}\n\n${tokenName} airdrops are now claimable below in this thread!`;

    // const tokenFrame = `https://frames.coinvise.ai/token/${tokenAddress}`;

    // const tokenCastHash = await replyNeynarCast(
    //   message,
    //   firstCastHash,
    //   tokenFrame
    // );

    // const yapCampaignMsg = `🪂 Airdrop #1: Yap about ${tokenName} to be eligible to claim.`;

    // const yapLink = `https://frames.coinvise.ai/claim/${yapCampaignId}/${yapSlug}`;

    // const yapCastHash = await replyNeynarCast(
    //   yapCampaignMsg,
    //   tokenCastHash,
    //   yapLink
    // );

    // const followCampaignMsg = `🪂 Airdrop #2: Follow and recast the main post in this thread to be eligible to claim.`;
    // const followLink = `https://frames.coinvise.ai/claim/${followCampaignId}/${followSlug}`;

    // const followCastHash = await replyNeynarCast(
    //   followCampaignMsg,
    //   yapCastHash,
    //   followLink
    // );

    // console.log("All casts done:", followCastHash);

    console.log("Webhook received! Image generated.");
    return;
  }
}

processQueue();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function generateTweetImage(data) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const profileImage = await loadImage(data.profilePic);
  ctx.drawImage(profileImage, 20, 20, 80, 80);

  ctx.fillStyle = "#000";
  ctx.font = "bold 24px Arial";
  ctx.fillText(data.displayName, 120, 50);

  ctx.fillStyle = "#555";
  ctx.font = "18px Arial";
  ctx.fillText(`@${data.username}`, 120, 80);

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  wrapText(ctx, data.text, 20, 140, width - 40, 28);

  ctx.fillStyle = "#777";
  ctx.font = "16px Arial";
  ctx.fillText(new Date(data.timestamp).toLocaleString(), 20, height - 20);

  const imagePath = "Cast.png";
  const buffer = canvas.toBuffer("image/png");
  writeFileSync(imagePath, new Uint8Array(buffer));
  console.log("Image saved as tweet.png");
  const imageUrl = await uploadToCloudinary(imagePath);
  return imageUrl;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
