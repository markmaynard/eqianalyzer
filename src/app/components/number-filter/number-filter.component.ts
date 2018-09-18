import { Component, OnInit, NgZone } from '@angular/core';

import { NumberFilter } from '../../services/assesment-query-builder.service';

@Component({
    selector: 'num-filter',
    templateUrl: 'number-filter.component.html',
})
export class NumberFilterComponent implements OnInit {
    constructor(
        public filter: NumberFilter
    ) {}

    ngOnInit() {}
}