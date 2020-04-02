import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {baseUrl} from "../shared/baseurl";
import {Sample} from "../shared/sample";
import {ProcessHTTPMsgService} from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class SampleService {

  constructor(private http: HttpClient, private pHTTPMsg: ProcessHTTPMsgService) { }

  getSamples(): Observable<Sample[]> {
    return this.http.get<Sample[]>(baseUrl + 'samples')
      .pipe(catchError(this.pHTTPMsg.handleError));
  }
}
