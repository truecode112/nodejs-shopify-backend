import dotenv from 'dotenv';
import express from 'express';
import * as App from '../models/application.js';
import {Session} from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'
import { shopifyApi, ApiVersion, BillingInterval, DataType } from '@shopify/shopify-api';
import fetch from 'node-fetch';

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

app_router.get('/bannerInfo/:id/:uid', async(req, res) => {
    try {
        console.log('get banner info', req.params);
       
        var info = await App.getBannerInfo("", req.params.uid);

        return res
            .status(200)
            .json({error: null, bannerInfo: info});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

export default app_router;
