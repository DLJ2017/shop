// client/pages/detail/detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config=require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    product: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     this.getProduct(options.id)
  },

  getProduct(id){
    wx.showLoading({
      title: '商品数据加载中',
    })

    qcloud.request({
      url: config.service.productDetail + id,
      success: result => {
       wx.hideLoading()

       let data=result.data
       console.log(data);

       if(!data.code){
         this.setData({
           product:data.data
         })
       }else{
         setTimeout(()=>{
           wx.navigateBack()
         },2000)
       }

      },
      fail: result => {
        wx.hideLoading()

        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      }
    })
  },

//商品购买
  buy() {
    wx.showLoading({
      title: '商品购买中...',
    })
    
    //Object.assign
    let product = Object.assign({
      count: 1
    }, this.data.product)

    qcloud.request({
      url: config.service.addOrder,
      login: true,
      method: 'POST',
      data: {
        list: [product],
        isInstantBuy:true
      },
      success: result => {
        wx.hideLoading()

        let data = result.data
        //console.log("购买数据")
        //console.log(data)

        if (!data.code) {
          wx.showToast({
            title: '商品购买成功',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '商品购买失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '商品购买失败',
        })
      }
    })
  },

  //加入购物车
  addTrolley(){
    wx.showLoading({
      title: '正在添加到购物车...',
    })

    qcloud.request({
      url: config.service.addTrolley,
      login: true,
      //使用PUT，
      method: 'PUT',
      data:this.data.product,
      success: result => {
        wx.hideLoading()

        let data = result.data
  
        if (!data.code) {
          wx.showToast({
            title: '已添加到购物车',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '添加到购物车失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '添加到购物车失败',
        })
      }
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