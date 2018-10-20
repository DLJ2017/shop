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
    trolleyAccount: 0, // 购物车结算总价
    isTrolleyEdit: false, // 购物车是否处于编辑状态
    isTrolleyTotalCheck: true, // 购物车中商品是否全选
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  onTapLogin: function() {
    app.login({
      success: ({
        userInfo
      }) => {
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
  onTapCheckTotal() {
    let trolleyCheckMap = this.data.trolleyCheckMap
    let trolleyList = this.data.trolleyList
    let isTrolleyTotalCheck = this.data.isTrolleyTotalCheck

    //全选按钮被选中/取消
    isTrolleyTotalCheck = !isTrolleyTotalCheck

    //遍历并修改所有商品的状态
    trolleyList.forEach(product => {
      trolleyCheckMap[product.id] = isTrolleyTotalCheck
    })

    trolleyAccount = this.calcAccount(trolleyList, trolleyCheckMap)

    this.setData({
      isTrolleyTotalCheck,
      trolleyCheckMap,
      trolleyAccount
    })


  },

  //单选
  onTapCheckSingle(event) {
    let checkId = event.currentTarget.dataset.id
    let trolleyCheckMap = this.data.trolleyCheckMap
    let trolleyList = this.data.trolleyList
    let isTrolleyTotalCheck = this.data.isTrolleyTotalCheck
    let trolleyAccount = this.data.trolleyAccount
    let numTotalProduct
    let numCheckedProduct = 0

    //单选商品被选中/取消
    trolleyCheckMap[checkId] = !trolleyCheckMap[checkId]

    //判断选中的商品个数是否与商品总数相等
    numTotalProduct = trolleyList.length
    trolleyCheckMap.forEach(checked => {
      numCheckedProduct = (checked ? numCheckedProduct + 1 : numCheckedProduct)
    })

    isTrolleyTotalCheck = (numTotalProduct === numCheckedProduct ? true : false)

    trolleyAccount = this.calcAccount(trolleyList, trolleyCheckMap)

    this.setData({
      trolleyCheckMap,
      isTrolleyTotalCheck,
      trolleyAccount
    })
  },

  //计算总价
  calcAccount(trolleyList, trolleyCheckMap) {
    let account = 0
    trolleyList.forEach(product => {
      account = trolleyCheckMap[product.id] ? account + product.price * product.count : account
    })

    //返回
    return account
  },

  //编辑/完成状态切换
  onTapEditTrolley() {
    let isTrolleyEdit = this.data.isTrolleyEdit

    if (isTrolleyEdit) {
      this.updateTrolley()
    } else {
      this.setData({
        isTrolleyEdit: !isTrolleyEdit
      })
    }
  },
  //数量加减
  adjustTrolleyProductCount(event) {
    let trolleyCheckMap = this.data.trolleyCheckMap
    let trolleyList = this.data.trolleyList
    let dataset = event.currentTarget.dataset
    //data.type
    let adjustType = dataset.type
    let productId = dataset.id
    //将找到的商品TrolleyList[index]传给product
    let product
    let index

    for (index = 0; index < trolleyList.length; index++) {
      if (productId === trolleyList[index].id) {
        product = trolleyList[index]
        break
      }
    }

    if (product) {
      if (adjustType === "add") {
        //点击加号
        product.count++
      } else {
        //点击减号
        if (product.count <= 1) {
          //删除对象中的配对，trolleyCheckMap本质上也是一个对象
          delete trolleyCheckMap[productId]
          //删除数组元素
          trolleyList.splice(index, 1)
        } else {
          //商品数量大于1
          product.count--
        }
      }
    }
    
    //调整结算总价
    let trolleyAccount=this.calcAccount(trolleyList,trolleyCheckMap)

    //当购物车为空，自动同步至服务器
    if(!trolleyList.length){
      this.updateTrolley()
    }

    this.setData({
      trolleyAccount,
      trolleyList,
      trolleyCheckMap
    })
  },
  updateTrolley() {
    wx.showLoading({
      title: '更新购物车数据...',
    })

    let trolleyList = this.data.trolleyList

    qcloud.request({
      url: config.service.updateTrolley,
      method: 'POST',
      login: true,
      data: {
        list: trolleyList
      },
      success: result => {
        wx.hideLoading()

        let data = result.data

        if (!data.code) {
          this.setData({
            isTrolleyEdit: false
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '更新购物车失败'
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '更新购物车失败'
        })
      }
    })
  },
  onTapPay(){
    if(!this.data.trolleyAccount)  return

    wx.showToast({
      title: '结算中...',
    })

    let trolleyList=this.data.trolleyList
    let trolleyCheckMap=this.data.trolleyCheckMap
     
    //filter筛选出购物车列表中被勾选的商品，并针对这些商品进行购买。判断是否被勾选，使用双感叹号
    let needToPayProductList=trolleyList.filter(product=>{
      return !!trolleyCheckMap[product.id]
    })

    //请求后台
    qcloud.request({
      url:config.service.addOrder,
      login:true,
      method:'POST',
      data:{
        list:needToPayProductList,
        isInstantBuy: true
      },
      success:result=>{
        wx.hideLoading()

        let data=result.data

        if(!data.code){
          wx.showToast({
            title: '结算成功',
          })
          this.getTrolley()
        }else{
          wx.showToast({
            icon:'none',
            title: '结算失败',
          })
        }
      },
      fail:()=>{
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '结算失败',
        })
      }
    })
  }, 
  onTapPay() {
    if (!this.data.trolleyAccount) return

    wx.showLoading({
      title: '结算中...',
    })

    let trolleyCheckMap = this.data.trolleyCheckMap
    let trolleyList = this.data.trolleyList

    let needToPayProductList = trolleyList.filter(product => {
      return !!trolleyCheckMap[product.id]
    })

    // 请求后台
    qcloud.request({
      url: config.service.addOrder,
      login: true,
      method: 'POST',
      data: {
        list: needToPayProductList
      },
      success: result => {
        wx.hideLoading()

        let data = result.data

        if (!data.code) {
          wx.showToast({
            title: '结算成功',
          })

          this.getTrolley()
        } else {
          wx.showToast({
            icon: 'none',
            title: '结算失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '结算失败',
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 同步授权状态
    this.setData({
      locationAuthType: app.data.locationAuthType
    })
    //用户已登录，check session
    app.checkSession({
      success: ({
        userInfo
      }) => {
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
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})