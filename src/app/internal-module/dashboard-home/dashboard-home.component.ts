import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule
} from 'ng-apexcharts';
import { environment } from '../../../environments/environment';
import { GceSoftBase } from '../../core/gce-soft-base';
import { InternalLocalStoreService } from '../services/internal-local-store.service';
import { RequestTypeLocalStoreService } from '../services/request-type-local-store.service';
import {
  AdminDashboardData,
  buildAdminDashboardFromLocalStores,
  buildStaticAdminDashboardData
} from '../static/static-admin-dashboard.seed';

type DonutChartConfig = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  tooltip: ApexTooltip;
};

type TrendChartConfig = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  fill: ApexFill;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

type BarChartConfig = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule, NgApexchartsModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent extends GceSoftBase implements OnInit {
  private readonly localStore = inject(InternalLocalStoreService);
  private readonly rtStore = inject(RequestTypeLocalStoreService);
  private readonly primaryChartColor = '#d96d0f';

  data!: AdminDashboardData;

  usersDonutChart!: DonutChartConfig;
  serviceDonutChart!: DonutChartConfig;
  creationTrendChart!: TrendChartConfig;
  moduleBarChart!: BarChartConfig;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.data = environment.useLocalInternalStore
      ? buildAdminDashboardFromLocalStores(this.localStore, this.rtStore)
      : buildStaticAdminDashboardData();

    const c = this.data.cards;
    this.usersDonutChart = this.buildUsersDonut(this.data.usersBreakdown);
    this.serviceDonutChart = this.buildServiceDonut(this.data.serviceBreakdown);
    this.creationTrendChart = this.buildCreationTrend(this.data.trend);
    this.moduleBarChart = this.buildModuleBar(this.data.moduleBar);

    void c;
  }

  private buildUsersDonut(b: AdminDashboardData['usersBreakdown']): DonutChartConfig {
    const series = [b.active, b.inactive];
    const labels = ['نشط', 'غير نشط'];
    const colors = ['#22c55e', '#94a3b8'];
    const sum = series.reduce((a, x) => a + x, 0);
    return this.donutShell(series, labels, colors, 'المستخدمون', sum, 'مستخدم');
  }

  private buildServiceDonut(b: AdminDashboardData['serviceBreakdown']): DonutChartConfig {
    const series = [b.active, b.inactive];
    const labels = ['نشط', 'غير نشط'];
    const colors = ['#22c55e', '#94a3b8'];
    const sum = b.active + b.inactive;
    return this.donutShell(series, labels, colors, 'أنواع الخدمات', sum, 'نوع');
  }

  private donutShell(
    series: number[],
    labels: string[],
    colors: string[],
    totalLabel: string,
    sum: number,
    unit: string
  ): DonutChartConfig {
    return {
      series,
      chart: { type: 'donut', height: 280, fontFamily: 'Tajawal, sans-serif' },
      labels,
      colors,
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '12px',
        labels: { colors: '#66789d' },
        markers: { size: 6 }
      },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              value: { show: true, color: '#1f2f54', fontWeight: 700 },
              total: {
                show: true,
                label: totalLabel,
                color: '#7b8bab',
                formatter: () => String(sum)
              }
            }
          }
        }
      },
      responsive: [{ breakpoint: 640, options: { chart: { height: 260 }, legend: { position: 'bottom' } } }],
      tooltip: { y: { formatter: (value: number) => `${value} ${unit}` } }
    };
  }

  private buildCreationTrend(trend: AdminDashboardData['trend']): TrendChartConfig {
    const maxVal = Math.max(1, ...trend.users, ...trend.roles, ...trend.serviceTypes, 2);
    const cap = Math.ceil(maxVal * 1.15);

    return {
      series: [
        { name: 'المستخدمون', data: trend.users },
        { name: 'الأدوار', data: trend.roles },
        { name: 'أنواع الخدمات', data: trend.serviceTypes }
      ],
      chart: {
        type: 'area',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'Tajawal, sans-serif',
        zoom: { enabled: false }
      },
      colors: [this.primaryChartColor, '#6366f1', '#0ea5e9'],
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        labels: { colors: '#66789d' }
      },
      xaxis: {
        categories: trend.categories,
        labels: { style: { colors: '#8a99b8', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        max: cap,
        tickAmount: Math.min(5, cap),
        labels: { style: { colors: '#8a99b8', fontSize: '11px' } }
      },
      grid: { borderColor: '#edf2fb', strokeDashArray: 5 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.32, opacityTo: 0.04, stops: [0, 90, 100] }
      },
      tooltip: { theme: 'light', y: { formatter: (value: number) => `${value}` } }
    };
  }

  private buildModuleBar(items: AdminDashboardData['moduleBar']): BarChartConfig {
    const categories = items.map((x) => x.label);
    const data = items.map((x) => x.value);
    const colors = [this.primaryChartColor, '#6366f1', '#0ea5e9', '#f59e0b', '#a78bfa'];
    const maxVal = Math.max(1, ...data);

    return {
      series: [{ name: 'العدد', data }],
      chart: { type: 'bar', height: 320, toolbar: { show: false }, fontFamily: 'Tajawal, sans-serif' },
      colors,
      plotOptions: {
        bar: {
          borderRadius: 6,
          borderRadiusApplication: 'end',
          horizontal: true,
          distributed: true,
          barHeight: '72%'
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (value: number) => (value > 0 ? String(value) : ''),
        style: { colors: ['#ffffff'], fontWeight: '700', fontSize: '11px' },
        offsetX: -4
      },
      xaxis: {
        categories,
        labels: { style: { colors: '#8a99b8', fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
        max: Math.ceil(maxVal * 1.2)
      },
      yaxis: { labels: { style: { colors: '#5f6f90', fontSize: '11px', fontWeight: 600 } } },
      grid: { borderColor: '#edf2fb', xaxis: { lines: { show: true } } },
      tooltip: { y: { formatter: (value: number) => `${value}` } }
    };
  }
}
