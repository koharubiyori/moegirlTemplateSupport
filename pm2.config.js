/**
 * 创建配置项
 * @param {string} name 
 * @param {string} script 
 * @param {string} cwd 
 * @param {'fork' | 'cluster_mode'} exec_mode 
 * @param {number | 'max'} instances 
 * @param {object} mixin
 */
function createConfig(name, script, cwd, exec_mode, instances = 1, mixin = {}) {
  return {
    name,  // 项目名         
    script, // 执行文件
    cwd, // 根目录
    args: '', // 传递给脚本的参数
    interpreter: '', // 指定的脚本解释器
    interpreter_args: '', // 传递给解释器的参数
    watch: true, // 是否监听文件变动然后重启
    ignore_watch: [ // 不用监听的文件
      'node_modules',
      'logs'
    ],
    exec_mode, // 应用启动模式，支持fork和cluster模式
    instances, // 应用启动实例个数，仅在cluster模式有效 默认为fork；或者 max
    // max_memory_restart: 8, // 最大内存限制数，超出自动重启
    error_file: `./logs/error.log`, // 错误日志文件
    out_file: `./logs/output.log`, // 正常日志文件
    merge_logs: true, // 设置追加日志而不是新建日志
    log_date_format: 'YYYY-MM-DD HH:mm:ss', // 指定日志文件的时间格式
    min_uptime: '10s', // 应用运行少于时间被认为是异常启动
    max_restarts: 30, // 最大异常重启次数，即小于min_uptime运行时间重启次数；
    autorestart: true, // 默认为true, 发生异常的情况下自动重启
    restart_delay: 60, // 异常重启情况下，延时重启时间
    env: {
      NODE_ENV: 'production', // 环境参数，当前指定为生产环境 process.env.NODE_ENV
      REMOTE_ADDR: '' // process.env.REMOTE_ADDR
    },
    env_dev: {
      NODE_ENV: 'development', // 环境参数，当前指定为开发环境 pm2 start app.js --env_dev
      REMOTE_ADDR: ''
    },
    env_test: { // 环境参数，当前指定为测试环境 pm2 start app.js --env_test
      NODE_ENV: 'test',
      REMOTE_ADDR: ''
    },
    ...mixin
  }
}

module.exports = {
  apps: [
    createConfig('moegirlWeb', './src/main.js', '.', 'cluster_mode', 2)
  ]
}