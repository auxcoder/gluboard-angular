import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {closestTo, isAfter, isBefore} from "date-fns";
import * as qs from 'qs';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {baseUrl} from "../shared/baseurl";
import {Sample} from "../shared/sample";
import {ProcessHTTPMsgService} from './process-httpmsg.service';

interface samplesParams {
  date?: string;
  time?: string;
  code?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SampleService {

  constructor(private http: HttpClient, private pHTTPMsg: ProcessHTTPMsgService) { }

  filterSliceData(data, start, end) {
    var dataset = data;
    if (start) dataset = dataset.filter(sample => isAfter(new Date(sample.date), new Date(start)));
    if (end) dataset = dataset.filter(sample => isBefore(new Date(sample.date), new Date(end)));
    if (!start && !end) dataset = dataset.slice(0, 30);
    return dataset
  }

  getSamples(params: samplesParams): Observable<Sample[]> {
    const stringifyObj = qs.stringify(params, {encodeValuesOnly: true});
    const queryStr = stringifyObj ? `?${stringifyObj}` : '';
    return this.http.get<Sample[]>(baseUrl + 'samples' + queryStr)
      .pipe(catchError(this.pHTTPMsg.handleError));
  }

  lastDayOfSample(dataSet) {
    var dateToCompare = new Date();
    var samples = dataSet.map(sample => new Date(sample.date));
    return closestTo(dateToCompare, samples);
  }
}
