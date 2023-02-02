import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftMenuComponent } from 'src/app/components/left-menu/left-menu.component';
import { ConfirmBoxComponent } from 'src/app/components/confirm-box/confirm-box.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ContextMenuComponent } from 'src/app/components/context-menu/context-menu.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { HomeComponent } from '../home/components/home/home.component';
import { DetailsComponent } from 'src/app/components/details/details.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { RemoveUnderscorePipe } from 'src/app/pipes/removeunderscore.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    LeftMenuComponent,
    ConfirmBoxComponent,
    HeaderComponent,
    ContextMenuComponent,
    ProfileComponent,
    DetailsComponent,
    LeftMenuComponent,
    DetailsComponent,
    RemoveUnderscorePipe,    
  ],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule.forRoot()
    
  ],
  exports:[
    LeftMenuComponent,
    ConfirmBoxComponent,
    HeaderComponent,
    ContextMenuComponent,
    ProfileComponent,
    DetailsComponent,
    LeftMenuComponent,
    NgxSkeletonLoaderModule,
    RemoveUnderscorePipe,
  ]
})
export class SharedModule { }
