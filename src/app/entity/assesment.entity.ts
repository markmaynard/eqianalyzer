import { Person } from './person.entity';
import { TheDb } from '../model/thedb';
import { Observable, EMPTY, forkJoin, Observer} from'rxjs'
import { map, flatMap, catchError } from 'rxjs/operators';
import { ParseResult } from 'papaparse';

export class Assesment {

    id: number;
    date: Date;
    personId: Number;
    inconsistencyIndex: Number;
    positiveImpression: Number;
    negativeImpression: Number;
    item133Response: Number;
    totalEmotionalIntelligence: Number;
    selfPerceptionComposite: Number;
    selfRegard: Number;
    selfActualization: Number;
    emotionalSelfAwareness: Number;
    selfExpressionComposite: Number;
    emotionalExpression: Number;
    assertiveness: Number;
    independence: Number;
    interpersonalComposite: Number;
    interpersonalRelationships: Number;
    empathy: Number;
    socialResponsibility: Number;
    decisionMakingComposite: Number;
    problemSolving: Number;
    realityTesting: Number;
    impulseControl: Number;
    stressManagementComposite: Number;
    flexibility: Number;
    stressTolerance: Number;
    optimism: Number
    wellBeingIndicator: Number;

    public static get(id: number): Observable<Assesment> {
        const sql = 'SELECT * FROM assesment WHERE id = $id';
        const values = { $id: id };

        return TheDb.selectOne(sql, values)
            .pipe(
                map((row: any) => {
                    if (row) {
                        return new Assesment().fromRow(row);
                    } else {
                        throw new Error('Expected to find 1 Assesment. Found 0.');
                    }
                }
            )
        );
    }

    public static getAllByPerson(person: Person): Observable<Assesment[]> {
        const sql = 'SELECT * FROM assesment WHERE personId = $id';
        const values = { $id: person.id };

        return TheDb.selectAll(sql, values)
            .pipe(
                map((rows: any[]) => {
                    const assesmentes: Assesment[] = [];
                    for (const row of rows) {
                        const assesment = new Assesment().fromRow(row);
                        assesmentes.push(assesment);
                    }
                    return assesmentes;
                })
            );
    }

    public static getAllInRange(d1: Date, d2: Date): Observable<Assesment[]> {
        const sql = 'SELECT * FROM assesment WHERE date BETWEEN $d1 AND $d2 ORDER BY date';
        const values = { 
            $d1: d1,
            $d2: d2
        };

        return TheDb.selectAll(sql, values)
            .pipe(
                map((rows) => {
                const assesmentes: Assesment[] = [];
                for (const row of rows) {
                    const assesment = new Assesment().fromRow(row);
                    assesmentes.push(assesment);
                }
                return assesmentes;
                })
            );
    }

    public static getAllInRangeForPerson(d1: Date, d2: Date, person: Person): Observable<Assesment[]> {
        const sql = 'SELECT * FROM assesment WHERE date BETWEEN $d1 AND $d2 AND personId = $person';
        const values = { 
            $d1: d1,
            $d2: d2,
            $person: person.id
        };

        return TheDb.selectAll(sql, values)
            .pipe(
                map((rows) => {
                    const assesmentes: Assesment[] = [];
                    for (const row of rows) {
                        const assesment = new Assesment().fromRow(row);
                        assesmentes.push(assesment);
                    }
                    return assesmentes;
                })
            );
    }

    public static getAll(): Observable<Assesment[]> {
        const sql = `SELECT * FROM assesment ORDER BY date`;
        const values = {};

        return TheDb.selectAll(sql, values)
            .pipe(
                map((rows) => {
                const assesmentes: Assesment[] = [];
                for (const row of rows) {
                    const assesment = new Assesment().fromRow(row);
                    assesmentes.push(assesment);
                }
                return assesmentes;
                })
            );
    }

