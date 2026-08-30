








/**
 +----------------------------------------------------------
 * 删除股票
 +----------------------------------------------------------
 */
   

  function delgp(id)
 {
if(confirm("删除后不可恢复，你确认要删除么？")){
  $.ajax({ 
type: "post",
dataType: "json",
url: "user.php?rec=gupiaodel",
data: {id:id},
         success: function(data){	
         location.reload();
			
        }
     });
}else{

}

    
}
	
 
 
 
 
 


 function returnFloat(value) {
      var value = Math.round(parseFloat(value) * 100) / 100;
      var s = value.toString().split(".");
      if (s.length == 1) {
        value = value.toString() + ".00";
        return value;
      }
      if (s.length > 1) {
        if (s[1].length < 2) {
          value = value.toString() + "0";
        }
        return value;
      }
    }



function showuserx(gpdata){

	 if(gpdata){ 
	      var html=''; 
	     $.each(gpdata,function(index,list){
			
			 html += ' <div class="gpitem '+ list['css']+'">';
        html += '<div class="gpli"><li class="li1 '+ list['cssf']+'">'+ list['gupiao']+'</li><li class="li2 fontjj">'+ list['yk']+'</li><li class="li3 fontjj">'+ list['gushu']+'</li><li class="li4 fontjj">'+ list['chengbenjia']+'</li> </div>';
        html += '<div class="gpli gpli2"><li class="li1 fontjj">'+ list['sz']+'</li><li class="li2 fontjj">'+ list['ykbili']+'</li><li class="li3 fontjj">'+ list['gushukeyong']+'</li><li class="li4 fontjj">'+ list['curr_pr']+'</li> </div>';
        html += '<div class="gulicz"><li><a>明细</a></li><li><a href="?rec=mairu&gupiaono='+ list['gupiaono']+'">买入</a></li><li><a href="?rec=maichu&gupiaono='+ list['gupiaono']+'">卖出</a></li><li><a>条件单</a></li><li><a>看行情</a></li></div>';
     html += ' </div>';
		 });
		 
		 $("#gplistbox").html(html); //把HTML添加到容器
		 
	 }
}


//冒泡排序
  function listSortBy(myArray,field,order){
//冒泡排序
//myArray=gpdata;
//console.log('111',myArray)
     if(myArray.length>0){
        for(var i=0; i<myArray.length; i++){
            //在这要注意myArray.length-i-1，意思是第一次从数组第一个值开始，第二次从第二个值开始.....
            for(var j=0; j<myArray.length-i-1; j++){
                var str_i = myArray[j][field];
                var str_j = myArray[j+1][field];
                //判断值是否大于后面值，如果大于进行换位处理
                if(order=='asc'){
					
                    if(parseFloat(str_i) > parseFloat(str_j)){
                        var tmp = myArray[j];
                        myArray[j] = myArray[j+1];
                        myArray[j+1] = tmp;
                    }
                }else if(order=='desc'){
                    if(parseFloat(str_i) < parseFloat(str_j)){
                        var tmp = myArray[j];
                        myArray[j] = myArray[j+1];
                        myArray[j+1] = tmp;
                    }
                }
            }
        }
    }
    return myArray;
}
