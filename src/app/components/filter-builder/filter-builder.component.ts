import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NumberFilter, AssesmentQueryBuilder, FilterOption, IFilter, FieldType, DateFilter } from '../../services/assesment-query-builder.service';
import { Person } from '../../entity/person.entity';
import { MessageService } from 'primeng/api';
@Component({
    selector: 'filter-builder',
    templateUrl: 'filter-builder.component.html',
})
export class FilterBuilderComponent implements OnInit {

    fieldType = FieldType;
    filters: IFilter[] = [];
    query: String;
    values: {};
    people: Person[] = [];
    submitted: Boolean = false;
    personForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
      });

    constructor(private assesmentQueryBuilder: AssesmentQueryBuilder) {}

    ngOnInit() {
        let filterOptions: FilterOption[] = this.assesmentQueryBuilder.getAvailableFilterOptions();
        for (let filterOption of filterOptions) {
            if (filterOption.fieldType === FieldType.Number) {
                console.log(`pushing ${filterOption.fieldName}`)
                this.filters.push(new NumberFilter(filterOption))
            } else if (filterOption.fieldType === FieldType.Date) {
                this.filters.push(new DateFilter(filterOption))                
            }   else if (filterOption.fieldType === FieldType.String) {
                throw new Error("Not Implemented");
            }
        }
        console.log('oooooo');
        console.log(this.filters);
    }

    onSubmit(value: string) {
        console.log(value);
        this.submitted = false;
        let firstName = this.personForm.get("firstName");
        let lastName = this.personForm.get("lastName");
        if (firstName && lastName) {
            Person.getByFirstNameLastName(firstName.value, lastName.value).subscribe( (peeps: Person[]) => {
                console.log(peeps);
                this.people = peeps;
            });
        }
    }

    deleteFilter(event: any) {
        this.filters = this.filters.filter(val => val.filterOption.fieldName !== event.filterOption.fieldName)
    }
    
    buildQuery() {
        this.assesmentQueryBuilder.filters = this.filters;
        this.query = this.assesmentQueryBuilder.getFilterQuery();
        this.values = this.assesmentQueryBuilder.getFilterValues();
        console.log(this.values);
    }
}