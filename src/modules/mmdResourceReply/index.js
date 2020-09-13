const superagent = require('superagent')
const sourceUrl = (repo, modelName) => `https://koharubiyori.gitee.io/${repo}/${modelName}.jpg`

/*
  interface Query {
    repo?: string
    modelName: string
  }
*/
module.exports = async function mmdResourceReply(ctx, next) {
  try {
    const modelName = ctx.query.modelName
    const repo = ctx.query.repo || 'moegirl-mmd-resources'
    if (!modelName) {
      ctx.status = 400
      return next()
    }

    const mmdData = await superagent
      .get(sourceUrl(repo, modelName))

    ctx.body = mmdData.body
    ctx.set('cache-control', 'public, max-age=2592000, s-maxage=2592000')
  } catch(e) {
    console.log(e)
    ctx.status = 502
  }

  next()
}