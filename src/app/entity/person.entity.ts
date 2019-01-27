import { Assesment } from './assesment.entity';
import { ClergyStatus } from './clergystatus.enum';
import { TheDb } from '../model/thedb'
import { Observable, EMPTY, forkJoin, Observer, zip, of} from'rxjs'
import { map, flatMap, catchError, reduce } from 'rxjs/operators';

export class Person {

    id: number;

    name: string;

    dateOfBirth: Date;

    clergyStatus: ClergyStatus;

    district: string;

    gender: string;

    assesments: Assesment[];

    columns: String[] = [
        'id',
        'name',
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

    public static getByNameAndDOB(name: string, dob: Date): Observable<Person> {
        const sql = 'SELECT * FROM person WHERE name = $name AND dateOfBirth = $dateOfBirth';
        const values = { 
            $name: name,
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

    public static getAllByNameAndDOB(name: string, dob: Date): Observable<Person[]> {
        const sql = 'SELECT * FROM person WHERE name = $name AND dateOfBirth = $dateOfBirth';
        const values = { 
            $name: name,
            $dateOfBirth: dob.toUTCString()
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
                        return []
                    }
                })
            );
    }

    public static getByNameAndGender(name: string, gender: string): Observable<Person> {
        const sql = 'SELECT * FROM person WHERE name = $name AND gender = $gender';
        const values = { 
            $name: name,
            $gender: gender
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

    public static getAllByNameAndGender(name: string, gender: string): Observable<Person[]> {
        const sql = 'SELECT * FROM person WHERE name = $name AND gender = $gender';
        const values = { 
            $name: name,
            $gender: gender
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
                        return []
                    }
                })
            );
    }

    public static getByNameAndDOBAndGender(name: string, dob: Date, gender: string): Observable<Person> {
        const sql = 'SELECT * FROM person WHERE name = $name AND dateOfBirth = $dateOfBirth AND gender = $gender';
        const values = { 
            $name: name,
            $dateOfBirth: dob.toUTCString(),
            $gender: gender
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

    public static getByName(name: string): Observable<Person[]> {
        const sql = 'SELECT * FROM person WHERE name = $name';
        const values = { 
            $name: name
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
                        throw new Error('Expected to find N Person(s). Found 0.');
                    }
                })
            );
    }

    public static getAllByDistrictGenderClergyStatusAndDateRange(
        district: string | null,
        gender: string | null,
        clergyStatus: ClergyStatus | null,
        utcAssementStart: Date | null,
        utcAssementEnd: Date | null
    ): Observable<Person[]> {
        let sql = `SELECT * FROM person WHERE`;
        sql = sql + (district ? ` district = $district AND`: ``);
        sql = sql + (gender ? ` gender = $gender AND`: ``);
        sql = sql + (clergyStatus ? ` clergyStatus = $clergyStatus AND`: ``);
        sql = (district !== null || gender !== null || clergyStatus !== null)? sql.slice(0, -3): sql.slice(0, -6) + ' ORDER BY name';
        const values = {};
        if (district) values['$district'] = district;
        if (gender) values['$gender'] = gender;
        if (clergyStatus) values['$clergyStatus'] = clergyStatus;    

        return TheDb.selectAll(sql, values)
            .pipe(
                map((rows) => {
                    const people: Person[] = [];
                    for (const row of rows) {
                        const person = new Person().fromRow(row);
                        people.push(person);
                    }
                    return people;
                })/*,
                map((people: Person[]) => {
                    let assesments$ = [];
                    for (let person of people) {
                        assesments$.push(Assesment.getAllByPerson(person))
                    }
                    return zip(assesments$).pipe(
                        flatMap((assesments: Assesment[][]) => {
                        for(let i = 0; i < assesments.length; i++) {
                            people[i].assesments = assesments[i]
                        }
                        return people
                        })
                    ).subscribe(people => people)
                }),
                map((people: Person[]) => {
                    return people.filter(p => p.assesments.filter((assesment: Assesment) => {
                        let onOrAfterStart: boolean = utcAssementStart === null || assesment.date >= utcAssementStart;
                        let onOrBeforEnd: boolean = utcAssementEnd === null || assesment.date <= utcAssementEnd
                        return onOrAfterStart && onOrBeforEnd;
                    }).length > 0);
                })*/
            );

    }

    public static getAll(): Observable<Person[]> {
        const sql = `SELECT * FROM person ORDER BY name`;
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
            INSERT INTO person (name, dateOfBirth, clergyStatus, district, gender)
            VALUES($name, $dateOfBirth, $clergyStatus, $district, $gender)`;

        const values = {
            $name: this.name,
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
            SET name = $name
            SET dateOfBirth = $dateOfBirth
            SET clergyStatus = $clergyStatus
            SET district = $district
            SET gender = $gender
            WHERE id = $id`;

        const values = {
            $id: this.id,
            $name: this.name,
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
        this.name = row['name'];
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
            let name: string = this.processField(row['Name'],'name',personImportError);
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
                return Person.getByNameAndDOB(name, dateOfBirth)
                    .pipe(
                        map(r => {
                            let p: Person = new Person().fromRow(r);
                            return p;
                        }),
                        catchError(error => {
                            let p: Person = new Person();
                            p.name = name;
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