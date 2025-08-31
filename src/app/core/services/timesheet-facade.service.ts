import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import {
  ClassSchedule,
  TimesheetRequest,
  TimesheetResponse,
} from './../models/student';
import { DataContext } from './timesheet.service';

@Injectable({
  providedIn: 'root',
})
export class TimesheetFacade {
  private timesheetSubject = new BehaviorSubject<TimesheetResponse | null>(
    null
  );
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private currentClassSubject = new BehaviorSubject<ClassSchedule | null>(null);

  public timesheet$ = this.timesheetSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public currentClass$ = this.currentClassSubject.asObservable();

  constructor(private dataContext: DataContext) {
    this.startCurrentClassTimer();
  }

  loadStudentTimesheet(studentId: string): void {
    if (!studentId?.trim()) {
      this.errorSubject.next('Student ID is required');
      return;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const sessionId = this.generateSessionId(studentId);
    const request: TimesheetRequest = {
      studentId: studentId.trim(),
      sessionId,
    };

    this.dataContext
      .getStudentTimesheet(request)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.timesheetSubject.next(response);
            this.updateCurrentClass(response.classes);
          } else {
            this.errorSubject.next(
              response.message || 'Failed to load timesheet'
            );
          }
        },
        error: (error) => {
          this.errorSubject.next('Network error occurred. Please try again.');
          console.error('Timesheet loading error:', error);
        },
      });
  }

  getCurrentClass(classes: ClassSchedule[]): ClassSchedule | null {
    const now = new Date();
    const currentDay = this.getCurrentDayName();
    const currentTime = this.getCurrentTimeString();

    return (
      classes.find(
        (cls) =>
          cls.day.toLowerCase() === currentDay.toLowerCase() &&
          this.isTimeInRange(currentTime, cls.startTime, cls.endTime)
      ) || null
    );
  }

  getNextClass(classes: ClassSchedule[]): ClassSchedule | null {
    const now = new Date();
    const currentDay = this.getCurrentDayName();
    const currentTime = this.getCurrentTimeString();

    const todayClasses = classes.filter(
      (cls) => cls.day.toLowerCase() === currentDay.toLowerCase()
    );

    const sortedClasses = todayClasses.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    return sortedClasses.find((cls) => cls.startTime > currentTime) || null;
  }

  getClassStatus(classItem: ClassSchedule): string {
    const currentDay = this.getCurrentDayName();
    const currentTime = this.getCurrentTimeString();

    if (classItem.day.toLowerCase() !== currentDay.toLowerCase()) {
      return 'Scheduled';
    }

    if (
      this.isTimeInRange(currentTime, classItem.startTime, classItem.endTime)
    ) {
      return 'Current';
    }

    if (currentTime < classItem.startTime) {
      const currentTimesheet = this.timesheetSubject.value;
      if (
        currentTimesheet &&
        this.getNextClass(currentTimesheet.classes)?.id === classItem.id
      ) {
        return 'Next';
      }
      return 'Upcoming';
    }

    if (currentTime > classItem.endTime) {
      return 'Completed';
    }

    return 'Scheduled';
  }

  clearTimesheet(): void {
    this.timesheetSubject.next(null);
    this.currentClassSubject.next(null);
    this.errorSubject.next(null);
  }

  private generateSessionId(studentId: string): string {
    const timestamp = Date.now().toString();
    return btoa(timestamp + '-' + studentId);
  }

  private getCurrentDayName(): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[new Date().getDay()];
  }

  private getCurrentTimeString(): string {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  }

  private isTimeInRange(
    currentTime: string,
    startTime: string,
    endTime: string
  ): boolean {
    return currentTime >= startTime && currentTime <= endTime;
  }

  private updateCurrentClass(classes: ClassSchedule[]): void {
    const currentClass = this.getCurrentClass(classes);
    this.currentClassSubject.next(currentClass);
  }

  private startCurrentClassTimer(): void {
    setInterval(() => {
      const currentTimesheet = this.timesheetSubject.value;
      if (currentTimesheet?.classes) {
        this.updateCurrentClass(currentTimesheet.classes);
      }
    }, 60000);
  }
}
