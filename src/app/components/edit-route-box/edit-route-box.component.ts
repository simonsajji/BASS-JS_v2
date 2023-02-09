import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { ToastrServices } from 'src/app/services/toastr.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit-route-box',
  templateUrl: './edit-route-box.component.html',
  styleUrls: ['./edit-route-box.component.css']
})
export class EditRouteBoxComponent implements OnInit {

  message: string = "";
  datanew: any;
  columns: any;
  selectedOptions: string[] = [];
  orderedColumns: string[] = [];
  loader: boolean = false;
  currentUserViews: any;
  branchId: any;
  dropDownActive: boolean = false;
  destinationRoute: any;
  sourceRoute: any;
  location: any;
  currentRouteName: any;
  currentTechnicianName: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any, private dialogRef: MatDialogRef<EditRouteBoxComponent>, private toastr: ToastrServices, private apiService: ApiService) {
    if (data) {
      this.branchId = data?.branchId;
      this.currentRouteName = data?.currentRouteName;
      this.location = data?.location;
      console.log(data?.location);
      console.log(this.destinationRoute)
    }
    this.fetchAllRoutesofBranch();
  }

  ngOnInit(): void {
    this.dropDownActive = true;
  }

  okClick(): void {
    this.editRoute()
  }

  editRoute() {
    let payload = [

      {
        "Item_Id": this.destinationRoute?.Branch_Id, // target branch id
        "Item_Name": null,
        "Source_BranchId": this.branchId,
        "Target_BranchId": this.destinationRoute?.Branch_Id,
        "Source_RouteId": null,
        "Target_RouteId": this.destinationRoute?.Route_Id,
        "Source_Technician_Id": null,
        "Target_Technician_Id": this.destinationRoute?.Servicer_Id,
        "Initiator_Id": 2708,
        "Initiator_RoleId": null,
        "Technician_Move_Id": null,
        "Source_Location_ID": this.location?.Location_Id,
        "Initiation_Date": null,
        "MoveStatus_Id": null

      }
    ]
    this.loader = true;
    console.log(this.destinationRoute);
    console.log(this.location)
    this.apiService.post(`http://bassnewapi.testzs.com/api/Branch/LocationMoveBetweenRoute`, payload).subscribe((res) => {
      console.log(res);
      if (res) this.toastr.success("The Route was changed successfully for the Location");
      let obj = {Route_Name:this.currentRouteName,First_Name:this.currentTechnicianName}
      this.dialogRef.close(obj)
      this.loader = false;
    },
      (error: any) => {
        this.toastr.error("The Route move is unsuccessful");
      }
    )
  }

  fetchAllRoutesofBranch() {
    this.loader = true;
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/RouteList?BranchId=${this.branchId}&Active=true`).subscribe((res) => {
      this.datanew = res;
      this.loader = false;
    })
  }

  selectRoutetoMove(route: any) {
    this.destinationRoute = route;
    this.currentRouteName = route?.Route_Name;
    this.currentTechnicianName = route?.Primary_Servicer_Name;
    this.dropDownActive = false;
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }


}
