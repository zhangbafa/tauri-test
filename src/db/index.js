import Database from '@tauri-apps/plugin-sql';

class DBManager {
  static instance = null;
  
  constructor() {
    if (DBManager.instance) {
      return DBManager.instance;
    }
    this.db = null;
    this.initializing = null;
    DBManager.instance = this;
  }

  async init(dbName = 'note.db') {
    if (this.db) {
      return true;
    }
    
    if (this.initializing) {
      return this.initializing;
    }

    this.initializing = (async () => {
      try {
        this.db = await Database.load(`sqlite:${dbName}`);
        console.log('Database initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        this.db = null;
        throw error;
      } finally {
        this.initializing = null;
      }
    })();

    return this.initializing;
  }

  async execute(sql, params = []) {
    try {
      if (!this.db) {
        await this.init();
      }
      return await this.db.execute(sql, params);
    } catch (error) {
      console.error('SQL execution failed:', error);
      throw error;
    }
  }

  // 使用 query 方法进行查询
  async query(sql, params = []) {
    try {
      if (!this.db) {
        await this.init();
      }
      return await this.db.select('select * from category', params);
    } catch (error) {
      console.error('SQL query failed:', error);
      throw error;
    }
  }

  async createTable(tableName, columns) {
    const columnDefs = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
    
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
    return await this.execute(sql);
  }

  async alterTable(tableName, columnName, columnType) {
    const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
    return await this.execute(sql);
  }

  async insert(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    return await this.execute(sql, values);
  }

  async batchInsert(tableName, dataArray) {
    const results = [];
    for (const data of dataArray) {
      results.push(await this.insert(tableName, data));
    }
    return results;
  }

  async update(tableName, data, where) {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const whereClause = Object.keys(where)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    const values = [...Object.values(data), ...Object.values(where)];
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    
    return await this.execute(sql, values);
  }

  async delete(tableName, where) {
    const whereClause = Object.keys(where)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    const values = Object.values(where);
    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    
    return await this.execute(sql, values);
  }

  async select(tableName, columns = ['*'], where = null, orderBy = null, limit = null) {
    let sql = `SELECT ${columns.join(', ')} FROM ${tableName}`;
    const values = [];

    if (where) {
      const whereClause = Object.keys(where)
        .map(key => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      values.push(...Object.values(where));
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    console.log('SQL Query:', sql, 'Values:', values);
    return await this.query(sql, values);  // 使用 query 而不是 execute
  }
}

// 创建单例实例
const dbManager = new DBManager();
export default dbManager;
