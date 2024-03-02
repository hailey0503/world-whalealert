require("dotenv").config();
const ethers = require("ethers");
const winston = require("./winston.js");
const { userClient } = require("./twitterClient.js");
const { sendMessage } = require("./telegram.js");
const { discordClient, sendDiscordMessage } = require("./discord.js");
const fs = require("fs");
const result = JSON.parse(fs.readFileSync("./data/accountLabels.json"));

const abi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
];


const tokens = [{name: "$WLD", contractAddress: "0x163f8C2467924be0ae7B5347228CABF260318753", threshold: ethers.utils.parseEther("100000")},
{name: "$RNDR", contractAddress: "0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24", threshold: ethers.utils.parseEther("100000")},
{name: "$FET", contractAddress:"0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85", threshold: ethers.utils.parseEther("500000")}]


async function main() {
  //connectToMongoDB();
  //Initial fetch when the server starts
  ERC20TransferAlert();
  
  setInterval(() => console.log("keepalive"), 60 * 5 * 1000);
}

async function ERC20TransferAlert() {
 
 // const network_id_pair = { networkId: "WLD" };
  const wsETHUrl = process.env.WSETHURL;
  winston.warn(wsETHUrl);
  const networkId = 1;
  let erc20;
  const startConnection = () => {
    winston.warn("startconnection ");
    let provider = new ethers.providers.WebSocketProvider(wsETHUrl, networkId);
    //diff by tokens
    const EXPECTED_PONG_BACK = 30000;
    const KEEP_ALIVE_CHECK_INTERVAL = 15000;
    
    let pingTimeout = null;
    let keepAliveInterval = null;
    provider._websocket.on("open", () => {
      keepAliveInterval = setInterval(() => {
        winston.debug("Checking if the WLD connection is alive, sending a ping");
  
        provider._websocket.ping();
  
        pingTimeout = setTimeout(() => {
          provider._websocket.terminate();
        }, EXPECTED_PONG_BACK);
      }, KEEP_ALIVE_CHECK_INTERVAL);
  
    });

    for (const token of tokens) {
      const erc20 = new ethers.Contract(token.contractAddress, abi, provider);
      erc20.on("Transfer", async (from, to, amount, event) => {
        onTransfer(from, to, amount, event, token.threshold, token.name); 
      });
    }
 
    provider._websocket.on("close", () => {
      winston.error("The ETH websocket connection was closed");
      clearInterval(keepAliveInterval);
      clearTimeout(pingTimeout);
      startConnection();
    });

    provider._websocket.on("pong", () => {
      winston.debug(
        "Received pong, so WDL connection is alive, clearing the timeout"
      );
      clearInterval(pingTimeout);
    });
  };

  startConnection();
}

async function onTransfer(from, to, amount, event, whaleThreshold, tokenName) {
  try {
    const value = amount;
    const txHash = event.transactionHash; //event tx -> console.log
    winston.debug("txhash", txHash);
    winston.debug("thres", whaleThreshold);
    winston.debug(value.gte(whaleThreshold));

    if (value.gte(whaleThreshold)) {
      winston.debug("gte in");
      const fromAddress = from;
      const toAddress = to;
      //console.log('from to',fromAddress, toAddress)
      const walletFromName = getWalletInfo(fromAddress, result);
      const walletToName = getWalletInfo(toAddress, result);
      //console.log('names',walletFromName, walletToName)
      const link = "https://etherscan.io/tx/" + txHash;
      // console.log('link',link)
      const message = `${ethers.utils.formatEther(
        value
      )} ${tokenName} is transfered to ${walletToName} from ${walletFromName} ${link}`;

      const tweetPromise = tweet(message);
      const telegramPromise = telegram(message);
      const discordPromise = discord(message);
      winston.debug("line 61");
      await Promise.all([tweetPromise, telegramPromise, discordPromise]);
    }
  } catch (e) {
    winston.error("line 65", e);
  }
}

function getWalletInfo(address, result) {
  winston.debug("getwallet");

  const addressShort = address.slice(0, 7) + "..." + address.slice(37, 42);
  winston.debug("short", addressShort);

  winston.debug("result", result[address]);
  const walletName = addressShort;
  if (result[address]) {
    walletName = result[address].name;
  }
  winston.debug("from_wallet_name: " + walletName);
  return walletName;
}

async function tweet(arg) {
  try {
    await userClient.v2.tweet(arg);
  } catch (e) {
    console.error(e);
  }
}
async function telegram(arg) {
  winston.debug("telegram in");
  try {
    await sendMessage(arg);
  } catch (e) {
    winston.debug("telegram e");
    console.error(e);
  }
}
async function discord(arg) {
  //need to update
  winston.debug("discord in");
  try {
    await sendDiscordMessage(arg);
  } catch (e) {
    winston.debug("discord e");
    console.error(e);
  }
}

main()
  .then(/*() => process.exit(0)*/)
  .catch((error) => {
    console.error(error);
    console.log("www");
    process.exit(1);
  });
