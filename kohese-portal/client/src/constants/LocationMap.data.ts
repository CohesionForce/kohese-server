/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


/* Contains the information needed for routing and displaying the correct
*  components without defining explicit handling code for each state
*
*  UI components sending parameters into click events will now also be able to
*  reference a intuitive name for each route instead of having to pass in all
*  the needed route values in the markup
*
*  Top level calls referencing this map will likely look like this
*   ```
*  <div (click)="navigate('Details', {id: proxy.id}">
*    ...
*  </div>
*   ```
*/

export var LocationMap = {
  'Login': {
    'type' : 'external',
    'title': undefined,
    'params': {},
    'route': '/login'
  },
  'Dashboard': {
    'type' : 'single',
    'title': 'Dashboard',
    'params': {},
    'route' : '/dashboard'
  },
  // We should rename this component to be called Users
  'Admin': {
    'type': 'single',
    'title': 'Admin',
    'params': {},
    'route': '/admin'
  },
  'Versions': {
    'type': 'dual',
    'title': 'Versions',
    'params': ['id'],
    'route': '/versions'
  },
  'Repositories': {
    'type': 'single',
    'title': 'Repositories',
    'params': {},
    'route': '/repositories'
  },
  'Explore' : {
    'type' : 'dual',
    'title' : 'Explore',
    'params' : ['id'],
    'route' : '/explore'
  },
  'Analysis' : {
    'type' : 'single',
    'title': 'Analysis',
    'params' : {},
    'route' : '/analysis'
  },
  'Type-Editor' : {
    'type' : 'single',
    'title' : 'Type Editor',
    'params' : [],
    'route' : '/typeeditor'
  },
  'Dev-Tools' : {
    'type' : 'single',
    'title' : 'Dev Tools',
    'params' : [],
    'route' : '/devtools'
  },
  'Outline': {
    params: ['id'],
    route: 'outline'
  },
  'Document' : {
    'params' : ['id'],
    'route' : 'document'
  },
  'Reports': {
    route: 'reports'
  }
}