    public insert(): Observable<void> {
        const sql = `
            INSERT INTO assesment (
                date,
                personId,
                inconsistencyIndex,
                positiveImpression,
                negativeImpression,
                item133Response,
                totalEmotionalIntelligence,
                selfPerceptionComposite,
                selfRegard,
                selfActualization,
                emotionalSelfAwareness,
                selfExpressionComposite,
                emotionalExpression,
                assertiveness,
                independence,
                interpersonalComposite,
                interpersonalRelationships,
                empathy,
                socialResponsibility,
                decisionMakingComposite,
                problemSolving,
                realityTesting,
                impulseControl,
                stressManagementComposite,
                flexibility,
                stressTolerance,
                optimism,
                wellBeingIndicator)
            VALUES(
                $date,
                $personId,
                $inconsistencyIndex,
                $positiveImpression,
                $negativeImpression,
                $item133Response,
                $totalEmotionalIntelligence,
                $selfPerceptionComposite,
                $selfRegard,
                $selfActualization,
                $emotionalSelfAwareness,
                $selfExpressionComposite,
                $emotionalExpression,
                $assertiveness,
                $independence,
                $interpersonalComposite,
                $interpersonalRelationships,
                $empathy,
                $socialResponsibility,
                $decisionMakingComposite,
                $problemSolving,
                $realityTesting,
                $impulseControl,
                $stressManagementComposite,
                $flexibility,
                $stressTolerance,
                $optimism,
                $wellBeingIndicator
            )`;

        const values = {
            $date: this.date,
            $personId: this.personId,
            $inconsistencyIndex: this.inconsistencyIndex,
            $positiveImpression: this.positiveImpression,
            $negativeImpression: this.negativeImpression,
            $item133Response: this.item133Response,
            $totalEmotionalIntelligence: this.totalEmotionalIntelligence,
            $selfPerceptionComposite: this.selfPerceptionComposite,
            $selfRegard: this.selfRegard,
            $selfActualization: this.selfActualization,
            $emotionalSelfAwareness: this.emotionalSelfAwareness,
            $selfExpressionComposite: this.selfExpressionComposite,
            $emotionalExpression: this.emotionalExpression,
            $assertiveness: this.assertiveness,
            $independence: this.independence,
            $interpersonalComposite: this.interpersonalComposite,
            $interpersonalRelationships: this.interpersonalRelationships,
            $empathy: this.empathy,
            $socialResponsibility: this.socialResponsibility,
            $decisionMakingComposite: this.decisionMakingComposite,
            $problemSolving: this.problemSolving,
            $realityTesting: this.realityTesting,
            $impulseControl: this.impulseControl,
            $stressManagementComposite: this.stressManagementComposite,
            $flexibility: this.flexibility,
            $stressTolerance: this.stressTolerance,
            $optimism: this.optimism,
            $wellBeingIndicator: this.wellBeingIndicator
        };

        return TheDb.insert(sql, values)
            .pipe(
                map((result) => {
                    if (result.changes !== 1) {
                        throw new Error(`Expected 1 Assesment to be inserted. Was ${result.changes}`);
                    } else {
                        this.id = result.lastID;
                    }
                })
            );
    }

