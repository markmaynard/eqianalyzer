import { Component, OnInit } from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';

// tslint:disable-next-line:no-implicit-dependencies
import { Menu, MenuItemConstructorOptions, OpenDialogOptions, remote } from 'electron';

// import { Hero } from './model/hero';
import { Person } from './entity/person.entity';
import { Settings } from './model/settings';
import { TheDb } from './model/thedb';
import { DbService } from './services/db.service'

// Importing style.scss allows webpack to bundle stylesheet with application
import '../assets/sass/style.scss';
import { parse } from 'papaparse';
import { readFileSync } from 'fs';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit{
    public people: Person[];

    constructor(private dbService : DbService) {
        Settings.initialize();

        

        
        if (fs.existsSync(Settings.dbPath)) {
            this.openDb(Settings.dbPath);
        } else if (Settings.hasFixedDbLocation) {
            this.createDb(Settings.dbPath);
        } else {
            this.createDb();
        }
    }

    ngOnInit(){
        // no-op
    }

    public openDb(filename: string) {
        TheDb.openDb(filename)
            .then(() => {
                if (!Settings.hasFixedDbLocation) {
                    Settings.dbPath = filename;
                    Settings.write();
                }
            })
            .then(() => {
                this.getPeople();
            })
            .catch((reason) => {
                // Handle errors
                console.log('Error occurred while opening database: ', reason);
            });
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
            .then((dbPath) => {
                if (!Settings.hasFixedDbLocation) {
                    Settings.dbPath = dbPath;
                    Settings.write();
                }
            })
            .then(() => {
                this.getPeople();
            })
            .catch((reason) => {
                console.log(reason);
            });
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
            .then((people) => {
                this.people = people;
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

        parse(file, {
            header: true,
            dynamicTyping: true,
            step: function(row) {
              console.log("Row:", row.data);
            },
            complete: function() {
              console.log("All done!");
            }
          });

        
    }
}
