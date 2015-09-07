
function ViewData(){

  var CPU_LINE_MAX = 30;
  var RAM_LINE_MAX = 30;
  var _viewModel = null;


  function createMemoryPie(selector, data){
    var memoryPie = new Chartist.Pie(selector, {
        series: data.series
      }, {
        donut: true,
        donutWidth: 30,
        startAngle: 0,
        total: 200,
        showLabel: false,
        chartPadding: 0,

    });

    return memoryPie;
  }

  function createCPUPie(selector, data){
    var cpuPie =  new Chartist.Pie(selector, {
        series: [20, 80]
      }, {
        width:  '30px',
        height: '30px',
        donut: true,
        donutWidth: 8,
        startAngle: 0,
        total: 100,
        chartPadding: 2,
        showLabel: false,
      });

    return cpuPie;
  }

  function createMemoryLine(selector, data){
    var memoryHistory = new Chartist.Line(selector, {
      labels: data.labels,
      series: data.series
    }, {
      high: 110,
      low: 0,
      lineSmooth: true,
      showArea: true,
      showLine: true,
      showPoint: false,
      fullWidth: true,
      axisX: {
        showLabel: false,
        scaleMinSpace: 100,
        offset: 20,
      },
      axisY: {
        showLabel: false,
        scaleMinSpace: 10,
        offset: 30,
      },
      chartPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
    });

    return memoryHistory;
  }

  function createCPULine(selector, data){
    var memoryHistory = new Chartist.Line(selector, {
      labels: data.labels,
      series: data.series
    }, {
      high: 110,
      low: 0,
      lineSmooth: true,
      showArea: true,
      showLine: true,
      showPoint: false,
      fullWidth: true,
      axisX: {
        showLabel: false,
        scaleMinSpace: 100,
        offset: 20,
      },
      axisY: {
        showLabel: false,
        scaleMinSpace: 10,
        offset: 30,
      },
      chartPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
    });

    return memoryHistory;
  }

  function updateViewModel(viewModel, data){
    viewModel.memory.total = data.memory.total / 1000;
    viewModel.memory.free = data.memory.free / 1000;
    viewModel.memory.pieData.series = [100 - data.memory.percent, data.memory.percent];

    viewModel.memory.lineData.labels.push(0);
    if(viewModel.memory.lineData.labels.length > RAM_LINE_MAX){
      viewModel.memory.lineData.labels.shift();
    }

    viewModel.memory.lineData.series[0].push(data.memory.percent);
    if(viewModel.memory.lineData.series[0].length > 100){
      viewModel.memory.lineData.series[0].shift();
    }

    if(viewModel.cpu.lineData.labels.length <= 0)
       viewModel.cpu.lineData.labels.push(1); // add dummy data for the first line

    viewModel.cpu.lineData.labels.push(1);
    if(viewModel.cpu.lineData.labels.length > CPU_LINE_MAX)
      viewModel.cpu.lineData.labels.shift();

    viewModel.cpu.cores = data.cpu.length;
    viewModel.cpu.totalBusy = 0;
    viewModel.cpu.busy = [];
    for(var i = 0; i < data.cpu.length; i++){
      viewModel.cpu.totalBusy += data.cpu[i].percent;
      viewModel.cpu.busy[i] = data.cpu[i].percent;

      viewModel.cpu.pieData[i] = {
        series: [data.cpu[i].percent, 100 - data.cpu[i].percent]
      };

      if(!viewModel.cpu.lineData.series[i])
        viewModel.cpu.lineData.series[i] = [];

      if(viewModel.cpu.lineData.series[i].length <= 0)
        viewModel.cpu.lineData.series[i].push(0) // add dummy data for the first line

      viewModel.cpu.lineData.series[i].push(data.cpu[i].percent);

      if(viewModel.cpu.lineData.series[i].length > CPU_LINE_MAX)
        viewModel.cpu.lineData.series[i].shift();
    }

    viewModel.cpu.totalBusy = viewModel.cpu.totalBusy / data.cpu.length;
  }

  function createDOM(viewModel){
    viewModel.memory.pieChart = createMemoryPie('.memory-pie', viewModel.memory.pieData);
    viewModel.memory.lineChart = createMemoryLine('.memory-line', viewModel.memory.lineData);
    viewModel.cpu.lineChart = createCPULine('.cpu-line', viewModel.cpu.lineData);

    viewModel.cpu.pieChart = [];
    for(var i = 0; i < viewModel.cpu.pieData.length; i++){
      var rowId = 'cpu-row-' + i;
      var html = '<div class="cpu-row" id="' + rowId + '" data-cpu-series="ct-series-' + String.fromCharCode(97 /* 'a' */ + i) + '" >'  +
                 '  <div class="cpu-col-data">'                         +
                 '    <span class="core-name">core-' + (i+1) + '</span>'            +
                 '    <span class="core-data">&nbsp;</span>'            +
                 '    <span class="core-x">&nbsp;</span>'               +
                 '  </div>'                                             +
                 '  <div class="cpu-col-chart">'                        +
                 '    <div class="cpu-pie cpu-pie-' + i +'"></div>'            +
                 '  </div>'                                             +
                 '</div>';

      var $cpu = $(html);

      $('.cpu-rows').append($cpu);

      viewModel.cpu.pieChart[i] = createCPUPie('.cpu-pie-' + i, viewModel.cpu.pieData[i]);

    }
  }

  function attachEvents(){
    $('.cpu-row').hover(function(){
      var series = $(this).data('cpu-series');
      $('.cpu-line .' + series + ' > path').css('fill-opacity', 0.6);
    }, function(){
      var series = $(this).data('cpu-series');
      $('.cpu-line .' + series + ' > path').css('fill-opacity', 0.1);
    });
  }


  function update(viewModel, data){
    updateViewModel(viewModel, data);
    updateView(viewModel);

  }

  function updateView(viewModel){
    viewModel.memory.pieChart.update(viewModel.memory.pieData);
    viewModel.memory.lineChart.update(viewModel.memory.lineData);
    $('#memTotalLbl').text(viewModel.memory.total.toFixed(0));
    $('#memUsedLbl').text((viewModel.memory.total - viewModel.memory.free).toFixed(0));
    $('#memFreeLbl').text(viewModel.memory.free.toFixed(0));

    viewModel.cpu.lineChart.update(viewModel.cpu.lineData);
    for(var i = 0; i < viewModel.cpu.pieChart.length; i++){
      var rowId = '#cpu-row-' + i;
      viewModel.cpu.pieChart[i].update(viewModel.cpu.pieData[i]);
      $(rowId + ' .cpu-col-data .core-data').text(viewModel.cpu.busy[i].toFixed(2) + '%')
    }

    $('.cpu-card .content p').text('cores: ' + viewModel.cpu.cores + ' | ' + viewModel.cpu.totalBusy.toFixed(0) + '%')
  }

  function init(data){
    var viewModel = {
      memory: {
        pieData: {
          series: []
        },
        lineData: {
          labels: [0],
          series: [[0]],
        }
      },
      cpu: {
        pieData:[
          //{series: []}
        ],
        lineData: {
          labels: [],
          series: [
            // [...],
            // [...],
          ]
        },
        cores: 0,
        totalBusy: 0,
      }
    };

    updateViewModel(viewModel, data);
    createDOM(viewModel);
    attachEvents();

    return viewModel;
  }



  function dataHandler(data){
    if(_viewModel){
      update(_viewModel, data);
    }
    else{
      _viewModel = init(data);
    }
  }

  function createDummyData(){
    var result = {
        cpu: [
          { idle: Math.random() * 10000, total: 10000, percent: 0},
          { idle: Math.random() * 10000, total: 10000, percent: 0},
          { idle: Math.random() * 10000, total: 10000, percent: 0},
          { idle: Math.random() * 10000, total: 10000, percent: 0}
        ],
        memory: {
          free: Math.random() * 10000,
          total: 10000,
          percent: 0
        }
      };

    result.memory.percent = (result.memory.free * 100) / result.memory.total;

    for(var i = 0; i < 4; i++){
      result.cpu[i].percent = (result.cpu[i].idle * 100) / result.cpu[i].total;
    }

    return result;
  }

  return {
    dataHandler: dataHandler,
    //createDummyData: createDummyData
  }
}
