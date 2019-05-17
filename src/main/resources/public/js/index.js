new Vue({
	el : '#app',
	data : function() {
		return {
			filter: {
				source: [],
				table: [],
				variable: []
			},
			asideWidth: "50%",

			mapFormVisible: false,
			mapForm: {
				startColor: "",
				endColor: "",
				number: 4,
				method: 1
			},
			predefineColors: [
				'#ff4500',
				'#ff8c00',
				'#ffd700',
				'#90ee90',
				'#00ced1',
				'#1e90ff',
				'#c71585',
				'rgba(255, 69, 0, 0.68)',
				'rgb(255, 120, 0)',
				'hsv(51, 100, 98)',
				'hsva(120, 40, 94, 0.5)',
				'hsl(181, 100%, 37%)',
				'hsla(209, 100%, 56%, 0.73)',
				'#c7158577'
			],

			legendColorData:[
				{color: "11", from: "11", to: "11"}
			],
			tableData: [{
							date: 'Oak Grove CDP (Washington County)',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						},{
							date: '2016-05-02',
							name: '王小虎',
							address: '上海市普陀区金沙江路 1518 弄',
							date1: '2016-05-02',
							name1: '王小虎',
							address1: '上海市普陀区金沙江路 1518 弄',
							date2: '2016-05-02',
							name2: '王小虎',
							address2: '上海市普陀区金沙江路 1518 弄',
						}]

		};
	},
	methods : {
		handleMapOptionApply: function(){

		}
	},
	mounted : function() {

	}
});