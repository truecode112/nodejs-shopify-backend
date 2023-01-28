import dotenv from 'dotenv';
import express from 'express';
import * as App from '../models/application.js';
import {Session} from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'
import fetch from 'node-fetch';
import { getAvalableDiscount, updateDiscountUsage, deleteDiscountCode } from '../models/discount.js';
import { shopifyApi, ApiVersion, BillingInterval, DataType } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'
import { getApplicationsByUid } from '../models/application.js';

var app_router = express.Router();

app_router.post('/', async (req, res) => {
    try {
        console.log('create application', req.body);
       
        var insertedApp = await App.createApplication(req);

        return res
            .status(200)
            .json({error: null, application: insertedApp});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

app_router.get('/:id', async(req, res) => {
    try {
        console.log('get applications', req.params);
       
        var adminApplications = await App.getApplicationsByAdminAddress(req.params.id);

        return res
            .status(200)
            .json({error: null, applications: adminApplications});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

app_router.get('/:id/:uid', async(req, res) => {
    try {
        console.log('get one application', req.params);
       
        var oneApp = await App.getApplicationsByUid(req.params.id, req.params.uid);

        return res
            .status(200)
            .json({error: null, application: oneApp});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

app_router.delete('/:id/:uid', async(req, res) => {
    try {
        console.log('delete application', req.params);
       
        await App.deleteApplication(req.params.id, req.params.uid);

        return res
            .status(200)
            .json({error: null, message: ""});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

app_router.patch('/:id/:uid', async(req, res) => {
    try {
        console.log('update application', req.params, req.body);

        const shopifyRes = await fetch(req.body.shopURL + '/admin/oauth/access_scopes.json', {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': req.body.shopifyAccessToken}
        });

        if (!shopifyRes.ok) {
            return res
                .status(200)
                .json({error: "shopify error", message: "Failed to validate shopify"});
        }
        var res_data = await shopifyRes.json(); 
        if (res_data === null || res_data === undefined) {
            return res
                .status(200)
                .json({error: "shopify error", message: "Failed to validate shopify"});
        }

        var access_scopes = [];
        res_data.access_scopes.forEach(scope => {
            access_scopes.push(scope.handle);
        });

        if (access_scopes.length == 0) {
            return res
                .status(200)
                .json({error: "shopify error", message: "No valid scopes"});
        }

        await App.updateApplication(req.params.id, req.params.uid, JSON.stringify(access_scopes), req.body);

        return res
            .status(200)
            .json({error: null, message: ""});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

app_router.post('/bannerInfo', async(req, res) => {
    try {
        console.log('get banner info', req.body);
        
        var info = await App.getBannerInfo("", req.body.uid);
        var result = {
            error: null,
            bannerInfo: info,
            discountCode: ""
        };

        var adminAddress = req.body.wallet_address;
        var uid = req.body.uid;
        var chain_id = req.body.chain_id;

        var appInfo = await getApplicationsByUid(adminAddress, uid);
        if (appInfo === null || appInfo === undefined) {
            return res.status(200).json(result);
        }

        if (chain_id == "ethereum" && (appInfo.productContractAddress === null || appInfo.productContractAddress === "")) {
            return res.status(200).json(result);
        }

        if (chain_id == "goerli" && (appInfo.testnetContractAddress === null || appInfo.testnetContractAddress === "")) {
            return res.status(200).json(result);
        }

        var validContractAddress = "";
        if (chain_id === "ethereum") {
            validContractAddress = appInfo.productContractAddress;
        } else {
            validContractAddress = appInfo.testnetContractAddress;
        }

        var availDiscount = await getAvalableDiscount(adminAddress, validContractAddress);
        if (availDiscount === null || availDiscount === undefined) {
            return res.status(200).json(result);
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
          hostName: '95.217.102.97',
          apiVersion: ApiVersion.January23,
          isEmbeddedApp: true,
        });

        console.log('priceRuleId', appInfo.priceRuleId);
        console.log('availDiscount.discount_code', availDiscount.discount_code);

        const client = new shopify.clients.Rest({session});
        try {
            const response = await client.get({
                type: DataType.JSON,
                path: `/admin/api/2023-01/price_rules/${appInfo.priceRuleId}/discount_codes/${availDiscount.discount_id}.json`,
            });
    
            if (response.body.discount_code.usage_count == 0) {
                result.discountCode = availDiscount.discount_code;
                return res.status(200).json(result);
            }
            await updateDiscountUsage(adminAddress, validContractAddress, availDiscount.discount_code, availDiscount.discount_id, response.body.discount_code.usage_count);
        } catch (shopifyerr) {
            console.log('shopify error', shopifyerr);
            if (shopifyerr.response.code == 404) {
                // Not Found. in case the discount code is deleted manually in shopify
                // In this case delete the discound code in database
                await deleteDiscountCode(adminAddress, validContractAddress, availDiscount.discount_code, availDiscount.discount_id);
            }
        }
        return res
            .status(200)
            .json(result);

    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

export default app_router;
