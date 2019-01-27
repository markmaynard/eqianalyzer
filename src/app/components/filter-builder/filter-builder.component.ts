import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as math from 'mathjs';

import { NumberFilter, AssesmentQueryBuilder, FilterOption, IFilter, FieldType, DateFilter } from '../../services/assesment-query-builder.service';
import { Person } from '../../entity/person.entity';
import { MessageService } from 'primeng/api';
import { map, flatMap, catchError, distinct } from 'rxjs/operators';
import { TheDb } from '../../model/thedb';
import { ClergyStatus } from '../../entity/clergystatus.enum';
@Component({
    selector: 'filter-builder',
    templateUrl: 'filter-builder.component.html',
})
export class FilterBuilderComponent implements OnInit {

    fieldType = FieldType;
    filters: IFilter[] = [];
    availableFields: FilterOption[] = [];
    availableFieldsSelectOptions: {label: string, value: FilterOption}[] = [];
    query: string;
    queryResults: {}[];
    values: {};
    dobValue: Date;
    assesmentStart: Date;
    assesmentEnd: Date;
    people: Person[] = [];
    submitted: boolean = false;
    showSubjectSelect: boolean = false;
    personForm = new FormGroup({
        name: new FormControl(''),
        gender: new FormControl(''),
        district: new FormControl(''),
        clergyStatus: new FormControl(''),

    });
    
    genders = [
        {label:'All', value:null},
        {label:'M', value:'M'},
        {label:'F', value:'F'}
    ];

    districts: [{label: string, value: null|string}];

    clergyStatuses: [{label: string, value: null|string}] = [{label:'All', value: null}];

    fieldSelectForm = new FormGroup({
        selectedField: new FormControl('', Validators.required)
    })

    constructor(private assesmentQueryBuilder: AssesmentQueryBuilder, private zone: NgZone) {
        this.clergyStatuses.push(...Object.keys(ClergyStatus).map(key => {
            return {label: ''+ClergyStatus[key], value:key }
        }));
    }

    ngOnInit() {
        console.log('Making all call');
        setTimeout(() => {Person.getAll().pipe(
            map((people) => people.map(p => p.district)),
            distinct(),
        ).subscribe((districts) => {
            let dists = districts.map((d) => {
                return {label: d, value: d}
            });
            this.districts = [{label: 'All', value: null}];
            this.districts.push(...dists);
        })}, 3000);
        let filterOptions: FilterOption[] = this.assesmentQueryBuilder.getAvailableFilterOptions();
        this.updateFilterLists();
    }

    addFilter(filterOption: FilterOption) {
        console.log(filterOption)
        if (filterOption) {
            if (filterOption.fieldType === FieldType.Number) {
                console.log(`pushing ${filterOption.fieldName}`)
                this.filters.push(new NumberFilter(filterOption))
            } else if (filterOption.fieldType === FieldType.Date) {
                this.filters.push(new DateFilter(filterOption))                
            }   else if (filterOption.fieldType === FieldType.String) {
                throw new Error("Not Implemented");
            }
            this.updateFilterLists();
            let field = this.fieldSelectForm.get("selectedField");
            if (field) {
                field.setValue(undefined);
            }
        }
    }

    updateFilterLists() {
        this.availableFields = this.assesmentQueryBuilder.getAvailableFilterOptions().filter( (opt: FilterOption) => {
            return this.filters.filter( (filter: IFilter) => opt.fieldName === filter.filterOption.fieldName).length == 0
        })
        this.availableFieldsSelectOptions = this.availableFields.map( v => {
            return {label: v.fieldName, value: v};
        });
    }

    onSubmit(value: string) {
        console.log(value);
        this.submitted = false;
        let name = this.personForm.get("name");
        if (name && name.value && !this.dobValue) {
            Person.getByName(name.value).subscribe( (peeps: Person[]) => {
                if (peeps.length > 1) {
                    this.zone.run(() => {
                        this.showSubjectSelect=true;
                        this.people = peeps;
                    })
                } else {
                    this.zone.run(() => {
                        this.people = peeps;
                        this.assesmentQueryBuilder.subjects = this.people;
                    })
                }
            });
        } else if (name && name.value && this.dobValue) {
            console.log(this.dobValue.getTimezoneOffset())
            let utcDob = new Date(this.dobValue.getTime() - this.dobValue.getTimezoneOffset()*60000);
            console.log(Math.round(utcDob.getTime() / 1000));
            Person.getByNameAndDOB(name.value, utcDob).subscribe( (peep: Person) => {
                console.log(peep);
                this.zone.run(() => {
                    this.people = [peep];
                    this.assesmentQueryBuilder.subjects = this.people;
                })
            });
        } else {
            let utcAssementStart = this.assesmentStart? new Date(this.assesmentStart.getTime() - this.assesmentStart.getTimezoneOffset()*60000) : null;
            let utcAssementEnd = this.assesmentEnd? new Date(this.assesmentEnd.getTime() - this.assesmentEnd.getTimezoneOffset()*60000) : null;
            let district = this.personForm.get("district") ? this.personForm.get("district")!.value : null;
            let gender = this.personForm.get("gender") ? this.personForm.get("gender")!.value : null;
            let clergyStatus = this.personForm.get("clergyStatus") ? this.personForm.get("clergyStatus")!.value : null;
            
            Person.getAllByDistrictGenderClergyStatusAndDateRange(
                district,
                gender,
                clergyStatus,
                utcAssementStart,
                utcAssementEnd
            ).subscribe( (peeps: Person[]) => {
                this.zone.run(() => {
                    this.people = peeps;
                    this.showSubjectSelect=false;
                    this.assesmentQueryBuilder.subjects = this.people;
                    this.buildQuery();
                })
            });
        }
    }

    onPersonSelected(person: Person) {
        this.zone.run(() => {
            this.people = [person];
        })
        this.assesmentQueryBuilder.subjects = this.people;
    }

    deleteFilter(event: any) {
        this.filters = this.filters.filter(val => val.filterOption.fieldName !== event.filterOption.fieldName)
        this.updateFilterLists();
    }
    
    buildQuery() {
        this.assesmentQueryBuilder.filters = this.filters;
        this.query = this.assesmentQueryBuilder.getFilterQuery(
            this.assesmentStart? new Date(this.assesmentStart.getTime() - this.assesmentStart.getTimezoneOffset()*60000) : null,
            this.assesmentEnd? new Date(this.assesmentEnd.getTime() - this.assesmentEnd.getTimezoneOffset()*60000) : null
        );
        // this.values = this.assesmentQueryBuilder.getFilterValues();
        // console.log(this.values);
        TheDb.selectAll(this.query, {}).subscribe(res => {
            this.zone.run(() => {
                console.log("Results:");
                console.log(res);
                this.queryResults = res;
                for (let filter of this.availableFields) {
                    console.log(filter.fieldName);
                    let arr = res.map(r => r[filter.fieldName]);
                    console.log(math.std(arr));
                    console.log(`${filter.fieldName} ${math.std(arr)} ${math.median(arr)} ${math.mean(arr)} ${math.mode(arr)}`);
                }
            });
        });
    }
}