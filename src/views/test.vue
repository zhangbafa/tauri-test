

<script>
import { exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { exists, readTextFile, writeTextFile, createDir, BaseDirectory } from '@tauri-apps/plugin-fs';

/**
 * 文件工具类
 */
export const fileUtils = {
  /**
   * 写入文件
   * @param {string} filename - 文件名
   * @param {string} content - 文件内容
   * @param {string} directory - 目录名
   * @returns {Promise<void>}
   */
  async writeToFile(filename, content, directory = '') {
    try {
      // 如果指定了目录，先确保目录存在
      if (directory) {
        const dirExists = await exists(directory, { dir: BaseDirectory.App });
        if (!dirExists) {
          await createDir(directory, { dir: BaseDirectory.App, recursive: true });
        }
        
        // 拼接完整路径
        filename = `${directory}/${filename}`;
      }

      // 写入文件
      await writeTextFile({
        path: filename,
        contents: content,
        dir: BaseDirectory.App
      });

      return true;
    } catch (error) {
      console.error('写入文件失败:', error);
      throw error;
    }
  },

  /**
   * 读取文件
   * @param {string} filename - 文件名
   * @param {string} directory - 目录名
   * @returns {Promise<string>}
   */
  async readFromFile(filename, directory = '') {
    try {
      if (directory) {
        filename = `${directory}/${filename}`;
      }

      const content = await readTextFile({
        path: filename,
        dir: BaseDirectory.App
      });

      return content;
    } catch (error) {
      console.error('读取文件失败:', error);
      throw error;
    }
  }
}; 
// const saveToFile = async (content) => {
//   try {
//     await fileUtils.writeToFile(
//       'example.txt',  // 文件名
//       content,        // 要保存的内容
//       'data'         // 可选的子目录
//     );
//     Message.success('文件保存成功');
//   } catch (error) {
//     Message.error('文件保存失败');
//   }
// };

// const readFile = async () => {
//   try {
//     const content = await fileUtils.readFromFile(
//       'example.txt',
//       'data'
//     );
//     // 处理读取到的内容
//   } catch (error) {
//     Message.error('文件读取失败');
//   }
// };
</script>