import { create,exists,writeFile, BaseDirectory,writeTextFile,mkdir } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-shell';
import { appConfigDir,join } from '@tauri-apps/api/path';
import { ref } from 'vue'
export function useFS() {

    const basedir  = ref(BaseDirectory.AppConfig)

    // 创建目录
    async function makeDirectory(dirname){
        try {
            await mkdir(dirname, { baseDir: BaseDirectory.AppConfig });
        } catch (error) {
            
        }
    }

    // 追加的方式写入文本文件
    async function writeText(filename,data){
        const baseDir = BaseDirectory.AppConfig
        const append = true
        writeTextFile(filename, data, { baseDir,append });
    }

    // 打开指定目录
    async function openDirectory(dirname,filename) {
        const appConfigDirs = await appConfigDir()
        const path = await join(appConfigDirs, dirname,filename);
        console.log(path)
        const result = await exists(path)
        if(!result) return false
        await open(path)
        return true
    }
    
    // 检查有没有目录或者文件，没有创建
    async function createIfNotExists(dirname) {
        const appConfigDirs = await appConfigDir()
        console.log(appConfigDirs)
        const path = await join(appConfigDirs, dirname);
        const result = await exists(path)
        if(!result) {
            makeDirectory(dirname)
        }
    } 

    // 生成文件名，可自定义扩展名
    function generateDateTimeFilename(extension = 'txt') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        return `${year}${month}${day}${hours}${minutes}${seconds}.${extension}`;
    }

    return {
        makeDirectory,
        openDirectory,
        writeText,
        createIfNotExists,
        generateDateTimeFilename
        
    }
}
