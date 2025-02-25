const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

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

module.exports = {
  triggerFollowAirdrop,
  triggerYapAirdrop,
  registerToken,
  triggerNeynarCast,
  replyNeynarCast,
};
