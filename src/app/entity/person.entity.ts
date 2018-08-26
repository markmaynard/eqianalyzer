import { Assesment } from './assesment.entity';
import { ClergyStatus } from './clergystatus.enum';
import { TheDb } from '../model/thedb'
import { Observable, EMPTY, forkJoin, Observer} from'rxjs'
import { map, flatMap, catchError } from 'rxjs/operators';

export class Person {

    id: number;

    firstName: string;

    lastName: string;

    dateOfBirth: Date;

    clergyStatus: ClergyStatus;

    district: string;

    assesments: Assesment[];

    columns: String[] = [
        'id',
        'firstName',
        'lastName',
        'dateOfBirth',
        'clergyStatus',
        'district'
    ]

    public static get(id: number): Observable<Person> {
        const sql = 'SELECT * FROM person WHERE id = $id';
        const values = { $id: id };

        return TheDb.selectOne(sql, values)
            .pipe(
                map((row: any) => {
                    if (row) {
                        return new Person().fromRow(row);
                    } else {
                        throw new Error('Expected to find 1 Person. Found 0.');
                    }
                })
            );
    }

    public static getByFirstNameLastNameAndDOB(firstName: string, lastName: string, dob: Date): Observable<Person> {
        const sql = 'SELECT * FROM person WHERE firstName = $firstName AND lastName = $lastName AND dateOfBirth = $dateOfBirth';
        const values = { 
            $firstName: firstName,
            $lastName:  lastName,
            $dateOfBirth: dob.toISOString()
        };

        return TheDb.selectOne(sql, values)
            .pipe(
                map((row) => {
                    if (row) {
                        return new Person().fromRow(row);
                    } else {
                        throw new Error('Expected to find 1 Person. Found 0.');
                    }
                })
            );
    }

    public static getAll(): Observable<Person[]> {
        const sql = `SELECT * FROM person ORDER BY lastName, firstName`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .pipe(
                map((rows) => {
                    const persones: Person[] = [];
                    for (const row of rows) {
                        const person = new Person().fromRow(row);
                        persones.push(person);
                    }
                    return persones;
                })
            );
    }

    public insert(): Observable<void> {
        const sql = `
            INSERT INTO person (firstName, lastName, dateOfBirth, clergyStatus, district)
            VALUES($firstName, $lastName, $dateOfBirth, $clergyStatus, $district)`;

        const values = {
            $firstName: this.firstName,
            $lastName: this.lastName,
            $dateOfBirth: this.dateOfBirth,
            $clergyStatus: ClergyStatus[this.clergyStatus],
            $district: this.district
        };

        return TheDb.insert(sql, values)
            .pipe(
                map((result) => {
                    if (result.changes !== 1) {
                        throw new Error(`Expected 1 Person to be inserted. Was ${result.changes}`);
                    } else {
                        this.id = result.lastID;
                    }
                })
            );
    }

    public update(): Observable<void> {
        const sql = `
            UPDATE person
            SET firstName = $firstName
            SET lastName = $lastName
            SET dateOfBirth = $dateOfBirth
            SET clergyStatus = $clergyStatus
            SET district = $district
            WHERE id = $id`;

        const values = {
            $id: this.id,
            $firstName: this.firstName,
            $lastName: this.lastName,
            $dateOfBirth: this.dateOfBirth,
            $clergyStatus: this.clergyStatus,
            $district: this.district
        };

        return TheDb.update(sql, values)
            .pipe(
                map((result) => {
                    if (result.changes !== 1) {
                        throw new Error(`Expected 1 Person to be updated. Was ${result.changes}`);
                    }
                })
            );
    }

    public delete(): Observable<void> {
        const sql = `
            DELETE FROM person WHERE id = $id`;

        const values = {
            $id: this.id,
        };

        return TheDb.delete(sql, values)
            .pipe(
                map((result) => {
                    if (result.changes !== 1) {
                        throw new Error(`Expected 1 Person to be deleted. Was ${result.changes}`);
                    }
                })
            );
    }

    public fromRow(row: object): Person {
        this.id = row['id'];
        this.firstName = row['firstName'];
        this.lastName = row['lastName'];
        this.dateOfBirth =new Date(row['dateOfBirth']);
        this.clergyStatus = ClergyStatus[<string>row['clergyStatus']];
        this.district = row['district'];
        return this;
    }

    /*public static fromCSVImportRow(row: object): Person {
        this.firstName = row['firstName'];
        this.lastName = row['lastName'];
        this.dateOfBirth =new Date(row['dateOfBirth']);
        this.clergyStatus = ClergyStatus[<string>row['clergyStatus']];
        this.district = row['district'];
        Person.getByFirstNameLastNameAndDOB(row['firstName'], row['lastName'], new Date(row['dateOfBirth'])).pipe( person => person).catch(err => {
            
        })
        return this;
    }*/
}