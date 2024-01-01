"use strict"

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
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
const ADMIN_ID = process.env.ADMIN_ID || '0';

let isWait = null

const bot = new TelegramBot(BOT_TOKEN, {
   polling: true,
})

bot.onText(/\/start/, async (message) => {
   if (message.chat.id != ADMIN_ID) return
   await bot.sendMessage(ADMIN_ID, 'q', {
      reply_markup: {
         keyboard: [['Добавить', 'Удалить', 'Показать'], ['Назад']]
      }
   })
})

bot.onText(/Добавить/, async (message) => {
   if (message.text == 'Назад' || message.text == '/start' || message.chat.id != ADMIN_ID) return
   await bot.sendMessage(ADMIN_ID, 'айди;домен;название')
   isWait = 'add'
})

bot.onText(/Удалить/, async (message) => {
   if (message.text == 'Назад' || message.text == '/start' || message.chat.id != ADMIN_ID) return
   let msg = ''
   for (let item of SITES) {
      msg += `${item.domain}\n`
   }
   await bot.sendMessage(ADMIN_ID, msg)
   await bot.sendMessage(ADMIN_ID, 'домен')
   isWait = 'delete'
})

bot.onText(/Показать/, async (message) => {
   if (message.text == 'Назад' || message.text == '/start' || message.chat.id != ADMIN_ID) return
   let msg = ''
   for (let item of SITES) {
      msg += `Domain: ${item.domain}\nID: ${item.owner_id}\nName: ${item.name}\n-------\n`
   }
   await bot.sendMessage(ADMIN_ID, msg)
})

bot.on('message', async (message) => {
   if (message.text == 'Назад' || message.text == '/start' || message.chat.id != ADMIN_ID) return
   if (isWait == 'add') {
      const data = message.text.match(/(.+);(.+);(.+)/) || []
      if (typeof data[1] == 'undefined' || typeof data[2] == 'undefined' || typeof data[3] == 'undefined') {
         return await bot.sendMessage(ADMIN_ID, 'Перезаполни. Ошибка.')
      } else {
         SITES.push({ owner_id: data[1], domain: data[2], name: data[3] })
         fs.writeFileSync(path.resolve(__dirname, 'sites.json'), JSON.stringify(SITES))
         isWait = null
      }
   }
   if (isWait == 'delete') {
      let res = SITES.findIndex((item) => {
         return item.domain == message.text
      })
      SITES.splice(res, 1)
      fs.writeFileSync(path.resolve(__dirname, 'sites.json'), JSON.stringify(SITES))
      isWait = null
   }
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

setInterval(() => {
   fs.readFile(path.resolve(__dirname, 'sites.json'), 'utf8', (err, data) => {
      if (err == null) {
         for (let site of JSON.parse(data)) {
            checkWalls(site)
         }
      } else if (err.code == 'ENOENT') {
         fs.writeFileSync(path.resolve(__dirname, 'sites.json'), JSON.stringify(SITES))
      }
   })

}, 600_000)