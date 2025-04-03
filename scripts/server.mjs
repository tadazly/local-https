#!/usr/bin/env node
// 👆如果要链接到全局指令，上面这行必不可少

import console from './utils/logUtil.mjs'
import * as serverTask from './tasks/serverTask.mjs'

async function main() {
    console.enableLogTime(true);
    const [, , task] = process.argv
    if (serverTask[task]) {
        console.log(`执行任务：${task}`)
        try {
            await serverTask[task].apply(this, process.argv.slice(3))
        } catch (err) {
            console.error(`任务 ${task} 执行失败：`, err)
        }
    } else {
        console.error(`未知任务：${task}，请使用 start / last / createSSL`)
    }
}

main()