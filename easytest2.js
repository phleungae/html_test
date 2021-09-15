let WINDData = WIND.WINDData;
let WINDView = WIND.WINDView;
let ViewStateType = WIND.ViewStateType;
let LeftMouseOperation = WIND.LeftMouseOperation;
let TreeRuleType = WIND.TreeRuleType;
let MeasureType = WIND.MeasureType;
let setLanguageType = WIND.setLanguageType;
let CallbackType = WIND.CallbackType;
var canvas2 = document.getElementById("new-nice");
var ctx = canvas2.getContext("2d");

//WINDData初始化
let config = {};
config.serverIp = 'https://model.everybim.net';
config.appKey = 'YHeLIehn9wNacNT2YZ08ggqM3HhldCF2X1Ng';
config.appSecret = '818137e741bf3ab769c9266afd42165633f11f3137bd632b62fc70e56608b943';
let data = new WINDData(config);
let loadCallback = function (type, value) {//模型加载百分比回调
    console.log('load:' + value);
ctx.fillStyle = 'red'
ctx.fillRect(0,0,value,10);
if (value != 100) {
    document.getElementById("percentage").innerHTML = 'loading...' + value + '%';
}   else {
    document.getElementById("percentage").innerHTML = "Done";
}
};

const Http = new XMLHttpRequest();
const url='http://13.250.169.13:8100/Socket/MOKO114/Data/0124/';
Http.open("GET", url);
Http.send();
Http.onreadystatechange = (e) => {
  console.log(Http.responseText)

ctx.font = "20px Comic Sans MS";
ctx.fillSytle = 'blue';
ctx.textAlign = "center";
ctx.fillText("hi",canvas2.width/2, canvas2.height/2);
}


//let openModelDataUI = document.getElementById("openModelData");
//openModelDataUI.addEventListener("click", fetchRestaurants, false);


//let url1 = 'http://13.250.169.13:8100/Socket/MOKO114/Data/0124';
  //  document.getElementById("abcd").innerHTML = "hi";               //Problem

data.addWINDDataCallback(1, loadCallback);

//获取当前服务器包含的模型列表
let modeldata = new Map();
async function getModelList() {
    let modelarray = await data.getWINDDataQuerier().getAllModelParameterS();
    let l = modelarray.length;
    for (let i = 0; i < l; i++) {
        let model = modelarray[i];
        let temp = {};
        temp._id = model._id;
        temp._version = model.modelFile.version;
        temp._name = model.name;
        modeldata.set(model.name, temp);
    }
    console.log(modeldata);

    let modellistUI = document.getElementById("modellist");
    modeldata.forEach((model, name) => {
        modellistUI.add(new Option(name));
    });
    modellistUI.options[1].selected = true;//默认选中第2个 here to choose which model to add

    console.log(modellistUI.selectedIndex)

    modellistUI.onchange = async function() {       //Open the model when there is changes in 
                                                    //the dropdown menu.
        console.log(modellistUI.selectedIndex)
        ctx.clearRect(0,0,100,10);
        closeModelDatas(); 
        await openModelData();

    };
}


//WINDView初始化
let canvas = document.getElementById("View");
let view = new WINDView(canvas);
view.bindWINDData(data);//将View与一个Data绑定

//页面加载时初始化ui事件
window.addEventListener('load', onLoad, true);
async function onLoad() {
    //初始化UI
    await getModelList();
    openModelData();        //Open the model at the beginning
    //initDataUI();
    initViewUI();
    initViewRoamingUI();
}

/*function initDataUI() {

    let openModelDataUI = document.getElementById("openModelData");
    openModelDataUI.addEventListener("click", openModelData, false);


    let closeModelDatasUI = document.getElementById("closeModelDatas");
    closeModelDatasUI.addEventListener("click", closeModelDatas, false);

    let getAllComponentParamterUI = document.getElementById("getAllComponentParamter");
    getAllComponentParamterUI.addEventListener("click", getAllComponentParamter, false);

    let getAllStoreyParameterUI = document.getElementById("getAllStoreyParameter");
    getAllStoreyParameterUI.addEventListener("click", getAllStoreyParameter, false);
}*/

