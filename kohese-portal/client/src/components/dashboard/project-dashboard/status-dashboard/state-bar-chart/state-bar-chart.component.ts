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
    chart : StateBarChartComponent;
  }

@Component({
  selector: 'state-bar-chart',
  templateUrl: './state-bar-chart.component.html',
  styleUrls: ['./state-bar-chart.component.css']
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
  stateGraphInfo : Array<StateGraphInfo>;
  supportedTypes = ['Action', 'Task', 'Decision', 'Issue'];
  selectedType = this.supportedTypes[0];
  infoMap;

  // D3 Elements
  xScale;
  yScale;
  kindScale;
  xAxis;
  yAxis;
  chartWidth  = 1000;
  chartHeight = 400; // Eventually replace these with calls to get available area
  barPadding = 150;

  constructor(private stateFilterService : StateFilterService) {}

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
        for (let state of this.stateInfo[kind][stateKind].states) {
          this.infoMap[kind][stateKind][state] = {
            count : 0,
            kind : kind,
            stateName : state,
            stateKind : stateKind,
            key : keyId++,
            chart : this
          }
        }
      }
    }

    for (let proxy of projectProxies) {
      for (let stateKind of proxy.model.item.stateProperties) {
        if (proxy.item[stateKind]) {
          try {
          this.infoMap[proxy.kind][stateKind][proxy.item[stateKind]].count++
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
    this.svg = d3.select(this.chartContainer.nativeElement)
    .append('svg')
    .attr('height', this.chartHeight + this.barPadding)
    .attr('width', this.chartWidth);
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
      console.log(d);
      console.log(this.yScale(d.count))
      return this.yScale(0) - this.yScale(d.count)
    })
    .on('mouseover', function(d) {
      d3.select(this).transition('hover').attr('fill', d.chart.lightenDarkenColor(d.chart.kindScale(d.kind), 70))
    })
    .on('mouseout', function(d) {
      d3.select(this).transition('hoverOut').attr('fill', d.chart.kindScale(d.kind));
    })
    .on('click', function(d,i) {
      console.log(d);
    })

    this.legend = d3.select(this.chartContainer.nativeElement)
      .append('svg')

  }

  consolelog(d) {
    console.log(d);
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
    console.log(rangeArray);

    this.kindScale = d3.scaleOrdinal(d3.schemeCategory10);

    this.xScale = d3.scaleBand()
    .domain(rangeArray)
    .rangeRound([this.barPadding, this.chartWidth - this.barPadding])
    .paddingInner(0.05);

    console.log(d3.max(this.stateGraphInfo, (d) => d.count));

    this.yScale = d3.scaleLinear()
    .domain([0, d3.max(this.stateGraphInfo, (d) => d.count)])
    .range([this.chartHeight, 0]);
  }

  key (d) {
    return d.key;
  }

  // Move to service
  lightenDarkenColor(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

  getStateKey(stateInfo) {
    return stateInfo.stateKind + ':' + stateInfo.stateName
  }

}
