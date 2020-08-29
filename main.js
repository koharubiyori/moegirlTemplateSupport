const canvas = require('canvas')
const superagent = require('superagent')
const StringDecoder = require('string_decoder').StringDecoder
const Koa = require('koa')
const KoaRouter = require('koa-router')
const md5 = require('md5')

const app = new Koa()
const router = new KoaRouter()

router.get('/moegirlWeb/accessCountImg', async (ctx, next) => {
  try {  
    const referer = ctx.request.headers.referer
    const domainRegex = /^https:\/\/(m?zh\.moegirl\.org\.cn\/)/

    // 禁止萌百以外的域名使用
    if (!domainRegex.test(referer)) {
      ctx.status = 403
      return next()
    }
    
    const sign = md5(referer.replace(domainRegex, ''))
    const virtualDomain = `https://${sign}.zh.moegirl.org.cn`
    const busuanziCount = await getBusuanziCount(virtualDomain)
    ctx.body = createNumberImage(busuanziCount, { ...ctx.query })
    ctx.set('Content-Type', 'image/png')
  } catch(e) {
    console.log(e)
    ctx.status = 400
  }

  next()
})

app.use(router.routes())
app.listen(8200, () => {
  console.log('已启动服务：http://localhost:8200')
})

/**
 * 创建一个以数字数字为内容的图片buffer
 * @param {string} text
 * @param {object} [options] 
 * @param {number} [options.fontSize]
 * @param {string} [options.color]
 * @param {boolean} [options.fontBold]
 */
function createNumberImage(text, options = {}) {
  options.fontSize = parseInt(options.fontSize) || 14
  options.fontBold = options.fontBold === 'true'
  text = text.toString()

  const canvasSize = {
    width: options.fontSize * text.length / 2,  // 数字都是半角
    height: options.fontSize
  }
  const canvasInstance = canvas.createCanvas(canvasSize.width, canvasSize.height)
  const ctx = canvasInstance.getContext('2d')

  ctx.textBaseline = 'middle'
  ctx.fillStyle = options.color || 'black'
  ctx.font = `${options.fontBold ? 'bold' : ''} ${options.fontSize}px sans-serif`
  ctx.fillText(text, 0, options.fontSize / 2, canvasSize.width)

  return canvasInstance.toBuffer()
}

/**
 * 通过不蒜子获取计数
 * @param {string} referer 
 * @return {Promise<number>}
 */
function getBusuanziCount(referer) {
  return new Promise((resolve, reject) => {
    const busuanziApi = 'http://busuanzi.ibruce.info/busuanzi'
    const callbackName = 'BusuanziCallback_' + Math.floor(1099511627776 * Math.random())
  
    const requestUrl = `${busuanziApi}?jsonpCallback=${callbackName}`
    superagent
      .get(requestUrl) 
      .set('referer', referer)
      .responseType('text')
      .then(data => {
        const callbackStr = new StringDecoder().write(data.body)
        const callbackJsonStr = callbackStr.match(new RegExp(`${callbackName}\\((.+?)\\)`))[1]
        const callbackData = JSON.parse(callbackJsonStr)
        resolve(callbackData.site_uv)
      })
      .catch(e => {
        console.log(e)
        reject(e)
      })
  })
}