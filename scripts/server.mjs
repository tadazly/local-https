#!/usr/bin/env node
// 👆如果要链接到全局指令，上面这行必不可少

import console from './utils/logUtil.mjs'
import * as serverTask from './tasks/serverTask.mjs'

function main() {
    const [, , task] = process.argv
    if (serverTask[task]) {
        console.log(`执行任务：${task}`)
        serverTask[task].apply(this, process.argv.slice(3))
    } else {
        console.error(`未知任务：${task}，请使用 start / last / createSSL`)
    }
}

main()