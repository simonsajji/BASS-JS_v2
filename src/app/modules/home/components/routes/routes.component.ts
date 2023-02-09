import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef, OnChanges, SimpleChanges, Pipe, PipeTransform, AfterViewInit } from '@angular/core';
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
export class RoutesComponent implements OnInit, OnChanges, AfterViewInit {

  isUserLoggedIn: boolean = false;
  _routeListener: any;
  currentAccount: any;
  selectedTabIndex: number = 1;
  fetchedBranches: any;
  branchView: boolean = false;
  locationsView: boolean = false;
  routesView: boolean = false;
  selectedBranch: any;
  selectedRoute: any;
  dropPoint: any;
  loader: any;
  dataloader: boolean = false;
  selection = new SelectionModel<any>(true, []);
  dataSource: any;
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  pageSizeperPage: any;
  data: any = [];
  shownColumns: any = ['Route_Id', 'Route_Name', 'Primary_Servicer_Name', 'Secondary', 'Add'];
  isFilterActive: any;
  filteredColumns: any = [];
  enabledAddressFilter: boolean = true;
  enabledLocationNameFilter: boolean = true;
  enabledAddressLine1Filter: boolean = true;
  enabledRouteFilter: boolean = true;
  enabledOnRouteFilter: boolean = true;
  orderedColumns: any;
  masterCheckbox: boolean = false;
  pgIndex: any = 0;
  routeDetailState: any;
  selectedRte: any;
  loaderFetchRouteDetails: any;
  routeBranchId: any;
  routesCount: any;
  @ViewChild('filterName') filterName: any;

  @ViewChild('matpaginatr') paginator: MatPaginator | any;

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalBroadCasrService: MsalBroadcastService, private cdr: ChangeDetectorRef,
    private authService: MsalService, private loginService: LoginService, private router: Router, private apiService: ApiService, private dialog: MatDialog, private toastr: ToastrServices, private moveService: MoveService, private activatedRoute: ActivatedRoute) {
    this._routeListener = router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isUserLoggedIn = true;
        this.activatedRoute.queryParams.subscribe((params) => {
          this.routeBranchId = params['branchId'];
          this.routesCount = params['routesCount'];
          this.getAllRoutesofBranch();
        });
      }
    });
  }

  ngOnInit(): void {
    this.pageSizeperPage = 8;
    this.routeDetailState = false;
    this.currentAccount = this.authService?.instance?.getAllAccounts()[0];
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<any>([]);    
  }

  ngOnChanges(changes: SimpleChanges) { }

  viewRouteDetails(row: any) {
    this.selectedRte = row;
  }

  onChangedPage(event: any) {
    this.pageSizeperPage = event?.pageSize;
    this.masterCheckbox = false;
  }

  logout(ev: any) {
    if (ev) this.authService.logoutRedirect({ postLogoutRedirectUri: environment?.postLogoutUrl });
  }

  getAllRoutesofBranch() {
    this.loader = true;
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/RouteList?BranchId=${this.routeBranchId}&Active=true`).subscribe((res) => {
      console.log(res);
      this.data = res;
      this.dataSource.data = res;
      this.selectedRte = this.data[0];
      this.loader = false;
    })
  }

  selectRoute(route: any) {
    this.dataloader = true;
    this.routesView = true;
    this.branchView = false;
    this.locationsView = false;
    this.getDetailsofSelectedRoute(route);
    this.selectedRoute = route;
  }

  getDetailsofSelectedRoute(route: any) {
    this.apiService.get(`http://bassnewapi.testzs.com/api/Branch/LocationList/${route?.Route_Id}`).subscribe((res) => {
      if (res) {
        route.Locations = res;
        route?.Locations.forEach((item: any) => {
          item.selected = false;
        })
        if (this.selectedRoute?.Locations) this.selectedRoute.Locations = res;
        let timeOutId = setTimeout(() => {
          if (this.selectedRoute?.Locations?.length > 0) this.dataloader = false;
        }, 400)
      }
      else this.dataloader = false;
    });

  }

}
