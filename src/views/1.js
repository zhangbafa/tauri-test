

// import { ref } from 'vue';
// import dbManager from '@/db/index.js'

// 创建用户表
// 创建用户表
// async function initializeData() {
//   const db = await dbManager.init()
//   const ls = await dbManager.query('select * from notes')
//   console.log(ls)
//   await dbManager.createTable('notes', {
//     id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
//     content: 'TEXT',
//     created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
//   })
// }
// initializeData()

const category = `
CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(10) NOT NULL,
    add_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delete_flag INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS anchor_script (
    id INTEGER PRIMARY KEY AUTOINCREMENT
    content TEXT NOT NULL,
    type TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id INTEGER,
);

CREATE TABLE IF NOT EXISTS assistant_reply (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    reply_content TEXT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    config_description TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`