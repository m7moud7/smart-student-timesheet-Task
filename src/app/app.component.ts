import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TimesheetComponent } from './features/timesheet/timesheet/timesheet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TimesheetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'smart-student-timesheet';
  currentTime = '';
  private timeInterval: any;

  private router = inject(Router);

  ngOnInit(): void {
    this.updateCurrentTime();
    this.timeInterval = setInterval(() => {
      this.updateCurrentTime();
    }, 1000);

    console.log('Current route:', this.router.url);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  getCurrentTime(): string {
    return this.currentTime;
  }

  getCurrentUrl(): string {
    return this.router.url;
  }

  private updateCurrentTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
