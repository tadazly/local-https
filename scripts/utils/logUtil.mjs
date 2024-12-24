import chalk from "chalk"
import readline from 'node:readline/promises'
import { formatDate } from "./dateUtil.mjs"

let logTimeFlag = false
/**
 * 是否启用日志时间
 * @param {boolean} value 
 */
const enableLogTime = (value) => {
    logTimeFlag = true
}
const addLogTime = (msgs) => {
    if (logTimeFlag) {
        msgs.unshift(formatDate(new Date()))
    }
}

const log = (...msgs) => {
    addLogTime(msgs)
    console.log(...msgs.map(msg => chalk.white(msg)))
}
const info = (...msgs) => {
    addLogTime(msgs)
    console.log(...msgs.map(msg => chalk.bold.green(msg)))
}
const error = (...msgs) => {
    addLogTime(msgs)
    console.log(...msgs.map(msg => chalk.hex('#ff0000').bold(msg)))
}
const warn = (...msgs) => {
    addLogTime(msgs)
    console.log(...msgs.map(msg => chalk.hex('#ffcc00').bold(msg)))
}
const debug = (...msgs) => {
    addLogTime(msgs)
    console.log(...msgs.map(msg => chalk.blueBright(msg)))
}


/**
 * 命令行确认提示
 * @param {string} message 
 * @returns {Promise<boolean>}
 */
const confirm = async (msg) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    const answer = await rl.question(chalk.hex('#ffcc00').bold(`${msg} (Y/N): `))
    const normalizedAnswer = answer.trim().toLowerCase()
    rl.close()
    if (normalizedAnswer === 'y' || normalizedAnswer === 'yes') {
        return true
    } else if (normalizedAnswer === 'n' || normalizedAnswer === 'no') {
        return false
    } else {
        error("Invalid input. Please enter 'Y' or 'N'.")
        return confirm(msg)
    }
}

const logger = {
    log,
    warn,
    error,
    debug,
    info,
    confirm,
    enableLogTime
}

export default logger
export {
    log,
    warn,
    error,
    debug,
    info,
    confirm,
    enableLogTime,
}
