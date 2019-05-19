var Utils = {
		formatDate: function(d, s){
		    var date = new Date();
		    if(d){
		        if(typeof d == 'object'){
		            date = d;
		        }else{
		            if(isNaN(d)){
		                date = new Date(d.replace(/-/g, "/").replace(/年/g, "/").replace(/月/g, "/").replace(/日/g, " ").replace(/时/g, ":").replace(/分/g, ":").replace(/秒/g, ""));
		            }else{
		                d = String(d).length == 10 ? d + "000" : String(d).length >= 13 ? d : new Date().getTime() + Number(d);
		                date = new Date(Number(d));
		            }
		        }
		    }
		    var weekday = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
		    var weekdayS = ["日","一","二","三","四","五","六"];
		    var weekdayEn = ["Sunday","Monday","Tuesday","Wednesday","Thursday ","Friday","Saturday"];
		    var weekdayEnS = ["Sun.","Mon.","Tues.","Wed.","Thurs. ","Fri.","Sat."];
		    var t = String(s);
		    t = t.replace('yyyy', date.getFullYear());
		    t = t.replace('yy', date.getYear());
		    t = t.replace('MM', (date.getMonth()+1) < 10 ? "0"+(date.getMonth()+1) : (date.getMonth()+1));
		    t = t.replace('M', (date.getMonth()+1));
		    t = t.replace('dd', date.getDate() < 10 ? "0"+date.getDate() : date.getDate());
		    t = t.replace('d', date.getDate());
		    t = t.replace('HH', date.getHours() < 10 ? "0"+date.getHours() : date.getHours());
		    t = t.replace('H', date.getHours());
		    t = t.replace('mm', date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes());
		    t = t.replace('m', date.getMinutes());
		    t = t.replace('ss', date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds());
		    t = t.replace('s', date.getSeconds());
		    t = t.replace('S', date.getMilliseconds());
		    t = t.replace('en:ww', weekdayEn[date.getDay()]);
		    t = t.replace('en:w', weekdayEnS[date.getDay()]);
		    t = t.replace('cn:ww', weekday[date.getDay()]);
		    t = t.replace('cn:w', weekdayS[date.getDay()]);
		    t = t.replace('ww', weekday[date.getDay()]);
		    t = t.replace('w', weekdayS[date.getDay()]);
		    return t;
		},
		mercatorToLonLat: function(x, y){ //20037508.342789244 = (Math.PI * 6378137)
			var toX = x/ 20037508.342789244 * 180;
            var toY = y/ 20037508.342789244 * 180;
            toY = 180 / Math.PI * (2 * Math.atan(Math.exp(toY * Math.PI / 180)) - Math.PI / 2);
            return {
            	lon: toX,
            	lat: toY
            };
		},
		lonLatToMercator: function(lon, lat){
			var toX = lon * 20037508.342789244 / 180;
            var toY = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            toY = toY * 20037508.342789244 / 180;
            return {
            	x: toX,
            	y: toY
            };
		},
		xToLon: function(x){ 
			var toX = x/ 20037508.342789244 * 180;
            return toX;
		},
		yToLat: function(y){ 
            var toY = y/ 20037508.342789244 * 180;
            toY = 180 / Math.PI * (2 * Math.atan(Math.exp(toY * Math.PI / 180)) - Math.PI / 2);
            return toY;
		},
		lonTox: function(lon){
			var toX = lon * 20037508.342789244 / 180;
            return toX;
		},
		latToy: function(lat){
			var toY = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            toY = toY * 20037508.342789244 / 180;
            return toY;
		},
		dfmTolonlat: function(str){
			var d = Number(str.split("°")[0]);
			var f = Number(str.split("°")[1].split("′")[0]);
			var m = Number(str.split("°")[1].split("′")[1].split("″")[0]);
			return d + f/60 + m/3600 
		},
		lonlatTodfm: function(lonlat){
			var d = String(lonlat).split(".")[0];
			var deg = String(lonlat).split(".").length < 2 ? 0 : Number("0."+String(lonlat).split(".")[1]);
			var f = String(deg*60).split(".")[0];
			deg = String(deg*60).split(".").length < 2 ? 0 : Number("0."+String(deg*60).split(".")[1]);
			var m = Number(deg*60).toFixed(1);
			return d + "°" + f + "′" + m;
		},
		lonTodfm: function(lon){
			return this.lonlatTodfm(lon).replace("-","") + (lon < 0 ? "W" : "E");
		},
		latTodfm: function(lat){
			return this.lonlatTodfm(lat).replace("-","") + (lat < 0 ? "S" : "N");
		},
		isEmpty: function(obj){
			for(var k in obj)
				return !1;
		    return !0;
		},
		timeLength: function(start, end){
			var endTime = Math.floor(new Date("2018/01/06 00:"+end).getTime()/1000);
			var startTime = Math.floor(new Date("2018/01/06 00:"+start).getTime()/1000);
			return endTime - startTime + 1;
		},
		addDescMsg: function(index, msg){
			if($("#info_container .info_item[index="+index+"]").length == 0){
				Config.msgDesc.push({index:index, msg: msg});
			}else {
				$("#info_container .info_item").removeClass("active");
				$("#info_container .info_item[index="+index+"]").addClass("active");
				//scroll top
				var parent = $("#info_container").offset().top;
				$("#info_container").scrollTop(parent);
				var target = $("#info_container .info_item[index="+index+"]").offset().top;
				var scrollHeight = $("#info_container .info_item[index="+index+"]")[0].scrollHeight;
				$("#info_container").scrollTop(target - parent + scrollHeight + index*10);
			}
			
		},
		Add: function(arg1, arg2) {
			var r1, r2, m;
			try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
			try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
			m = Math.pow(10, Math.max(r1, r2))
			return (arg1 * m + arg2 * m) / m
		},
		Minus: function(arg1, arg2) {
			var r1, r2, m, n;
			try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
			try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
			m = Math.pow(10, Math.max(r1, r2));
			//动态控制精度长度
			n = (r1 >= r2) ? r1 : r2;
			return ((arg1 * m - arg2 * m) / m).toFixed(n);
		},
		Multiply: function(arg1, arg2) {
			var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
			try { m += s1.split(".")[1].length } catch (e) { }
			try { m += s2.split(".")[1].length } catch (e) { }
			return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
		},
		Division: function(arg1, arg2) {
			var t1 = 0, t2 = 0, r1, r2;
			try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
			try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
			with (Math) {
			  r1 = Number(arg1.toString().replace(".", ""))
			  r2 = Number(arg2.toString().replace(".", ""))
			  return (r1 / r2) * pow(10, t2 - t1);
			}
		}
};