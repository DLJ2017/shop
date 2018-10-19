// pages/trolley/trolley.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    locationAuthType: app.data.locationAuthType,
    //模拟数据
    trolleyList: [], // 购物车商品列表
    trolleyCheckMap: [], // 购物车中选中的id哈希表
    trolleyAccount: 45, // 购物车结算总价
    isTrolleyEdit: false, // 购物车是否处于编辑状态
    isTrolleyTotalCheck: true, // 购物车中商品是否全选
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onTapLogin: function () {
    app.login({
      success: ({ userInfo }) => {
        this.setData({
          userInfo,
          locationAuthType: app.data.locationAuthType
        })

        this.getTrolley()
      },
      error: () => {
        this.setData({
          locationAuthType: app.data.locationAuthType
        })
      }
    })
  },

  getTrolley() {
    wx.showToast({
      title: '刷新购物车数据',
    })

    qcloud.request({
      url: config.service.trolleyList,
      login: true,
      success: result => {
        wx.hideLoading()

        let data = result.data

        if (!data.code) {
          this.setData({
            trolleyList: data.data
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '数据刷新失败',
          })
        }

      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '数据刷新失败',
        })
      }
    })
  },


  //多选
  onTapCheckTotal(){
       let trolleyCheckMap=this.data.trolleyCheckMap
       let trolleyList=this.data.trolleyList
       let isTrolleyTotalCheck=this.data.isTrolleyTotalCheck

        //全选按钮被选中/取消
        isTrolleyTotalCheck=!isTrolleyTotalCheck
        
        //遍历并修改所有商品的状态
        trolleyList.forEach(product =>{
          trolleyCheckMap[product.id]=isTrolleyTotalCheck
        })

        this.setData({
          isTrolleyTotalCheck,
          trolleyCheckMap
        })


  },

  //单选
   onTapCheckSingle(event){
     let checkId = event.currentTarget.dataset.id
     let trolleyCheckMap = this.data.trolleyCheckMap
     let trolleyList = this.data.trolleyList
     let isTrolleyTotalCheck = this.data.isTrolleyTotalCheck
     let numTotalProduct
     let numCheckedProduct = 0

      //单选商品被选中/取消
     trolleyCheckMap[checkId] = !trolleyCheckMap[checkId]

      //判断选中的商品个数是否与商品总数相等
     numTotalProduct = trolleyList.length
     trolleyCheckMap.forEach(checked=>{
       numCheckedProduct=(checked?numCheckedProduct+1:numCheckedProduct)
     })

     isTrolleyTotalCheck=(numTotalProduct===numCheckedProduct?true:false)

      this.setData({
        trolleyCheckMap,
        isTrolleyTotalCheck
      })
   },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 同步授权状态
    this.setData({
      locationAuthType: app.data.locationAuthType
    })
    //用户已登录，check session
    app.checkSession({
      success: ({ userInfo }) => {
        this.setData({
          userInfo
        })
        this.getTrolley()

      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})