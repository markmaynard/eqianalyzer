import { Component, OnInit, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { NumberFilter, IFilter } from '../../services/assesment-query-builder.service';
import { isNumber } from 'util';

@Component({
    selector: 'num-filter',
    templateUrl: 'assesment-entry-form.component.html',
})
export class AssesmentEntryFormComponent implements OnInit {

    assesmentForm = new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        dob: new FormControl(''),
        gender: new FormControl('')
      });

    constructor(
    ) {
    }

    ngOnInit() {
    }
}