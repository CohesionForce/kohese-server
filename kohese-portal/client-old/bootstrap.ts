import '../node_modules/zone.js/dist/zone';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { UpgradeModule } from '@angular/upgrade/static';
import { AppModule } from './app.module';
import { Ng1AppModule } from './app';

console.log('Bootstrap.ts');

/* The first call bootstraps the Angular 2 module,
   after that resolves we bootstrap the Angular 1 module */
platformBrowserDynamic().bootstrapModule(AppModule)
  .then(platformRef => {
  console.log("Bootstrap start")
  console.log("Ng1AppModule");
  console.log(Ng1AppModule);
  const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
  upgrade.bootstrap(document.documentElement, [Ng1AppModule.name]);
});
