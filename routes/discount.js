import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path:path.resolve(__dirname, '../.env')});
import { shopifyApi, ApiVersion, BillingInterval, DataType } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'
import {Session} from '@shopify/shopify-api';
import voucher_codes from 'voucher-code-generator';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

import express from 'express';
import { getDiscountCount, saveNewDiscount } from '../models/discount.js';
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

        var discount_count = await getDiscountCount(wallet_address);
        console.log('Current discount code count', discount_count);

        var appInfo = await getApplicationsByUid(wallet_address, uid);
        console.log(appInfo);
        if (appInfo === null || appInfo === undefined) {
          return res.status(200).json({error: "Invalid plugin configuration", message: "", discount_code: ""});
        }

        if (chain_id == "ethereum" && (appInfo.productContractAddress === null || appInfo.productContractAddress === "")) {
          return res.status(200).json({error: "No valid mainnet contract address", message: "", discount_code: ""});
        }

        if (chain_id == "goerli" && (appInfo.testnetContractAddress === null || appInfo.testnetContractAddress === "")) {
          return res.status(200).json({error: "No valid testnet contract address", message: "", discount_code: ""});
        }

        var validContractAddress = "";
        if (chain_id === "ethereum") {
          validContractAddress = appInfo.productContractAddress;
        } else {
          validContractAddress = appInfo.testnetContractAddress;
        }

        const session = new Session({
          id: 'session-id',
          shop: appInfo.shopURL,
          state: 'state1234',
          isOnline: true,
          accessToken: appInfo.shopifyAccessToken,
        });
      
        const shopify = shopifyApi({
          apiKey: appInfo.shopifyAPIKey,
          apiSecretKey: appInfo.shopifySecretKey,
          scopes: appInfo.adminAccessScope,
          hostName: '95.217.102.97',
          apiVersion: ApiVersion.October22,
          isEmbeddedApp: true,
        });

        const sdk = new ThirdwebSDK(chain_id);
  
        const edition = await sdk.getContract(validContractAddress, "nft-collection");
        const balance = await edition.balanceOf(wallet_address);
    
        if (balance.eq(0)) {
            return res.status(200).json({error: "No NFT holder", message: "", discount_code: ""});
        }

        console.log('balance', balance);
    
        const client = new shopify.clients.Rest({session});
    
        let new_discount_code = voucher_codes.generate({
            length: 10,
            count: 1,
            charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        });
    
        const response = await client.post({
            type: DataType.JSON,
            path: `/admin/api/2023-01/price_rules/${appInfo.priceRuleId}/discount_codes.json`,
            data: {
              discount_code: {
                code: new_discount_code[0],
                usage_count: 1,
              },
            },
          });
        
        console.log('discount_code', response.body.discount_code.code);
        var insertId = saveNewDiscount(wallet_address, response.body.discount_code.code);
        return res
            .status(200)
            .json({error: null, message: "Discount code " + response.body.discount_code.code + " is applied!", discount_code: response.body.discount_code.code});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null, discount_code: null});
    }
});

export default discount_router;
