import Database from 'better-sqlite3'

export class DB {
  constructor(filePath) {
    this.db = new Database(filePath, { readonly: true })
  }

  query(sql, params = []) {
    const stmt = this.db.prepare(sql)
    return stmt.all(params)
  }
}
