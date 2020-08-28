const canvas = require('canvas')
const superagent = require('superagent')
const StringDecoder = require('string_decoder').StringDecoder
const http = require('http')
const Koa = require('koa')
const KoaRouter = require('koa-router')

const app = new Koa()
const router = new KoaRouter()

router.get('/moegirlWeb/accessCountImg', async (ctx, next) => {
  try {
    const referer = ctx.request.headers.referer
    const busuanziCount = await getBusuanziCount(referer)
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
 * @param {string} [options.bgColor]
 */
function createNumberImage(text, options = {}) {
  options.fontSize = parseInt(options.fontSize) || 14
  text = text.toString()

  const canvasSize = {
    width: options.fontSize * text.length / 2,  // 数字都是半角
    height: options.fontSize
  }
  const canvasInstance = canvas.createCanvas(canvasSize.width, canvasSize.height)
  const ctx = canvasInstance.getContext('2d')

  if (options.bgColor) {
    ctx.fillStyle = options.bgColor
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
  }

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
