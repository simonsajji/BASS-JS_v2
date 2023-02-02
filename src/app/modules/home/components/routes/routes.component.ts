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


@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css'],
  // animations: [
  //   trigger('slideInOut', [
  //     transition(':enter', [
  //       style({transform: 'translateX(22%)'}),
  //       animate('0.4s ease-in-out', style({transform: 'translateX(0%)'}))
  //     ]),
  //     transition(':leave', [
  //       animate('0.4s ease-in-out', style({transform: 'translateX(22%)'}))
  //     ])
  //   ]),
  // ]
})
export class RoutesComponent implements OnInit,OnChanges,AfterViewInit {

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
  shownColumns:any = ['Route_Id','Route_Name','Primary_Servicer_Name','Secondary','Add'];
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
  selectedRte:any;
  loaderFetchRouteDetails:any;
  routeBranchId:any;
  routesCount:any;
  @ViewChild('filterName') filterName: any;

  @ViewChild('matpaginatr') paginator: MatPaginator | any;

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig:MsalGuardConfiguration,
  private msalBroadCasrService:MsalBroadcastService,private cdr: ChangeDetectorRef,
  private authService:MsalService,private loginService:LoginService,private router:Router,private apiService:ApiService,private dialog: MatDialog,private toastr: ToastrServices,private moveService:MoveService,private activatedRoute:ActivatedRoute) { 
    this._routeListener = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd){
         this.isUserLoggedIn = true;
         this.activatedRoute.queryParams.subscribe((params) => {
          this.routeBranchId = params['branchId'];
          this.routesCount = params['routesCount'];
          console.log(this.routeBranchId); // OUTPUT 123
          // this.dataSource.paginator = this.paginator;
          this.getAllBranches();
          this.getAllRoutesofBranch();
        });
      }
    });
    
    
  }

  ngOnInit(): void {
    this.pageSizeperPage = 8;
   this.routeDetailState = false;
  
   this.currentAccount =  this.authService?.instance?.getAllAccounts()[0];
   console.log(this.currentAccount);
 
   if(this.branchData) this.branchData[0].dropped = true;
   this.branchView = true;
   this.routesView = false;
   this.locationsView = false;
    if(this.branchData) this.selectedBranch = this.branchData[0];
    this.moveService.getDropPoint().subscribe((item:any) => {
      this.dropPoint = item;
    });

  
  }

  ngAfterViewInit() {
    // this.dataSource = new MatTableDataSource<any>(this.data);
    this.dataSource = new MatTableDataSource<any>([]);
    // this.dataSource.paginator = this.paginator;    
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.selection = this.tableService.getSelectionModel();

  }

  changeState(): void {
    // (this.routeDetailState == false) ? this.routeDetailState = true : this.routeDetailState = false;
  }

  viewRouteDetails(row:any){
    console.log(row);
   this.selectedRte = row;

  }

  applyFilter(filterValue: any, column: any) {
    // this.selection.deselect(...this.getPageData())
    if (filterValue.target?.value == '') {
      this.isFilterActive = false;
      this.filteredColumns.map((item: any, idx: any) => {
        if (item == column) this.filteredColumns.splice(idx, 1)
      });
      this.clearAllFilters();
      // this.tableService.clearSelectionModel();
    }
    else {
      if (column == 'Title') {
        this.enabledRouteFilter = false;
        this.enabledAddressLine1Filter = false;
        this.enabledLocationNameFilter = true;
      }
    

      this.isFilterActive = true;
      this.filteredColumns.push(column);
      this.dataSource.filterPredicate = function (data: any, filter: string): any {
        if (column == 'Title') return data?.Title?.toLowerCase().includes(filter);

      };
      if (filterValue?.target?.value) filterValue = filterValue.target?.value?.trim().toLowerCase();
      else filterValue = filterValue;
      this.dataSource.filter = filterValue;
      this.cdr.detectChanges();
    }
  }

  clearAllFilters() {
    this.applyFilter('', '');
    this.enabledLocationNameFilter = true;
    if (this.filterName?.nativeElement) this.filterName.nativeElement.value = '';

    this.isFilterActive = false;
  }

  onChangedPage(event: any) {
    this.pageSizeperPage = event?.pageSize;
    this.masterCheckbox = false;
  
  
  }


  logout(ev:any){
    if(ev) this.authService.logoutRedirect({postLogoutRedirectUri:environment?.postLogoutUrl});
  }

  getAllBranches(){
    this.loader = true;
    this.apiService.get('http://bassnewapi.testzs.com/api/Branch/BranchList').subscribe((res)=>{
      res.sort((a:any,b:any) => (a.Branch_Name > b.Branch_Name) ? 1 : ((b.Branch_Name > a.Branch_Name) ? -1 : 0));
      console.log(res);
      this.branchData = res;
      this.branchData.forEach((branch:any)=>{
        branch.selected = false;
        branch.dropped = false;
        branch.routesDropped = false;
        branch.showRoutesList = false;
      })
      this.branchData[0].dropped = true;
      this.branchView = true;
      this.routesView = false;
      this.locationsView = false;
      this.selectedBranch = this.branchData[0];      
      console.log(this.branchData);
      // this.loader = false;
    });
  }

  getAllRoutesofBranch(){
    this.loader = true;
    
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/RouteList/${this.routeBranchId}`).subscribe((res)=>{
      console.log(res);
      this.data = res;
      this.dataSource.data = res;
      this.selectedRte = this.data[0];
   
      this.loader = false;
     
    })
  }

  getLocationsofRoute(route:any){
    console.log(route?.Route_Id);
    // this.loader = true;
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/LocationList/${route?.Route_Id}`).subscribe((res)=>{
      // console.log(res);
      route.Locations = res;
      route.isrouteDropped = true;
      route?.Locations.forEach((item:any)=>{
        item.selected = false;
      })
      console.log(this.branchData);
      // this.loader = false;
    })
  }

  

  currentbranchSelect(branch:any){
    this.branchView = true;
    this.locationsView = false;
    this.routesView = false;
    this.selectedBranch = branch;
    branch.showRoutesList = false;
  }

  
  expandBranch(branch:any){
    // this.shrinkAllBranches();
    this.branchData?.forEach((element:any)=>{
      if(element?.Branch_Id == branch?.Branch_Id) element.dropped = true;
      // else element.dropped = false;
    })
  }

  shrinkBranch(branch:any){
    this.branchData?.forEach((element:any)=>{
      if(element?.Branch_Id == branch?.Branch_Id) element.dropped = false;
    })
  }

  shrinkAllBranches(){
    this.branchData?.forEach((branch:any)=>{
      branch.dropped = false;
    });
    console.log(this.branchData)
  }

  onTabChanged(event:any): void {
    this.selectedTabIndex = event?.index;
  }

  selectBranchLocation(branch:any){
    // this.getAllRoutesofBranch({branch:branch,view:'locationsView'})
    this.branchView = false;
    this.routesView = false;
    this.selectedRoute = '';
    branch?.Routes?.forEach((route:any)=>{
      route.selected = false;
    })
    this.locationsView = true;
    branch.showRoutesList = true;
    this.loader = true;
  }

  selectRoute(route:any){
    this.dataloader = true;
    this.routesView = true;
    this.branchView = false;
    this.locationsView = false;
    this.getDetailsofSelectedRoute(route);
    this.selectedRoute = route;
    this.draggeditem = [];
    
  }

  getDetailsofSelectedRoute(route:any){
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/LocationList/${route?.Route_Id}`).subscribe((res)=>{
      if(res){
        route.Locations = res;
        route?.Locations.forEach((item:any)=>{
          item.selected = false;
        })
        if(this.selectedRoute?.Locations) this.selectedRoute.Locations = res;
        let timeOutId = setTimeout(()=>{
          if(this.selectedRoute?.Locations?.length > 0)  this.dataloader = false;
        },400)
      }
      else this.dataloader = false;
      
    });
   
  }


  onRightClick(item:any){
    if(item?.RouteName){
      // this.dropArea = item;
      // this.contextmenuX = ev?.clientX
      // this.contextmenuY = ev?.clientY
      // this.contextmenu=true;
    } 
    else this.dropArea = null;
    return false;
  }

  selectLocationCard(item:any){
    if(item?.selected){
      item.selected = false;
      this.draggeditem = this.draggeditem.filter((loc:any)=>{
        if(item?.LocationId != loc?.LocationId) return item 
      })
    }
    else{
      item.selected = true;
      if(item?.LocationId) this.draggeditem?.push(item);
      else{ this.draggeditem = null;}
      console.log(this.draggeditem)
    }
    
  }

  disableContextMenu(){
    this.contextmenu= false;
  }

  moveLocation(){
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      data: {
        message: 'Are you sure want to Move?',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        // remove location from current route
        console.log(this.draggeditem)
        this.branchData?.forEach((element:any) => {
          element?.Routes?.forEach((route:any)=>{
              this.draggeditem?.forEach((item:any)=>{
               route.Locations =  route?.Locations?.filter((loc:any,index:any)=>{return (loc?.LocationId != item?.LocationId)})
              })              
            // })
          })
        });
         // also remove it from selectedRoute
         this.draggeditem?.forEach((item:any)=>{
           this.selectedRoute.Locations =  this.selectedRoute?.Locations?.filter((loc:any,index:any)=>{return (loc?.LocationId != item?.LocationId)})
        })  
        // add location from new route
        this.branchData?.forEach((element:any) => {
          element?.Routes?.forEach((route:any)=>{
            if(this.dropArea?.Route_Id == route?.Route_Id) route?.Locations?.push(...this.draggeditem)
          })
        });
        this.toastr.success(`Moved  ${this.draggeditem.length} Locations to Route ${this.dropArea?.RouteName}  successfully`);
        this.draggeditem = [];
        this.dropArea = null;
        this.dropPoint = null;
      }
      
    });
       
  }

  moveApiLocation(){

  }

  moveLocationOnClick(ev:any){
    if(this.draggeditem && this.dropArea) this.moveLocation();
  }

  onBodyClick(event:any): void {
    if (event.target.classList[0] !== 'no-close') {
      this.contextmenu = false;
    }
  }

  allowDrop(ev:any,route:any) {
    ev.preventDefault();
    this.dropPoint = route;
  }

  itemDrop(ev:any,route:any){
    this.dropArea = route;
    console.log(this.dropArea?.Route_Id,  this.draggeditem[0]?.Route_Id)
    if(this.draggeditem && this.dropArea && (this.dropArea?.Route_Id != this.draggeditem[0]?.Route_Id)) this.moveLocation();
  }

  drgEnter(ev:any){
    this.moveService.setDropPoint(null);
  }

  drgEv(ev:any){
    this.moveService.setDropPoint(this.dropPoint);
  }

}
