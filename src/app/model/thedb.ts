import * as fs from 'fs';
import * as path from 'path';
import { Observable, EMPTY, forkJoin, Observer} from'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';

import { Database } from 'sqlite3';
import { Settings } from './settings';

export interface IDbResult {
    changes: number;
    lastID: number;
}

/**
 * TheDb is RxJs wrapper around sqlite3 API.
 *
 * @export
 * @class TheDb
 */
export class TheDb {
    private static readonly version = 1;
    private static db: Database;

    public static selectOne(sql: string, values: {}): Observable<{}> {
        return Observable.create((observer: Observer<{}>) => {
            TheDb.db.get(sql, values, (err, row) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(row);
                    observer.complete();
                }
            });
        });
    }

    public static selectAll(sql: string, values: {}): Observable<Array<{}>> {
        return Observable.create((observer: Observer<Array<{}>>) => {
            TheDb.db.all(sql, values, (err, rows) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(rows);
                    observer.complete();
                }
            });
        });
    }

    public static insert(sql: string, values: {}): Observable<IDbResult> {
        return TheDb.change(sql, values);
    }

    public static update(sql: string, values: {}): Observable<IDbResult> {
        return TheDb.change(sql, values);
    }

    public static delete(sql: string, values: {}): Observable<IDbResult> {
        return TheDb.change(sql, values);
    }

    public static query(sql: string): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            TheDb.db.run(sql, {}, (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }

    public static beginTxn(): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            TheDb.db.run('BEGIN', (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }

    public static commitTxn(): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            TheDb.db.run('COMMIT', (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }

    public static rollbackTxn(reason: Error): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            console.log('Rollback transaction');
            TheDb.db.run('ROLLBACK', (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }

    public static importJson(filename: string, disableForeignKeys: boolean): Observable<void> {
        const data: { version: number, tables: { [key: string]: Array<{}> } } = JSON.parse(fs.readFileSync(filename, 'utf8'));
        const tableNames = Object.keys(data.tables);
        const deletes: Array<Observable<IDbResult>> = [];
        const inserts: Array<Observable<IDbResult>> = [];

        let foreignKeys: boolean;

        return TheDb.getPragmaForeignKeys()
            .pipe(
                flatMap((value) => {
                    foreignKeys = value;
                    if (foreignKeys === !disableForeignKeys) {
                        return EMPTY;
                    } else {
                        return TheDb.setPragmaForeignKeys(!disableForeignKeys);
                    }
                }),
                flatMap(TheDb.beginTxn),
                flatMap(() => {
                    for (const table of tableNames) {
                        deletes.push(TheDb.delete(`DELETE FROM ${table}`, {}));
                    }
                    return forkJoin(deletes);
                }),
                flatMap(() => {
                    for (const tableName of tableNames) {
                        if (data.tables[tableName].length === 0) {
                            continue;
                        }
                        const columnNames = Object.keys(data.tables[tableName][0]);

                        for (const row of data.tables[tableName]) {
                            let sql = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES\n`;
                            const values: Array<number | string | null> = [];
                            for (const name of columnNames) {
                                values.push(row[name]);
                            }
                            sql += `(${Array(columnNames.length + 1).join('?, ').slice(0, -2)})`;
                            inserts.push(TheDb.insert(sql, values));
                        }
                    }
                    return forkJoin(inserts);
                }),
                flatMap(TheDb.commitTxn),
                catchError(TheDb.rollbackTxn)
            ).pipe(
                flatMap(() => {
                    if (foreignKeys === !disableForeignKeys) {
                        return EMPTY;
                    } else {
                        return TheDb.setPragmaForeignKeys(foreignKeys);
                    }
                })
            );
    }

    public static exportJson(filename: string): Observable<void> {
        const data = {
            version: TheDb.version,
            tables: {},
        };

        return TheDb.selectAll(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`, {})
            .pipe(
                flatMap((rows) => {
                    const selects: Array<Observable<Array<{}>>> = [];
                    for (const row of rows) {
                        selects.push(
                            TheDb.selectAll(`SELECT * FROM ${row['name']}`, {})
                                .pipe(
                                    map((results) => {
                                        return data.tables[row['name']] = results;
                                    })
                                ),
                        );
                    }
                    return forkJoin(selects);
                }),
                map((res: any) => fs.writeFileSync(filename, JSON.stringify(data, undefined, 4)))
            )
    }

    public static resetDbKarma(): Observable<void> {
        const fromJson = path.join(Settings.dbFolder, `karma-database.init.json`);

        return TheDb.importJson(fromJson, true);
    }

    public static createDb(dbPath: string): Observable<string> {
        dbPath += path.extname(dbPath) === '.db' ? '' : '.db';

        console.log('Creating  databae: ', dbPath);

        const dataPath = path.join(Settings.dbFolder, `database.init.json`);
        const schemaPath = path.join(Settings.dbFolder, `database.db.sql`);
        const schema = fs.readFileSync(schemaPath, { encoding: 'utf8' });

        // Create data directory in userdata folder
        if (!fs.existsSync(path.join(dbPath, '..'))) {
            fs.mkdirSync(path.join(dbPath, '..'));
        }

        return TheDb.getDb(dbPath)
            .pipe(
                flatMap(() => TheDb.exec(schema)),
                flatMap(() => TheDb.setPragmaForeignKeys(true)),
                flatMap(() => TheDb.importJson(dataPath, false)),
                flatMap(TheDb.setPragmaVersion),
                flatMap(() => {
                    console.log('Database created.');
                    return dbPath;
                })
            )
    }

    public static openDb(dbPath: string): Observable<void> {
        console.log('Opening database: ', dbPath);
        return TheDb.getDb(dbPath)
            .pipe(
                flatMap(() => TheDb.setPragmaForeignKeys(true)),
                flatMap(TheDb.upgradeDb),
                map((res: any) => {
                    console.log('Database opened');
                    return;
                })
            );
    }

    public static closeDb(): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            if (!TheDb.db) {
                return
            }
            return TheDb.db.close((err) => {
                console.log('Closing current Db');
                if (err) {
                    observer.error(err);
                    console.log('Db not closed');
                } else {
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }

    private static getDb(dbPath: string): Observable<void> {
        return TheDb.closeDb()
            .pipe(
                flatMap(() => {
                    return Observable.create((observer: Observer<void>) => {
                        const db = new Database(dbPath, (err) => {
                            if (err) {
                                observer.error(err);
                            } else {
                                TheDb.db = db;
                                observer.next(undefined);
                                observer.complete();
                            }
                        });
                    });
                })
            );
    }

    private static upgradeDb(): Observable<void> {
        return TheDb.getPragmaVersion()
            .pipe(
                map((version) => {
                    if (version === TheDb.version) {
                        return undefined;
                    } else if (version > TheDb.version) {
                        throw new Error(`Cannot downgrade database from version ${version} to ${TheDb.version}.`);
                    } else {
                        switch (version) {
                            case 0:
                                // Upgrade schema if needed
                                // Upgrade data if needed
                                break;
                            default:
                                new Error(`No upgrade defined for database version ${version}`);
                        }
                        return undefined
                    }
                }),
                flatMap(TheDb.setPragmaVersion)
            )
    }

    private static change(sql: string, values: {}): Observable<IDbResult> {
        return Observable.create((observer: Observer<IDbResult>) => {
            TheDb.db.run(sql, values, function (err) {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next({ changes: this.changes, lastID: this.lastID });
                    observer.complete();
                }
            });
        });
    }

    private static exec(sql: string): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            TheDb.db.exec(sql, (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }

    private static getPragmaForeignKeys(): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {
            TheDb.db.get('PRAGMA foreign_keys', (err, row) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(Boolean(row['foreign_keys']));
                    observer.complete();
                }
            });
        });
    }

    private static setPragmaForeignKeys(value: boolean): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            TheDb.db.run(`PRAGMA foreign_keys = ${value}`, (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    console.log(`PRAGMA foreign_keys = ${value}`);
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }

    private static getPragmaVersion(): Observable<number> {
        return Observable.create((observer: Observer<number>) => {
            TheDb.db.get('PRAGMA user_version', (err, row) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(Number(row['user_version']));
                    observer.complete();
                }
            });
        });
    }

    private static setPragmaVersion(): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            TheDb.db.run(`PRAGMA user_version = ${TheDb.version}`, (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    console.log(`PRAGMA version = ${TheDb.version}`);
                    observer.next(undefined);
                    observer.complete();
                }
            });
        });
    }
}
