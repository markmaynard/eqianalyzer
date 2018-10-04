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
            $dateOfBirth: dob.toUTCString()
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

    public static getByFirstNameLastName(firstName: string, lastName: string): Observable<Person[]> {
        const sql = 'SELECT * FROM person WHERE firstName = $firstName AND lastName = $lastName';
        const values = { 
            $firstName: firstName,
            $lastName:  lastName
        };

        return TheDb.selectAll(sql, values)
            .pipe(
                map((rows) => {
                    if (rows) {
                        const people: Person[] = [];
                    for (const row of rows) {
                        const person = new Person().fromRow(row);
                        people.push(person);
                    }
                    return people;
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
                    const people: Person[] = [];
                    for (const row of rows) {
                        const person = new Person().fromRow(row);
                        people.push(person);
                    }
                    return people;
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
            $dateOfBirth: this.dateOfBirth.toUTCString(),
            $clergyStatus: this.clergyStatus,
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

    public static fromCSVImportRow(data: object): Observable<Person> {
        let row = data[0];
        let personImportError = new PersonImportError();
        try {
            let firstName = this.processField(row['firstName'],'firstName',personImportError);
            let lastName = this.processField(row['lastName'],'lastName',personImportError);
            console.log(row['dateOfBirth']);
            let dateOfBirth: Date;
            if ( row.data[0]['dateOfBirth'] ) {
                try{
                    dateOfBirth = new Date(row.data[0]['dateOfBirth']);
                } catch (e) {
                    personImportError.errorMsgs.push(`Error processing field: dateOfBirth - ${e}`);
                }
            } else {
                personImportError.errorMsgs.push('Error missing field: dateOfBirth');
            }
            let clergyStatus: ClergyStatus;
            try {
                if (row['clergyStatus']) {
                    clergyStatus = (<string>row['clergyStatus']) as ClergyStatus;
                } else {
                    personImportError.errorMsgs.push('Error missing field: clergyStatus');                    
                }
            } catch (e) {
                personImportError.errorMsgs.push('Error processing field: clergyStatus');                    
            }
            let district = this.processField(row['district'],'district',personImportError);
            return Person.getByFirstNameLastNameAndDOB(row['firstName'], row['lastName'], row.data[0]['dateOfBirth'])
                .pipe(
                    catchError(error => {
                        let p: Person = new Person();
                        p.firstName = firstName;
                        p.lastName = lastName;
                        p.dateOfBirth = dateOfBirth;
                        p.clergyStatus = clergyStatus;
                        p.district = district;
                        return p.insert().pipe( map(r => p));
                    })
                )
            } catch (e) {
                console.log(e);
                throw personImportError
            }
    }

    private static processField(field: number, fieldName: string, assementImportError: PersonImportError): any {
        if ( field ) {
            try{
                return field;
            } catch (e) {
                assementImportError.errorMsgs.push(`Error processing field: ${fieldName} - ${e}`);
            }
        } else {
            assementImportError.errorMsgs.push(`Error missing field: ${fieldName}`);
        }
        throw(new Error(`Import failed: ${fieldName}`));
    }
}


export class PersonImportError {
    errorMsgs: string[] = [];
}