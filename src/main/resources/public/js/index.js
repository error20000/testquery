

var Config = {
		defulatColor: [226, 119, 40],
		defulatTimeFormat: "yyyy/M/d HH:mm:ss",
		timeLength: 0,
		accidentTime: ["2018/1/6 19:45:00", "2018/1/6 19:55:00"],
		detailTime: ["2018/1/6 19:00:00", "2018/1/6 20:00:00"],
		
		select: 0,
		shipsSelect: [],
		shipsForm:[{
			mmsi:'',
			shipLength: '',
			shipWidth: '',
			name: '',
			showName: '',
			callSign:'',
			shipType:'',
			left: '',
			track: '',
			lon: '', 
			lat: '', 
			real: false, 
			time: '', 
			speed: '', 
			cog: '', 
			head: '', 
			
			lonlat: '', 
			car: '',
			cc: '', 
			tc: '', 
			driver: '',
			sailor: '',
			ro: '',
			time: '',
			carl: '',
			man: '',
			distance: '',
			position: '',
			cpa: '', 
			tcpa: ''
		},{
			mmsi:'',
			shipLength: '',
			shipWidth: '',
			name: '',
			showName: '',
			callSign:'',
			shipType:'',
			left: '',
			track: '',
			lon: '', 
			lat: '', 
			real: false, 
			time: '', 
			speed: '', 
			cog: '', 
			head: '', 
			
			lonlat: '', 
			car: '',
			cc: '', 
			tc: '', 
			driver: '',
			sailor: '',
			ro: '',
			time: '',
			carl: '',
			man: '',
			distance: '',
			position: '',
			cpa: '', 
			tcpa: ''
		}],
		shipsShape: [],
		timeEvent: [],
		timeSelect: 0,
		msgDesc: [],
		weatherDesc: "",
		timeDesc: "",
		timeUTCDesc: "",

		isTrackShowPoint: false,
		isTrackShowLine: false,
		isTrackShowDashed: false,
		isTrackShowShape: false,
		isTrackShowInfo: false,
		trackPoint: {},
		trackLine: {},
		trackDashed: {},
		trackShape: {},
		trackInfo: {}
		
};

var Ships=[];

var CurShipInfo = {};
var TimeEvent = {
		
};

