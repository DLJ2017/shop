// pages/home/home.js
const qcloud=require('../../vendor/wafer2-client-sdk/index.js')

Page({

  /**
   * 页面的初始数据
   */

  data: {
    productList: [], // 商品列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProduct();
  }, 

  getProduct(){
    qcloud.request({
      url: 'https://kaoqkmap.qcloud.la/weapp/product',
      success: result => {
        //console.log(result.data.data)
        this.setData({
          productList: result.data.data
        })
       
      },
      fail: result => {
        console.log('error!')
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