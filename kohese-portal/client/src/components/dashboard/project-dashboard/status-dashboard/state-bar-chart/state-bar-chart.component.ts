import { StateSummaryDialogComponent } from './state-summary-dialog/state-summary-dialog.component';
import { DialogService } from './../../../../../services/dialog/dialog.service';
import { ItemProxy } from './../../../../../../../common/src/item-proxy';
import { StateFilterService } from './../../../state-filter.service';
import { Subscription } from 'rxjs';
import {
  Observable
} from 'rxjs/Observable';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input
} from '@angular/core';
import * as d3 from 'd3';
import {
  ProjectInfo
} from '../../../../../services/project-service/project.service';

interface StateGraphInfo {
    stateName: string,
    stateKind : string,
    kind : string,
    count: number,
    chart : StateBarChartComponent,
    proxies : Array<ItemProxy>,
    description : string
  }

@Component({
  selector: 'state-bar-chart',
  templateUrl: './state-bar-chart.component.html',
  styleUrls: ['./state-bar-chart.component.scss']
})
export class StateBarChartComponent implements OnInit {
  @ViewChild('chart', {
    read: ElementRef
  }) chartContainer;
  svg;
  legend;

  @Input()
  projectStream: Observable < ProjectInfo > ;
  projectStreamSub : Subscription;
  project : ProjectInfo;

  stateInfo;
  totalCount;
  stateGraphInfo : Array<StateGraphInfo>;
  supportedTypes = ['Action', 'Task', 'Decision', 'Issue'];
  selectedType = this.supportedTypes[0];
  selectedState : string;
  infoMap;
  activeGraphInfo : Array<StateGraphInfo> = [];

  // D3 Elements
  xScale;
  yScale;
  kindScale;
  xAxis;
  yAxis;
  chartWidth  = 1200;
  chartHeight = 400; // Eventually replace these with calls to get available area
  barPadding = 150;

  constructor(private stateFilterService : StateFilterService,
              private dialogService : DialogService) {}

  ngOnInit() {
    // Add the svg canvas
    this.projectStreamSub = this.projectStream.subscribe((newProject) => {
      if (newProject) {
        let projectUpdate = this.project != undefined;
        this.project = newProject;
        if (projectUpdate) {
          this.stateGraphInfo = this.buildStateGraphInfo();
          this.updateGraph();
        } else {
          this.stateInfo = this.stateFilterService.getStateInfoFor(this.supportedTypes);
          this.stateGraphInfo = this.buildStateGraphInfo();
          this.initGraph();
        }
      }
    })
  }

  selectType(type) {
    this.selectedType = type;
  }

  buildStateGraphInfo() : Array<StateGraphInfo> {
    let info = [];
    this.infoMap = {};
    let projectProxies = [];
    let unsupportedList = [];
    let emptyStates = [];
    for (let projectItem of this.project.projectItems) {
      let newItems = projectItem.getDescendants();
      projectProxies = projectProxies.concat(projectItem);
      projectProxies = projectProxies.concat(newItems);
    }

    projectProxies = projectProxies.filter((proxy) => {
      for (let kind of this.supportedTypes) {
        if (proxy.kind === kind) {
          return true;
        }
      }
      return false;
    })

    // Build the info map for aggregating state info
    for (let kind in this.stateInfo) {
      let keyId = 0;
      this.infoMap[kind] = {}
      for (let stateKind in this.stateInfo[kind]) {
        this.infoMap[kind][stateKind] = {};
        let stateKindInfo = this.stateInfo[kind][stateKind]
        for (let i = 0; i < stateKindInfo.states.length; i++) {
          this.infoMap[kind][stateKind][stateKindInfo.states[i]] = {
            count : 0,
            kind : kind,
            stateName : stateKindInfo.states[i],
            stateKind : stateKind,
            key : keyId++,
            chart : this,
            proxies : [],
            description : stateKindInfo.descriptions[i]
          }
        }
      }
    }

    for (let proxy of projectProxies) {
      for (let stateKind of proxy.model.item.stateProperties) {
        if (proxy.item[stateKind]) {
          try {
          this.infoMap[proxy.kind][stateKind][proxy.item[stateKind]].count++
          this.infoMap[proxy.kind][stateKind][proxy.item[stateKind]].proxies.push(proxy);
        } catch {
          unsupportedList.push(proxy);
        }
      }
      }
    }

    if (unsupportedList.length) {
      console.log ('Unsupported states', unsupportedList);
    }

    for (let kind in this.infoMap) {
      for (let stateKind in this.infoMap[kind]) {
        for (let state in this.infoMap[kind][stateKind]) {
          if (this.infoMap[kind][stateKind][state].count) {
            info.push(this.infoMap[kind][stateKind][state]);
          } else {
            emptyStates.push(this.infoMap[kind][stateKind][state]);
          }
        }
      }
    }

    console.log('Unused States', emptyStates);
    console.log(info);

    return info;
  }

