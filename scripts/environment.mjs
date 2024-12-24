import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

/** 脚本所在路径 */
const script_path = fileURLToPath(import.meta.url)
/** 工作区路径 */
const project_path = resolve(dirname(script_path), '..')

export {
    project_path
}