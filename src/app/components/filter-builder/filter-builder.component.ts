import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NumberFilter, AssesmentQueryBuilder, FilterOption, IFilter, FieldType, DateFilter } from '../../services/assesment-query-builder.service';
import { Person } from '../../entity/person.entity';
import { MessageService } from 'primeng/api';
import { TheDb } from '../../model/thedb';
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
    values: {};
    dobValue: Date;
    people: Person[] = [];
    submitted: boolean = false;
    personForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required)
    });
    
    fieldSelectForm = new FormGroup({
        selectedField: new FormControl('', Validators.required)
    })

    constructor(private assesmentQueryBuilder: AssesmentQueryBuilder, private zone: NgZone) {}

    ngOnInit() {
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
        let firstName = this.personForm.get("firstName");
        let lastName = this.personForm.get("lastName");
        if (firstName && lastName && !this.dobValue) {
            Person.getByFirstNameLastName(firstName.value, lastName.value).subscribe( (peeps: Person[]) => {
                console.log(peeps);
                this.zone.run(() => {
                    this.people = peeps;
                })
                this.assesmentQueryBuilder.personIds = this.people.map(p => p.id);
            });
        } else if (firstName && lastName && this.dobValue) {
            console.log(this.dobValue.getTimezoneOffset())
            let utcDob = new Date(this.dobValue.getTime() - this.dobValue.getTimezoneOffset()*60000);
            console.log(Math.round(utcDob.getTime() / 1000));
            Person.getByFirstNameLastNameAndDOB(firstName.value, lastName.value, utcDob).subscribe( (peep: Person) => {
                console.log(peep);
                this.zone.run(() => {
                    this.people = [peep];
                })
                this.assesmentQueryBuilder.personIds = this.people.map(p => p.id);
            });
        }
    }

    deleteFilter(event: any) {
        this.filters = this.filters.filter(val => val.filterOption.fieldName !== event.filterOption.fieldName)
        this.updateFilterLists();
    }
    
    buildQuery() {
        this.assesmentQueryBuilder.filters = this.filters;
        this.query = this.assesmentQueryBuilder.getFilterQuery();
        // this.values = this.assesmentQueryBuilder.getFilterValues();
        // console.log(this.values);
        TheDb.selectAll(this.query, {}).subscribe(res => {
            console.log("Results:");
            console.log(res);
        });
    }
}