// pages/user/user.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js')
const config = require('../../config.js')

//定义三个常量表示状态变量的值，用来在不同的状态变量下，给按钮文字提示设置不同的值
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    locationAuthType: UNPROMPTED
  },


  onTapAddress() {
    wx.showToast({
      icon: 'none',
      title: '此功能暂未开放',
    })
  },

  onTapKf() {
    wx.showToast({
      icon: 'none',
      title: '此功能暂未开放',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  //运行前，先清除登录相关缓存
  onLoad: function(options) {
    this.checkSession({
      success: ({
        userInfo
      }) => {
        this.setData({
          userInfo: userInfo
        })
      },
      error: () => {

      }
    })
  },

  //检查会话,检查用户是否登录、处于一个会话当中
  checkSession({
    success,
    error
  }) {
    wx.checkSession({
      success: () => {
        //自动加载用户数据并展示
        this.getUserInfo({
          success,
          error
        })
      },
      //失败的回调函数
      fail: () => {
        error && error()
      }
    })
  },

  onTapLogin: function () {
    this.login({
      success: ({ userInfo }) => {
        this.setData({
          userInfo: userInfo
        })
      }
    })
  },

  login({
    success,
    error
  }) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo'] === false) {
          this.setData({
            locationAuthType: UNAUTHORIZED
          })
          //已拒绝授权
          wx.showModal({
            title: '提示',
            content: '请授权我们获取您的用户信息',
            showCancel: false
          })
        } else {
          this.setData({
            locationAuthType: AUTHORIZED
          })
          //执行登录函数
          this.doQcloudLogin({ success, error })
        }
      }
    })
  },

  doQcloudLogin({ success, error }) {
    // 调用 qcloud 登陆接口
    qcloud.login({
      success: result => {
        if (result) {
          let userInfo = result
          success && success({
            userInfo
          })
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          this.getUserInfo({ success, error })
        }
      },
      fail: () => {
        error && error()
      }
    })
  },



  getUserInfo({
    success,
    error
  }) {
    qcloud.request({
      url: config.service.requestUrl,
      //用户身份验证功能，设置login为true，在发送请求的时候，会带上用户身份的相关信息，若验证通过，则服务器返回相应数据
      login: true,
      success: result => {
        let data = result.data

        if (!data.code) {
          let userInfo = data.data

          success && success({
            userInfo
          })
        } else {
          error && error()
        }
      },
      fail: () => {
        error && error()
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