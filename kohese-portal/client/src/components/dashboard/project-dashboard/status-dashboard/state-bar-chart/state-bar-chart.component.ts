/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { StateSummaryDialogComponent } from './state-summary-dialog/state-summary-dialog.component';
import { DialogService } from './../../../../../services/dialog/dialog.service';
import { ItemProxy } from './../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { Subscription, BehaviorSubject } from 'rxjs';
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input
} from '@angular/core';
import * as d3 from 'd3';
import {
  ProjectInfo
} from '../../../../../services/project-service/project.service';

@Component({
  selector: 'state-bar-chart',
  templateUrl: './state-bar-chart.component.html',
  styleUrls: ['./state-bar-chart.component.scss']
})
export class StateBarChartComponent implements AfterViewInit {
  @ViewChild('chart')
  private _svgElement: ElementRef;
  svg;
  legend;

  @Input()
  projectStream: BehaviorSubject<ProjectInfo>;
  projectStreamSub : Subscription;
  project : ProjectInfo;

  // D3 Elements
  xScale;
  yScale;
  xAxis;
  yAxis;

  private static readonly _X_AXIS_PADDING: number = 125;
  private static readonly _Y_AXIS_PADDING: number = 50;

  private _kindNames: Array<string> = [];
  get kindNames() {
    return this._kindNames;
  }

  private _stateMap: { [kind: string]: { [attributeName: string]: { [stateName:
    string]: Array<ItemProxy> } } } = {};
  get stateMap() {
    return this._stateMap;
  }

  private _hideEmptyStates: boolean = true;
  get hideEmptyStates() {
    return this._hideEmptyStates;
  }
  set hideEmptyStates(hideEmptyStates: boolean) {
    this._hideEmptyStates = hideEmptyStates;
    let selectedKindNames: Array<string> = Object.keys(this._stateMap);
    for (let j: number = 0; j < selectedKindNames.length; j++) {
      delete this._stateMap[selectedKindNames[j]];
    }

    this.kindSelectionToggled(selectedKindNames, true);
  }

  private _selection: { kindNames: Array<string>, attributeName: string,
    stateName: string };
  get selection() {
    return this._selection;
  }

  get TreeConfiguration() {
    return TreeConfiguration;
  }

  get Object() {
    return Object;
  }

  constructor(private dialogService : DialogService) {}

  public ngAfterViewInit(): void {
    this.svg = d3.select(this._svgElement.nativeElement);

    // Add the svg canvas
    this.projectStreamSub = this.projectStream.subscribe((newProject) => {
      if (newProject) {
        this.project = newProject;

        for (let j: number = 0; j < this.project.projectItems.length; j++) {
          this.project.projectItems[j].visitTree(undefined, (itemProxy:
            ItemProxy) => {
            if ((itemProxy.model.item.stateProperties.length > 0) && (this.
              _kindNames.indexOf(itemProxy.kind) === -1)) {
              this._kindNames.push(itemProxy.kind);
            }
          }, undefined);
        }
        this._kindNames.sort((oneKindName: string, anotherKindName: string) => {
          return oneKindName.localeCompare(anotherKindName);
        });

        if (Object.keys(this._stateMap).length !== 0) {
          this.kindSelectionToggled(this._kindNames, false);
        }

        this.kindSelectionToggled(this._kindNames, true);
      }
    });
  }

  public ngOnDestroy(): void {
    this.projectStreamSub.unsubscribe();
  }

  openStateSummaryDialog(proxies: Array<ItemProxy>, kindName: string,
    stateName: string): void {
    this.dialogService.openComponentDialog(StateSummaryDialogComponent, {
      data: {
        proxies : proxies,
        kindName: kindName,
        stateName: stateName
      }
    }).updateSize('80%', '80%').afterClosed().subscribe(() => {
      this.kindSelectionToggled(this._kindNames, false);
      this.kindSelectionToggled(this._kindNames, true);
    });
  }

