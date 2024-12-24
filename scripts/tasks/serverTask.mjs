import express from 'express'
import cors from 'cors'
import serveIndex from 'serve-index'
import https from 'https'
import compression from 'compression'
import zlib from 'zlib'
import Path from 'path'
import fsAsync from 'fs/promises'
import { execAsync } from '../utils/processUtil.mjs'
import { checkExist } from '../utils/fsUtil.mjs'
import { project_path } from '../environment.mjs'

/**
 * 创建开发用的SSL证书
 * @param {string} [filename] 文件名，默认 server 
 */
export async function createSSL(filename) {
    const cwd = process.cwd();
    if (!filename) {
        filename = 'server'
    }
    const outputDir = Path.join(project_path, 'ssl')
    if (!await checkExist(outputDir)) {
        await fsAsync.mkdir(outputDir)
    }
    await execAsync(`openssl req -nodes -new -x509 -keyout ${filename}.key -out ${filename}.cert -days 365 \
-subj "/C=CN/ST=Shanghai/L=Shanghai/O=LocalHttps/OU=LocalHttps/CN=localhost"`, outputDir)
    console.info(`输出至 ${Path.join(outputDir, filename + '.key&cert')}`)
}

/**
 * 启动服务器
 * @param {number} [port] 端口，默认 80/443
 * @param {string} [serverPath] 服务器根目录
 */
export async function start(port, serverPath) {
    if (!serverPath) {
        serverPath = process.cwd()
    }
    let success, failed
    const readyPromise = new Promise((resolve, reject) => {
        success = async () => {
            const tempPath = Path.join(project_path, '.temp')
            if (!await checkExist(tempPath)) {
                await fsAsync.mkdir(tempPath)
            }
            await fsAsync.writeFile(
                Path.join(tempPath, 'startServerConfig.json'),
                JSON.stringify({
                    serverPath,
                    port
                }),
                'utf-8'
            )
            resolve()
        }
        failed = reject
    })
    const app = express()
    app.use(cors())
    const keyPath = Path.join(project_path, 'ssl/server.key')
    const certPath = Path.join(project_path, 'ssl/server.cert')
    if (await checkExist(keyPath) && await checkExist(certPath)) {
        if (!port) {
            port = 443
        }
        app.use(
            compression({
                // 检查是否支持 Brotli
                filter: (req, res) => {
                    if (req.headers['accept-encoding']?.includes('br')) {
                        return true;
                    }
                    return compression.filter(req, res);
                },
                // 自定义 Brotli 压缩方法
                brotli: {
                    zlib: zlib.createBrotliCompress(),
                },
                threshold: 1024, // 最小压缩字节数
            })
        )

        // 自定义中间件为 .br 文件添加 Content-Encoding
        app.use((req, res, next) => {
            if (req.url.endsWith('.br')) {
                res.set('Content-Encoding', 'br');
                if (req.url.includes('wasm.br')) {
                    res.set('Content-Type', 'application/wasm'); // 根据文件类型调整
                } else {
                    res.set('Content-Type', 'application/octet-stream'); // 根据文件类型调整
                }
            }
            next()
        })
        if (!await checkExist(Path.join(serverPath, 'index.html'))) {
            app.use('/', serveIndex(serverPath))
        }
        app.use('/', express.static(serverPath))
        const [key, cert] = await Promise.all([
            fsAsync.readFile(keyPath),
            fsAsync.readFile(certPath),
        ])
        const sslOptions = {
            key, cert
        }
        https
            .createServer(sslOptions, app)
            .listen(port, () => {
                console.info(`'${serverPath}' running on 'https://localhost:${port}'`)
                success()
            })
            .on('error', err => {
                console.error(`'${serverPath}' start failed\n`, err)
                failed()
            })
    } else {
        console.warn(`${serverPath} 缺少 SSL 证书，以 http 运行，若要以 https 运行，请使用 createSSL 创建开发证书 或将 SSL 证书 (server.key & server.cert) 放置在 local-https/ssl/ 下`)
        if (!port) {
            port = 80
        }
        if (!await checkExist(Path.join(serverPath, 'index.html'))) {
            app.use('/', serveIndex(serverPath))
        }
        app.use('/', express.static(serverPath))
        app
            .listen(port, () => {
                console.info(`'${serverPath}' running on 'http://localhost:${port}'`)
                success()
            })
            .on('error', err => {
                console.error(`'${serverPath}' start failed\n`, err)
                failed()
            })
    }
    return readyPromise
}

/**
 * 启动上次启动的服务器
 */
export async function last() {
    const configPath = Path.join(project_path, '.temp/startServerConfig.json')
    if (!await checkExist(configPath)) {
        console.warn(`不存在最近运行的 server 配置`)
        return
    }
    const { serverPath, port } = JSON.parse(await fsAsync.readFile(configPath, 'utf-8'))
    await start(port, serverPath)
}