/**
 * Chat functions
 */
"use strict";

const mongo = require("mongodb").MongoClient;
const dsn =  "mongodb://localhost:27017/chat";

const chat = {
    show: async function () {
        const client  = await mongo.connect(dsn);
        const db = await client.db();
        const col = await db.collection('conversations');
        const res = await col.find().sort({timestamp: -1}).toArray();

        await client.close();

        return res;
    },
    save: async function (user, conversation) {
        let d = new Date().toUTCString();
        let data = [{
            user: user,
            timestamp: d,
            conversation: conversation
        }];

        const client  = await mongo.connect(dsn);
        const db = await client.db();
        const res = await db.collection('conversations').insertMany(data);

        await client.close();

        return res;
    },
    restore: async function (timestamp) {
        const criteria = {
            timestamp: timestamp
        };
        const client  = await mongo.connect(dsn);
        const db = await client.db();
        const col = await db.collection('conversations');
        const res = await col.find(criteria).toArray();

        await client.close();

        return res;
    },
    delete: async function (timestamp) {
        const criteria = {
            timestamp: timestamp
        };
        const client  = await mongo.connect(dsn);
        const db = await client.db();
        const col = await db.collection('conversations');
        const res = await col.deleteOne(criteria).toArray();

        await client.close();

        return res;
    }
}

module.exports = chat;