    public update(): Observable<void> {
        const sql = `
            UPDATE assesment
                SET date = $date
                SET personId = $personId
                SET inconsistencyIndex = $inconsistencyIndex
                SET positiveImpression = $positiveImpression
                SET negativeImpression = $negativeImpression
                SET item133Response = $item133Response
                SET totalEmotionalIntelligence = $totalEmotionalIntelligence
                SET selfPerceptionComposite = $selfPerceptionComposite
                SET selfRegard = $selfRegard
                SET selfActualization = $selfActualization
                SET emotionalSelfAwareness = $emotionalSelfAwareness
                SET selfExpressionComposite = $selfExpressionComposite
                SET emotionalExpression = $emotionalExpression
                SET assertiveness = $assertiveness
                SET independence = $independence
                SET interpersonalComposite = $interpersonalComposite
                SET interpersonalRelationships = $interpersonalRelationships
                SET empathy = $empathy
                SET socialResponsibility = $socialResponsibility
                SET decisionMakingComposite = $decisionMakingComposite
                SET problemSolving = $problemSolving
                SET realityTesting = $realityTesting
                SET impulseControl = $impulseControl
                SET stressManagementComposite = $stressManagementComposite
                SET flexibility = $flexibility
                SET stressTolerance = $stressTolerance
                SET optimism = $optimism
                SET wellBeingIndicator = $wellBeingIndicator)
            VALUES(
                $date,
                $personId,
                $inconsistencyIndex,
                $positiveImpression,
                $negativeImpression,
                $item133Response,
                $totalEmotionalIntelligence,
                $selfPerceptionComposite,
                $selfRegard,
                $selfActualization,
                $emotionalSelfAwareness,
                $selfExpressionComposite,
                $emotionalExpression,
                $assertiveness,
                $independence,
                $interpersonalComposite,
                $interpersonalRelationships,
                $empathy,
                $socialResponsibility,
                $decisionMakingComposite,
                $problemSolving,
                $realityTesting,
                $impulseControl,
                $stressManagementComposite,
                $flexibility,
                $stressTolerance,
                $optimism,
                $wellBeingIndicator
            )`;

        const values = {
            $date: this.date,
            $personId: this.personId,
            $inconsistencyIndex: this.inconsistencyIndex,
            $positiveImpression: this.positiveImpression,
            $negativeImpression: this.negativeImpression,
            $item133Response: this.item133Response,
            $totalEmotionalIntelligence: this.totalEmotionalIntelligence,
            $selfPerceptionComposite: this.selfPerceptionComposite,
            $selfRegard: this.selfRegard,
            $selfActualization: this.selfActualization,
            $emotionalSelfAwareness: this.emotionalSelfAwareness,
            $selfExpressionComposite: this.selfExpressionComposite,
            $emotionalExpression: this.emotionalExpression,
            $assertiveness: this.assertiveness,
            $independence: this.independence,
            $interpersonalComposite: this.interpersonalComposite,
            $interpersonalRelationships: this.interpersonalRelationships,
            $empathy: this.empathy,
            $socialResponsibility: this.socialResponsibility,
            $decisionMakingComposite: this.decisionMakingComposite,
            $problemSolving: this.problemSolving,
            $realityTesting: this.realityTesting,
            $impulseControl: this.impulseControl,
            $stressManagementComposite: this.stressManagementComposite,
            $flexibility: this.flexibility,
            $stressTolerance: this.stressTolerance,
            $optimism: this.optimism,
            $wellBeingIndicator: this.wellBeingIndicator
        };

        return TheDb.update(sql, values)
            .pipe(
                    map((result: any) => {
                    if (result.changes !== 1) {
                        throw new Error(`Expected 1 Assesment to be updated. Was ${result.changes}`);
                    }
                })
            );
    }

    public delete(): Observable<void> {
        const sql = `
            DELETE FROM assesment WHERE id = $id`;

        const values = {
            $id: this.id,
        };

        return TheDb.delete(sql, values)
            .pipe(
                    map((result) => {
                    if (result.changes !== 1) {
                        throw new Error(`Expected 1 Assesment to be deleted. Was ${result.changes}`);
                    }
                })
        );
    }

    public fromRow(row: object): Assesment {
        this.id = row['id'];
        this.personId = row['personId'];
        this.date = row['date'];
        this.inconsistencyIndex = row['inconsistencyIndex'];
        this.positiveImpression = row['positiveImpression'];
        this.negativeImpression = row['negativeImpression'];
        this.item133Response = row['item133Response'];
        this.totalEmotionalIntelligence = row['totalEmotionalIntelligence'];
        this.selfPerceptionComposite = row['selfPerceptionComposite'];
        this.selfRegard = row['selfRegard'];
        this.selfActualization = row['selfActualization'];
        this.emotionalSelfAwareness = row['emotionalSelfAwareness'];
        this.selfExpressionComposite = row['selfExpressionComposite'];
        this.emotionalExpression = row['emotionalExpression'];
        this.assertiveness = row['assertiveness'];
        this.independence = row['independence'];
        this.interpersonalComposite = row['interpersonalComposite'];
        this.interpersonalRelationships = row['interpersonalRelationships'];
        this.empathy = row['empathy'];
        this.socialResponsibility = row['socialResponsibility'];
        this.decisionMakingComposite = row['decisionMakingComposite'];
        this.problemSolving = row['problemSolving'];
        this.realityTesting = row['realityTesting'];
        this.impulseControl = row['impulseControl'];
        this.stressManagementComposite = row['stressManagementComposite'];
        this.flexibility = row['flexibility'];
        this.stressTolerance = row['stressTolerance'];
        this.optimism = row['optimism'];
        this.wellBeingIndicator = row['wellBeingIndicator'];
        return this;
    }

