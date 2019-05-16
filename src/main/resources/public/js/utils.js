var Utils = {
		animating: true,
		animateInterval: {},
		setShip: function(shipIndex, params){
			var ship = Ships[shipIndex];
			var shipGraphic = "";
			
			var shipCenterPoint = {x: ship.shipWidth/2, y: ship.shipLength/2}; 
			var shipGisPoint = {x: shipCenterPoint.x - ship.left, y: shipCenterPoint.y - ship.trail}; //以天线为原点
			var distance = Math.sqrt(Math.pow(shipGisPoint.x, 2) + Math.pow(shipGisPoint.y, 2));
			
			/*var deg = Math.atan(shipGisPoint.x/shipGisPoint.y)*180/Math.PI+180;
			deg = deg + params.head > 360 ? deg + params.head - 360 : deg + params.head;
			var angle = deg*Math.PI/180;
			var lonlatPoint = Utils.lonLatToMercator(params.lon, params.lat);
			var centerPoint = {
					x: lonlatPoint.x - Math.sin(angle) * distance,
					y: lonlatPoint.y - Math.cos(angle) * distance
			};*/
			var lonlatPoint = Utils.lonLatToMercator(params.lon, params.lat);
			var shipD = (360-params.head)*Math.PI/180 - Math.atan(shipGisPoint.x/shipGisPoint.y);
			var shipA = {
					x: 0,
					y: distance
			};
			var shipB = {
					x: shipA.x*Math.cos(shipD) - shipA.y*Math.sin(shipD) + lonlatPoint.x,
					y: shipA.y*Math.cos(shipD) + shipA.x*Math.sin(shipD) + lonlatPoint.y
			};
			var centerPoint = {
					x: shipB.x,
					y: shipB.y
			};
			
			if(ArGis.view.zoom >= 0 && ArGis.view.zoom <= 14){
				shipGraphic = Utils.createShipSign({
					lon: params.lon,
					lat: params.lat,
					angle: params.head || 0,
					color: ship.color,
					attr:{type:'ship', base: ship, params: params, change: {lon: Utils.xToLon(centerPoint.x),lat: Utils.yToLat(centerPoint.y)}}
				});
			}else{
				shipGraphic = Utils.createShip({
					lon: Utils.xToLon(centerPoint.x),
					lat: Utils.yToLat(centerPoint.y),
					angle: params.head || 0,
					url: ship.url,
					width: ship.shipWidth/Math.floor(ArGis.view.state.resolution * 10-3)*10 + "px",
					height: ship.shipLength/Math.floor(ArGis.view.state.resolution * 10-3)*10 + "px",
					attr:{type:'ship', base: ship, params: params, change: {lon: Utils.xToLon(centerPoint.x),lat: Utils.yToLat(centerPoint.y)}}
				});
			}
			//画船首线
			var headD = (360-params.head)*Math.PI/180;
			var headA = {
					x: 0,
					y: 600
			};
			var headB = {
					x: headA.x*Math.cos(headD) - headA.y*Math.sin(headD) + centerPoint.x,
					y: headA.y*Math.cos(headD) + headA.x*Math.sin(headD) + centerPoint.y
			};
			var headLine = Utils.createLine({
				paths:[
					[Utils.xToLon(centerPoint.x), Utils.yToLat(centerPoint.y)],
					[Utils.xToLon(headB.x), Utils.yToLat(headB.y)]
				],
				width: "1px",
				color: ship.color
			});
			//画cog
			var cogD = (360-params.cog)*Math.PI/180;
			var pathPoint = [];
			pathPoint.push([Utils.xToLon(lonlatPoint.x), Utils.yToLat(lonlatPoint.y)]);
			for (var k = 1; k <= Math.ceil(params.speed); k++) {
				var cogA={
						x: 0,
						y: k == Math.ceil(params.speed) ? params.speed * 300 : k * 300
				};
				var cogB = {
						x: cogA.x*Math.cos(cogD) - cogA.y*Math.sin(cogD) + lonlatPoint.x,
						y: cogA.y*Math.cos(cogD) + cogA.x*Math.sin(cogD) + lonlatPoint.y
				};
				pathPoint.push([Utils.xToLon(cogB.x), Utils.yToLat(cogB.y)]);
				if(k != Math.ceil(params.speed)){
					//加入刻度
					var cogKD = (360-params.cog+90)*Math.PI/180;
					var cogKA = {
							x: 0,
							y: 30
					};
					var cogKB = {
							x: cogKA.x*Math.cos(cogKD) - cogKA.y*Math.sin(cogKD) + cogB.x,
							y: cogKA.y*Math.cos(cogKD) + cogKA.x*Math.sin(cogKD) + cogB.y
					};
					pathPoint.push([Utils.xToLon(cogKB.x), Utils.yToLat(cogKB.y)]);
					pathPoint.push([Utils.xToLon(cogB.x), Utils.yToLat(cogB.y)]);
				}
			}
			var cogLine = Utils.createLine({
				paths: pathPoint,
				width: "1px",
				style: "short-dash"
			});
			ArGis["shipLayer_"+ship.mmsi].graphics.add(shipGraphic);
			ArGis["shipLayer_"+ship.mmsi].graphics.add(headLine);
			ArGis["shipLayer_"+ship.mmsi].graphics.add(cogLine);
		},
		updateShipInfo: function(shipIndex, time, params){
			var curShip = Ships[shipIndex];
			if(curShip){
				//基本信息
				Config.shipsForm[shipIndex].mmsi = curShip.mmsi;
				Config.shipsForm[shipIndex].shipLength = curShip.shipLength;
				Config.shipsForm[shipIndex].shipWidth = curShip.shipWidth;
				Config.shipsForm[shipIndex].name = curShip.name;
				Config.shipsForm[shipIndex].showName = curShip.showName;
				Config.shipsForm[shipIndex].callSign = curShip.callSign;
				Config.shipsForm[shipIndex].shipType = curShip.shipType;
				Config.shipsForm[shipIndex].left = curShip.left;
				Config.shipsForm[shipIndex].trail = curShip.trail;
				//时间线信息
				var curPoint = curShip.timeLine[time];
				if(curPoint){
					Config.shipsForm[shipIndex].lat = curPoint.lat;
					Config.shipsForm[shipIndex].lon = curPoint.lon;
					Config.shipsForm[shipIndex].time = curPoint.time;
					Config.shipsForm[shipIndex].speed = Number(Number(curPoint.speed).toFixed(1));
					Config.shipsForm[shipIndex].cog = Number(Number(curPoint.cog).toFixed(1));
					Config.shipsForm[shipIndex].head = Number(Number(curPoint.head).toFixed(1));
					Config.shipsForm[shipIndex].unkonw = curPoint.unkonw;
				}
				//其他信息
				this.appendShipInfo(shipIndex, {
					lonlat: Utils.lonTodfm(curPoint.lon)+"/"+Utils.latTodfm(curPoint.lat),
					time: Utils.formatDate(curPoint.time, "HH:mm"),
					cc: Config.shipsForm[shipIndex].head+"°",
					tc: Config.shipsForm[shipIndex].cog+"°",
				});
				//日期
				Config.timeDesc = Utils.formatDate(curPoint.time, "HH:mm:ss DATE JAN/dd/18"); 
				var date = new Date(curPoint.time);
				Config.timeUTCDesc = date.getUTCHours()+":"+(date.getUTCMinutes() < 10 ? "0"+date.getUTCMinutes() : date.getUTCMinutes())+" UTC"; 
			}
		},
		appendShipInfo: function(shipIndex, params){
			var curShip = Ships[shipIndex];
			if(curShip){
				//其他信息
				Config.shipsForm[shipIndex].lonlat = params.lonlat || Config.shipsForm[shipIndex].lonlat; //文本经纬度
				Config.shipsForm[shipIndex].car = params.car || Config.shipsForm[shipIndex].car; //车
				Config.shipsForm[shipIndex].cc = params.cc || Config.shipsForm[shipIndex].cc; //罗航向
				Config.shipsForm[shipIndex].tc = params.tc || Config.shipsForm[shipIndex].tc; //真航向
				Config.shipsForm[shipIndex].driver = params.driver || Config.shipsForm[shipIndex].driver; //值班驾驶员
				Config.shipsForm[shipIndex].sailor = params.sailor || Config.shipsForm[shipIndex].sailor; //值班水手
				Config.shipsForm[shipIndex].ro = params.ro || Config.shipsForm[shipIndex].ro; //舵令
				Config.shipsForm[shipIndex].time = params.time || Config.shipsForm[shipIndex].time; //时间
				Config.shipsForm[shipIndex].carl = params.carl || Config.shipsForm[shipIndex].carl; //车令
				Config.shipsForm[shipIndex].man = params.man || Config.shipsForm[shipIndex].man; //下达人
				Config.shipsForm[shipIndex].distance = params.distance || Config.shipsForm[shipIndex].distance; //距离
				Config.shipsForm[shipIndex].position = params.position || Config.shipsForm[shipIndex].position; //方位
				Config.shipsForm[shipIndex].cpa = params.cpa || Config.shipsForm[shipIndex].cpa; //cpa
				Config.shipsForm[shipIndex].tcpa = params.tcpa || Config.shipsForm[shipIndex].tcpa; //tcpa
				Config.weatherDesc = params.weather || Config.weatherDesc; //天气
			}
		},
		animateShip: function(shipIndex, fromTime, toTime, timeEvent){
			var ship = Ships[shipIndex];
			if(timeEvent){
				var temp1 = ship.timeLine[fromTime];
				var temp2 = ship.timeLine[toTime];
				
				var count = 60;
				var interval = 1/count;
				var intervalCount = 0;
				//总差距
				var lonCount = temp2.lon - temp1.lon;
				var latCount = temp2.lat - temp1.lat;
				var speedCount = temp2.speed - temp1.speed;
				var cogCount = temp2.cog - temp1.cog;
				var headCount = temp2.head - temp1.head;
				//每秒差距
				var lonSecond = lonCount/count;
				var latSecond = latCount/count;
				var speedSecond = speedCount/count;
				var cogSecond = cogCount/count;
				if(Math.abs(cogCount) > 180){
					if(cogCount > 0){
						cogSecond = (Math.abs(cogCount) - 360)/count
					}else{
						cogSecond = (360 - Math.abs(cogCount))/count
					}
				}else{
					cogSecond = cogCount/count;
				}
				var headSecond = headCount/count;
				if(Math.abs(headCount) > 180){
					if(headCount > 0){
						headSecond = (Math.abs(headCount) - 360)/count
					}else{
						headSecond = (360 - Math.abs(headCount))/count
					}
				}else{
					headSecond = headCount/count;
				}
				//动画
				clearInterval(this.animateInterval[ship.mmsi]);
				if(this.animating){
					this.animateInterval[ship.mmsi] = setInterval(function() {
						var startPoint = {
								lon: temp1.lon + intervalCount*lonSecond,
								lat: temp1.lat + intervalCount*latSecond,
								speed: temp1.speed + intervalCount*speedSecond,
								cog: temp1.cog + intervalCount*cogSecond,
								head: temp1.head + intervalCount*headSecond
						};
						ArGis["shipLayer_"+ship.mmsi].graphics.removeAll();
						Utils.setShip(shipIndex, startPoint);
						intervalCount = intervalCount+1;
						/*if(intervalCount >= 1/interval ){
							clearInterval(Utils.animateInterval[ship.mmsi]);
						}*/
					}, interval*1000);
				}
				
			}
		},
		animateClear: function(){
			for ( var key in this.animateInterval) {
			   clearInterval(this.animateInterval[key]);
		    }
		},
		createShip: function(params){
			var geometry = {
					type: "point",
				    longitude: params.lon ? params.lon : params.paths[0],
					latitude: params.lat ? params.lat : params.paths[1]
				  };
				
		      var symbol  = {
		  		    type: "picture-marker",  
		  		    angle:  params.angle,
		  		    url: params.url,
		  		    width: params.width,
				    height: params.height
		  		  };
			return this.createGraphic(geometry, symbol, params.attr, params.template);
		},
		createShipSign: function(params){
			var geometry = {
					type: "point",
				    longitude: params.lon ? params.lon : params.paths[0],
					latitude: params.lat ? params.lat : params.paths[1]
				  };
				
		      var symbol  = {
		  		    type: "simple-marker", 
		  		    color: params.color,
		  		    angle: params.angle,
		  		    path: "M23.5,29 14.5,0 5.5,29z"
		  		  };
			return this.createGraphic(geometry, symbol, params.attr, params.template);
		},
		createPoint: function(params){
			var geometry = {
					type: "point",
				    longitude: params.lon ? params.lon : params.paths[0],
				    latitude: params.lat ? params.lat : params.paths[1]
				  };
				
		      var symbol  = {
		  		    type: "simple-marker",  
		  		    color: params.color ? params.color : [226, 119, 40],
		  		     size: params.width ? params.width : "4px",
				    outline: {
				    	style:"none"
				    }
		  		  };
			return this.createGraphic(geometry, symbol, params.attr, params.template);
		},
		createLine: function(params){
			var geometry = {
			        type: "polyline", 
			        paths: params.paths
			      };
				
		      var symbol  = {
		  		    type: "simple-line",  
		  		    color: params.color ? params.color : [226, 119, 40],
		  		    width: params.width ? params.width : "1px",
		  		    style: params.style ? params.style : "solid"
		  		  };
			return this.createGraphic(geometry, symbol, params.attr, params.template);
		},
		createShape: function(params){
		    var geometry = {
				type: "point",
			    longitude: params.lon ? params.lon : params.paths[0],
				latitude: params.lat ? params.lat : params.paths[1]
			  };
				
			var symbol  = {
				type: "picture-marker",   
	  		    angle:  params.angle,
				  url: params.url,
				  width: params.width ? params.width : "8px",
				  height: params.height ? params.height : "8px"

	  		  };
			return this.createGraphic(geometry, symbol, params.attr, params.template);
		},
		createInfo: function(params){
			var geometry = {
					type: "point",
				    longitude: params.lon ? params.lon : params.paths[0],
					latitude: params.lat ? params.lat : params.paths[1]
				  };
					
			var symbol  = {
					type: "simple-marker",  
		  		    color: params.color ? params.color : [226, 119, 40],
		  		     size: params.width ? params.width : "4px",
				    outline: {
				    	style:"none"
				    }
	  		  };
			return this.createGraphic(geometry, symbol, params.attr, params.template);
		},
		createGraphic: function(geometry, symbol, attr, template){
			var graphic;
			require(["esri/Graphic"], 
					function (Graphic) {
				      
					graphic = new Graphic({
			    	  	geometry: geometry,
					    symbol: symbol
			      	});
					
			      if(attr){
			    	  graphic.attributes = attr;
			      }
			      if(template){
			    	  graphic.popupTemplate = template;
			      }
			});
			return graphic;
		},
		drawPoint: function(params){
			var point = this.createPoint(params);
			ArGis.trackLayer.add(point);
		},
		drawLine: function(params){
			var line = this.createLine(params);
			ArGis.trackLayer.add(line);
		},
		drawShape: function(params){
			
		},
		drawInfo: function(params){
			
		},
		drawRadar: function(time, interval){
			var radarUrls = [];
			for (var i = 0; i < interval; i++) {
				var forTemp = Utils.formatDate(time + i * 1000 , Config.defulatTimeFormat);
				var radarUrl = RadarData[forTemp];
				if(radarUrl){
					radarUrls.push({time: forTemp, url: radarUrl});
				}
			}
			for (var i = 0; i < radarUrls.length; i++) {
				if(i == 0){
					$("#radar").attr("src", radarUrls[i].url);
				}else{
					setTimeout(function(){
						$("#radar").attr("src", radarUrls[i+1].url);
					}, (new Date(radarUrls[i].time).getTime() - new Date(radarUrls[i-1].time).getTime())/interval * 1000);
				}
				
			}
		},
		removeTrackType: function(type, graphics) {
			var delArray = [];
			graphics.forEach(function(item, i){
			  if(item.attributes && item.attributes.type == type){
				  delArray.push(item);
			  }
			});
			graphics.removeMany(delArray);
		},
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
			
		}
};