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

var discount_router = express.Router();

const SHOPIFY_SITE_URL = process.env.SHOPIFY_SITE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const NFT_COLLECTION_ADDRESS = process.env.NFT_COLLECTION_ADDRESS;
const SHOPIFY_DISCOUNT_ID = process.env.SHOPIFY_DISCOUNT_ID;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY;
const SHOPIFY_API_SCOPES = process.env.SHOPIFY_API_SCOPES;

  const session = new Session({
    id: 'session-id',
    shop: 'slimprints.myshopify.com',
    state: 'state1234',
    isOnline: true,
    accessToken: SHOPIFY_ACCESS_TOKEN,
  });

  console.log(SHOPIFY_API_KEY);

  const shopify = shopifyApi({
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET_KEY,
    scopes: SHOPIFY_API_SCOPES,
    hostName: '95.217.102.97:3000',
    apiVersion: ApiVersion.October22,
    isEmbeddedApp: true,
  });

discount_router.post('/', async (req, res) => {
    try {
        console.log('discount_router', req.body);

        var wallet_addres = req.body.wallet_address;
        var chain_id = req.body.chain_id;
        
        const sdk = new ThirdwebSDK(chain_id);
    
        const edition = await sdk.getContract(NFT_COLLECTION_ADDRESS, "nft-collection");
        console.log(wallet_addres);

        const balance = await edition.balanceOf(wallet_addres);
    
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
            path: `/admin/api/2023-01/price_rules/${SHOPIFY_DISCOUNT_ID}/discount_codes.json`,
            data: {
              discount_code: {
                code: new_discount_code[0],
                usage_count: 3,
              },
            },
          });
        
        console.log('discount_code', response.body.discount_code.code);
        return res
            .status(200)
            .json({error: null, message: "Your discount code is " + response.body.discount_code.code, discount_code: response.body.discount_code.code});
    } catch (e) {
        console.log(e);
        return res
            .status(401)
            .json({error: "401 Unauthorized", message: null, discount_code: null});
    }
    
});

export default discount_router;
