import { Component, OnInit, NgZone, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as math from 'mathjs';

import { IFilter } from '../../services/assesment-query-builder.service';
import { isNumber } from 'util';

@Component({
    selector: 'query-results',
    templateUrl: 'query-results.component.html',
})
export class QueryResultsComponent implements OnInit, OnChanges{
    
    @Input('filters')
    public filters: IFilter[];

    @Input('queryResults')
    public queryResults: {}[];

    public calculations: {
        filterName: string,
        average: number,
        median: number,
        mode: number[],
        stdev: number
    }[] = [];

    constructor(
        private cdRef: ChangeDetectorRef,
        private zone: NgZone
    ) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.runCalculations();
    }

    runCalculations() {
        console.log('runCalculations');
        let res = this.queryResults;
        this.zone.run( () => {
            for (let filter of this.filters) {
                let arr = res.map(r => r[filter.filterOption.fieldName]);
                this.calculations.push(
                    {
                        filterName: filter.filterOption.fieldName,
                        stdev: math.std(arr),
                        average: math.mean(arr),
                        median: math.median(arr),
                        mode: math.mode(arr),
                    }
                );
                console.log(`${filter.filterOption.fieldName} ${math.std(arr)} ${math.median(arr)} ${math.mean(arr)} ${math.mode(arr)}`);
            }
            this.cdRef.detectChanges();
        });
    }

}