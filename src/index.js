"use strict"

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api')
const cheerioLib = require('cheerio')
const fsLib = require('fs')
const pathLib = require('path')

//FOR VPS
const express = require('express')

const server = express()

server.listen(3000, () => {
   console.log('http://localhost:3000')
})

server.get('/', (req, res) => {
   res.sendStatus(200)
})

const getPageContentHelper = require('./commands/getPageContent.js')
const getMessageForSendingHelper = require('./commands/getMessageForSending.js')

const BOT_TOKEN = process.env.BOT_TOKEN || '0';
const CHANNEL_ID = process.env.CHANNEL_ID || '0';

const bot = new TelegramBot(BOT_TOKEN, {
   polling: true,
})

const SITES = ['https://vk.com/kaiknitu', 'https://vk.com/dean4']

let checkWalls = async (site_url) => {
   try {
      const content = await getPageContentHelper(site_url)
      const $ = cheerioLib.load(content)
      const newPosts = {}
      const author = await $('.page_name').text()
      newPosts[author] = {}
      $('.wall_post_cont._wall_post_cont').each((index, item) => {
         let postText = $(item).text()
         newPosts[author][$(item).attr('id')] = { text: postText, link: site_url, author: author, postID: $(item).attr('id').slice(3) }
      })

      await fsLib.stat(pathLib.resolve(__dirname, 'posts.json'), async (err) => {
         if (err == null) {
            await fsLib.readFile(pathLib.resolve(__dirname, 'posts.json'), 'utf8', async (err, oldData) => {
               if (err) throw err
               let oldPosts = JSON.parse(oldData)
               let postsForSending = {}

               for (let postID of Object.keys(newPosts[author])) {
                  if (!(postID in oldPosts[author])) {
                     postsForSending[postID] = newPosts[author][postID]
                  }
               }

               if (postsForSending != {}) {

                  for (let item of Object.keys(postsForSending)) {
                     await bot.sendMessage(CHANNEL_ID, getMessageForSendingHelper(postsForSending[item]))
                  }

                  fsLib.writeFile(pathLib.resolve(__dirname, 'posts.json'), JSON.stringify(newPosts), (err) => {
                     if (err) throw err;
                  })
               }
            })
         } else {
            fsLib.writeFile(pathLib.resolve(__dirname, 'posts.json'), JSON.stringify(newPosts), (err) => {
               if (err) throw err;
            })
         }

      })
   } catch (err) {
      console.log(err)
   }
}

setInterval(async () => {
   for (let link of SITES) {
      checkWalls(link)
   }
}, 300_000)