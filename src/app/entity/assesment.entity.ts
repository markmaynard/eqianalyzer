import { Person } from './person.entity';
import { TheDb } from '../model/thedb';
import { Observable, EMPTY, forkJoin, Observer} from'rxjs'
import { map, flatMap, catchError } from 'rxjs/operators';

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
    optimismWellBeingIndicator: Number;

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
                optimismWellBeingIndicator)
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
                $optimismWellBeingIndicator
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
            $optimismWellBeingIndicator: this.optimismWellBeingIndicator
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
                SET optimismWellBeingIndicator = $optimismWellBeingIndicator)
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
                $optimismWellBeingIndicator
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
            $optimismWellBeingIndicator: this.optimismWellBeingIndicator
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
        this.optimismWellBeingIndicator = row['optimismWellBeingIndicator'];
        return this;
    }

}
