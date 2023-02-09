import { AnimationStyleMetadata } from '@angular/animations';
import { Component, OnInit,Input,Output,EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrServices } from 'src/app/services/toastr.service';
import { MoveService } from 'src/app/services/move.service';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import {fromEvent} from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})

export class LeftMenuComponent implements OnInit {
  @Input() branchData:any;
  @Input() selectedRoute:any;
  @Input() selectedBranch:any;
  @Input() branchView:any;
  @Input() locationsView:any;
  @Input() routesView:any;
  @Input() draggeditem:any;
  @Output() branchSelectEvent = new EventEmitter<any>();
  @Output() fetchAllRoutesEvent = new EventEmitter<any>();
  @Output() selectBranchLocationEvent = new EventEmitter<any>();
  @Output() selectRouteEvent = new EventEmitter<any>();
  @Output() selectLocationEvent = new EventEmitter<any>();
  @Output() selectMachineEvent = new EventEmitter<any>();
  @Output() selectTechnicianEvent = new EventEmitter<any>();
  dropArea:any;
  dropPoint:any = null;
  dragActive:boolean = false;
  xPos:any;
  yPos:any;
  @ViewChild('cursorDrop')  cursorDrop:ElementRef | undefined;
  constructor(private router:Router, private dialog: MatDialog,private toastr: ToastrServices,private moveService:MoveService,private apiService:ApiService) { }

  ngOnInit(): void {
    this.moveService.getDraggedItems().subscribe((item:any) => {
      this.draggeditem = item;
    });
    this.moveService.getDropPoint().subscribe((item:any) => {
      this.dropPoint = item;
    });
  }

  showRoutesList(branch:any){
    this.selectRouteEvent.emit(branch?.Branch_Id);
    this.router.navigate(['home/routes'],
    {queryParams:{branchId:branch?.Branch_Id,routesCount:branch?.Route_Count},skipLocationChange:true})

  }

  showLocationsList(branch:any){
    this.selectLocationEvent.emit(branch?.Branch_Id);
    this.router.navigate(['home/location-list'],
    // {queryParams:{branchId:branch?.Branch_Id,routesCount:branch?.Route_Count,locationsCount:branch?.Location_Count}}
    {queryParams:{branchId:branch?.Branch_Id,routesCount:branch?.Route_Count,locationsCount:branch?.Location_Count},skipLocationChange:true}
    )
  }

  showMachinesList(branch:any){
    this.selectMachineEvent.emit(branch?.Branch_Id);
    this.router.navigate(['home/machine-list'],
    // {queryParams:{branchId:branch?.Branch_Id,routesCount:branch?.Route_Count,locationsCount:branch?.Location_Count}}
    {queryParams:{branchId:branch?.Branch_Id,routesCount:branch?.Route_Count,locationsCount:branch?.Location_Count,machinesCount:branch?.Machine_count},skipLocationChange:true}
    )
  }
  showTechniciansList(branch:any){
    this.selectTechnicianEvent.emit(branch?.Branch_Id);
    this.router.navigate(['home/technicians-list'],
    // {queryParams:{branchId:branch?.Branch_Id,routesCount:branch?.Route_Count,locationsCount:branch?.Location_Count}}
    {queryParams:{branchId:branch?.Branch_Id,routesCount:branch?.Route_Count,locationsCount:branch?.Location_Count,techniciansCount:branch?.Technician_Count},skipLocationChange:true}
    )
  }

  navigate(route:any){
    this.router.navigate([route]) 
  }

  shrinkBranch(branch:any){
    this.branchData?.forEach((element:any)=>{
      if(element?.Branch_Id == branch?.Branch_Id) element.dropped = false;
    })
  }

  expandBranch(branch:any){
    // this.shrinkAllBranches();
    this.branchData?.forEach((element:any)=>{
      if(element?.Branch_Id == branch?.Branch_Id) element.dropped = true;
      // else element.dropped = false;
    })
  }

  currentbranchSelect(branch:any){
    this.branchSelectEvent.emit(branch);
    this.router.navigate(['home/branch'],
    {queryParams:{branchId:branch?.Branch_Id,branchName:branch?.Branch_Name,
      routesCount:branch?.Route_Count,
      machineCount:branch?.Machine_count,
      technicianCount:branch?.Technician_Count,
      totalCollection:branch?.Total_Collection,
      locationCount:branch?.Location_Count
    },skipLocationChange:true})
  }

  getAllRoutesofBranch(branch:any,view:any){
    this.fetchAllRoutesEvent.emit({branch:branch,view:view})
  }

