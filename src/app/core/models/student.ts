import { Observable } from 'rxjs';

export interface Student {
  id: string;
  name: string;
  email?: string;
  department?: string;
}

export interface ClassSchedule {
  id: string;
  className: string;
  startTime: string;
  endTime: string;
  day: string;
  date: string;
  instructor: string;
  room?: string;
  credits?: number;
}

export interface TimesheetRequest {
  studentId: string;
  sessionId: string;
}

export interface TimesheetResponse {
  student: Student;
  classes: ClassSchedule[];
  success: boolean;
  message?: string;
}

export interface DataStrategy {
  getStudentTimesheet(request: TimesheetRequest): Observable<TimesheetResponse>;
}