    public static fromCSVImportRow(row: ParseResult, personId: Number): Observable<Assesment> {
        let assesment: Assesment = new Assesment();
        let assementImportError = new AssementImportError();
        assesment.personId = personId;
        try {
            if ( row.data[0]['Date Assessed'] ) {
                try{
                    assesment.date = new Date(row.data[0]['Date Assessed']);
                } catch (e) {
                    assementImportError.errorMsgs.push(`Error processing field: Date Assessed - ${e}`);
                }
            } else {
                assementImportError.errorMsgs.push('Error missing field: Date Assessed');
            }
            
            assesment.inconsistencyIndex = this.processNumField(row.data[0]['Incosis'],'Incosis',assementImportError);
            assesment.positiveImpression = this.processNumField(row.data[0]['Positive'],'Positive',assementImportError);
            assesment.negativeImpression = this.processNumField(row.data[0]['Negative'],'Negative',assementImportError);
            assesment.item133Response = this.processNumField(row.data[0]['Item 133'],'Item 133',assementImportError);
            assesment.totalEmotionalIntelligence = this.processNumField(row.data[0]['Total EI'],'Total EI',assementImportError);
            assesment.selfPerceptionComposite = this.processNumField(row.data[0]['SP Comp'],'SP Comp',assementImportError);
            assesment.selfRegard = this.processNumField(row.data[0]['SR'],'SR',assementImportError);
            assesment.selfActualization = this.processNumField(row.data[0]['SA'],'SA',assementImportError);
            assesment.emotionalSelfAwareness = this.processNumField(row.data[0]['ESA'],'ESA',assementImportError);
            assesment.selfExpressionComposite = this.processNumField(row.data[0]['SE Comp'],'SE Comp',assementImportError);
            assesment.emotionalExpression = this.processNumField(row.data[0]['EE'],'EE',assementImportError);
            assesment.assertiveness = this.processNumField(row.data[0]['A'],'A',assementImportError);
            assesment.independence = this.processNumField(row.data[0]['I'],'I',assementImportError);
            assesment.interpersonalComposite = this.processNumField(row.data[0]['IN Comp'],'IN Comp',assementImportError);
            assesment.interpersonalRelationships = this.processNumField(row.data[0]['IR'],'IR',assementImportError);
            assesment.empathy = this.processNumField(row.data[0]['E'],'E',assementImportError);
            assesment.socialResponsibility = this.processNumField(row.data[0]['SocRes'],'SocRes',assementImportError);
            assesment.decisionMakingComposite = this.processNumField(row.data[0]['DM Comp'],'DM Comp',assementImportError);
            assesment.problemSolving = this.processNumField(row.data[0]['PS'],'PS',assementImportError);
            assesment.realityTesting = this.processNumField(row.data[0]['RT'],'RT',assementImportError);
            assesment.impulseControl = this.processNumField(row.data[0]['IC'],'IC',assementImportError);
            assesment.stressManagementComposite = this.processNumField(row.data[0]['SM Comp'],'SM Comp',assementImportError);
            assesment.flexibility = this.processNumField(row.data[0]['F'],'F',assementImportError);
            assesment.stressTolerance = this.processNumField(row.data[0]['ST'],'ST',assementImportError);;
            assesment.optimism = this.processNumField(row.data[0]['O'],'O',assementImportError);
            assesment.wellBeingIndicator = this.processNumField(row.data[0]['WellBeing'],'WellBeing',assementImportError);
        } catch (e) {
            console.log(e);
            throw assementImportError;
        }
        console.log('Assesment:');
        console.log(assesment);
        return assesment.insert().pipe(map(()=>assesment));
    }

    private static processNumField(field: number, fieldName: string, assementImportError: AssementImportError): number {
        if ( field !== undefined ) {
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

export class AssementImportError {
    errorMsgs: string[] = [];
}