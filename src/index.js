"use strict"

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')

//FOR VPS
const express = require('express')

const server = express()

server.listen(3000, () => {
   console.log('http://localhost:3000')
})

server.get('/', (req, res) => {
   res.sendStatus(200)
})

const getMessageForSendingHelper = require('./commands/getMessageForSending.js');

const BOT_TOKEN = process.env.BOT_TOKEN || '0';
const CHANNEL_ID = process.env.CHANNEL_ID || '0';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '0';

const bot = new TelegramBot(BOT_TOKEN, {
   polling: true,
})

const SITES = [{ owner_id: -406973, domain: 'https://vk.com/kaiknitu', name: 'КНИТУ-КАИ им. А.Н.Туполева' }, {
   owner_id: -42009524, domain: 'https://vk.com/dean4', name: 'Дирекция института КТЗИ, КНИТУ-КАИ, 7 здание'
}]

let checkWalls = async (site) => {
   try {
      let wallInfo = null
      let postsForSending = []
      await axios.get(`https://api.vk.com/method/wall.get?access_token=${ACCESS_TOKEN}&count=5&v=5.199&owner_id=${site.owner_id}`)
         .then(data => {
            wallInfo = data.data.response.items
         })
      for (let post of wallInfo) {
         if ((new Date().getTime() - 600000) <= post.date * 1000 && (post.date * 1000 <= new Date().getTime())) {
            postsForSending.push(post)
         }
      }
      if (postsForSending.length > 0) {
         for (let post of postsForSending) {
            await bot.sendMessage(CHANNEL_ID, getMessageForSendingHelper(site, post), { parse_mode: 'HTML' })
         }
      }
   } catch (err) {
      console.log(err)
   }
}

setInterval(async () => {
   for (let site of SITES) {
      checkWalls(site)
   }
}, 600_000)