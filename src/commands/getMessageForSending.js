const getMessageForSending = (postInfo) => {
   console.log(postInfo)
   let message = `${postInfo.author}\n(${postInfo.link}?w=wall${postInfo.postID})\n\n${postInfo.text}`
   return message
}
module.exports = getMessageForSending;