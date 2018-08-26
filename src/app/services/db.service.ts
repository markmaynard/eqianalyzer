import { Injectable } from '@angular/core';
import {createConnection, Connection} from 'typeorm';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  dbLoaded = true;

  constructor() { }

  //tslint:disable-next-line
  loadDB(path: string): Observable<Connection> {
    return from(
      createConnection(
        {
          type: 'sqlite',
          database: path,
          entities: [
            'src/entity/*.ts'
          ],
          migrations: [
            'src/migration/*.ts'
          ]
        }
      )
    )
  }

}
/*
{
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "test",
  password: "test",
  database: "test",
}*/
