import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, JoinColumn, ManyToOne} from 'typeorm';
import { Person } from './person.entity';

@Entity()
export class Assesment {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Person, person => person.assesments)
    person: Person;

    @Column('double')
    inconsistencyIndex: Number;

    @Column('double')
    positiveImpression: Number;

    @Column('double')
    negativeImpression: Number;

    @Column('double')
    item133Response: Number;

    @Column('double')
    totalEmotionalIntelligence: Number;

    @Column('double')
    selfPerceptionComposite: Number;

    @Column('double')
    selfRegard: Number;

    @Column('double')
    selfActualization: Number;

    @Column('double')
    emotionalSelfAwareness: Number;

    @Column('double')
    selfExpressionComposite: Number;

    @Column('double')
    emotionalExpression: Number;

    @Column('double')
    assertiveness: Number;

    @Column('double')
    independence: Number;

    @Column('double')
    interpersonalComposite: Number;

    @Column('double')
    interpersonalRelationships: Number;

    @Column('double')
    empathy: Number;

    @Column('double')
    socialResponsibility: Number;

    @Column('double')
    decisionMakingComposite: Number;

    @Column('double')
    problemSolving: Number;

    @Column('double')
    realityTesting: Number;

    @Column('double')
    impulseControl: Number;

    @Column('double')
    stressManagementComposite: Number;

    @Column('double')
    flexibility: Number;

    @Column('double')
    stressTolerance: Number;

    @Column('double')
    optimismWellBeingIndicator: Number;

}
