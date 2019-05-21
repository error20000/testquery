new Vue({
	el : '#app',
	data : function() {
		return {
			asideWidth: "50%",
			filter: {
				source: '',
				table: '',
				variable: ''
			},
			sourceOptions: [],
			tableOptions: [],
			variableOptions: [],

			map: '',
			center: {
				lat: 36,
				lng: -84.5
			},
			zoom: 7,
			mapFormVisible: false,
			mapForm: {
				startColor: "#008000",
				endColor: "#ff0000",
				number: 4,
				method: 1
			},
			geometrys: [],
			geometrysMap: {},

			predefineColors: [
				'#ff4500',
				'#ff8c00',
				'#ffd700',
				'#90ee90',
				'#00ced1',
				'#1e90ff',
				'#c71585',
				'#ff0000',
			],
			minValue: 0,
			maxValue: 0,
			legendColorData:[],

			tableData: [],
			tableColumnMap: {},
			tableRowClassName: '',
			tableMap: {},
			
			chart: "",
			chartType: 1,
			chartVariable: "",
			chartTypeOptions: [
				{"label": "Bar Chart", "value": 1 },
				{"label": "Line Chart", "value": 2 },
				{"label": "Pie Chart", "value": 3 },
				{"label": "X Y Plot", "value": 4 }
			],
			scatterVisible: false,
			xVar: "",
			yVar: "",
			pieTopVisible: false,
			pielLegendShow: false,
			pieTop: 10,
			pieTopOptions: [
				{"label": "ALL", "value": 0 },
				{"label": "10", "value": 10 },
				{"label": "20", "value": 20 },
				{"label": "50", "value": 50 },
				{"label": "100", "value": 100 }
			],

		};
	},
	methods : {
		handleMapOptionApply: function(){
			console.log(this.mapForm);
			//calc color
			this.calcColor();
			this.mapFormVisible = false;
		},
		hanhleSourceChange: function(val){
			console.log("hanhleSourceChange");
			//Table
		},
		hanhleTableChange: function(val){
			console.log("hanhleTableChange");
			//Variable
			this.tableData = [];
			this.tableColumnMap = {};
			for (let i = 0; i < tableData.length; i++) {
				//data
				this.tableData.push(tableData[i]);
				//column
				for (const key in tableData[i]) {
					if (key == "statefips")
						continue;
					if (key == "name") {
						continue;
					}
					if (key == "geo_id2") {
						continue;
					}
					this.tableColumnMap[key] = key;
				}
				//table map
				this.tableMap[tableData[i]["geo_id2"]] = tableData[i];
			}
			//init variable option
			this.hanhleVariableOption();
		},
		hanhleVariableChange: function(val){
			console.log("hanhleVariableChange");
			//minValue  maxValue
			for (let i = 0; i < tableData.length; i++) {
				const curValue = tableData[i][val];
				if(i == 0 ){
					minValue = curValue;
					maxValue = curValue;
				}else{
					minValue = Math.min(minValue, curValue);
					maxValue = Math.max(maxValue, curValue);
				}
			}
			console.log(minValue+", "+maxValue);
			//chart variable
			this.chartVariable = this.filter.variable;
			this.xVar = this.filter.variable;
			this.yVar = this.yVar ? this.yVar : this.variableOptions[this.variableOptions.length == 1 ? 0 : 1].value;
			//calc color
			this.calcColor();
			//change chart
			this.hadleChartTypeChange();
		},
		hanhleSourceOption: function(){
			this.sourceOptions.push({label: "2017 ACS-Social Characteristics", value: "2017 ACS-Social Characteristics"});
			//select first
			this.filter.source = this.sourceOptions[0].value;
		},
		hanhleTableOption: function(){
			this.tableOptions.push({label: "Birthplace and Language", value: "places2017.residence_birthplace_and_language_2017"});
			//select first
			this.filter.table = this.tableOptions[0].value;
			this.hanhleTableChange(this.tableOptions[0].value);
		},
		hanhleVariableOption: function(){
			this.variableOptions = [];
			for (const key in this.tableColumnMap) {
				let node = {
					label: key,
					value: key,
				}
				this.variableOptions.push(node);
			}
			//select first
			this.filter.variable = this.variableOptions[0].value;
			//chart variable
			this.chartVariable = this.filter.variable;
			this.xVar = this.filter.variable;
			this.yVar = this.yVar ? this.yVar : this.variableOptions[this.variableOptions.length == 1 ? 0 : 1].value;
			//execute
			this.hanhleVariableChange(this.filter.variable);
		},
		
		init: function(){
			this.initChart();
			this.hanhleSourceOption();
			this.hanhleTableOption();

			this.showMap();
			//this.showTable();
			//this.initChart();
		},

		showMap: function (lat, lng) {
			var center = {
		        lat: lat || this.center.lat,
		        lng: lng || this.center.lng
	        };
	        this.map = new google.maps.Map(document.getElementById('mapView'), {
		        center: center,
		        zoom: this.zoom
		        // mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			
			this.drawData();
		},
		drawData: function(){
			let features = mapData.features;
			for (let i = 0; i < features.length; i++) {
				const e = features[i];
				//geoId
				let geoId = e["properties"]["GEOID"];
				//path
				let originPath = e["geometry"]["coordinates"];
				/*if(geoId == "4752006"){
					console.log(e["geometry"]["coordinates"]);
				}*/
				let paths = [];
				for (var k = 0; k < originPath.length; k++) {
					const e2 = originPath[k];
					for (var m = 0; m < e2.length; m++) {
						const e3 = e2[m];
						let path3 = [];
						for (let n = 0; n < e3.length; n++) {
							const e4 = e3[n];
							let temp = Utils.mercatorToLonLat(e4[0], e4[1]);
							let node = {
									lat: temp.lat,
									lng: temp.lon
							};
							path3.push(node);
						}
						paths.push(path3);
					}
				}
				/*if(geoId == "4752006"){
					console.log(paths);
				}*/
				//color
				let color = this.getColor(geoId);
				//draw Polygon
				this.drawPolygon(geoId, this.map, paths, color, color);
			}
		},
		drawPolygon: function(id, map, path, fillColor, strokeColor){
			let polygon = new google.maps.Polygon({
				paths: path,
				map: map,
				fillColor: fillColor,
				//fillOpacity: 1,
				strokeColor: strokeColor,
				//strokeOpacity: 1
			});
			let geometry = {
				id: id,
				polygon: polygon,
				fillColor: fillColor,
				strokeColor: strokeColor
			}
			this.geometrysMap[id] = geometry;
			//event
			let _this = this;
			google.maps.event.addListener(polygon , 'mouseover', function(event) {
				_this.handlePolygonMouseover(geometry, "#000000", "#000000");
			});
			google.maps.event.addListener(polygon , 'mouseout', function(event) {
				_this.handlePolygonMouseout(geometry, fillColor, strokeColor);
			});
			//store
			this.geometrys.push(geometry);
			return geometry;
		},
		reDrawColor: function(){
			if(!this.geometrys){
				return;
			}
			for (let i = 0; i < this.geometrys.length; i++) {
				const e = this.geometrys[i];
				let polygon = e.polygon;
				//color
				let color = this.getColor(e.id);
				e.fillColor = color;
				e.strokeColor = color;
				//redraw color
				this.reDrawPolygonColor(polygon, color, color);
				//event
				let _this = this;
				google.maps.event.addListener(polygon , 'mouseover', function(event) {
					_this.handlePolygonMouseover(e, "#000000", "#000000");
				});
				google.maps.event.addListener(polygon , 'mouseout', function(event) {
					_this.handlePolygonMouseout(e, color, color);
				});
			}
		},
		reDrawPolygonColor: function(polygon, fillColor, strokeColor){
			polygon.setOptions({
				paths: polygon.getPaths(),
				map: polygon.getMap(),
				fillColor: fillColor || polygon.fillColor,
				//fillOpacity: 1,
				strokeColor: strokeColor || polygon.strokeColor,
				//strokeOpacity: 1
			});
		},
		handlePolygonMouseover: function(geometry, fillColor, strokeColor){
			//map hover
			this.polygonChange(geometry, fillColor, strokeColor);
			//table hover
			//this.$refs.table.setCurrentRow(this.tableMap[id]);
		},
		handlePolygonMouseout: function(geometry, fillColor, strokeColor){
			//map out
			this.polygonChange(geometry, fillColor, strokeColor);
			//table out
			//this.$refs.table.setCurrentRow();
		},
		polygonChange: function(geometry, fillColor, strokeColor){
			let id = geometry.id;
			let polygon = geometry.polygon;
			fillColor = fillColor || geometry.fillColor;
			strokeColor = strokeColor || geometry.strokeColor;
			this.reDrawPolygonColor(polygon, fillColor, strokeColor);
		},
		getColor: function(geoId){
			//value
			let value = 0;
			for (let i = 0; i < tableData.length; i++) {
				const e = tableData[i];
				if(geoId == e.geo_id2){
					value = e[this.filter.variable];
					break;
				}
			}
			//color
			let color = "";
			for (let i = 0; i < this.legendColorData.length; i++) {
				const e = this.legendColorData[i];
				if(i == this.legendColorData.length - 1){
					if(value >= e.from && value <= e.to){
						color = e.color;
						break;
					}
				}else{
					if(value >= e.from && value < e.to){
						color = e.color;
						break;
					}
				}
			}
			return color;
		},
		calcColor: function(min, max){
			min = min || minValue;
			max = max || maxValue;
			this.legendColorData = [];
			switch (this.mapForm.method) {
				case 1: //Equal Interval
					let rang = (max - min)/this.mapForm.number;
					for (let i = 0; i < this.mapForm.number; i++) {
						let node = {
							color: "",
							from: min + (rang * i),
							to: min + (rang * (i + 1) ),
						};
						this.legendColorData.push(node);
					}
					break;
				case 2: //Quantiles
					
					break;
				case 3: //Natural Breaks
					
					break;
			
				default:
					break;
			}
			//to rgb
			let startColor = String(this.mapForm.startColor).replace("#", "");
			let endColor = String(this.mapForm.endColor).replace("#", "");
			for (let i = 0; i < this.legendColorData.length; i++) {
				let startR = parseInt(startColor.substring(0, 2), 16);
				let startG = parseInt(startColor.substring(2, 4), 16);
				let startB = parseInt(startColor.substring(4, 6), 16);
				let endR = parseInt(endColor.substring(0, 2), 16);
				let endG = parseInt(endColor.substring(2, 4), 16);
				let endB = parseInt(endColor.substring(4, 6), 16);
				let curR = Math.floor(startR + ((endR-startR)*i/(this.legendColorData.length-1)));
				let curG = Math.floor(startG + ((endG-startG)*i/(this.legendColorData.length-1)));
				let curB = Math.floor(startB + ((endB-startB)*i/(this.legendColorData.length-1)));		
				let curColor = "rgb(" + curR+ ","+curG+","+curB+")";	
				this.legendColorData[i].color = curColor;
			}
			//reDraw
			this.reDrawColor();
		},

		//table
		showTable: function(){

		},
		handleCurrentChange: function(curRow, oldRow){
			/*let geometry1 = this.geometrysMap[curRow["geo_id2"]];
			this.polygonChange(geometry1, "#000000", "#000000");
			
			let geometry2 = this.geometrysMap[oldRow["geo_id2"]];
			this.polygonChange(geometry2, "", "");*/
		},
		handleCellMouseEnter: function(row){
			let geometry = this.geometrysMap[row["geo_id2"]];
			//map hover
			this.polygonChange(geometry, "#000000", "#000000");
		},
		handleCellMouseLeave: function(row){
			let geometry = this.geometrysMap[row["geo_id2"]];
			//map out
			this.polygonChange(geometry, "", "");
		},

		//chart
		initChart: function(){
			this.chart = echarts.init(document.getElementById('chartView'));
			this.chartType = this.chartTypeOptions[0].value;
		},
		hadleChartTypeChange: function(val){
			val = val || this.chartType;
			this.scatterVisible = false;
			this.pieTopVisible = false;
			switch (val) {
			case 1:
				this.barChart();
				break;
			case 2:
				this.lineChart();
				break;
			case 3:
				this.pieTopVisible = true;
				this.pieChart();
				break;
			case 4:
				this.scatterVisible = true;
				this.scatterChart();
				break;

			default:
				break;
			}
		},
		hadleChartVariableChange: function(val){
			this.hadleChartTypeChange();
		},
		barChart: function(){
			//data
			let xAxisData = [];
			let yAxisData = [];
			
			for (var i = 0; i < this.tableData.length; i++) {
				xAxisData.push(this.tableData[i]["name"]);
				yAxisData.push(this.tableData[i][this.chartVariable]);
			}
			//chart
	        var option = {
	            title: {
	                text: this.chartVariable
	            },
				tooltip: {
					trigger: 'axis'
				},
				toolbox: {
					feature: {
						dataZoom: {
							yAxisIndex: 'none'
						},
						restore: {},
						saveAsImage: {}
					}
				},
				dataZoom: [
					{
						show: true,
						start: 0,
						end: 100
					}
				],
	            legend: {
	            	top: 20,
	                data:[this.chartVariable]
	            },
	            xAxis: {
	                data: xAxisData
	            },
	            yAxis: {},
	            series: [{
	                name: this.chartVariable,
	                type: 'bar',
	                data: yAxisData
	            }]
	        };
			this.chart.clear();
	        this.chart.setOption(option);
		},
		lineChart: function(){
			//data
			let xAxisData = [];
			let yAxisData = [];
			
			for (var i = 0; i < this.tableData.length; i++) {
				xAxisData.push(this.tableData[i]["name"]);
				yAxisData.push(this.tableData[i][this.chartVariable]);
			}
			//chart
	        var option = {
	            title: {
	                text: this.chartVariable
	            },
				tooltip: {
					trigger: 'axis'
				},
				toolbox: {
					feature: {
						dataZoom: {
							yAxisIndex: 'none'
						},
						restore: {},
						saveAsImage: {}
					}
				},
				dataZoom: [
					{
						show: true,
						start: 0,
						end: 100
					}
				],
	            legend: {
	            	top: 20,
	                data:[this.chartVariable]
	            },
	            xAxis: {
	                data: xAxisData
	            },
	            yAxis: {},
	            series: [{
	                name: this.chartVariable,
	                type: 'line',
	                data: yAxisData
	            }]
	        };
			this.chart.clear();
	        this.chart.setOption(option);
		},
		pieChart: function(){
			//data
			let xAxisData = [];
			let yAxisData = [];
			let selectedData = {};
			
			for (var i = 0; i < this.tableData.length; i++) {
				xAxisData.push(this.tableData[i]["name"]);
				let node = {
					name: this.tableData[i]["name"],
					value: this.tableData[i][this.chartVariable]
				}
				yAxisData.push(node);
				selectedData[this.tableData[i]["name"]] = this.pieTop === 0 ? true : i < this.pieTop;
			}
			
			//chart
	        var option = {
	            title: {
	                text: this.chartVariable
	            },
				toolbox: {
					feature: {
						dataZoom: {
							show: false
						},
						restore: {},
						saveAsImage: {}
					}
				},
				tooltip : {
					trigger: 'item',
					formatter: "{a} <br/>{b} : <br/>{c} ({d}%)"
				},
				legend: {
					show: this.pielLegendShow,
					type: 'scroll',
					orient: 'vertical',
					right: 0,
					//width: 100,
					data: xAxisData,
					selected: selectedData
				},
	            series : [
					{
						name: this.chartVariable,
						type: 'pie',
						radius : '55%',
						center: ['40%', '50%'],
						data: yAxisData,
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}
				]
			};
			this.chart.clear();
	        this.chart.setOption(option);
		},
		scatterChart: function(){
			//data
			let axisData = [];
			
			for (var i = 0; i < this.tableData.length; i++) {
				let node = [this.tableData[i][this.xVar], this.tableData[i][this.yVar]];
				axisData.push(node);
			}
			
			//chart
	        var option = {
	            title: {
	                text: this.xVar + " by " + this.yVar
	            },
				toolbox: {
					feature: {
						dataZoom: {
							show: false
						},
						restore: {},
						saveAsImage: {}
					}
				},
				xAxis: {},
				yAxis: {},
				series: [{
					symbolSize: 20,
					data: axisData,
					type: 'scatter'
				}]
			};
			this.chart.clear();
	        this.chart.setOption(option);
		},
	},
	mounted : function() {
		this.init();
	}
});