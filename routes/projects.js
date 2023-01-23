import express from 'express';
import * as Project from '../models/project.js';

var project_router = express.Router();

project_router.post('/', async (req, res) => {
    try {
        console.log('create project', req.body);
       
        var insertedProject = await Project.createProject(req);

        return res
            .status(200)
            .json({error: null, project: insertedProject});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

project_router.get('/:id', async(req, res) => {
    try {
        console.log('get projects', req.params);
       
        var adminProjects = await Project.getProjectsByAdminAddress(req.params.id);

        return res
            .status(200)
            .json({error: null, projects: adminProjects});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

project_router.get('/:id/:uid', async(req, res) => {
    try {
        console.log('get one project', req.params);
       
        var oneProject = await Project.getProjectByUid(req.params.id, req.params.uid);

        return res
            .status(200)
            .json({error: null, project: oneProject});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});

project_router.delete('/:id/:uid', async(req, res) => {
    try {
        console.log('delete project', req.params);
       
        await Project.deleteProject(req.params.id, req.params.uid);

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
/*
project_router.patch('/:id/:uid', async(req, res) => {
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

        await Project.updateApplication(req.params.id, req.params.uid, JSON.stringify(access_scopes), req.body);

        return res
            .status(200)
            .json({error: null, message: ""});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});*/

export default project_router;
