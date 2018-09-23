import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MenubarModule } from 'primeng/primeng';
import { ButtonModule } from 'primeng/button';
import { MessageModule, KeyFilterModule } from 'primeng/primeng';

import { AppComponent } from './app.component';
import { FilterBuilderComponent } from './components/filter-builder/filter-builder.component';
import { NumberFilterComponent } from './components/number-filter/number-filter.component';
import { AssesmentQueryBuilder } from './services/assesment-query-builder.service';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MenubarModule,
        MessageModule,
        KeyFilterModule,
        ButtonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        AppComponent,
        FilterBuilderComponent,
        NumberFilterComponent
    ],
    providers: [
        FilterBuilderComponent,
        NumberFilterComponent,
        AssesmentQueryBuilder
    ],
    bootstrap: [
        AppComponent
    ],
})

export class AppModule {
}
