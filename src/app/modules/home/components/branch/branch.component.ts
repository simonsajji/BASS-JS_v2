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
  branchData:any;
  branchView:boolean = false;
  locationsView:boolean = false;
  routesView:boolean = false;
  loader:any;
  currentBranchId:any;
  fetchedBranches:any;
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
          this.currentBranchId = params['branchId'];
          this.currentBranchDetails.branchId = params['branchId'];
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
  }

  logout(ev:any){
    if(ev) this.authService.logoutRedirect({postLogoutRedirectUri:environment?.postLogoutUrl});
  }

  getAllBranches(){
    this.loader = true;
    this.apiService.get('http://bassnewapi.testzs.com/api/Branch/BranchList').subscribe((res)=>{
      res.sort((a:any,b:any) => (a.Branch_Name > b.Branch_Name) ? 1 : ((b.Branch_Name > a.Branch_Name) ? -1 : 0));
      this.fetchedBranches = res;
      this.fetchedBranches.forEach((branch:any)=>{
        if(this.currentBranchId == branch?.Branch_Id) this.branchData = branch;
      })  
      this.loader = false;
    });
  }
}
