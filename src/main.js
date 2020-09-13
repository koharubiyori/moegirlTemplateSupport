const Koa = require('koa')
const KoaRouter = require('koa-router')
const originChecker = require('./middlewares/originChecker')
const accessCountImg = require('./modules/accessCountImg')
const mmdResourceReply = require('./modules/mmdResourceReply')

const app = new Koa()
const router = new KoaRouter()

const prefix = moduleName => '/moegirlWeb/' + moduleName

router.get(prefix('accessCountImg'), accessCountImg)
router.get(prefix('mmdResourceReply'), mmdResourceReply)

app.use(originChecker(
  /^https?:\/\/zh\.moegirl\.org\.cn$/,
  /^http:\/\/localhost:\d+$/
))
app.use(router.routes())

app.listen(8200, () => {
  console.log('已启动服务：http://localhost:8200')
})
