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
  lineChart: any;
  pieChart: any;
  chartHorizontalBar: any;
  // data
  samples: Sample[];
  samplesErrMsg: string;
  opened: boolean;
  today = new Date().valueOf();
  lastAves: aveItem[] = [
    {color: '#4e73df', label: 'Last Day', value: '110'},
    {color: '#1cc88a', label: 'Last Three', value: '176'},
    {color: '#36b9cc', label: 'Last Seven', value: '198'},
    {color: '#e74a3b', label: 'Last Month', value: '186'},
  ];
  defaultRanges: Range[] = [
    {
      label: 'Last Month',
      start: subMonths(this.today, 1).valueOf(),
      end: this.today
    },
    {
      label: 'Last Two Months',
      start: subMonths(this.today, 2).valueOf(),
      end: this.today
    },
    {
      label: 'Last Three Months',
      start: subMonths(this.today, 2).valueOf(),
      end: this.today
    }
  ]
  lastSampleDate: number;
  levels = {
    low: {
      value: 70,
      label: 'Low',
      total: 0,
    },
    normal: {
      total: 0,
      label: 'High',
    },
    high: {
      value: 130,
      label: 'High',
      total: 0
    },
    toohigh: {
      value: 160,
      label: 'High',
      total: 0
    }
  }

  constructor(
    private sampleSvc: SampleService,
    @Inject('BaseUrl') public BaseUrl
  ) { }

  ngOnInit(): void {
    this.opened = true;
    // get data
    this.sampleSvc.getSamples({
      code: 58
    })
      .subscribe(data => {
        this.samples = data;
        this.lastSampleDate = this.sampleSvc.lastDayOfSample(data).valueOf();
        this.updateDefaultRangesWithDataSet();
        var toDate = this.lastSampleDate;
        var fromDate = subMonths(toDate, 6);

        // where you would normally scope.$apply
        // this.zone.run(() => {});

        const dataset = this.sampleSvc.filterSliceData(data, fromDate, toDate)
        const groupLevel = dataset.map(item => {
          item.value = Number(item.value);
          return item
        })
        .reduce((acc, curr) => {
          if (curr.value < this.levels.low.value) acc[0] += 1;
          if (curr.value > this.levels.high.value) acc[2] += 1;
          if (curr.value >= this.levels.low.value && curr.value <= this.levels.high.value) acc[2] += 1;
          if (curr.value >= this.levels.toohigh.value) acc[3] += 1;
          return acc;
        }, [0, 0, 0, 0]);

        // line chart
        this.lineChart.data.datasets[0].data = dataset.map(item => Number(item.value));
        this.lineChart.data.labels = dataset.map(item => format(new Date(item.date), 'MMM d'));
        this.lineChart.update();
        // pie chart
        this.pieChart.data.datasets[0].data = this.asPercent(groupLevel);
        this.pieChart.update();
        // bar chart
        this.chartHorizontalBar.data.datasets[0].data = this.asPercent(groupLevel);
        this.chartHorizontalBar.update();

      }, errormsg => this.samplesErrMsg = <any>errormsg);
  }

  ngAfterViewInit() {
    // line
    this.canvas = document.getElementById('lineChart');
    this.lineChart = new Chart(this.canvas.getContext('2d'), {
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

    // pie
    this.canvas = document.getElementById('pieChart');
    this.pieChart = new Chart(this.canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Low', 'Normal', 'High', 'Too High'],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgb(78, 115, 223)',
            'rgb(28, 200, 138)',
            "rgb(246, 194, 62)",
            'rgb(231, 74, 59)'
          ],
          hoverBackgroundColor: [
            'rgb(78, 115, 223, 0.2)',
            'rgba(28, 200, 138, 0.2)',
            "rgba(246, 194, 62, 0.2)",
            'rgba(231, 74, 59, 0.2)'
          ],
          borderColor: [
            'rgb(78, 115, 223)',
            'rgb(28, 200, 138)',
            "rgb(246, 194, 62)",
            'rgb(231, 74, 59)'
          ],
        }],
      },
      options: {
        responsive: true,
        legend: {
          display: false,
        },
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        maintainAspectRatio: false,
        cutoutPercentage: 56,
      },
    });

    // var color = Chart.helpers.color;
    this.canvas = document.getElementById('chartHorizontalBar');
    this.chartHorizontalBar = new Chart(this.canvas.getContext('2d'), {
      type: 'horizontalBar',
      data: {
        labels: ['Low', 'Normal', 'High', 'Too High'],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgb(78, 115, 223)',
            'rgb(28, 200, 138)',
            "rgb(246, 194, 62)",
            'rgb(231, 74, 59)'
          ],
          hoverBackgroundColor: [
            'rgb(78, 115, 223, 0.2)',
            'rgba(28, 200, 138, 0.2)',
            "rgba(246, 194, 62, 0.2)",
            'rgba(231, 74, 59, 0.2)'
          ],
          borderColor: [
            'rgb(78, 115, 223)',
            'rgb(28, 200, 138)',
            "rgb(246, 194, 62)",
            'rgb(231, 74, 59)'
          ],
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        tooltips: {
          displayColors: false,
        }
      }
    });
  }

  asPercent(levels) {
    const total = levels.reduce((acc, curr) => (acc + curr), 0);
    return levels.map(level => {
      return Math.round(level * 100 / total);
    });
  }

  openLogin() {
    console.log('open login > ');
  }

  openPrint() {
    window.print();
  }

  updateDefaultRangesWithDataSet() {
    this.defaultRanges = this.defaultRanges.map((item, idx) => {
      return Object.assign(item, {start: subMonths(this.lastSampleDate, idx + 1).valueOf(), end: this.lastSampleDate});
    })
  }

  onChangeRange(range: Range) {
    const dataset = this.sampleSvc.filterSliceData(this.samples, range.start, range.end)
    const groupLevel = dataset.map(item => {
      item.value = Number(item.value);
      return item
    })
    .reduce((acc, curr) => {
      if (curr.value < this.levels.low.value) acc[0] += 1;
      if (curr.value > this.levels.high.value) acc[2] += 1;
      if (curr.value >= this.levels.low.value && curr.value <= this.levels.high.value) acc[2] += 1;
      if (curr.value >= this.levels.toohigh.value) acc[3] += 1;
      return acc;
    }, [0, 0, 0, 0]);
    // line chart
    this.lineChart.data.datasets[0].data = dataset.map(item => Number(item.value));
    this.lineChart.data.labels = dataset.map(item => format(new Date(item.date), 'MMM d'));
    this.lineChart.update();
    // pie chart
    this.pieChart.data.datasets[0].data = this.asPercent(groupLevel);
    this.pieChart.update();
    // bar chart
    this.chartHorizontalBar.data.datasets[0].data = this.asPercent(groupLevel);
    this.chartHorizontalBar.update();
  }
}