async function fetchAsync (url) {       //Api-Test
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

async function openModelData() {
    let modellistUI = document.getElementById("modellist");
    let model = modeldata.get(modellistUI.options[modellistUI.selectedIndex].text);
    if (model) {
        await data.getWINDDataLoader().openModelData(model._id);//打开对应模型id的模型数据
    }
}

function closeModelDatas() {
    data.getWINDDataLoader().closeAllModelDatas();
}

async function getAllComponentParamter() {
    console.log(await data.getWINDDataQuerier().getAllComponentParameterL());
}

async function getAllStoreyParameter() {
    console.log(await data.getWINDDataQuerier().getAllStoreyParameterL());
}

let openModelDataLocalUI = document.getElementById("openModelDataLocal");
openModelDataLocalUI.onchange = function () {
    let file = this.files[0];
    data.getWINDDataLoader().openModelDataTest(file);
};



//视图
function initViewUI() {
    let screenshotUI = document.getElementById("screenshot");
    screenshotUI.addEventListener("click", screenshot, false);

    document.getElementById('shadow').addEventListener('click', function () {
        let open = document.getElementById("shadow").checked;
        view.getWINDViewSetting().isLightShadowOpened(open);
    });

    document.getElementById('realmode').addEventListener('click', function () {
        let open = document.getElementById("realmode").checked;
        view.getWINDViewSetting().isRealModeOpened(open);
    });

    let cubeSectionSwitchUI = document.getElementById("cubeSectionSwitch");
    cubeSectionSwitchUI.addEventListener("click", cubeSectionSwitch, false);

    let cubeSectionShowHideUI = document.getElementById("cubeSectionShowHide");
    cubeSectionShowHideUI.addEventListener("click", cubeSectionShowHide, false);

    let resetCubeSectionUI = document.getElementById("resetCubeSection");
    resetCubeSectionUI.addEventListener("click", resetCubeSection, false);

    let measureSwitchUI = document.getElementById("measureSwitch");
    measureSwitchUI.addEventListener("click", measureSwitch, false);

    let measureTypeListUI = document.getElementById("measureTypeList");
    measureTypeListUI.add(new Option('点到点', 'dot'));
    measureTypeListUI.add(new Option('净距', 'distance'));
    measureTypeListUI.add(new Option('角度', 'angle'));
    measureTypeListUI.add(new Option('长度', 'length'));
    measureTypeListUI.add(new Option('查看', 'view'));
    measureTypeListUI.addEventListener("change", function (event) {
        measureTypeListUpdate(event.target.value)
    }, false);

    //添加视图回调
    view.addWINDViewCallback('callback', callback);
}
function measureTypeListUpdate(value) {
    if (value === 'dot') {
        view.getWINDViewMeasure().setMeasureType(MeasureType.DOT);
    } else if (value === 'distance') {
        view.getWINDViewMeasure().setMeasureType(MeasureType.DISTANCE);
    } else if (value === 'angle') {
        view.getWINDViewMeasure().setMeasureType(MeasureType.ANGLE);
    } else if (value === 'length') {
        view.getWINDViewMeasure().setMeasureType(MeasureType.LENGTH);
    } else if (value === 'view') {
        view.getWINDViewMeasure().setMeasureType(MeasureType.VIEW);
    }
}
function callback(type, result) {
    if (type === CallbackType.ROAMINGSTATE_CHANGED) {
        //result._personRoamingOpened;
        document.getElementById("thirdPersonSwitch").checked = result._thirdPersonOpened;
        document.getElementById("gravityFallSwitch").checked = result._gravityFallOpened;
        document.getElementById("collisionDetectSwitch").checked = result._collisionDectectOpened;
    }
}

function cubeSectionSwitch() {
    let state = view.getWINDViewSection().getSectionState();
    if (state._cubeSectionOpened) {
        view.getWINDViewSection().closeCubeSection();
    } else {
        view.getWINDViewSection().openCubeSection();
    }
}

function cubeSectionShowHide() {
    let state = view.getWINDViewSection().getSectionState();
    if (state._cubeSectionShowed) {
        view.getWINDViewSection().hideCubeSection();
    } else {
        view.getWINDViewSection().showCubeSection();
    }
}

function resetCubeSection() {
    view.getWINDViewSection().resetCubeSection();
}

function screenshot() {
    document.getElementById("screenshotView").src = view.screenShot();
}

function measureSwitch() {
    let state = view.getWINDViewMeasure().getMeasureState();
    if (state._measureOpened) {
        view.getWINDViewMeasure().closeMeasure();
    } else {
        view.getWINDViewMeasure().openMeasure();
    }
}

//漫游
function initViewRoamingUI() {
    let setLeftMouseOperationUI = document.getElementById("setLeftMouseOperation");
    setLeftMouseOperationUI.add(new Option('点选', 'pick'));
    setLeftMouseOperationUI.add(new Option('旋转', 'rotate'));
    setLeftMouseOperationUI.add(new Option('平移', 'pan'));
    setLeftMouseOperationUI.addEventListener("change", function (event) {
        leftmouseOperationUpdate(event.target.value)
    }, false);

    let revertHomePositionUI = document.getElementById("revertHomePosition");
    revertHomePositionUI.addEventListener("click", revertHomePosition, false);

    let zoomInPositionUI = document.getElementById("zoomInPosition");
    zoomInPositionUI.addEventListener("click", zoomInPosition, false);

    let zoomOutPositionUI = document.getElementById("zoomOutPosition");
    zoomOutPositionUI.addEventListener("click", zoomOutPosition, false);

    let locateSelectEntitiesUI = document.getElementById("locateSelectEntities");
    locateSelectEntitiesUI.addEventListener("click", locateSelectEntities, false);
}

function leftmouseOperationUpdate(value) {
    if (value === 'pick') {
        view.getWINDViewRoaming().setLeftMouseOperation(LeftMouseOperation.PICK);
    } else if (value === 'rotate') {
        view.getWINDViewRoaming().setLeftMouseOperation(LeftMouseOperation.ROTATE);
    } else if (value === 'pan') {
        view.getWINDViewRoaming().setLeftMouseOperation(LeftMouseOperation.PAN);
    }
}

function revertHomePosition() {
    view.getWINDViewRoaming().revertHomePosition();
}

function zoomInPosition() {
    view.getWINDViewRoaming().zoomInPosition();
}

function zoomOutPosition() {
    view.getWINDViewRoaming().zoomOutPosition();
}

function locateSelectEntities() {
    view.getWINDViewRoaming().locateSelectEntities();
}