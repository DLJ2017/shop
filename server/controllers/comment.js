const DB=require('../utils/db.js')

module.exports={
  /**
   * 添加评论
   */
  add:async ctx=>{
    //获取用户的数据，用户数据被保存在中间件ctx.state.$wxInfo的userinfo中
    let user=ctx.state.$wxInfo.userinfo.openId
    let username=ctx.state.$wxInfo.userinfo.nickName
    let avatar=ctx.state.$wxInfo.userinfo.avatarUrl
    
    //读取请求体中的数据  put .body
    let productId=+ctx.request.body.product_id
    //避免undefined的情况
    let content=ctx.request.body.content ||null

    if(!isNaN(productId)){
      await DB.query('INSERT INTO comment(user,username,avatar,content,product_id) VALUES(?,?,?,?,?)', [user, username, avatar, content, productId])
    }

    ctx.state.data={}
  },
  /**
   * 获取评论列表
   */
  list:async ctx=>{
    //get 请求，所以使用 .query 
      let productId = +ctx.request.query.product_id

      if (!isNaN(productId)) {
        ctx.state.data = await DB.query('select * from comment where comment.product_id = ?', [productId])
      } else {
        ctx.state.data = []
      }
    },
}