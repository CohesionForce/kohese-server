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
  'Create' : {
    'type' : 'dual',
    'title' : 'Create Item',
    'params' : ['parentId'],
    'route' : '/create'
  },
  'Type-Creator' : {
    'type' : 'single',
    'title' : 'Type Creator',
    'params' : [],
    'route' : '/typecreator'
  }
}

