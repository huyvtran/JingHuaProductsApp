import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { ImageViewerController } from 'ionic-img-viewer';
import { AppService, AppGlobal } from './../../app/app.service';
import { AppConfig, AppStaticConfig } from './../../app/app.config';
import { Storage } from '@ionic/storage';
/**
管理端：资质审核详情界面
 */

@IonicPage()
@Component({
  selector: 'page-adminauditinfodetail',
  templateUrl: 'adminauditinfodetail.html',
})
export class AdminauditinfodetailPage {
  _imageViewerCtrl: ImageViewerController;
  _servePath: any = AppGlobal.domain;
  u_token: any;
  region: any;
  FBAuditViewModel: any = {
    fbusinessId: '',
    ProvinceID: '',
    CityId: '',
    CountyId: '',
    address: '',
    pccname: '',
    expiredDate: '',
    companyName: '',
    clientName: '',
    mobile: '',
    imagesList: '',
    auditDec: ' 无',
    isAudit: true,
    eTaxIdeNumber: '',
    enterpriseNatureName: '',
    salesmanCode: '',
    salesmanName_OA: '',
    sserIdErp: '',
  }
  eTaxIdeNumber: any;
  expiredDate: any;
  isViewPage: any = false;
  pageParmasData: any;
  dependentColumns: any[] = [];
  propertyColumns: any[] = [];
  provincejson: any;
  cityjson: any;
  tempLocation: any = '';
  countyjson: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public appService: AppService,
    public appConfig: AppConfig,
    private storageCtrl: Storage,
    private app: App,
    private ref: ChangeDetectorRef,
    public imageViewerCtrl: ImageViewerController,
  ) {
    this.storageCtrl.get('u_token').then((val) => {
      this.u_token = val;
    });
    console.log(navParams.data.itemData)
    this.FBAuditViewModel = navParams.data.itemData;
    this._imageViewerCtrl = imageViewerCtrl;
    this.getRegion();
    this.getCompanyProperty();
  }
  ionViewDidEnter() {
    let text = document.getElementsByClassName("multi-picker-placeholder");
    let date = document.getElementsByClassName("datetime-text datetime-placeholder")
    this.tempLocation = this.navParams.data.itemData.pccname;
    text[0].textContent = this.navParams.data.itemData.enterpriseNatureName;
    //date[0].textContent = new Date(this.navParams.data.itemData.expiredDate).toLocaleDateString()
  }
  getCompanyProperty() {
    this.appService.httpGet_token(AppGlobal.API.getDataCompanyProperty, this.u_token, {}, rs => {
      if (rs.status == 401 || rs.status == 403) {
        this.app.getRootNav().setRoot('AdminloginPage');
      }
      if (rs.isSuccess) {
        let options: Array<any> = [];
        for (let i = 0; i < rs.objectData.length; i++) {
          let optionsitem = {
            text: '',
            value: ''
          }
          optionsitem.text = rs.objectData[i].enterpriseNatureName;
          optionsitem.value = rs.objectData[i].enterpriseNatureId;
          options.push(optionsitem);
        }
        this.propertyColumns = [
          {
            options: options
          }
        ]
      } else {
        this.appConfig.popAlertView(rs.errorMessage);
      }
    });
  }
  noPassAudit() {
    this.appConfig.popPromptView('', 'alert-bg-c', '请输入审核不通过的原因，供用户参考', 'reason', '输入审核不通过的原因', rs => {
      this.FBAuditViewModel.auditDec = rs.reason;
      this.FBAuditViewModel.isAudit = false;
      this.FBAuditViewModel.address = '无详细地址';
      this.FBAuditViewModel.pccname = '无区域';
      this.appService.httpPost_token(AppGlobal.API.postFbenterpriseSubmit, this.u_token, this.FBAuditViewModel, rs => {
        console.log(rs)
        if (rs.status == 401 || rs.status == 403) {
          this.app.getRootNav().setRoot('AdminloginPage');
        }
        if (rs.isSuccess) {
          this.navCtrl.push('AdminauditinfolistPage');
        } else {
          this.appConfig.popAlertView(rs.errorMessage);
        }
      }, true)
    })
  }
  showOriginal(myImage) {
    const imageViewer = this._imageViewerCtrl.create(myImage, {
      enableBackdropDismiss: true
    });
    imageViewer.present();
  }
  passAudit() {
    console.log(this.FBAuditViewModel);
    if (this.FBAuditViewModel.companyName == "") {
      this.appConfig.popAlertView('企业名称不能为空！')
      return
    } else if (this.FBAuditViewModel.clientName == "") {
      this.appConfig.popAlertView('企业联系人姓名不能为空！')
      return
    } else if (this.FBAuditViewModel.mobile == "") {
      this.appConfig.popAlertView('联系电话不能为空！')
      return
    } else if (!AppStaticConfig.verifyMobile(this.FBAuditViewModel.mobile)) {
      this.appConfig.popAlertView('联系电话格式不正确！')
      return
    } else if (this.eTaxIdeNumber == "") {
      this.appConfig.popAlertView('企业识别号不能为空！')
      return
    } else if (this.FBAuditViewModel.SalesmanCode == "") {
      this.appConfig.popAlertView('业务员姓名不能为空！')
      return
    } else if (this.FBAuditViewModel.expiredDatet == '') {
      this.appConfig.popAlertView('资质过期日期不能为空！')
      return
    } else if (this.FBAuditViewModel.ProvinceID == "" || this.FBAuditViewModel.ProvinceID == undefined) {
      this.appConfig.popAlertView('企业所在省市区不能为空！')
      return
    } else if (this.FBAuditViewModel.address == "" || this.FBAuditViewModel.address == undefined) {
      this.appConfig.popAlertView('企业详细地址不能为空！')
      return
    } else {
      this.FBAuditViewModel.pccname = document.getElementById('PCCname').textContent.trim();
      this.FBAuditViewModel.enterpriseNatureName = document.getElementById('enterpriseNature').textContent.trim();
      
      let tempLocation: any = this.FBAuditViewModel.ProvinceID.split(' ');
      this.FBAuditViewModel.ProvinceID = tempLocation[0];
      this.FBAuditViewModel.CityID = tempLocation[1];
      this.FBAuditViewModel.CountyID = tempLocation[2];
      this.FBAuditViewModel.auditDec = ' 无';
      this.FBAuditViewModel.isAudit = true;
      this.FBAuditViewModel.eTaxIdeNumber = this.eTaxIdeNumber;
      // this.appService.httpPost_token(AppGlobal.API.postFbenterpriseSubmit, this.u_token, this.FBAuditViewModel, rs => {
      //   console.log(rs)
      //   if (rs.status == 401 || rs.status == 403) {
      //     this.app.getRootNav().setRoot('AdminloginPage');
      //   }
      //   if (rs.isSuccess) {
      //     this.navCtrl.push('AdminauditinfolistPage');
      //   } else {
      //     this.appConfig.popAlertView(rs.errorMessage);
      //   }
      // }, true)
    }
  }
  getRegion() {
    this.appService.getRegionContact()
      .subscribe(rs => {
        this.region = rs.json();
        let provinceData = this.region.filter(function (e) { return e.IsSingleCity == '1'; });
        let cityData = this.region.filter(function (e) { return e.IsSingleCity == '2'; });
        let countyData = this.region.filter(function (e) { return e.IsSingleCity == '3'; });
        //省份
        this.provincejson = {
          options: AppStaticConfig.addRegionData(provinceData)
        }
        this.dependentColumns.push(this.provincejson);
        //城市
        this.cityjson = {
          options: AppStaticConfig.addRegionData(cityData)
        }
        this.dependentColumns.push(this.cityjson);
        //区县
        this.countyjson = {
          options: AppStaticConfig.addRegionData(countyData)
        }
        this.dependentColumns.push(this.countyjson);
        console.log(this.dependentColumns)
        this.ref.detectChanges();
      }, error => {
        console.log(error);
      });
  }
  saveCompanyInfo() {
    if (this.FBAuditViewModel.companyName == "") {
      this.appConfig.popAlertView('企业名称不能为空！')
      return
    } else if (this.FBAuditViewModel.clientName == "") {
      this.appConfig.popAlertView('企业联系人姓名不能为空！')
      return
    } else if (this.eTaxIdeNumber == "") {
      this.appConfig.popAlertView('企业识别号不能为空！')
      return
    } else if (this.FBAuditViewModel.enterpriseNatureId == "") {
      this.appConfig.popAlertView('企业性质不能为空！')
      return
    } else if (this.FBAuditViewModel.mobile == "") {
      this.appConfig.popAlertView('联系电话不能为空！')
      return
    } else if (!AppStaticConfig.verifyMobile(this.FBAuditViewModel.mobile)) {
      this.appConfig.popAlertView('联系电话格式不正确！')
      return
    } else if (this.FBAuditViewModel.salesmanCode == "") {
      this.appConfig.popAlertView('业务员姓名不能为空！')
      return
    } else if (this.FBAuditViewModel.expiredDatet == '') {
      this.appConfig.popAlertView('资质过期日期不能为空！')
      return
    } else if (this.FBAuditViewModel.ProvinceID == "" || this.FBAuditViewModel.ProvinceID == undefined) {
      this.appConfig.popAlertView('企业所在省市区不能为空！')
      return
    } else if (this.FBAuditViewModel.address == "" || this.FBAuditViewModel.address == undefined) {
      this.appConfig.popAlertView('企业详细地址不能为空！')
      return
    } else {
      this.FBAuditViewModel.pccname = document.getElementById('PCCname').textContent.trim();
      this.FBAuditViewModel.enterpriseNatureName = document.getElementById('enterpriseNature').textContent.trim();
      let tempLocation: any = this.FBAuditViewModel.provinceID.split(' ');
      this.FBAuditViewModel.ProvinceID = tempLocation[0];
      this.FBAuditViewModel.CityID = tempLocation[1];
      this.FBAuditViewModel.CountyID = tempLocation[2];
      this.FBAuditViewModel.auditDec = ' 无';
      this.FBAuditViewModel.isAudit = true;
      this.FBAuditViewModel.eTaxIdeNumber = this.eTaxIdeNumber;
      console.log(this.FBAuditViewModel)
      this.appService.httpPost_token(AppGlobal.API.postCompanyDataSaveSubmit, this.u_token, this.FBAuditViewModel, rs => {
        console.log(rs)
        if (rs.status == 401 || rs.status == 403) {
          this.app.getRootNav().setRoot('AdminloginPage');
        }
        if (rs.isSuccess) {
          this.navCtrl.push('AdminauditinfolistPage');
        } else {
          this.appConfig.popAlertView(rs.errorMessage);
        }
      }, true)
    }
  }
  selectSalesman() {
    this.appConfig.popPromptViewA('', 'alert-bg-d', '业务员查询', 'salesman', '请输入业务员的姓名进行查询', rs => {
      if (rs.salesman.length <= 0) {
        this.appConfig.popAlertView('请输入你要查询的业务员姓名');
        return;
      } else {
        this.getSaleManInfo(rs);
      }

    });
  }

  getSaleManInfo(psnname) {
    this.appService.httpPost_token(AppGlobal.API.getSaleManInfo, this.u_token, { psnname: psnname }, rs => {
      if (rs.status == 401 || rs.status == 403) {
        this.app.getRootNav().setRoot('AdminloginPage');
      }
      let tempdate = [
        { salesmanCode_ERP: '1', salesmanName_ERP: '张1', userID_ERP: 'A1' },
        { salesmanCode_ERP: '2', salesmanName_ERP: '张2', userID_ERP: 'A2' },
        { salesmanCode_ERP: '3', salesmanName_ERP: '张3', userID_ERP: 'A3' },
        { salesmanCode_ERP: '4', salesmanName_ERP: '张4', userID_ERP: 'A4' },
        { salesmanCode_ERP: '5', salesmanName_ERP: '张5', userID_ERP: 'A5' },
      ]
      this.appConfig.popRadioView('选择业务员', 'alert-bg-e', tempdate, rs => {
        let salesmaninfo = rs.split(",");
        this.FBAuditViewModel.salesmanCode = salesmaninfo[0];
        this.FBAuditViewModel.salesmanName_OA = salesmaninfo[1];
        this.FBAuditViewModel.userIdErp = salesmaninfo[2];
      });
      if (rs.isSuccess) {
        if (rs.objectData != null) {
          if (rs.objectData.length > 0) {
            this.appConfig.popRadioView('选择业务员', 'alert-bg-e', rs.objectData, rs => {
              let salesmaninfo = rs.split(",");
              this.FBAuditViewModel.salesmanCode = salesmaninfo[0];
              this.FBAuditViewModel.salesmanName_OA = salesmaninfo[1];
              this.FBAuditViewModel.userIdErp = salesmaninfo[2];
            });

          } else {
            this.appConfig.popAlertView(rs.errorMessage);
          }
        }
      } else {
        this.appConfig.popAlertView(rs.errorMessage);
      }
    }, true)
  }
}
