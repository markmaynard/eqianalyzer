import { Component, OnInit, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Person } from '../../entity/person.entity';
import { Assesment } from '../../entity/assesment.entity';
import { ClergyStatus } from '../../entity/clergystatus.enum';

import { NumberFilter, AssesmentQueryBuilder, FilterOption, IFilter, FieldType, DateFilter } from '../../services/assesment-query-builder.service';
import { isNumber } from 'util';

@Component({
    selector: 'assesment-entry-form',
    templateUrl: 'assesment-entry-form.component.html',
})
export class AssesmentEntryFormComponent implements OnInit {

    people: Person[] = [];
    activePerson: Person;
    assesments: Assesment[] = [];
    personForm = new FormGroup({
        name: new FormControl(''),
        dob: new FormControl(''),
        gender: new FormControl('')
      });
    personCreateForm = new FormGroup({
        clergyStatus: new FormControl(''),
        district: new FormControl(''),
      });
    showSubjectSelect = false;
    showSubjectCreate = false;
    showSubjectNoneFound = false;
    dobValue: Date = new Date();
    genders = [
        {label:'All', value:null},
        {label:'M', value:'M'},
        {label:'F', value:'F'}
    ];
    assesmentsOptions: {label:string,value:number}[] = [];
    assesmentsOptionsForm = new FormGroup({
        assesmentsOptionsFormControl: new FormControl('')
    });
    clergyStatus: ClergyStatus;
    clergyStatuses: [{label: string, value: null|string}] = [{label:'All', value: null}];

    district: string;

    constructor(private assesmentQueryBuilder: AssesmentQueryBuilder, private zone: NgZone
    ) {
        console.log("AssesmentEntryFormComponent - constructor")
        this.clergyStatuses.push(...Object.keys(ClergyStatus).map(key => {
            return {label: ''+ClergyStatus[key], value:key }
        }));
    }

    ngOnInit() {
        console.log("AssesmentEntryFormComponent - onInit")
    }

    onSubmit(value: any) {
        console.log(value);
        let name = value.name || this.personForm.get("name");
        let gender = value.gender || (this.personForm.get("gender") || {value:null}).value;
        let dob = (value.dob !== "")?this.dobValue:undefined;
        console.log(`Name: ${name} Gender: ${gender} DOB: ${dob}`)
        if (name && !dob && (!gender || gender === "")) {
            Person.getByName(name).subscribe( (peeps: Person[]) => {
                this.zone.run(() => {
                    this.people = peeps;
                    this.showSubjectSelect = peeps.length != 0;
                    this.showSubjectCreate = peeps.length == 0 && this.canAddNewSubject(value);
                    this.showSubjectNoneFound = peeps.length == 0 && !this.canAddNewSubject(value);
                })
            });
        } else if (name && dob && (!gender || gender === "")) {
            console.log(this.dobValue.getTimezoneOffset())
            let utcDob = new Date(this.dobValue.getTime() - this.dobValue.getTimezoneOffset()*60000);
            console.log(Math.round(utcDob.getTime() / 1000));
            Person.getAllByNameAndDOB(name, utcDob).subscribe( (peeps: Person[]) => {
                console.log(peeps);
                this.zone.run(() => {
                    this.people = peeps;
                    this.assesmentQueryBuilder.subjects = this.people;
                    this.showSubjectSelect = peeps.length != 0;
                    this.showSubjectCreate = peeps.length == 0 && this.canAddNewSubject(value);
                    this.showSubjectNoneFound = peeps.length == 0 && !this.canAddNewSubject(value);
                })
            });
        } else if (name && dob && gender && gender != "") {
            console.log(this.dobValue.getTimezoneOffset())
            let utcDob = new Date(this.dobValue.getTime() - this.dobValue.getTimezoneOffset()*60000);
            console.log(Math.round(utcDob.getTime() / 1000));
            Person.getByNameAndDOBAndGender(name, utcDob, gender).subscribe( (peep: Person) => {
                console.log(peep);
                this.zone.run(() => {
                    this.people = [peep];
                    this.assesmentQueryBuilder.subjects = this.people;
                })
                
            },
            () => {
                this.zone.run(() => {
                    this.showSubjectCreate = this.canAddNewSubject(value);
                    this.showSubjectNoneFound = !this.canAddNewSubject(value);
                });
            });
        }
    }

    canAddNewSubject(value:any): boolean {
        let name = value.name || this.personForm.get("name");
        let gender = value.gender || (this.personForm.get("gender") || {value:null}).value;
        let dob = this.dobValue;
        return name && dob && gender && gender != ""
    }

    onPersonSelected(person: Person) {
        this.zone.run(() => {
            this.showSubjectSelect = false;
            this.activePerson = person;
            Assesment.getAllByPerson(this.activePerson).subscribe( (assesments: Assesment[]) => {
                this.assesments = assesments;
                this.assesmentsOptions = [
                    ...this.assesments.map( (a, i) => {
                        let date = new Date(a.date);
                        return {label:date.toDateString(), value:i}
                    }),
                    {label:"Create New Assement", value: -1}
                ]
            })
        });
        this.assesmentQueryBuilder.subjects = this.people;
    }

    closeSubjectModal() {}

    addSubject() {}
}