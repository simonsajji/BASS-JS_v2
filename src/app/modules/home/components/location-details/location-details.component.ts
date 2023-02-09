import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation,ViewChild,ChangeDetectorRef ,OnChanges, SimpleChanges, Pipe, PipeTransform,AfterViewInit } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from 'src/app/services/login.service';
import { ApiService } from 'src/app/services/api.service';
import { ConfirmBoxComponent } from '../../../../components/confirm-box/confirm-box.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrServices } from 'src/app/services/toastr.service';
import { ToastrService } from 'ngx-toastr';
import { A11yModule } from '@angular/cdk/a11y';
import { MoveService } from 'src/app/services/move.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations'; 
import { Location } from '@angular/common';
import { EditRouteBoxComponent } from 'src/app/components/edit-route-box/edit-route-box.component';


@Component({
  selector: 'app-location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.css']
})
export class LocationDetailsComponent implements OnInit {

  isUserLoggedIn:boolean = false;
  _routeListener: any;
  currentAccount:any;
  branchView:boolean = false;
  locationsView:boolean = false;
  routesView:boolean = false;
  selectedBranch:any;
  selectedRoute:any;
  dropPoint:any;
  loader:any;
  isDragActive:boolean = false;
  dataloader:boolean = false;
  selection = new SelectionModel<any>(true, []);
  dataSource: any ;
  dataSourceCollections: any ;
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  pageSizeperPage:any;
  data:any = [] ;
  locstionVisitsColumns:any = ['Date_&_Time','Servicer_Name','Issue_Reported'];
  machineColumns:any = ['Serial_Number','Machine_id','Machine_Type'];
  isFilterActive:any;
  filteredColumns: any = [];
  enabledAddressFilter: boolean = true;
  enabledLocationNameFilter: boolean = true;
  enabledAddressLine1Filter: boolean = true;
  enabledRouteFilter: boolean = true;
  enabledOnRouteFilter: boolean = true;
  orderedColumns: any;
  masterCheckbox: boolean = false;
  pgIndex: any = 0;
  routeDetailState:any;
  selectedLoc:any;
  loaderFetchRouteDetails:any;
  currentBranchId:any;
  routesCount:any;
  locationsCount:any;
  currentLocationId:any;
  currentLocation:any;
  filteredYear:any;
  currentRouteName:any;
  currentTechnicianName:any;
  @ViewChild('filterName') filterName: any;
  @ViewChild('matpaginatr') paginator: MatPaginator | any;

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig:MsalGuardConfiguration,
  private msalBroadCasrService:MsalBroadcastService,private cdr: ChangeDetectorRef,private locationCommon:Location,
  private authService:MsalService,private loginService:LoginService,private router:Router,private apiService:ApiService,private dialog: MatDialog,private toastr: ToastrServices,private moveService:MoveService,private activatedRoute:ActivatedRoute) { 
    this._routeListener = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd){
         this.isUserLoggedIn = true;
         this.activatedRoute.queryParams.subscribe((params) => {
          this.currentBranchId = params['branchId'];
          this.routesCount = params['routesCount'];
          this.locationsCount = params['locationsCount'];
          this.currentLocationId = params['locationId'];
          this.filteredYear = '2022';
          this.getLocationDetailsByLocationId();
        });
      }
    });
  }

  ngOnInit(): void {
    this.pageSizeperPage = 8;  
   this.currentAccount =  this.authService?.instance?.getAllAccounts()[0];   
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<any>([]);
    this.dataSourceCollections = new MatTableDataSource<any>([]);
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.selection = this.tableService.getSelectionModel();
  }

  onChangedPage(event: any) {
    this.pageSizeperPage = event?.pageSize;
    this.masterCheckbox = false;  
  }

  logout(ev:any){
    if(ev) this.authService.logoutRedirect({postLogoutRedirectUri:environment?.postLogoutUrl});
  }

  getLocationDetailsByLocationId(){
    this.loader = true;
    // this.dataSource = new MatTableDataSource<any>([]);
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/GetLocationsByLocatioId?LocationId=${this.currentLocationId}&Year=${this.filteredYear}`).subscribe((res)=>{
      console.log(res);
      this.data = res?.[0];
      this.currentRouteName = this.data?.Route_Name;
      this.dataSource.data = this.data?.machieinfo;
      this.currentTechnicianName = this.data?.First_Name;
      console.log(this.data)
      // this.dataSource.data = res;
      // this.currentLocation = this.data[0];
      // setTimeout(()=>{
      //   this.loader = false;
      // }, 2000);
      this.loader = false;
      // this.dataSource.paginator = this.paginator;
     
    })
  }

  editRoute(){
    const dialogRef = this.dialog.open(EditRouteBoxComponent, {
      data: {
        branchId:this.currentBranchId,
        currentRouteName:this.currentRouteName,
        location:this.data
      }
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        // this.shownColumns = data;
        this.currentRouteName = data?.Route_Name;
        this.currentTechnicianName = data?.First_Name;
      }
    });
  }

}
