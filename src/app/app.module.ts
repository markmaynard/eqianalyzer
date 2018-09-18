import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router'
import { MenubarModule } from 'primeng/primeng';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MenubarModule,
        RouterModule
    ],
    declarations: [
        AppComponent,
    ],
    providers: [
    ],
    bootstrap: [
        AppComponent
    ],
})

export class AppModule {
}