  updateGraph() {
    /* Using d3's remove function did not remove all child nodes of the SVG
    element, possibly due to it using forward iteration instead of reverse
    iteration. Thus, the below removal approach has been used instead. */
    for (let j: number = (this._svgElement.nativeElement.childNodes.length -
      1); j >= 0; j--) {
      this._svgElement.nativeElement.removeChild(this._svgElement.
        nativeElement.childNodes[j]);
    }

    this.setScales();

    this.xAxis = d3.axisBottom(this.xScale);
    this.svg.append('g').attr('class','x-axis').attr('transform',
      'translate(0,' + (this._svgElement.nativeElement.clientHeight -
      StateBarChartComponent._X_AXIS_PADDING) + ')').call(this.xAxis).
      selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr(
      "dy", ".15em").attr("transform", function(d) {
      return "rotate(-65)"
    }).on('mouseover', (d: any) => {
      let attributeAndStateNames: Array<string> = d.split(': ');
      this._selection = {
        kindNames: [],
        attributeName: attributeAndStateNames[0],
        stateName: attributeAndStateNames[1]
      };
      for (let kindName in this._stateMap) {
        if (this._stateMap[kindName][attributeAndStateNames[0]] && this.
          _stateMap[kindName][attributeAndStateNames[0]][
          attributeAndStateNames[1]]) {
          this._selection.kindNames.push(kindName);
        }
      }
    });

    this.yAxis = d3.axisLeft(this.yScale);
    this.svg.append('g').attr('class', 'y-axis').attr('transform',
      'translate(' + StateBarChartComponent._Y_AXIS_PADDING + ',' +
      -StateBarChartComponent._X_AXIS_PADDING + ')').call(this.yAxis);

    for (let kindName in this._stateMap) {
      let kindColor: string = TreeConfiguration.getWorkingTree().getModelProxyFor(kindName).view.item.color;
      for (let attributeName in this._stateMap[kindName]) {
        for (let stateName in this._stateMap[kindName][attributeName]) {
          let proxies: Array<ItemProxy> = this._stateMap[kindName][
            attributeName][stateName];
          this.svg.append('rect').datum([proxies]).attr('fill', kindColor).
            attr('x', this.xScale(attributeName + ': ' + stateName)).attr('y',
            this.yScale(proxies.length) - StateBarChartComponent.
            _X_AXIS_PADDING).attr('width', this.xScale.bandwidth()).attr(
            'height', (this.yScale(0) - this.yScale(proxies.length))).on(
            'mouseover', (d: any, i: number, nodes: Array<any>) => {
            d3.select(nodes[i]).transition('hover').attr('fill', this.
              lightenDarkenColor(kindColor, 70));
            this._selection = {
              kindNames: [kindName],
              attributeName: attributeName,
              stateName: stateName
            };
          }).on('mouseout', (d: any, i: number, nodes: Array<any>) => {
            d3.select(nodes[i]).transition('hoverOut').attr('fill', kindColor);
            this._selection = undefined;
          }).on('click', (d: any, i: any, nodes: Array<any>) => {
            this.openStateSummaryDialog(proxies, kindName, stateName);
          });
        }
      }
    }
  }

