import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/timesheet/timesheet.module').then(
        (m) => m.TimesheetModule
      ),
  },
  {
    path: 'timesheet',
    loadChildren: () =>
      import('./features/timesheet/timesheet.module').then(
        (m) => m.TimesheetModule
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
