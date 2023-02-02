import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent implements OnInit {

  isUserLoggedIn:boolean = false;
  _routeListener: any;
  currentAccount:any;
  selectedTabIndex: number = 1;
  fetchedBranches:any;
  draggeditem:any = [];
  dropArea:any;
  branches:any = [
    {branchname:'',locations:{dropdown:true,selected:true,unrouted:[],
      routes:[
        {route:'[227] dalhouse/dmtcmbt/edmstn 90 days-jh',routeid:101,locs:[{locname:'Canadian tire gas bar (35 Broadway)',id:82378},{locname:'ultramar ind(2 cameron rd)',id:75612},{locname:'couche tarmac (382 rue street Canada)',id:90234},{locname:'irving mainway - st leonard382 rue st-jean)',id:24556},{locname:'parkland/ultramar55 rosebury st)',id:97685}]}
      ,{route:'bthrst/negac/mramchi/blckvil - 90 days -jh',routeid:102,locs:[{locname:'10105 99 St, Nampa',id:45524},{locname:'AB-690, Deadwood, AB T0H 1A0, Canada',id:23424},{locname:'global fuels (120 canada rd)',id:63453},{locname:'bg fuels/mobil577 victoria street)',id:35735}]}
     ],loclength:0}},
    {branchname:'',locations:{dropdown:false,selected:false,unrouted:[],
      routes:[
        {route:'[227] dalhouse/dmtcmbt/edmstn 90 days-jh',routeid:201,locs:[{locname:'ultramar ind(2 cameron rd)',id:74823},{locname:'bg fuels/mobil577 victoria street)',id:39983}]}
     ],loclength:0}},
    {branchname:'',locations:{dropdown:false,selected:false,unrouted:[],routes:[],loclength:0}}];

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
  currentBranchDetails:any = {
    'branchName':'', 'locationsCount':0,'routesCount':0,'machinesCount':0,'techniciansCount':0,'totalCollection':0
  }
  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig:MsalGuardConfiguration,
  private msalBroadCasrService:MsalBroadcastService,
  private authService:MsalService,private loginService:LoginService,private router:Router,private apiService:ApiService,private dialog: MatDialog,private toastr: ToastrServices,private moveService:MoveService,private activatedRoute:ActivatedRoute) { 
    this._routeListener = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd){
         this.isUserLoggedIn = true;
         this.activatedRoute.queryParams.subscribe((params) => {
          this.currentBranchDetails.branchName = params['branchName'];
          this.currentBranchDetails.locationsCount = params['locationCount'];
          this.currentBranchDetails.routesCount = params['routesCount'];
          this.currentBranchDetails.machinesCount = params['machineCount'];
          this.currentBranchDetails.techniciansCount = params['technicianCount'];
          this.currentBranchDetails.totalCollection = params['totalCollection'];
          this.getAllBranches();
        });  
      }
    });
  }

  ngOnInit(): void {
    // this.loginService.getLoginStatus().subscribe((item) => {
    //   this.isUserLoggedIn = item;
    // })

     
   this.currentAccount =  this.authService?.instance?.getAllAccounts()[0];
   console.log(this.currentAccount);
  
   
   this.branches?.forEach((element:any) => {
    element?.locations?.routes?.forEach((route:any)=>{
      element.locations.loclength+=route?.locs?.length;
    })
    element?.locations?.unrouted?.forEach((route:any)=>{
      element.locations.loclength+=route?.locs?.length;
    })
   });
   if(this.branchData) this.branchData[0].dropped = true;
   this.branchView = true;
   this.routesView = false;
   this.locationsView = false;
   if(this.branchData) this.selectedBranch = this.branchData[0];
   this.moveService.getDropPoint().subscribe((item:any) => {
    this.dropPoint = item;
  });
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
      res.forEach((element:any,idx:any)=> {
        this.branches.forEach((item:any,index:any)=>{
          if(idx == index) item.branchname = element?.Branch_Name;
        })
      });
      console.log(this.currentBranchDetails)
      console.log(this.branchData[0])
      // if(this.currentBranchDetails.branchName == ''){
      //   this.currentBranchDetails.branchName = this.branchData[0]?.Branch_Name;
      //   this.currentBranchDetails.locationsCount = this.branchData[0]?.Location_Count;
      //   this.currentBranchDetails.machinesCount = this.branchData[0]?.Machine_count;
      //   this.currentBranchDetails.techniciansCount = this.branchData[0]?.Technician_Count;
      //   this.currentBranchDetails.routesCount = this.branchData[0]?.Route_Count;
      //   this.currentBranchDetails.totalCollection = this.branchData[0]?.Total_Collection;
      // }
      this.loader = false;
    });
  }

  getAllRoutesofBranch(obj:any){
    let branch = obj?.branch;
    let viewtype = obj?.view;
    console.log(branch,viewtype)
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/RouteList/${branch?.Branch_Id}`).subscribe((res)=>{
      console.log(res);
      if(branch.branch_Id == res[0].branch_Id){
        if(viewtype == 'locationsView'){
          this.branchData.forEach((item:any)=>{
            if(item.Branch_Id != branch?.Branch_Id) item.showRoutesList = false;
          })
          branch.showRoutesList = true;
        }
        else if(viewtype == 'dropView') branch.routesDropped = true;
        branch.Routes = res;
        this.loader = false;
      }
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
    this.getAllRoutesofBranch({branch:branch,view:'locationsView'})
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
