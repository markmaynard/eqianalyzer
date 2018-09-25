import { Injectable } from '@angular/core';
import { isNumber } from 'util';

@Injectable({
    providedIn: 'root'
  })
export class AssesmentQueryBuilder {
    POSSIBLE_FILTER_OPTIONS: FilterOption[] = [
    // {fieldName: "date", fieldType: FieldType.Date},
    {fieldName: 'inconsistencyIndex', fieldType: FieldType.Number},
    {fieldName: "positiveImpression", fieldType: FieldType.Number},
    {fieldName: "negativeImpression", fieldType: FieldType.Number},
    {fieldName: "item133Response", fieldType: FieldType.Number},
    {fieldName: "totalEmotionalIntelligence", fieldType: FieldType.Number},
    {fieldName: "selfPerceptionComposite", fieldType: FieldType.Number},
    {fieldName: "selfRegard", fieldType: FieldType.Number},
    {fieldName: "selfActualization", fieldType: FieldType.Number},
    {fieldName: "emotionalSelfAwareness", fieldType: FieldType.Number},
    {fieldName: "selfExpressionComposite", fieldType: FieldType.Number},
    {fieldName: "emotionalExpression", fieldType: FieldType.Number},
    {fieldName: "assertiveness", fieldType: FieldType.Number},
    {fieldName: "independence", fieldType: FieldType.Number},
    {fieldName: "interpersonalComposite", fieldType: FieldType.Number},
    {fieldName: "interpersonalRelationships", fieldType: FieldType.Number},
    {fieldName: "empathy", fieldType: FieldType.Number},
    {fieldName: "socialResponsibility", fieldType: FieldType.Number},
    {fieldName: "decisionMakingComposite", fieldType: FieldType.Number},
    {fieldName: "problemSolving", fieldType: FieldType.Number},
    {fieldName: "realityTesting", fieldType: FieldType.Number},
    {fieldName: "impulseControl", fieldType: FieldType.Number},
    {fieldName: "stressManagementComposite", fieldType: FieldType.Number},
    {fieldName: "flexibility", fieldType: FieldType.Number},
    {fieldName: "stressTolerance", fieldType: FieldType.Number},
    {fieldName: "optimismWellBeingIndicator", fieldType: FieldType.Number}
    ];

    public filters: IFilter[] = [];

    public personIds: number[] = [];

    constructor() {}

    getAvailableFilterOptions(): FilterOption[] {
        return this.POSSIBLE_FILTER_OPTIONS.filter( (option: FilterOption) => {
            return this.filters.filter( ( val: IFilter) => {
                return val.filterOption.fieldName === option.fieldName
            }).length == 0;
        })
    }

    addFilter(filterOption: FilterOption) {
        if(filterOption.fieldType === FieldType.Number) {
            this.filters.push(new NumberFilter(filterOption));
        }
        if(filterOption.fieldType === FieldType.Date) {
            this.filters.push(new DateFilter(filterOption));
        }
    }

    removeFilter(filterOption: FilterOption) {
        this.filters = this.filters.filter( (val: IFilter) => val.filterOption.fieldName !== filterOption.fieldName)
    }

    getFilterQuery(): string {
        let query: string = 'SELECT personId, '

        for(let filter of this.filters) {
            query = query + filter.filterOption.fieldName + ', '
        }
        query = query.slice(0, -2);
        query = query + ' FROM assesment';
        query = query + ' WHERE ';
        if(this.personIds.length > 0) {
            query = query + this.getPersonIdsInWhereClause() + ' AND ';
        }
        for(let filter of this.filters) {
            for(let vstring of filter.getWhereValuesStrings()) {
                query = query + vstring + ' AND '
            }
        }
        query = query.slice(0, -4);

        return query;
    }

    getFilterValues(): {} {
        if(this.filters.length > 0) {
            let values = {};
            let valuesString = '{ ';
            for(let filter of this.filters) {
                for(let value of filter.getWhereValues()) {
                    valuesString = valuesString + value + ', '
                }
            }
            valuesString = valuesString.slice(0, -2);
            valuesString = valuesString + ' }';
            console.log(valuesString);
            values = JSON.parse(valuesString);
            return values;
        }
        return {};
    }

    getPersonIdsInWhereClause(): String {
        let clause = "personId in ("
        for(let id of this.personIds) {
            clause = clause + `${id},`;
        }
        clause = clause.slice(0,-1);
        clause = clause + ')';
        return clause;
    }
}

@Injectable({
    providedIn: 'root'
  })
export class FilterOption {
    fieldName: string;
    fieldType: FieldType
}

export enum FieldType {
    Number,
    String,
    Date
}

export interface IFilter {
    filterOption: FilterOption;
    start?: any;
    stop?: any;
    getWhereClause(): string[];
    getWhereValuesStrings(): string[];
    getWhereValues(): {}[];
}

@Injectable({
    providedIn: 'root'
  })
export class NumberFilter implements IFilter {
    start?: number;
    stop?: number;

    constructor(
        public filterOption: FilterOption,
    ) {
        if (this.filterOption.fieldType !== FieldType.Number) {
            throw new Error(`Class NumberFilter only accepts filterOptions of fieldType Number ${this.filterOption.fieldName}`);
        }
    }

    getWhereClause(): string[] {
        let query: string[] = [];
        if(this.start) {
            query.push(`${this.filterOption.fieldName} >= ${this.start}`);
        }
        if(this.stop) {
            query.push(`${this.filterOption.fieldName} <= ${this.stop}`);
        }
        return query;
    }

    getWhereValuesStrings(): string[] {
        let values: string[] = [];
        if(isNumber(this.start)) {
            values.push(`${this.filterOption.fieldName} >= ${this.start}`);
        }
        if(isNumber(this.stop)) {
            values.push(`${this.filterOption.fieldName} <= ${this.stop}`);
        }
        return values;
    }

    getWhereValues(): string[] {
        let values: string[] = [];
        if(this.start) {
            values.push(`"T${this.filterOption.fieldName}_start": ${this.start}`);
        }
        if(this.stop) {
            values.push(`"T${this.filterOption.fieldName}_stop": ${this.stop}`);
        }
        return values;
    }

}

@Injectable({
    providedIn: 'root'
  })
export class DateFilter implements IFilter {
    start?: Date;
    stop?: Date;

    constructor(
        public filterOption: FilterOption,
    ) {
        if (this.filterOption.fieldType != FieldType.Date) {
            throw new Error("Class DateFilter only accepts filterOptions of fieldType Date");
        }
    }

    getWhereClause(): string[] {
        let query: string[] = [];
        if(this.start) {
            query.push(`${this.filterOption.fieldName} >= ${this.start}`);
        }
        if(this.stop) {
            query.push(`${this.filterOption.fieldName} <= ${this.stop}`);
        }
        return query;
    }

    getWhereValuesStrings(): string[] {
        let values: string[] = [];
        if(this.start) {
            values.push(`\$${this.filterOption.fieldName}_start`);
        }
        if(this.stop) {
            values.push(`\$${this.filterOption.fieldName}_stop`);
        }
        return values;
    }

    getWhereValues(): string[] {
        let values: string[] = [];
        if(this.start) {
            values.push(`'\$${this.filterOption.fieldName}_start': ${this.start}`);
        }
        if(this.stop) {
            values.push(`'\$${this.filterOption.fieldName}_stop': ${this.stop}`);
        }
        return values;
    }
}