  selectBranchLocation(branch:any){
    this.selectBranchLocationEvent.emit(branch);
  }

  allowDrop(ev:any,route:any) {
    // ev.preventDefault();
    this.dropPoint = route;
    this.moveService.setDropPoint(this.dropPoint);
    this.dragActive = true;  
    // ev.target.classList.add('drop-point') 
  }

  dragOver(ev:any,route:any){
    ev.preventDefault();
    this.dropPoint = route;
    this.moveService.setDropPoint(this.dropPoint);
    this.dragActive = true;  
    // ev.target.classList.add('drop-point') 
  }

  dragEnded(ev:any){
    this.dropPoint = null;
    this.moveService.setDropPoint(this.dropPoint);
  }

  disallowDrop(ev:any){
    this.dragActive = false;
    // this.dropPoint = null;
    if(this.cursorDrop) this.cursorDrop.nativeElement.classList.add('v-hidden');
    // ev.target.classList.remove('drop-point') 

  }

  getDivPosition(event:any){ 
    var x = event.clientX; 
    var y = event.clientY; 
    this.xPos = event.clientX;
    this.yPos = event.clientY;
    this.dragActive = true;
    if(this.cursorDrop) this.cursorDrop.nativeElement.classList.remove('v-hidden')
  } 

  leaveDropArea(ev:any){
    if(this.cursorDrop) this.cursorDrop.nativeElement.classList.add('v-hidden');
    // this.dropPoint = null;
  }

  leaveDrp(ev:any){
    this.moveService.setDropPoint(null)
  }

  itemDrop(ev:any,route:any){
    this.dropArea = route;
    this.dragActive = false;
    if(this.cursorDrop) this.cursorDrop.nativeElement.classList.add('v-hidden')
    if(this.draggeditem.length>0 && this.dropArea && (this.dropArea?.Route_Id != this.draggeditem[0]?.Route_Id)) this.moveLocation();
    this.dropPoint = null;
    this.moveService.setDropPoint(this.dropPoint);
  }

  itDrp(ev:any){
    this.dropPoint = null;
    this.moveService.setDropPoint(this.dropPoint);
  }

  moveLocation(){
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      data: {
        locations: `${this.draggeditem.length}`,
        sourceRoute: `${this.draggeditem[0]?.RouteName}`,
        destinationRoute: `${this.dropArea?.RouteName}`,

      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true)  this.moveApiLocation();
    });
    
  }

  moveApiLocation(){
    let params = [
      {
          "ItemId": 10,
          "ItemName": "loc010",
          "SourceBranchId": 2,
          "TargetBranchId": 3,
          "SourceRouteId": 4,
          "TargetRouteId": 5,
          "SourceTechnicianId": 6,
          "TargetTechnicianId": 7,
          "InitiatorId": 80
      },
      {
          "ItemId": 11,
          "ItemName": "loc110",
          "SourceBranchId": 2,
          "TargetBranchId": 3,
          "SourceRouteId": 4,
          "TargetRouteId": 5,
          "SourceTechnicianId": 6,
          "TargetTechnicianId": 7,
          "InitiatorId": 81
      }
  ]
    this.apiService.post(`http://bassnewapi.testzs.com/api/Branch/LocationMoveBetweenRoute`,params).subscribe((res)=>{
      if(res){
        console.log(res)
        // remove location from current route
        console.log(this.draggeditem)
        this.branchData?.forEach((element:any) => {
          element?.Routes?.forEach((route:any)=>{
              this.draggeditem?.forEach((item:any)=>{
               route.Locations =  route?.Locations?.filter((loc:any,index:any)=>{return (loc?.LocationId != item?.LocationId)})
              })              
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
        this.draggeditem = [];// need to set it in service
        this.moveService.setDraggedItems([])
        this.dropArea = null;
        this.dropPoint = null;
        this.moveService.setDropPoint(this.dropPoint);
      }
      else this.toastr.warning("Unable to Move")
    })
  }

  moveLocationOnClick(ev:any){
    if(this.draggeditem && this.dropArea) this.moveLocation();
  }


  getLocationsofRoute(route:any){
    console.log(route?.Route_Id);
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/LocationList/${route?.Route_Id}`).subscribe((res)=>{
      route.Locations = res;
      route.isrouteDropped = true;
      route?.Locations.forEach((item:any)=>{
        item.selected = false;
      })
      console.log(this.branchData);
    })
  }

  selectRoute(route:any){
    this.selectRouteEvent.emit(route);
    this.moveService.setDraggedItems([]);
  }

}
