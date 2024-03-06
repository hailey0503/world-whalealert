require("dotenv").config();
const ethers = require("ethers");
const ccxt = require("ccxt");
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

const tokens = [
  {
    name: "WLD",
    contractAddress: "0x163f8C2467924be0ae7B5347228CABF260318753",
    threshold: ethers.utils.parseEther("1000000"),
  },
  {
    name: "RNDR",
    contractAddress: "0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24",
    threshold: ethers.utils.parseEther("500000"),
  },
  {
    name: "FET",
    contractAddress: "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
    threshold: ethers.utils.parseEther("2500000"),
  },
  {
    name: "AGIX",
    contractAddress: "0x5B7533812759B45C2B44C19e320ba2cD2681b542",
    threshold: ethers.utils.parseEther("700000"),
  },
  {
    name: "PAAL",
    contractAddress: "0x14fee680690900ba0cccfc76ad70fd1b95d10e16",
    threshold: ethers.utils.parseEther("1000000"),
  },
  {
    name: "GLM",
    contractAddress: "0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429",
    threshold: ethers.utils.parseEther("2000000"),
  },
  {
    name: "ZIG",
    contractAddress: "0xb2617246d0c6c0087f18703d576831899ca94f01",
    threshold: ethers.utils.parseEther("10000000"),
  },
  {
    name: "GRT",
    contractAddress: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
    threshold: ethers.utils.parseEther("8000000"),
  },
  {
    name: "ROSE",
    contractAddress: "0x26B80FBfC01b71495f477d5237071242e0d959d7",
    threshold: ethers.utils.parseEther("3000000"),
  },
  {
    name: "OCEAN",
    contractAddress: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
    threshold: ethers.utils.parseEther("3000000"),
  },
  {
    name: "PRIME",
    contractAddress: "0xb23d80f5fefcddaa212212f028021b41ded428cf",
    threshold: ethers.utils.parseEther("100000"),
  },
  {
    name: "RLC",
    contractAddress: "0x607f4c5bb672230e8672085532f7e901544a7375",
    threshold: ethers.utils.parseEther("150000"),
  },
  {
    name: "ORAI",
    contractAddress: "0x4c11249814f11b9346808179cf06e71ac328c1b5",
    threshold: ethers.utils.parseEther("300000"),
  },
  {
    name: "ARKM",
    contractAddress: "0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050",
    threshold: ethers.utils.parseEther("1000000"),
  }
  
];

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
        winston.debug(
          "Checking if the WLD connection is alive, sending a ping"
        );

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
    const rawValue = amount;
    console.log("type:", typeof rawValue);

    const txHash = event.transactionHash; //event tx -> console.log
    winston.debug("txhash", txHash);
    winston.debug("thres", whaleThreshold);
    winston.debug(rawValue.gte(whaleThreshold));

    if (rawValue.gte(whaleThreshold)) {
      winston.debug("gte in");
      const fromAddress = from;
      const toAddress = to;
      //console.log('from to',fromAddress, toAddress)
      const walletFromName = getWalletInfo(fromAddress, result);
      const walletToName = getWalletInfo(toAddress, result);
      //console.log('names',walletFromName, walletToName)
      const link = "https://etherscan.io/tx/" + txHash;
      // console.log('link',link)
      const value = ethers.utils.formatEther(rawValue);
      // Assuming tokenName is defined somewhere before this point
      let price;
     
      try {
        // Call getPrice function
        const { currentPrice } = await getPrice(
          tokenName
        );
        price = currentPrice;
        

        // Use the retrieved values
        console.log("Current Price:", price);
      

        // Continue with your code
      } catch (error) {
        console.error("Error:", error.message);
      }

      const dollarValue = (price * Number(value)).toLocaleString("en-US", {
        maximumFractionDigits: 0,
      });
      const refinedValue = Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 0,
      });

      const message = `
        🚀🚀${refinedValue} $${tokenName} (${dollarValue} USD) is transferred to ${walletToName} from ${walletFromName}

#CurrentPrice: $${price} 

🤖 #AI #WLD #GRT #RNDR #FET #AGIX #PAAL #ZIG #GLM #ROSE #OCEAN #ARKM #RLC #PRIME #TRAC #ORAI    
    ${link} `;
console.log(message)
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

async function getPrice(symbol) {
  try {
    // Create an instance of the Binance exchange
    let exchange
    if (symbol === "ZIG" || symbol === "PRIME") {
      exchange = new ccxt.bybit({ enableRateLimit: true });
    } else if (symbol === "TRAC" || symbol === "ORAI") {
      exchange = new ccxt.kucoin({ enableRateLimit: true });
    } else {
      exchange = new ccxt.binance({ enableRateLimit: true });
    }
    // Fetch ticker data for the specified symbol
    const formattedSymbol = symbol.toUpperCase() + "/USDT";
    const ticker = await exchange.fetchTicker(formattedSymbol);

    // Check if the ticker data was successfully fetched
    if (ticker) {
      // Fetch OHLCV data for the specified symbol (1-hour timeframe)
      const currentPrice = ticker.last;

      console.log("Current Price:", symbol, currentPrice);
     
      // Return the current price and price differences
      return {
        currentPrice: currentPrice,
       
      };
    } else {
      throw new Error("Failed to fetch cryptocurrency data");
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null; // Return null or handle the error as required
  }
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
