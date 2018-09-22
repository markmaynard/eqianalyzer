import { Component, OnInit, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { NumberFilter, IFilter } from '../../services/assesment-query-builder.service';
import { isNumber } from 'util';

@Component({
    selector: 'num-filter',
    templateUrl: 'number-filter.component.html',
})
export class NumberFilterComponent implements OnInit {
    
    @Input("numberFilter")
    public filter: NumberFilter

    @Output() deleteFilter: EventEmitter<IFilter> = new EventEmitter();

    rangeForm = new FormGroup({
        start: new FormControl(''),
        stop: new FormControl(''),
      });

    constructor(
    ) {
    }

    ngOnInit() {
        console.log(`NumberFilter: ${this.filter.filterOption.fieldName}`)

        let startChanged = this.rangeForm.get('start')
        if (startChanged) {
            startChanged.valueChanges.subscribe(val => {
            if (isNumber(val)) {
                this.filter.start = val;
            } else {
                this.filter.start = undefined;
            }
          });
        }

        let stopChanged = this.rangeForm.get('stop')
        if (stopChanged) {
            stopChanged.valueChanges.subscribe(val => {
                if (isNumber(val)) {
                    this.filter.stop = val;
                } else {
                    this.filter.stop = undefined;
                }          
            });
        }
    }

    delete() {
        this.deleteFilter.emit(this.filter);
    }
}