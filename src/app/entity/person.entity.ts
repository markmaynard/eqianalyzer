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

    gender: string;

    assesments: Assesment[];

    columns: String[] = [
        'id',
        'firstName',
        'lastName',
        'dateOfBirth',
        'clergyStatus',
        'district',
        'gender'
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
            INSERT INTO person (firstName, lastName, dateOfBirth, clergyStatus, district, gender)
            VALUES($firstName, $lastName, $dateOfBirth, $clergyStatus, $district, $gender)`;

        const values = {
            $firstName: this.firstName,
            $lastName: this.lastName,
            $dateOfBirth: this.dateOfBirth.toUTCString(),
            $clergyStatus: this.clergyStatus,
            $district: this.district,
            $gender: this.gender
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
            SET gender = $gender
            WHERE id = $id`;

        const values = {
            $id: this.id,
            $firstName: this.firstName,
            $lastName: this.lastName,
            $dateOfBirth: this.dateOfBirth,
            $clergyStatus: this.clergyStatus,
            $district: this.district,
            $gender: this.gender
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
        this.gender = row['gender'];
        return this;
    }

    public static fromCSVImportRow(data: object): Observable<Person> {
        let row = data[0];
        let personImportError = new PersonImportError();
        try {
            let firstName: string;
            let lastName: string;
            if (row['Name']) {
                let fullName: string = row['Name'];
                let restOfName: string[];
                [firstName, ...restOfName] = fullName.split(' ');
                lastName = restOfName.join(' ');
            } else {
                firstName = this.processField(row['firstName'],'firstName',personImportError);
                lastName = this.processField(row['lastName'],'lastName',personImportError);
            }
            console.log(row['DoB']);
            let dateOfBirth: Date = new Date();
            if ( row['DoB'] ) {
                try{
                    dateOfBirth = new Date(row['DoB']);
                } catch (e) {
                    personImportError.errorMsgs.push(`Error processing field: DoB - ${e}, Desired format: YYYY-MM-DD`);
                }
            } else {
                personImportError.errorMsgs.push('Error missing field: DoB');
            }
            let clergyStatus: ClergyStatus;
            try {
                if (row['Status']) {
                    switch (row['Status']) {
                        case 'FE': {
                            clergyStatus = ClergyStatus.Full_Elder;
                            break;
                        }
                        case 'FD': {
                            clergyStatus = ClergyStatus.Full_Deacon;
                            break;
                        }
                        case 'PE': {
                            clergyStatus = ClergyStatus.Provisional_Elder;
                            break;
                        }
                        case 'PD': {
                            clergyStatus = ClergyStatus.Provisional_Deacon;
                            break;
                        }
                        case 'FL': {
                            clergyStatus = ClergyStatus.Full_Time_Local_Pastor;
                            break;
                        }
                        case 'PL': {
                            clergyStatus = ClergyStatus.Part_Time_Local_Pastor;
                            break;
                        }
                        case 'AM': {
                            clergyStatus = ClergyStatus.Associate_Member;
                            break;
                        }
                        case 'LP': {
                            clergyStatus = ClergyStatus.Lay_Person;
                            break;
                        }
                        case 'RFE': {
                            clergyStatus = ClergyStatus.Retired_Full_Elder;
                            break;
                        }
                        case 'RFD': {
                            clergyStatus = ClergyStatus.Retired_Full_Deacon;
                            break;
                        }
                        case 'RPE': {
                            clergyStatus = ClergyStatus.Retired_Provisional_Elder;
                            break;
                        }
                        case 'RPD': {
                            clergyStatus = ClergyStatus.Retired_Provisional_Deacon;
                            break;
                        }
                        case 'RFL': {
                            clergyStatus = ClergyStatus.Retired_Full_Time_Local_Pastor;
                            break;
                        }
                        case 'RPL': {
                            clergyStatus = ClergyStatus.Retired_Part_Time_Local_Pastor;
                            break;
                        }
                        case 'RAM': {
                            clergyStatus = ClergyStatus.Retired_Associate_Member;
                            break;
                        }
                        default: {
                            personImportError.errorMsgs.push(`Error invaid choice field: clergyStatus, value: ${row['Status']}`);                    
                        }
                    }
                } else {
                    personImportError.errorMsgs.push('Error missing field: Status');                    
                }
            } catch (e) {
                personImportError.errorMsgs.push('Error processing field: clergyStatus');                    
            }
            let district = this.processField(row['District'],'District',personImportError);
            let gender = this.processField(row['Gender'],'Gender',personImportError);
            if (undefined !== dateOfBirth) {
                return Person.getByFirstNameLastNameAndDOB(firstName, lastName, dateOfBirth)
                    .pipe(
                        catchError(error => {
                            let p: Person = new Person();
                            p.firstName = firstName;
                            p.lastName = lastName;
                            p.dateOfBirth = dateOfBirth;
                            p.clergyStatus = clergyStatus;
                            p.district = district;
                            p.gender = gender;
                            return p.insert().pipe( map(r => p));
                        })
                    )
            } else {
                personImportError.errorMsgs.push('Error processing field: DoB'); 
                throw personImportError
            }
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