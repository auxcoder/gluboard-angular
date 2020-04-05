import {Component, Inject, OnInit} from '@angular/core';
import {subMonths} from "date-fns";
import {SampleService} from "../services/sample.service";
import {Range} from "../shared/range";
import {Sample} from "../shared/sample";

interface aveItem {
  color: string;
  label: string;
  value: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  samples: Sample[];
  samplesErrMsg: string;
  opened: boolean;
  defaultRanges: Range[];
  today = new Date().valueOf();
  lastAves: aveItem[]
  constructor(
    private sampleSvc: SampleService,
    @Inject('BaseUrl') public BaseUrl
  ) { }

  ngOnInit(): void {
    this.opened = true;
    this.defaultRanges = [
      {
        label: 'Last Month',
        start: subMonths(this.today, 1),
        end: this.today
      },
      {
        label: 'Last Two Months',
        start: subMonths(this.today, 2),
        end: this.today
      },
      {
        label: 'Last Three Months',
        start: subMonths(this.today, 2),
        end: this.today
      }
    ]
    this.lastAves = [
      {color: 'lightblue', label: 'Last Day', value: '110'},
      {color: 'lightgreen', label: 'Last Three', value: '176'},
      {color: 'lightpink', label: 'Last Seven', value: '198'},
      {color: 'violet', label: 'Last Month', value: '186'},
    ];
    this.sampleSvc.getSamples()
      .subscribe(samples => this.samples = samples, errormsg => this.samplesErrMsg = <any>errormsg);
  }

  openLogin() {
    console.log('open login > ');
  }

  openPrint() {
    window.print();
  }
}