  setScales () {
    let horizontalLabels: Array<string> = [];
    let maxItems: number = 0;
    for (let kindName in this._stateMap) {
      for (let attributeName in this._stateMap[kindName]) {
        for (let stateName in this._stateMap[kindName][attributeName]) {
          horizontalLabels.push(attributeName + ': ' + stateName);

          let numberOfItems: number = this._stateMap[kindName][attributeName][
            stateName].length;
          if (numberOfItems > maxItems) {
            maxItems = numberOfItems;
          }
        }
      }
    }

    this.xScale = d3.scaleBand().domain(horizontalLabels).rangeRound([
      StateBarChartComponent._Y_AXIS_PADDING, this._svgElement.nativeElement.
      width.baseVal.value]).paddingInner(0.05);

    this.yScale = d3.scaleLinear().domain([0, maxItems]).range([this.
      _svgElement.nativeElement.clientHeight, StateBarChartComponent.
      _X_AXIS_PADDING]);
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

  public toggleAllSelected(select: boolean): void {
    if (select) {
      this.kindSelectionToggled(this._kindNames.filter((kindName: string) => {
        return !this._stateMap[kindName];
      }), true);
    } else {
      for (let kindName in this._stateMap) {
        delete this._stateMap[kindName];
      }

      this.updateGraph();
    }
  }

  public canMove(kindName: string, moveUp: boolean): boolean {
    let kindNames: Array<string> = Object.keys(this._stateMap);
    if (moveUp) {
      return (kindNames.indexOf(kindName) !== 0);
    } else {
      return (kindNames.indexOf(kindName) !== (kindNames.length - 1));
    }
  }

  public move(kindName: string, moveUp: boolean): void {
    let intermediateMap: any = {};
    let kindNames: Array<string> = Object.keys(this._stateMap);
    let kindIndex: number = kindNames.indexOf(kindName);
    for (let j: number = 0; j < (moveUp ? (kindIndex - 1) : kindIndex); j++) {
      intermediateMap[kindNames[j]] = this._stateMap[kindNames[j]];
      delete this._stateMap[kindNames[j]];
    }

    if (!moveUp) {
      intermediateMap[kindNames[kindIndex + 1]] = this._stateMap[kindNames[
        kindIndex + 1]];
      delete this._stateMap[kindNames[kindIndex + 1]];
    }

    intermediateMap[kindName] = this._stateMap[kindName];
    delete this._stateMap[kindName];

    if (moveUp) {
      intermediateMap[kindNames[kindIndex - 1]] = this._stateMap[kindNames[
        kindIndex - 1]];
      delete this._stateMap[kindNames[kindIndex - 1]];
    }

    for (let j: number = (moveUp ? (kindIndex + 1) : (kindIndex + 2)); j <
      kindNames.length; j++) {
      intermediateMap[kindNames[j]] = this._stateMap[kindNames[j]];
      delete this._stateMap[kindNames[j]];
    }

    for (let intermediateKindName in intermediateMap) {
      this._stateMap[intermediateKindName] = intermediateMap[
        intermediateKindName];
    }

    this.updateGraph();
  }

  public kindSelectionToggled(kindNames: Array<string>, selected: boolean):
    void {
    if (selected) {
      for (let j: number = 0; j < this.project.projectItems.length; j++) {
        this.project.projectItems[j].visitTree(undefined, (itemProxy:
          ItemProxy) => {
          if (kindNames.indexOf(itemProxy.kind) !== -1) {
            let kindMap: { [attributeName: string]: { [stateName: string]:
              Array<ItemProxy> } } = this._stateMap[itemProxy.kind];
            if (!kindMap) {
              kindMap = {};
              this._stateMap[itemProxy.kind] = kindMap;
            }

            let stateAttributeNames: Array<string> = itemProxy.model.item.
              stateProperties;
            for (let k: number = 0; k < stateAttributeNames.length; k++) {
              let attributeMap: { [stateName: string]: Array<ItemProxy> } =
                kindMap[stateAttributeNames[k]];
              if (!attributeMap) {
                attributeMap = {};
                kindMap[stateAttributeNames[k]] = attributeMap;
                for (let stateName in itemProxy.model.item.classProperties[
                  stateAttributeNames[k]].definition.properties.state) {
                  attributeMap[stateName] = [];
                }
              }

              let values: Array<ItemProxy> = attributeMap[itemProxy.item[
                stateAttributeNames[k]]];
              if (!values) {
                values = [];
                attributeMap[itemProxy.item[stateAttributeNames[k]]] = values;
              }

              values.push(itemProxy);
            }
          }
        }, undefined);
      }

      if (this._hideEmptyStates) {
        for (let kindName in this._stateMap) {
          for (let attributeName in this._stateMap[kindName]) {
            for (let stateName in this._stateMap[kindName][attributeName]) {
              if (this._stateMap[kindName][attributeName][stateName].length ===
                0) {
                delete this._stateMap[kindName][attributeName][stateName];
              }
            }
          }
        }
      }
    } else {
      for (let j: number = 0; j < kindNames.length; j++) {
        delete this._stateMap[kindNames[j]];
      }
    }

    this.updateGraph();
  }

  public getStateTotal(): number {
    let total: number = 0;
    for (let j: number = 0; j < this._selection.kindNames.length; j++) {
      total += this._stateMap[this._selection.kindNames[j]][this._selection.
        attributeName][this._selection.stateName].length;
    }

    return total;
  }

  public getStateDescription(kindName: string): string {
    return TreeConfiguration.getWorkingTree().getProxyFor(kindName).item.
      classProperties[this._selection.attributeName].definition.properties.
      state[this._selection.stateName].description;
  }
}
