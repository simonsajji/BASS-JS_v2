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


@Component({
  selector: 'app-machines-list',
  templateUrl: './machines-list.component.html',
  styleUrls: ['./machines-list.component.css']
})
export class MachinesListComponent implements OnInit {

  isUserLoggedIn:boolean = false;
  _routeListener: any;
  currentAccount:any;
  selectedTabIndex: number = 1;
  fetchedBranches:any;
  draggeditem:any = [];
  dropArea:any;
  branchData:any;
  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
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
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  pageSizeperPage:any;
  data:any = [] ;
  shownColumns:any = ['Machine_LocationId','Machine_Id','Serial_Number','Machine_TypeName','Machine_SubTypeName','Location_Id'];
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
  selectedMachine:any;
  loaderFetchRouteDetails:any;
  currentBranchId:any;
  routesCount:any;
  locationsCount:any;
  machinesCount:any;
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
          this.machinesCount = params['machinesCount'];
          console.log(this.currentBranchId); // OUTPUT 123
          this.getAllMachinesofBranch();
        });
      }
    });
  }

  ngOnInit(): void {
    this.pageSizeperPage = 8;
   this.routeDetailState = false;
   this.currentAccount =  this.authService?.instance?.getAllAccounts()[0];
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnChanges(changes: SimpleChanges) {  }

  viewMachineDetails(row:any){
   this.selectedMachine = row;
  }

  onChangedPage(event: any) {
    this.pageSizeperPage = event?.pageSize;
    this.masterCheckbox = false;  
  }
  logout(ev:any){
    if(ev) this.authService.logoutRedirect({postLogoutRedirectUri:environment?.postLogoutUrl});
  }

  getAllMachinesofBranch(){
    this.loader = true;
    // this.dataSource = new MatTableDataSource<any>([]);
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/MachinesList?BranchId=${this.currentBranchId}&Active=true`).subscribe((res)=>{
      console.log(res);
      this.data = res;
      this.dataSource.data = res;
      this.selectedMachine = this.data[0];
      // setTimeout(()=>{
      //   this.loader = false;
      // }, 2000);
      this.loader = false;
      // this.dataSource.paginator = this.paginator;
    })
  }
 
 }
