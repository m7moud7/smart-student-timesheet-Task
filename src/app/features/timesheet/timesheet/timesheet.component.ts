import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TimesheetFacade } from '../../../core/services/timesheet-facade.service';
import {
  ClassSchedule,
  TimesheetResponse,
} from './../../../core/models/student';

@Component({
  selector: 'app-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss'],
})
export class TimesheetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  studentId: string;
  timesheet: TimesheetResponse | null;
  loading: boolean;
  error: string | null;
  currentClass: ClassSchedule | null;

  constructor(private facade: TimesheetFacade) {
    this.studentId = '';
    this.timesheet = null;
    this.loading = false;
    this.error = null;
    this.currentClass = null;
  }

  ngOnInit(): void {
    this.facade.timesheet$
      .pipe(takeUntil(this.destroy$))
      .subscribe((timesheet) => {
        this.timesheet = timesheet;
      });

    this.facade.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.loading = loading;
    });

    this.facade.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.error = error;
    });

    this.facade.currentClass$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentClass) => {
        this.currentClass = currentClass;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLoadTimesheet(): void {
    if (this.studentId?.trim()) {
      this.facade.loadStudentTimesheet(this.studentId.trim());
    }
  }

  onEnterKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLoadTimesheet();
    }
  }

  onClearTimesheet(): void {
    this.facade.clearTimesheet();
    this.studentId = '';
  }

  isCurrentClass(classItem: ClassSchedule): boolean {
    return this.facade.getClassStatus(classItem) === 'Current';
  }

  isNextClass(classItem: ClassSchedule): boolean {
    return this.facade.getClassStatus(classItem) === 'Next';
  }

  getClassStatus(classItem: ClassSchedule): string {
    return this.facade.getClassStatus(classItem);
  }

  getRowCssClass(classItem: ClassSchedule): string {
    const status = this.getClassStatus(classItem);
    switch (status) {
      case 'Current':
        return 'current-class';
      case 'Next':
        return 'next-class';
      case 'Completed':
        return 'completed-class';
      case 'Upcoming':
        return 'upcoming-class';
      default:
        return '';
    }
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getTimeRange(startTime: string, endTime: string): string {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  getDuration(startTime: string, endTime: string): string {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  getTotalCredits(): number {
    if (!this.timesheet?.classes) return 0;
    return this.timesheet.classes.reduce(
      (total, cls) => total + (cls.credits || 0),
      0
    );
  }

  getTodayClassesCount(): number {
    if (!this.timesheet?.classes) return 0;
    const today = this.getCurrentDayName();
    return this.timesheet.classes.filter(
      (cls) => cls.day.toLowerCase() === today.toLowerCase()
    ).length;
  }

  trackByClassId(index: number, classItem: ClassSchedule): string {
    return classItem.id;
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
}
