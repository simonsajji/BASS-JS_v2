import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchComponent } from './components/branch/branch.component';
import { HomeComponent } from './components/home/home.component';
import { LocationDetailsComponent } from './components/location-details/location-details.component';
import { LocationListComponent } from './components/location-list/location-list.component';
import { MachinesListComponent } from './components/machines-list/machines-list.component';
import { RoutesComponent } from './components/routes/routes.component';
import { TechniciansListComponent } from './components/technicians-list/technicians-list.component';

const routes: Routes = [
  {
    path:'',
    component:HomeComponent,
    children: [
      {
        path:'branch', component: BranchComponent
      },
      {
        path:'routes', component: RoutesComponent
      },
      {
        path:'location-list', component: LocationListComponent
      },
      {
        path:'machine-list', component: MachinesListComponent
      },
      {
        path:'location-details', component: LocationDetailsComponent
      },
      {
        path:'technicians-list', component: TechniciansListComponent
      }
    ]
     // canActivate:[MsalGuard],
    //  canActivate:[]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
