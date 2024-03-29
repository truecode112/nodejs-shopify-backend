import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path:path.resolve(__dirname, '../.env')});
import { shopifyApi, LATEST_API_VERSION, BillingInterval, DataType } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'
import {Session} from '@shopify/shopify-api';
import voucher_codes from 'voucher-code-generator';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Ethereum } from '@thirdweb-dev/chains';

import express from 'express';
import { getDiscountCount, saveNewDiscount, getAvailableDiscount } from '../models/discount.js';
import { getApplicationsByUid } from '../models/application.js';

var discount_router = express.Router();

const SHOPIFY_SITE_URL = process.env.SHOPIFY_SITE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const NFT_COLLECTION_ADDRESS = process.env.NFT_COLLECTION_ADDRESS;
const SHOPIFY_DISCOUNT_ID = process.env.SHOPIFY_DISCOUNT_ID;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY;
const SHOPIFY_API_SCOPES = process.env.SHOPIFY_API_SCOPES;

discount_router.post('/', async (req, res) => {
    try {
        console.log('discount_router', req.body);

        var wallet_address = req.body.wallet_address;
        var chain_id = req.body.chain_id;
        var uid = req.body.uid;
        var store = req.body.store;

        var appInfo = await getApplicationsByUid(wallet_address, uid);
        //console.log(appInfo);
        if (appInfo === null || appInfo === undefined) {
          return res.status(200).json({error: "Invalid plugin configuration", message: "", discount_code: ""});
        }

        if (chain_id == "ethereum" && (appInfo.productionContractAddress === null || appInfo.productionContractAddress === "")) {
          return res.status(200).json({error: "No valid mainnet contract address", message: "", discount_code: ""});
        }

        if (chain_id == "goerli" && (appInfo.testnetContractAddress === null || appInfo.testnetContractAddress === "")) {
          return res.status(200).json({error: "No valid testnet contract address", message: "", discount_code: ""});
        }

        var validContractAddress = "";
        if (chain_id === "ethereum") {
          validContractAddress = appInfo.productionContractAddress;
        } else {
          validContractAddress = appInfo.testnetContractAddress;
        }
        var shopURL = appInfo.shopURL.replace(/(^\w+:|^)\/\//, '');
        const session = new Session({
          id: 'session-id',
          shop: shopURL,
          state: 'state1234',
          isOnline: true,
          accessToken: appInfo.shopifyAccessToken,
        });

        const shopify = shopifyApi({
          apiKey: appInfo.shopifyAPIKey,
          apiSecretKey: appInfo.shopifySecretKey,
          scopes: appInfo.adminAccessScope,
          hostName: 'odto.com',
          apiVersion: LATEST_API_VERSION,
          isEmbeddedApp: true,
        });

        if (chain_id == "ethereum")
          chain_id = Ethereum;

        const sdk = new ThirdwebSDK(chain_id, {
          clientId: "204a66e18d4370254df09a3726e66310",
          secretKey: "ajiqrmKmnqq8ldUwvkCjgCqgKy3u7JiNvKVRlvBkud1FfEyIX4MZuRGjiuof4T52bAhqF2mWvkiVuVihR-pYJQ"
        });
        
        console.log('contract address', validContractAddress);
        
        const edition = await sdk.getContract(validContractAddress, "nft-collection");
        const balance = await edition.balanceOf(wallet_address);

        if (balance.eq(0)) {
            return res.status(200).json({error: "No NFT holder", message: "", discount_code: ""});
        }

        console.log('balance', balance);

        const tokenIds = await edition.getOwnedTokenIds(wallet_address);

        var validTokenIdNum = -1;

        for (const tokenId of tokenIds) {
          var available_discount = await getAvailableDiscount(wallet_address, validContractAddress, tokenId.toNumber(), store);
          if (available_discount != null && available_discount != undefined) {
            return res
            .status(200)
            .json({error: null, message: "Your current discount code is " + available_discount.discount_code, discount_code: available_discount.discount_code, createdAt: available_discount.date_created});
          }
          var discount_count = await getDiscountCount(wallet_address, validContractAddress, tokenId.toNumber(), store);
          console.log('Current discount code count', discount_count);
          if (discount_count === 0 || discount_count === undefined) {
            validTokenIdNum = tokenId.toNumber();
            break;
          }
        }
        
        if (validTokenIdNum == -1) {
          return res.status(200).json({error: "No valid NFT for discount", message: "", discount_code: ""});
        }

        const client = new shopify.clients.Rest({session});
    
        let new_discount_code = voucher_codes.generate({
            length: 10,
            count: 1,
            charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        });

        console.log('new_discount_code >>> ', new_discount_code);
    
        const response = await client.post({
            type: DataType.JSON,
            path: `/admin/api/2023-10/price_rules/${appInfo.priceRuleId}/discount_codes.json`,
            data: {
              discount_code: {
                code: new_discount_code[0],
                usage_count: 1,
              },
            },
          });

        const discountCode = response.body.discount_code.code;
        const discountCodeId = response.body.discount_code.id;
        console.log('discountCode >>> ', discountCode);

        // var date_created = new Date(new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}));
        // date_created = date_created.getUTCMilliseconds();
        var date_created = Date.now();
        var insertId = saveNewDiscount(wallet_address, discountCode, discountCodeId, validContractAddress,  validTokenIdNum, date_created, store);
        var expire_date = new Date(date_created + 15 * 60 * 1000);
        var expire_date_str = expire_date.toLocaleString('en-US', {timeZone: 'America/New_York'})
          .replace(/T/, ' ')
          .replace(/\..+/, '');
        return res
            .status(200)
            .json({error: null, message: "Your current discount code is " + discountCode + "<br/>" + " Valid until " + expire_date_str, discount_code: discountCode, createdAt: date_created});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null, discount_code: null});
    }
});

export default discount_router;
