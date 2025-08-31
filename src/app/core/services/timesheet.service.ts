import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import {
  Student,
  ClassSchedule,
  TimesheetRequest,
  TimesheetResponse,
  DataStrategy,
} from './../models/student';

@Injectable({
  providedIn: 'root',
})
export class MockDataStrategy implements DataStrategy {
  private mockStudents: Student[] = [
    {
      id: '12345',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      department: 'Computer Science',
    },
    {
      id: '67890',
      name: 'Jane Smith',
      email: 'jane.smith@university.edu',
      department: 'Information Technology',
    },
  ];

  private mockClasses: ClassSchedule[] = [
    {
      id: '1',
      className: 'Angular Development',
      startTime: '09:00',
      endTime: '10:30',
      day: 'Monday',
      date: '2025-01-15',
      instructor: 'Dr. Smith',
      room: 'CS-101',
      credits: 3,
    },
    {
      id: '2',
      className: 'Database Systems',
      startTime: '11:00',
      endTime: '12:30',
      day: 'Monday',
      date: '2025-01-15',
      instructor: 'Prof. Johnson',
      room: 'CS-102',
      credits: 4,
    },
    {
      id: '3',
      className: 'Web Development',
      startTime: '14:00',
      endTime: '15:30',
      day: 'Tuesday',
      date: '2025-01-16',
      instructor: 'Dr. Brown',
      room: 'CS-103',
      credits: 3,
    },
    {
      id: '4',
      className: 'Software Engineering',
      startTime: '10:00',
      endTime: '11:30',
      day: 'Wednesday',
      date: '2025-01-17',
      instructor: 'Prof. Davis',
      room: 'CS-104',
      credits: 4,
    },
    {
      id: '5',
      className: 'Mobile App Development',
      startTime: '13:00',
      endTime: '14:30',
      day: 'Friday',
      date: '2025-01-19',
      instructor: 'Dr. Wilson',
      room: 'CS-105',
      credits: 3,
    },
  ];

  getStudentTimesheet(
    request: TimesheetRequest
  ): Observable<TimesheetResponse> {
    const student = this.mockStudents.find((s) => s.id === request.studentId);

    if (!student) {
      return of({
        student: {} as Student,
        classes: [],
        success: false,
        message: 'Student not found',
      }).pipe(delay(500));
    }

    const response: TimesheetResponse = {
      student,
      classes: this.mockClasses,
      success: true,
      message: 'Timesheet loaded successfully',
    };

    return of(response).pipe(delay(500));
  }
}

@Injectable({
  providedIn: 'root',
})
export class ApiDataStrategy implements DataStrategy {
  constructor(private http: HttpClient) {}

  getStudentTimesheet(
    request: TimesheetRequest
  ): Observable<TimesheetResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      sessionId: request.sessionId,
    });

    return this.http.post<TimesheetResponse>(
      '/api/student/timesheet',
      { studentId: request.studentId },
      { headers }
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class DataContext {
  private strategy: DataStrategy;

  constructor(private mockStrategy: MockDataStrategy) {
    this.strategy = this.mockStrategy;
  }

  setStrategy(strategy: DataStrategy): void {
    this.strategy = strategy;
  }

  getStudentTimesheet(
    request: TimesheetRequest
  ): Observable<TimesheetResponse> {
    return this.strategy.getStudentTimesheet(request);
  }
}
