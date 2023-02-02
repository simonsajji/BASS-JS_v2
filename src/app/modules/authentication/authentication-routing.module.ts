import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './components/authentication.component';

const routes: Routes = [
  {
    path:'',
    component:AuthenticationComponent,
  
     // canActivate:[MsalGuard],
     canActivate:[]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
