import { Component, OnInit, NgZone } from '@angular/core';
import * as fs from 'fs';

// tslint:disable-next-line:no-implicit-dependencies
import { Menu, MenuItemConstructorOptions, OpenDialogOptions, remote } from 'electron';

// import { Hero } from './model/hero';
import { Person } from './entity/person.entity';
import { Assesment } from './entity/assesment.entity'
import { Settings } from './model/settings';
import { TheDb } from './model/thedb';
import { DbService } from './services/db.service'

// Importing style.scss allows webpack to bundle stylesheet with application
import '../assets/sass/style.scss';
import { parse } from 'papaparse';
import { readFileSync } from 'fs';

import { map, flatMap, catchError } from 'rxjs/operators';
import {MenuItem} from 'primeng/api';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit{
    public people: Person[];
    public menuItems: MenuItem[];

    constructor(
        private dbService : DbService,
        private zone: NgZone) {
        Settings.initialize();
    }

    ngOnInit(){
        this.menuItems = [
            {
                label: 'File',
                items: [{
                        label: 'New', 
                        icon: 'pi pi-fw pi-plus',
                        items: [
                            {label: 'Project'},
                            {label: 'Other'},
                        ]
                    },
                    {label: 'Open'},
                    {label: 'Quit'}
                ]
            },
            {
                label: 'Edit',
                icon: 'pi pi-fw pi-pencil',
                items: [
                    {label: 'Delete', icon: 'pi pi-fw pi-trash'},
                    {label: 'Refresh', icon: 'pi pi-fw pi-refresh'}
                ]
            }
        ];

        if (fs.existsSync(Settings.dbPath)) {
            this.openDb(Settings.dbPath);
        } else if (Settings.hasFixedDbLocation) {
            this.createDb(Settings.dbPath);
        } else {
            this.createDb();
        }
        // no-op
    }

    public openDb(filename: string) {
        TheDb.openDb(filename)
            .pipe(
                map(() => {
                    if (!Settings.hasFixedDbLocation) {
                        Settings.dbPath = filename;
                        Settings.write();
                    }
                }),
                map(() => this.getPeople())
            ).subscribe(
                () =>  {console.log('DB opened')},
                (reason) => {
                    // Handle errors
                    console.log('Error occurred while opening database: ', reason);
                }
            );
    }

    public createDb(filename?: string) {
        if (!filename) {
            const options: OpenDialogOptions = {
                title: 'Create file',
                defaultPath: remote.app.getPath('documents'),
                filters: [
                    {
                        name: 'Database',
                        extensions: ['db'],
                    },
                ],
            };
            filename = remote.dialog.showSaveDialog(remote.getCurrentWindow(), options);
        }

        if (!filename) {
            return;
        }

        TheDb.createDb(filename)
            .pipe(
                map((dbPath) => {
                    console.log('app1');
                    if (!Settings.hasFixedDbLocation) {
                        Settings.dbPath = dbPath;
                        Settings.write();
                    }
                }),
                map(() => {
                    console.log('Database opened, getting people');
                    this.getPeople();
                })
            ).subscribe(
                () => { console.log('DB created')},
                (reason) => {
                    console.log(reason);
                }
            );
    }

    public onRestoreDb() {
        /*TheDb.importJson(path.join(Settings.dbFolder, 'database.init.json'), false)
            .then(() => {
                this.getPeople();
            });*/
        this.getPeople();
    }

    public getPeople() {
        Person.getAll()
            .subscribe((people) => {
                this.zone.run(()=>{
                console.log('GOT PEOPLE!!!');
                console.log(people);
                console.log(this);
                this.people = people;
                });
            });
    }

    public onMenu(person: Person) {
        const menu = this.initMenu(person);
        // Since Electron v2.0 popup must have option parameter.
        // See https://github.com/electron/electron/issues/12915
        // {} compiles correct, but tslint throws error
        menu.popup({});
    }

    private deleteHero(person: Person) {
        person.delete();
        this.getPeople();
    }

    private initMenu(person: Person): Menu {
        const template: MenuItemConstructorOptions[] = [
            {
                label: `Delete ${person.firstName},  ${person.lastName}`,
                click: () => this.deleteHero(person),
            },
        ];

        return remote.Menu.buildFromTemplate(template);
    }

    public onImportFromCSV() {
        let filenames: string[];
            const options: OpenDialogOptions = {
                title: 'Import CSV',
                defaultPath: remote.app.getPath('documents'),
                filters: [
                    {
                        name: 'CSV',
                        extensions: ['csv'],
                    },
                ],
            };
            filenames = remote.dialog.showOpenDialog(remote.getCurrentWindow(), options);

        if (filenames.length < 1) {
            return;
        }

        const file = readFileSync(filenames[0], 'utf8');
        let rowIndex = 1;
        let errors: string[]= [];
        parse(file, {
            header: true,
            dynamicTyping: true,
            step: (row) => {
              console.log("Row:", row.data);
              Person.fromCSVImportRow(row.data)
                .pipe(
                    flatMap((p: Person) => {
                        return Assesment.fromCSVImportRow(row, p.id);
                    })
                ).subscribe(
                    ()=>{
                        this.getPeople();
                    },
                    (err: Error) => { 
                        errors.push(`Error:(${rowIndex}: Import failed: ${err.message} `);
                    }
                )
                rowIndex++;
            },
            complete: () => {
              console.log("All done!");
              //setTimeout(this.getPeople(), 3000);
            }
          });

        
    }
}