var TimeControl={
		speed: 1,
		startTime: '',
		video: [] 
};
ArGis={
		map: "",
		view: "",
		center: [Center.lon, Center.lat],
		initData: function(){
//			Ships = shipFinalData;
//			return;
			//加载数据
			// 1、基础数据
			for (var i = 0; i < ShipInfoData.length; i++) {
				var info = ShipInfoData[i];
				info.data = [];
				Ships[i] = info;
				
			}
			// 2、轨迹数据
			var shipsTemp = {}, shipsHash={};
			for (var i = 0; i < ShipTrackData.length; i++) {
				var shipData = ShipTrackData[i];
				var key = shipData.Mmsi;
				var keyHash = shipData.Mmsi+"_"+shipData.UpdateTime;
				var change = {
						mmsi: shipData.Mmsi,
						lat: Number(shipData.Lat),
						lon: Number(shipData.Long),
						time: shipData.UpdateTime,
						speed: Number(shipData.Speed),
						cog: Number(shipData.Cog),
						head: Number(shipData.Head),
						unkonw: shipData.unkonw,
						real: true
				};
				var obj = shipsTemp[key];
				var objHash = shipsHash[keyHash];
				if(!obj){
					obj = {
						mmsi: key,
						data: []
					};
					var index = obj.data.push(change);
					shipsTemp[key] = obj;
					shipsHash[keyHash] = index;
				}else{
					if(!objHash){
						var index = obj.data.push(change);
						shipsHash[keyHash] = index;
					}else{
						obj.data[objHash-1] = change;
					}
					shipsTemp[key] = obj;
				}
			}
			for (var i = 0; i < Ships.length; i++) {
				Ships[i].data = shipsTemp[Ships[i].mmsi].data;
				delete shipsTemp[Ships[i].mmsi];
			}
			/*for (var k in shipsTemp) { //添加所有船只
				Ships.push(shipsTemp[k]);
			}*/
			// 3、优化轨迹数据
			for (var i = 0; i < Ships.length; i++) {
				var ship = Ships[i];
				var tempData = [];
				for (var j = 0; j < ship.data.length; j++) {
					if(ship.data[j].time >= Config.accidentTime[0] && ship.data[j].time <= Config.accidentTime[1]){ //这个时间段内点不优化
						tempData.push(ship.data[j]);
						continue;
					}
					if(j == 0){
						tempData.push(ship.data[j]);
					}else if(j == ship.data.length-1){
						tempData.push(ship.data[j]);
					}else{
						var temp1 = ship.data[j-1];
						var temp2 = ship.data[j];
						if(temp1.lat != temp2.lat && temp1.lon != temp2.lon){
							tempData.push(ship.data[j]);
						}
					}
				}
				ship.data = tempData;
			}
			
			// 4、设置被观察船只
			for (var i = 0; i < Ships.length && i < ShipInfoData.length; i++) {
				var ship = Ships[i];
				var select = {
						value: i,
						label: ship.showName
				};
				Config.shipsSelect.push(select);
			}
			//处理时间线
			// 1、创建实点
			var shipTimeTemp = {}, shipsTimeHash={};
			for (var i = 0; i < ShipTrackData.length; i++) {
				var shipData = ShipTrackData[i];
				var key = shipData.Mmsi;
				var uniKey = shipData.Mmsi+"_"+shipData.UpdateTime;
				var timePoint = {
						mmsi: shipData.Mmsi,
						lat: Number(shipData.Lat),
						lon: Number(shipData.Long),
						time: shipData.UpdateTime,
						speed: Number(shipData.Speed),
						cog: Number(shipData.Cog),
						head: Number(shipData.Head),
						real: true
				};
				var obj = shipTimeTemp[key];
				if(!obj){
					obj = {
						timePoints: [timePoint]
					};
					shipTimeTemp[key] = obj;
					shipsTimeHash[uniKey] = obj.timePoints.length;
				}else{
					var uniObj = shipsTimeHash[uniKey];
					if(!uniObj){
						obj.timePoints.push(timePoint);
						shipsTimeHash[uniKey] = obj.timePoints.length;
					}else{
						obj.timePoints[uniObj-1] = timePoint;
					}
					shipTimeTemp[key] = obj;
				}
			}
			// 2、创建虚拟点(只设置被观察船只)
			for (var i = 0; i < Ships.length && i < ShipInfoData.length; i++) {
				var ship = Ships[i];
				if(shipTimeTemp[ship.mmsi]){
					var timePoints = shipTimeTemp[ship.mmsi].timePoints;
					for (var j = 0; j < timePoints.length - 1; j++) {
						ship.timeLine = ship.timeLine || {};
						var tmp1 = timePoints[j];
						var tmp2 = timePoints[j+1];
						var count = Math.floor(new Date(tmp2.time).getTime()/1000) - Math.floor(new Date(tmp1.time).getTime()/1000);
						var latCount = tmp2.lat - tmp1.lat;
						var lonCount = tmp2.lon - tmp1.lon;
						var speedCount = tmp2.speed - tmp1.speed;
						var cogCount = tmp2.cog - tmp1.cog;
						var headCount = tmp2.head - tmp1.head;
						if(tmp1.time >= Config.detailTime[0] && tmp1.time <= Config.detailTime[1]){
							ship.timeLine[tmp1.time] = tmp1;
						}
						for (var k = 1; k < count; k++) {
							var time = Utils.formatDate(new Date(tmp1.time).getTime() + k*1000, Config.defulatTimeFormat);
							var timeLinePoint = {};
							/*if(Math.abs(speedCount) >= 2){
								//不均分
								timeLinePoint = {
										mmsi: tmp1.mmsi,
										lat: tmp1.lat + latCount,
										lon: tmp1.lon + lonCount,
										time: time,
										speed: tmp1.speed,
										cog: tmp1.cog + k*cogCount/count,
										head: tmp1.head + k*headCount/count,
										real: false
								};
							}else{*/
								//均分
								timeLinePoint = {
										mmsi: tmp1.mmsi,
										lat: tmp1.lat + k*latCount/count,
										lon: tmp1.lon + k*lonCount/count,
										time: time,
										speed: tmp1.speed + k*speedCount/count,
										cog: tmp1.cog + k*cogCount/count,
										head: tmp1.head + k*headCount/count,
										real: false
								};
//							}
							if(time >= Config.detailTime[0] && time <= Config.detailTime[1]){
								ship.timeLine[time] = timeLinePoint;
							}
						}
						
					}
				}
			}

			console.log(Ships);
			//处理事件
			for (var i = 0; i < TimeLineEventData.length; i++) {
				TimeLineEventData[i].timeStart = Config.timeLength;
				Config.timeEvent.push({name:TimeLineEventData[i].name,timeStart:TimeLineEventData[i].timeStart});
				TimeLineEventData[i].index.push(Config.timeLength);
				Config.timeLength += TimeLineEventData[i].timeLength;
				TimeLineEventData[i].index.push(Config.timeLength);
			}
		},
		initMap: function(){
			//加载工具

			//绘制碰撞点
			Utils.drawPoint({
				lon: 124.9597,
				lat: 30.851,
				color: "green",
				width: 10,
				attr: {
					time: "2018/1/6 19:50:10",
					lon: 124.9597,
					lat: 30.851
				},
				template: {
					title:"碰撞点",
					content:[{
					        type: "fields",
					        fieldInfos: [{
					          fieldName: "time",
					          label: "碰撞时间"
					        }, {
					          fieldName: "lon",
					          label: "碰撞经度"
					        }, {
						          fieldName: "lat",
						          label: "碰撞纬度"
					        }, {
						          fieldName: "content",
						          label: "碰撞描述"
					        }]
					      }]
				}
			});
			Utils.drawPoint({
				lon: 124.9616,
				lat: 30.8531,
				color: "red",
				width: 10,
				attr: {
					time: "2018/1/6 19:50:10",
					lon: 124.9616,
					lat: 30.8531
				},
				template: {
					title:"碰撞点",
					content:[{
					        type: "fields",
					        fieldInfos: [{
					          fieldName: "time",
					          label: "碰撞时间"
					        }, {
					          fieldName: "lon",
					          label: "碰撞经度"
					        }, {
						          fieldName: "lat",
						          label: "碰撞纬度"
					        }, {
						          fieldName: "content",
						          label: "碰撞描述"
					        }]
					      }]
				}
			});
			
		},
		initTrack: function(){
//			setTimeout(() => {
			Config.trackPoint = {};
			Config.trackLine = {};
			Config.trackDashed = {};
			Config.trackShape = {};
			Config.trackInfo = {};
				for (var i = 0; i < Ships.length; i++) {
					var ship = Ships[i];
					
					var shipCenterPoint = {x: ship.shipWidth/2, y: ship.shipLength/2}; 
					var shipGisPoint = {x: shipCenterPoint.x - ship.left, y: shipCenterPoint.y - ship.trail}; //以天线为原点
					var distance = Math.sqrt(Math.pow(shipGisPoint.x, 2) + Math.pow(shipGisPoint.y, 2));
					
					for (var j = 0; j < ship.data.length; j++) {
						var point = ship.data[j];
						if(point.real){
							//点
							var createPoint = Utils.createPoint({
								lon: point.lon,
								lat: point.lat,
								color: point.color || ship.trackColor,
								width: point.width || ship.trackSize,
								attr: {mmsi: ship.mmsi, type: "track_point"},
								template:{}
							});
							var tempPoint = Config.trackPoint[ship.mmsi];
							if(!tempPoint){
								tempPoint = [createPoint];
							}else{
								tempPoint.push(createPoint);
							}
							Config.trackPoint[ship.mmsi] = tempPoint;
							//线
							var tempLine = Config.trackLine[ship.mmsi];
							if(!tempLine){
								tempLine = [[point.lon, point.lat]];
							}else{
								tempLine.push([point.lon, point.lat]);
							}
							Config.trackLine[ship.mmsi] = tempLine;
							//形状
							var lonlatPoint = Utils.lonLatToMercator(point.lon, point.lat);
							var shipD = (360-point.head)*Math.PI/180 - Math.atan(shipGisPoint.x/shipGisPoint.y);
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
							
							var createShape = Utils.createShape({
								lon: Utils.xToLon(centerPoint.x),
								lat: Utils.yToLat(centerPoint.y),
								angle: point.head,
								url: ship.url,
								width: ship.shipWidth/Math.floor(ArGis.view.state.resolution)+"px" ,
								height: ship.shipLength/Math.floor(ArGis.view.state.resolution)+"px",
								attr: {mmsi: ship.mmsi, type: "track_shape",
									lon: point.lon,
									lat: point.lat,
									time: point.time,
									speed: point.speed,
									head: point.head,
									cog: point.cog,
									showName: ship.showName
								},
								template:{
									title:"详细信息",
									content:[{
									        type: "fields",
									        fieldInfos: [{
										          fieldName: "showName",
										          label: "名称"
										    },{
									          fieldName: "time",
									          label: "时间"
									        }, {
									          fieldName: "lon",
									          label: "经度"
									        }, {
										          fieldName: "lat",
										          label: "纬度"
									        }, {
										          fieldName: "speed",
										          label: "船速"
									        }, {
										          fieldName: "head",
										          label: "船首向"
									        }, {
										          fieldName: "cog",
										          label: "COG"
									        }]
									      }]
								}
							});
							var tempShape = Config.trackShape[ship.mmsi];
							if(!tempShape){
								tempShape = [createShape];
							}else{
								tempShape.push(createShape);
							}
							Config.trackShape[ship.mmsi] = tempShape;
							//事件
							var createInfo = Utils.createInfo({
								lon: point.lon,
								lat: point.lat,
								color: point.color || ship.trackColor,
								width: point.width,
								text: point.time,
								attr: {mmsi: ship.mmsi, type: "track_info"},
								template:""
							});
							var tempInfo = Config.trackInfo[ship.mmsi];
							if(!tempInfo){
								tempInfo = [createInfo];
							}else{
								tempInfo.push(createInfo);
							}
							Config.trackInfo[ship.mmsi] = tempInfo;
						}
					}
				}
//			}, 10);
		},
		initShips: function(){
			require([
				  "esri/layers/GraphicsLayer",
				], function(GraphicsLayer){
				for (var i = 0; i < Ships.length; i++) {
					ArGis["shipLayer_"+Ships[i].mmsi] = new GraphicsLayer({id:"shipGraphicsLayer_"+Ships[i].mmsi});
					ArGis.map.add(ArGis["shipLayer_"+Ships[i].mmsi]);
				}
			});
			
			//绘制船型
			/*var cgp = Utils.createShip({
				paths: "M150 0 L75 200 L225 200 Z",
				color: Ships[i].trackColor,
				width: 4,
				attr: {mmsi: Ships[i].mmsi, type: "ship_"+Ships[i].mmsi},
				template:{}
			});
			//加入缓存
			Config.shipsShape.push(cgp);
			//加入地图
			ArGis.view.graphics.add(cgp);*/
			/*var shipGf = Utils.createShap({
				lon: Center.lon,
				lat: Center.lat
			});
			ArGis.shipLayer.add(shipGf);*/
			/*var shipGraphic = Utils.createShipSign({
				lon: 124.9727,
				lat: 30.7071,
				angle: 0,
				color: "gray"
			})
			ArGis.shipLayer.graphics.add(shipGraphic);*/
			/*var geometry = {
			        type: "polygon", 
			        centroid:{
			        	type: "point", 
			        	x: 13910460.708464786, 
				        y: 3613339.776019942,
				        spatialReference:{
				        	wkid:102100
				        }
			        },
			        rings: [
			            [13910460.708464786-25, 3613339.776019942-150],
			            [13910460.708464786+25, 3613339.776019942-150],
			            [13910460.708464786+25,3613339.776019942+150],
			            [13910460.708464786-25, 3613339.776019942+150],
			            [13910460.708464786-25, 3613339.776019942-150]
			          ],
			          spatialReference:{
				        	wkid:102100
				        }
			      };
				
		      var symbol  = {
		    		  type: "simple-marker", 
		    	        color: [227, 139, 79, 0.8],
		    	        outline: { 
		    	          color: [255, 255, 255],
		    	          width: 1
		    	        },
		    	        style:'square'
		  		  };*/
			/*var geometry = {
			        type: "point", 
			        longitude: 124.9823,
					latitude: 30.199,
			  };
		      var symbol  = {
		    		  type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
				      url: "/images/11.png",
				      width: "50px",
				      height: "275px",
				      angle: 90
		  		  };
		      
			var shipGraphic = Utils.createGraphic(geometry, symbol);
			ArGis.shipLayer.graphics.add(shipGraphic);*/
		},
		initTimeLine: function(){
			//播放事件绑定
			//视频
			var video = document.getElementById("video");
			video.onplay = function(evt){
				PlayController.handlePlay();
			};
			video.onpause = function(evt){
				PlayController.handlePaused();
			};
			video.onended = function(evt){
//				PlayController.curPlayTime = 0;
				PlayController.handlePaused();
			};
			video.ontimeupdate = function(evt){
				console.log(video.currentTime);
			};
			video.onwaiting = function(){
				console.log("onwaiting");
			};
			video.onratechange = function(){
				console.log("onratechange");
			};
			//插件
			PlayController.endTime= Config.timeLength;
			PlayController.paused= true;
			PlayController.initPlay();
			PlayController.emitPlay = function(){
				video.play();
//				PlayController.handlePlay();
			};
			PlayController.emitPaused = function(){
				video.pause();
//				PlayController.handlePaused();
			};
			PlayController.emitRePlay = function(){
				video.currentTime = 0;
				video.play();
			};
			PlayController.emitUpdateTime = function(updateTime){
				video.currentTime = updateTime;
			};
			PlayController.timePointEvent = function(timePoint){
				var timeEvent;
				for (var i = 0; i < TimeLineEventData.length; i++) {
					if(timePoint >= TimeLineEventData[i].index[0] && timePoint < TimeLineEventData[i].index[1]){
						timeEvent = TimeLineEventData[i];
						break;
					}
				}
				if(timeEvent && typeof timeEvent.event == "function"){
					timeEvent.event(Math.floor(timePoint), timeEvent);
				}
			};
		},
		drawTrack: function(){
			for (var i = 0; i < Ships.length; i++) {
				var ship = Ships[i];
				this.showTrackPoint(ship);
				this.showTrackLine(ship);
				this.showTrackDashed(ship);
				this.showTrackShape(ship);
				this.showTrackInfo(ship);
			}
		},
		clearTrack: function(){
			this.clearTrackPoint();
			this.clearTrackLine();
			this.clearTrackDash();
			this.clearTrackShape();
			this.clearTrackInfo();
		},
		clearTrackPoint: function(){
			Utils.removeTrackType("track_point", ArGis.trackLayer.graphics);
		},
		clearTrackLine: function(){
			Utils.removeTrackType("track_line", ArGis.trackLayer.graphics);
		},
		clearTrackDash: function(){
			Utils.removeTrackType("track_dash", ArGis.trackLayer.graphics);
		},
		clearTrackShape: function(){
			Utils.removeTrackType("track_shape", ArGis.trackLayer.graphics);
		},
		clearTrackInfo: function(){
			Utils.removeTrackType("track_info", ArGis.trackLayer.graphics);
		},
		showTrackPoint: function(ship){
			if(Config.isTrackShowPoint){
				ArGis.trackLayer.addMany(Config.trackPoint[ship.mmsi]);
			}
		},
		showTrackLine: function(ship){
			if(Config.isTrackShowLine){
				var params = {
						paths: Config.trackLine[ship.mmsi],
						color: ship.trackColor,
						width: ship.trackSize,
						style: "",
						attr: {mmsi: ship.mmsi, type: "track_line"},
						template: {}
				};
				Utils.drawLine(params);
			}
		},
		showTrackDashed: function(ship){
			if(Config.isTrackShowDashed){
				var params = {
						paths: Config.trackLine[ship.mmsi],
						color: ship.trackColor,
						width: ship.trackSize,
						style: "short-dash",
						attr: {mmsi: ship.mmsi, type: "track_dash"},
						template: {}
				};
				Utils.drawLine(params);
			}
		},
		showTrackShape: function(ship){
			if(Config.isTrackShowShape){
				for (var i = 0; i < Config.trackShape[ship.mmsi].length; i++) {
					var graphic = Config.trackShape[ship.mmsi][i];
					graphic.symbol.width = ship.shipWidth/Math.floor(ArGis.view.state.resolution)+"px" ;
					graphic.symbol.height = ship.shipLength/Math.floor(ArGis.view.state.resolution)+"px";
				}
				ArGis.trackLayer.addMany(Config.trackShape[ship.mmsi]);
			}
		},
		showTrackInfo: function(ship){
			if(Config.isTrackShowInfo){
				var trackInfoPoint = [];
				var trackInfoLine = [];
				var timeInfo = ["2018/1/6 19:50:10"];
				var height = 16 * Math.floor(ArGis.view.state.resolution);
				for (var i = 0; i < Ships.length; i++) {
					var ship = Ships[i];
					for (var j = 0; j < timeInfo.length; j++) {
						var point = "";
						for (var m = 0; m < ship.data.length; m++) {
							if(timeInfo[j] == ship.data[m].time){
								point = ship.data[m];
								break;
							}
						}
						if(!point){
							continue;
						}
						//标签
						var geometry = {
								type: "point",
							    longitude: point.lon - 0.002,
								latitude: point.lat + 0.0005
							  };
								
						var symbol  = {
								type: "text", 
								  color: ship.color,
								  haloColor: "black",
								  haloSize: "1px",
								  text: timeInfo[j],
								  xoffset: 0,
								  yoffset: 0,
								  font: {  
								    size: "12px",
								    family: "sans-serif"
								  }

				  		  };
						var attr = {mmsi: ship.mmsi, type: "track_info"};
						var template = "";
						trackInfoPoint.push(Utils.createGraphic(geometry, symbol, attr, template));
						//连线
						var geometry2 = {
						        type: "polyline", 
						        paths: [[point.lon, point.lat], [geometry.longitude, geometry.latitude]]
						      };
							
					      var symbol2  = {
					  		    type: "simple-line",  
					  		    color: ship.color,
					  		    width: "1px",
					  		    style: "solid"
					  		  };
							var attr2 = {mmsi: ship.mmsi, type: "track_info"};
							var template2 = "";
					      trackInfoLine.push(Utils.createGraphic(geometry2, symbol2, attr2, template2));
					}
				}
				ArGis.trackLayer.addMany(Config.trackInfo[ship.mmsi]);
				ArGis.trackLayer.addMany(trackInfoPoint);
				ArGis.trackLayer.addMany(trackInfoLine);
			}
		}
};

