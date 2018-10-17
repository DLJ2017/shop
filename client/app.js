//app.js

var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

let userInfo

//定义三个常量表示状态变量的值，用来在不同的状态变量下，给按钮文字提示设置不同的值
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

App({
    onLaunch: function () {
        qcloud.setLoginUrl(config.service.loginUrl)
    },

    data:{
      locationAuthType: UNPROMPTED
    },

  login({
    success,
    error
  }) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo'] === false) {
          this.data.locationAuthType = UNAUTHORIZED
          //已拒绝授权
          wx.showModal({
            title: '提示',
            content: '请授权我们获取您的用户信息',
            showCancel: false
          })
        } else {
          this.data.locationAuthType = AUTHORIZED
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
    if(userInfo) return userInfo

    qcloud.request({
      url: config.service.user,
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
  //检查会话,检查用户是否登录、处于一个会话当中
  checkSession({
    success,
    error
  }) {
    if(userInfo){
      return success&&success({
        userInfo
      })
    }

    wx.checkSession({
      success: () => {
        //自动加载用户数据并展示
        this.getUserInfo({
          success:res=>{
            userInfo=res.userInfo

            success &&success({
              userInfo
            })
          },
          fail:()=>{
            error&&error()
          }
        })
      },
      //失败的回调函数
      fail: () => {
        error && error()
      }
    })
  }
})