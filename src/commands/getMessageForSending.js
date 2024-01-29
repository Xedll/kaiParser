const getMessageForSending = (site, post) => {
   const postDate = new Date(post.date * 1000)
   const postMonth = postDate.getMonth() + 1 >= 10 ? postDate.getMonth() + 1 : '0' + (postDate.getMonth() + 1)
   const postDay = postDate.getDate() >= 10 ? postDate.getDate() : '0' + (postDate.getDate())
   const postHours = postDate.getHours() >= 10 ? postDate.getHours() : '0' + (postDate.getHours())
   const postMinutes = postDate.getMinutes() >= 10 ? postDate.getMinutes() : '0' + (postDate.getMinutes())
   const postSeconds = postDate.getSeconds() >= 10 ? postDate.getSeconds() : '0' + (postDate.getSeconds())
   let message = `<a href="${site.domain}">${site.name}</a> (<a href="${site.domain}?w=wall${site.owner_id}_${post.id}">${postDay}.${postMonth}.${postDate.getFullYear()} ${postHours}:${postMinutes}:${postSeconds}</a>) #${site.name.split(' ').join('_')}\n\n${post.text}`
   return message
}
module.exports = getMessageForSending;