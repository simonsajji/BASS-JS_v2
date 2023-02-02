import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './modules/authentication/components/authentication.component';
import { MsalGuard } from '@azure/msal-angular';

import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'home',
        // canActivate:[MsalGuard],
        
        loadChildren: () =>
          import('./modules/home/home.module').then((m) => m.HomeModule)
      },
      {
        path: '',
         // canActivate:[MsalGuard],
        loadChildren: () =>
          import('./modules/authentication/authentication.module').then((m) => m.AuthenticationModule)
      },
    
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    initialNavigation:'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
