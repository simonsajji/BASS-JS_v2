import { Component, OnInit,Inject, HostListener } from '@angular/core';
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
  datanew : any;
  columns:any;
  selectedOptions: string[] = [];
  orderedColumns: string[] = [];
  loader:boolean = false;
  currentUserViews:any;
  branchId:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,private dialogRef: MatDialogRef<EditRouteBoxComponent>,private toastr:ToastrServices,private apiService:ApiService) {    
    if (data) {
      // this.columns = data.columns ;
      // this.selectedOptions = [...data?.selectedcolumns];
      // this.orderedColumns = [...data?.orderedColumns];
      // this.currentUserViews = data?.currentUserViews;
      // this.datanew = data;
      this.branchId = data?.branchId;
    }
    this.fetchAllRoutesofBranch();
  }

  ngOnInit(): void{ }

  okClick(): void {
    this.updateColumns();
  }

  fetchAllRoutesofBranch(){
    this.loader = true;
    
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/RouteList/${this.branchId}`).subscribe((res)=>{
      console.log(res);
      this.datanew = res;   
      this.loader = false;
     
    })

  }

  updateColumns(){
    // let currentUserViews = this.currentUserViews?.[0];
    // let selectedColumns = "[" + this.selectedOptions + "]";
    // selectedColumns = selectedColumns?.replace(/,/g," ");
    // let payload_ = {
    //   "User_ID": currentUserViews?.user_id,
    // };
    // this.loader = true;
    // this.apiService.put(`${environment?.coreApiUrl}/update_user_view`, payload_).subscribe(
    //   (dat:any) => {
    //     if(dat?.message) this.toastr.success('Successfully updated the columns in Table View');
    //     this.loader = false;
    //     this.dialogRef.close(this.selectedOptions)
    //   },
    //   (error: any) => {
    //     // console.log(error);
    //     if (error?.status == 200) {
    //       this.toastr.success('Successfully updated the columns in Table View');
    //       this.loader = false;
    //       this.dialogRef.close(this.selectedOptions);
    //     }
    //     else {
    //       this.loader = false;
    //       this.toastr.error("Error occured while updating the columns in Table View");
    //       this.dialogRef.close(this.selectedOptions);
    //     }
    //   }
    // )
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
  

}
