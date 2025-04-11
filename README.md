# local-https

> 快速启动一个本地 HTTPS 静态文件服务器，用于开发、调试、装腔作势。

**local-https** 是一个零配置、本地开发利器，支持 HTTP/HTTPS，内置一键证书生成，配合 PM2 管理后台服务，轻松应对前端开发、接口联调、演示测试等场景。无需复杂部署，让你像个高级工程师一样在本地跑个破页面。

## 特性

- **HTTPS支持**：一键生成本地自签证书，解决浏览器跨域&安全警告。
- **零配置启动**：执行一个命令，项目即刻在线。
- **PM2后台管理**：多服务标签，自动重启，永不掉线（除非你手动）。
- **跨平台支持**：Windows / macOS / Linux，无痛体验。
- **适合懒人**：写代码已经够累了，启动服务器这事就交给它吧。

## 快速开始

```bash
npm install
npm link
local-https createSSL     # 如果你需要 HTTPS
local-https start 3000 ./your-project
```

也可以使用后台服务方式启动：

```bash
local-https startBackground 3000 ./your-project awesome-tag
```

## 后天启动管理

- 查看服务列表：pm2 list
- 查看日志：pm2 logs
- 停止服务：local-https stopBackground awesome-tag

## 为啥要用这个？

- 用 Python、PHP 临时起服务器？别土了。
- 用 nginx 本地配 HTTPS？累不累？
- 用 VSCode 插件起服务？那玩意能后台跑？

现在，用 local-https，你只需要一个命令，告别繁琐配置，效率狂飙，甚至有点假装专业的错觉。

---

### 👇下面开始讲人话

## 依赖

- Nodejs v20+
- openssl 可选，使用本工具创建ssl证书才需要

## 安装

1. 初始化项目

    ```shell
    npm install
    ```

2. 链接全局`local-https`指令

    ```shell
    npm link
    ```

- 删除链接的全局指令

    ```shell
    npm unlink -g
    ```

## local-https 指令

### 创建测试用证书

如果需要开启 HTTPS，必须先拥有 SLL 证书，使用以下两种方式之一获得。

- 使用本工具创建

    需要本地有 `openssl` ，没有请自行安装。

    - windows：下载并安装 [Win64 OpenSSL v3.4.1 Light](https://slproweb.com/products/Win32OpenSSL.html)

    终端执行 

    ```shell
    local-https createSSL
    ```

    会在 `local-https/ssl/` 目录下创建 `server.key` 和 `server.cert`。

- 使用别的工具创建

    使用别的工具创建创建名为 `server.key` 和 `server.cert` 的证书，放置在 `local-https/ssl/` 目录下。

### 启动本地服务器

- 初次启动

    在你自己的web项目根路径下执行

    ```shell
    local-https start [port] [project-path]
    ```

    参数：

    - port: 可选，端口，默认 80 / 443
    - project-path: 可选，web项目路径，默认当前执行命令的目录

- 再次启动

    ```shell
    local-https last
    ```

    只要执行过 1 次 `start` 之后，可以在任意位置执行 `last` 来启动上一次启动的项目。

### 后台服务管理

本工具使用 PM2 来管理后台服务，支持以下功能：

- 启动后台服务

    ```shell
    local-https startBackground [port] [project-path] [tag]
    ```

    参数：
    - port: 端口号
    - project-path: web项目路径
    - tag: 可选，服务标签，用于标识不同的服务实例

- 停止后台服务

    ```shell
    local-https stopBackground [tag]
    ```

    参数：
    - tag: 可选，服务标签，不传则停止所有由本工具启动的后台服务

注意事项：
1. 后台服务使用 PM2 进行管理，服务会自动重启
2. 可以通过 `pm2 list` 查看所有运行的服务
3. 服务日志可以通过 `pm2 logs` 查看
4. 建议为不同的服务指定不同的 tag，方便管理