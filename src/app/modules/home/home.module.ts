import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './components/home/home.component';
import { BranchComponent } from './components/branch/branch.component';
import { RoutesComponent } from './components/routes/routes.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { RemoveUnderscorePipe } from 'src/app/pipes/removeunderscore.pipe';
import { LocationListComponent } from './components/location-list/location-list.component';
import { MachinesListComponent } from './components/machines-list/machines-list.component';
import { LocationDetailsComponent } from './components/location-details/location-details.component';
import { TechniciansListComponent } from './components/technicians-list/technicians-list.component';
@NgModule({
  declarations: [
    HomeComponent,
    BranchComponent,
    RoutesComponent,
    LocationListComponent,
    MachinesListComponent,
    LocationDetailsComponent,
    TechniciansListComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MaterialModule,
    SharedModule,

  ]
})
export class HomeModule { }
