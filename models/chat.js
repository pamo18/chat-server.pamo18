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
        let now = new Date();
        let yr = now.getFullYear();
        let mth = ((now.getMonth() + 1) < 10 ? "0" + now.getMonth() + 1 : now.getMonth() + 1);
        let day = (now.getDate() >= 10 ? now.getDate() : "0" + now.getDate());
        let hr = (now.getHours() >= 10 ? now.getHours() : "0" + now.getHours());
        let min = (now.getMinutes() >= 10 ? now.getMinutes() : "0" + now.getMinutes());
        let sec = (now.getSeconds() >= 10 ? now.getSeconds() : "0" + now.getSeconds());
        let d = `${day}/${mth}/${yr}, ${hr}:${min}:${sec}`;

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
