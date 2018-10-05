import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges, SimpleChange } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { NumberFilter, IFilter } from '../../services/assesment-query-builder.service';
import { isNumber } from 'util';
import { Person } from '../../entity/person.entity';

@Component({
    selector: 'subject-select-prompt',
    templateUrl: 'subject-select-prompt.component.html',
})
export class SubjectSelectPromptComponent implements OnChanges {
    
    @Input("subjects")
    public subjects: Person[];

    public subjectOptions: {
        label: string,
        value: number
    }[] = [];

    @Output() personSelected: EventEmitter<Person> = new EventEmitter();

    subjectForm = new FormGroup({
        subjectSelect: new FormControl(''),
      });

    private selectedPerson: Person;

    constructor(
    ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.subjects.currentValue) { 
            this.subjects = changes.subjects.currentValue;
            this.buildSelect();
        }
      }

    buildSelect() {
        this.subjectOptions = this.subjects.map( (p: Person, i: number) => {
            let dob = `${p.dateOfBirth.getMonth()}-${p.dateOfBirth.getDate()}-${p.dateOfBirth.getFullYear()}`;
            return {
                label: `${p.firstName} ${p.lastName} - ${dob}`,
                value: i
            }
        })
        let selectChanged = this.subjectForm.get('start')
        if (selectChanged) {
            selectChanged.valueChanges.subscribe( (val: number) => {
            this.selectedPerson = this.subjects[val];
          });
        }
    }

    onSubjectSelected() {
        this.personSelected.emit(this.selectedPerson);
    }
}