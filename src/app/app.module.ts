import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MenubarModule } from 'primeng/primeng';
import { ButtonModule } from 'primeng/button';
import { MessageModule, KeyFilterModule } from 'primeng/primeng';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AppComponent } from './app.component';
import { FilterBuilderComponent } from './components/filter-builder/filter-builder.component';
import { NumberFilterComponent } from './components/number-filter/number-filter.component';
import { QueryResultsComponent } from './components/query-results/query-results.component'
import { SubjectSelectPromptComponent } from './components/subject-select-prompt/subject-select-prompt'
import { AssesmentQueryBuilder } from './services/assesment-query-builder.service';
import { AssesmentEntryFormComponent } from './components/assesment-entry-form/assesment-entry-form.component';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MenubarModule,
        MessageModule,
        TabViewModule,
        KeyFilterModule,
        ButtonModule,
        DropdownModule,
        CalendarModule,
        CardModule,
        DialogModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        FieldsetModule,
        ProgressSpinnerModule
    ],
    declarations: [
        AppComponent,
        AssesmentEntryFormComponent,
        NumberFilterComponent,
        QueryResultsComponent,
        FilterBuilderComponent,
        SubjectSelectPromptComponent
    ],
    providers: [
        FilterBuilderComponent,
        AssesmentEntryFormComponent,
        NumberFilterComponent,
        QueryResultsComponent,
        AssesmentQueryBuilder,
        SubjectSelectPromptComponent
    ],
    bootstrap: [
        AppComponent
    ],
})

export class AppModule {
}
