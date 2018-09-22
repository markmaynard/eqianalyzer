import { Component, OnInit, NgZone } from '@angular/core';

import { NumberFilter, AssesmentQueryBuilder, FilterOption, IFilter, FieldType, DateFilter } from '../../services/assesment-query-builder.service';

@Component({
    selector: 'filter-builder',
    templateUrl: 'filter-builder.component.html',
})
export class FilterBuilderComponent implements OnInit {

    fieldType = FieldType;
    filters: IFilter[] = [];
    query: String;
    values: {};

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