  initGraph() {
    let vm = this;

    this.svg = d3.select(this.chartContainer.nativeElement)
    .append('svg')
    .attr('height', this.chartHeight + this.barPadding)
    .attr('width', this.chartWidth)
    .style('transform', 'translateX(-100px)');
    this.setScales();

    this.xAxis = d3.axisBottom(this.xScale);
    this.svg.append('g')
      .attr('class','x-axis')
      .attr(
        'transform',
        'translate(0,' + (this.chartHeight) + ')'
      )
      .call(this.xAxis)
      .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", function(d) {
              return "rotate(-65)"
            })
          .on('mouseover', function(d) {
            vm.activeGraphInfo = vm.findValidTypes(d);
            vm.selectedState = d.split(':')[0];
            let totalCount = 0;
            vm.activeGraphInfo.forEach((d)=> {
              totalCount += d.count;
            })
            vm.totalCount = totalCount;
          });

    this.yAxis = d3.axisLeft(this.yScale);
    this.svg.append('g')
      .attr('class', 'y-axis')
      .attr(
        'transform',
        'translate(' + this.barPadding + ',0)'
      )
      .call(this.yAxis);

    this.svg.selectAll( 'rect' )
    .data(this.stateGraphInfo, this.key)
    .enter()
    .append( 'rect' )
    .attr('fill', (d) => this.kindScale(d.kind))
    .attr('x', (d,i) => this.xScale(this.getStateKey(d)))
    .attr('y', (d) =>  this.yScale(d.count))
    .attr('width', this.xScale.bandwidth())
    .attr('height', (d) => {
      return this.yScale(0) - this.yScale(d.count)
    })
    .on('mouseover', function(d) {
      d.chart.activeGraphInfo = [d];
      d.selectedState = d.stateKind;
      d3.select(this).transition('hover').attr('fill', d.chart.lightenDarkenColor(d.chart.kindScale(d.kind), 70))
    })
    .on('mouseout', function(d) {
      d3.select(this).transition('hoverOut').attr('fill', d.chart.kindScale(d.kind));
    })
    .on('click', function(d,i) {
      d.chart.openStateSummaryDialog(d);
    })

  }

  findValidTypes(stateKey : string) : Array<StateGraphInfo>{
    let selectedInfo : Array<StateGraphInfo> = [];
    // Takes in the stateKey used in the xScale for this chart
    let splitKey = stateKey.split(':');
    for (let graphInfo of this.stateGraphInfo) {
      if (splitKey[0] === graphInfo.stateKind &&
          splitKey[1] === graphInfo.stateName ) {
            selectedInfo.push(graphInfo);
          }
    }
    return selectedInfo;
  }

  openStateSummaryDialog(stateGraphInfo): void {
    this.dialogService.openComponentDialog(StateSummaryDialogComponent, {
      data: {
        stateInfo : stateGraphInfo,
        kindColor : this.kindScale(stateGraphInfo.kind)
      }
    }).updateSize('80%', '80%');
  }

  updateGraph() {
    d3.select(this.chartContainer.nativeElement)
      .selectAll('svg')
      .remove();
    this.initGraph();

  }

  setScales () {
    let rangeArray : Array<string> = [];
    for (let state of this.buildStateGraphInfo()) {
      rangeArray.push(this.getStateKey(state));
    }

    this.kindScale = d3.scaleOrdinal(d3.schemeCategory10);

    this.xScale = d3.scaleBand()
    .domain(rangeArray)
    .rangeRound([this.barPadding, this.chartWidth - this.barPadding])
    .paddingInner(0.05);

    this.yScale = d3.scaleLinear()
    .domain([0, d3.max(this.stateGraphInfo, (d) => d.count)])
    .range([this.chartHeight, 0]);
  }

  key (d) {
    return d.key;
  }

  // Move to service
  lightenDarkenColor(color,amount) {
    var usePound = false;
    if ( color[0] == "#" ) {
        color = color.slice(1);
        usePound = true;
    }

    var num = parseInt(color,16);

    var r = (num >> 16) + amount;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amount;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amount;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

  getStateKey(stateInfo) {
    return stateInfo.stateKind + ':' + stateInfo.stateName
  }

}
