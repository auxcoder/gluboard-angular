import {HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessHTTPMsgService {

  constructor() { }

  handleError(error: HttpErrorResponse|any) {
    let errMsg = error.error instanceof ErrorEvent
      ? error.error.message
      : `${error.status} - ${error.statusText || ''} ${error.error}`;

    return throwError(errMsg);
  }
}
