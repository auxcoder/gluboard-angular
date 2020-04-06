import {AfterViewInit, Component, Inject, NgZone, OnInit} from '@angular/core';
import * as Chart from 'chart.js';
import {format, subMonths} from "date-fns";
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
export class HomeComponent implements OnInit, AfterViewInit {
  canvas: any;
  ctx: any;
  zone: NgZone;
  myLineChart: any;
  // data
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
    // get data
    this.sampleSvc.getSamples({
      code: 58
    })
      .subscribe(dataset => {
        //
        this.samples = dataset;
        var toDate = this.sampleSvc.lastDayOfSample(dataset);
        var fromDate = subMonths(toDate, 6);

        // where you would normally scope.$apply
        // this.zone.run(() => {});

        this.myLineChart.data.datasets[0].data = this.sampleSvc.filterSliceData(dataset, fromDate, toDate)
          .map(item => Number(item.value));
        this.myLineChart.data.labels = dataset.map(item => format(new Date(item.date), 'MMM d'));
        this.myLineChart.update();
      }, errormsg => this.samplesErrMsg = <any>errormsg);
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById('myLineChart');
    this.ctx = this.canvas.getContext('2d');
    this.myLineChart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: "Sample Value",
          lineTension: 0,
          backgroundColor: "rgba(78, 115, 223, 0.05)",
          borderColor: "rgba(78, 115, 223, 1)",
          pointRadius: 3,
          pointBackgroundColor: "rgba(78, 115, 223, 1)",
          pointBorderColor: "rgba(78, 115, 223, 1)",
          pointHoverRadius: 3,
          pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
          pointHoverBorderColor: "rgba(78, 115, 223, 1)",
          pointHitRadius: 10,
          pointBorderWidth: 5,
          data: [],
        }],
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 15,
            top: 15,
            bottom: 0
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              autoSkip: true,
              autoSkipPadding: 15,
            }
          }],
          yAxes: [{
            ticks: {
              maxTicksLimit: 11,
              padding: 10,
              callback: function(value, index, values) {
                return  (index === values.length - 1  ? 'mg/dL ' : '') + value;
              }
            },
            gridLines: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2]
            }
          }],
        },
        legend: {
          display: false
        },
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          titleMarginBottom: 10,
          titleFontColor: '#6e707e',
          titleFontSize: 14,
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          intersect: false,
          mode: 'index',
          caretPadding: 10,
          callbacks: {
            label: function(tooltipItem) {
              // https://www.chartjs.org/docs/latest/configuration/tooltip.html#tooltip-item-interface
              return format(new Date(tooltipItem.label), 'MMM d, yyyy');
            },
            title: function(tooltipItems) {
              return  tooltipItems[0].yLabel + ' mg/dL';
            }
          }
        }
      }
    });
  }

  openLogin() {
    console.log('open login > ');
  }

  openPrint() {
    window.print();
  }
}
