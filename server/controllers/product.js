//引入/utils/db.js文件
const DB=require('../utils/db.js')

//打包供外界使用，其中async await异步函数
module.exports={
  list:async ctx=>{
    ctx.state.data=await DB.query("SELECT * FROM product;")
  },

  detail:async ctx=>{
    let productId=+ctx.params.productId  //获取API中商品编号

    ctx.state.data=await DB.query('SELECT * FROM product where product.id=?',[productId])
  }
}