import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { TimesheetFacade } from './core/services/timesheet-facade.service';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(), TimesheetFacade],
};
