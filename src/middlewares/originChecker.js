module.exports = function originChecker(...originPatterns) {
  
  return async function(ctx, next) {
    let origin = ctx.headers.origin || ctx.headers.referer
    
    // 如果origin和referer都没有，代表用户在直接访问资源(或者图片被别人爬了)
    if (origin === undefined) return await next()

    if (ctx.headers.origin === undefined) {
      origin = origin.replace(/^(https?:\/\/.+?)\/.+$/, '$1')
    }
    
    if (
      originPatterns.some(patterns => patterns.test(origin))
    ) {
      ctx.set('Access-Control-Allow-Origin', origin)
    }

    await next()
  }
}