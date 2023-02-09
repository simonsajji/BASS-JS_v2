import { NavigationEnd, Router } from '@angular/router';
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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // host: {
  //   '(document:click)': '(onBodyClick($event))'
  // }
})
export class HomeComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  _routeListener: any;
  currentAccount: any;
  branchData: any;
  branchView: boolean = false;
  locationsView: boolean = false;
  routesView: boolean = false;
  selectedBranch: any;
  selectedRoute: any;
  loader: any;
  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalBroadCasrService: MsalBroadcastService,
    private authService: MsalService, private loginService: LoginService, private router: Router, private apiService: ApiService, private dialog: MatDialog, private toastr: ToastrServices, private moveService: MoveService) {
    this._routeListener = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isUserLoggedIn = true;
      }
    })
  }
  ngOnInit(): void {
    // this.loginService.getLoginStatus().subscribe((item) => {
    //   this.isUserLoggedIn = item;
    // });
    this.currentAccount = this.authService?.instance?.getAllAccounts()[0];
    console.log(this.currentAccount);
    this.getAllBranches();
    if (this.branchData) this.branchData[0].dropped = true;
    this.branchView = true;
    this.routesView = false;
    this.locationsView = false;
    if (this.branchData) this.selectedBranch = this.branchData[0];
  }

  logout(ev: any) {
    if (ev) this.authService.logoutRedirect({ postLogoutRedirectUri: environment?.postLogoutUrl });
  }

  getAllBranches() {
    this.apiService.get('http://bassnewapi.testzs.com/api/Branch/BranchList').subscribe((res) => {
      res.sort((a: any, b: any) => (a.Branch_Name > b.Branch_Name) ? 1 : ((b.Branch_Name > a.Branch_Name) ? -1 : 0));
      console.log(res);
      this.branchData = res;
      this.branchData.forEach((branch: any) => {
        branch.selected = false;
        branch.dropped = false;
        branch.routesDropped = false;
        branch.showRoutesList = false;
        branch.showLocationsList = false;
        branch.showMachinesList = false;
        branch.showTechniciansList = false;
      })
      this.branchData[0].dropped = true;
      this.branchView = true;
      this.routesView = false;
      this.locationsView = false;
      this.selectedBranch = this.branchData[0];
      this.branchData[0].selected = true;
      console.log(this.branchData);
      this.router.navigate(['home/branch'],
        {
          queryParams: {
            branchId: this.branchData[0]?.Branch_Id, branchName: this.branchData[0]?.Branch_Name,
            routesCount: this.branchData[0]?.Route_Count,
            machineCount: this.branchData[0]?.Machine_count,
            technicianCount: this.branchData[0]?.Technician_Count,
            totalCollection: this.branchData[0]?.Total_Collection,
            locationCount: this.branchData[0]?.Location_Count
          }, skipLocationChange: true
        })
    });
  }

  currentbranchSelect(ev: any) {
    this.unSetAll();
    this.branchData.forEach((branch: any) => {
      if (branch?.Branch_Id == ev?.Branch_Id) branch.selected = true;
      else branch.selected = false;
    });

  }

  unSetAll() {
    this.branchData.forEach((branch: any) => {
      branch.selected = false;
      branch.showRoutesList = false;
      branch.showLocationsList = false;
      branch.showMachinesList = false;
      branch.showTechniciansList = false;
    });

  }

  selectRouteView(branchId: any) {
    this.unSetAll();
    this.branchData.forEach((branch: any) => {
      if (branch?.Branch_Id == branchId) branch.showRoutesList = true;
      else branch.showRoutesList = false;
    });
  }

  selectLocationView(branchId: any) {
    this.unSetAll();
    this.branchData.forEach((branch: any) => {
      if (branch?.Branch_Id == branchId) branch.showLocationsList = true;
      else branch.showLocationsList = false;
    });
  }

  selectMachineView(branchId: any) {
    this.unSetAll();
    this.branchData.forEach((branch: any) => {
      if (branch?.Branch_Id == branchId) branch.showMachinesList = true;
      else branch.showMachinesList = false;
    });
  }

  selectTechnicianView(branchId: any) {
    this.unSetAll();
    this.branchData.forEach((branch: any) => {
      if (branch?.Branch_Id == branchId) branch.showTechniciansList = true;
      else branch.showTechniciansList = false;
    });
  }

}
