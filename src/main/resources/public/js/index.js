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

			predefineColors: [
				'#ff4500',
				'#ff8c00',
				'#ffd700',
				'#90ee90',
				'#00ced1',
				'#1e90ff',
				'#c71585',
			],
			minValue: 0,
			maxValue: 0,
			legendColorData:[],

			tableData: [],
			tableColumnMap: {},

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
			//calc color
			this.calcColor();
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
			this.hanhleVariableChange(this.filter.variable);
		},
		
		init: function(){
			
			this.hanhleSourceOption();
			this.hanhleTableOption();
			//this.hanhleVariableOption();

			this.showMap();
			this.showTable();
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
				let originPath = e["geometry"]["coordinates"][0][0];
				let path = [];
				for (let j = 0; j < originPath.length; j++) {
					const e2 = originPath[j];
					let temp = Utils.mercatorToLonLat(e2[0], e2[1]);
					let node = {
						lat: temp.lat,
						lng: temp.lon
					};
					path.push(node);
				}
				//color
				let color = this.getColor(geoId);
				//draw Polygon
				this.drawPolygon(geoId, this.map, path, color, color);
			}
		},
		drawPolygon: function(id, map, path, fillColor, strokeColor){
			let polygon = new google.maps.Polygon({
				path: path,
				map: map,
				fillColor: fillColor,
				//fillOpacity: 1,
				strokeColor: strokeColor,
				//strokeOpacity: 1
			});
			let geometry = {
				id: id,
				polygon: polygon
			}
			//event
			let _this = this;
			google.maps.event.addListener(polygon , 'mouseover', function(event) {
				_this.handlePolygonMouseover(polygon, "#000000", "#000000");
			});
			google.maps.event.addListener(polygon , 'mouseout', function(event) {
				_this.handlePolygonMouseout(polygon, fillColor, strokeColor);
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
				//redraw color
				this.reDrawPolygonColor(polygon, color, color);
				//event
				let _this = this;
				google.maps.event.addListener(polygon , 'mouseover', function(event) {
					_this.handlePolygonMouseover(polygon, "#000000", "#000000");
				});
				google.maps.event.addListener(polygon , 'mouseout', function(event) {
					_this.handlePolygonMouseout(polygon, color, color);
				});
			}
		},
		reDrawPolygonColor: function(polygon, fillColor, strokeColor){
			polygon.setOptions({
				path: polygon.getPath(),
				map: polygon.getMap(),
				fillColor: fillColor || polygon.fillColor,
				//fillOpacity: 1,
				strokeColor: strokeColor || polygon.strokeColor,
				//strokeOpacity: 1
			});
		},
		handlePolygonMouseover: function(polygon, fillColor, strokeColor){
			this.reDrawPolygonColor(polygon, fillColor, fillColor);
		},
		handlePolygonMouseout: function(polygon, fillColor, strokeColor){
			this.reDrawPolygonColor(polygon, fillColor, fillColor);
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

		}
	},
	mounted : function() {
		this.init();
	}
});