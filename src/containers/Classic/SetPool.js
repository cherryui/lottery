/**
 * Created by Aus on 17/2/7.
 */
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
    Step,
    Stepper,
    StepLabel,
} from 'material-ui/Stepper';
import Chip from 'material-ui/Chip';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Tools from '../../components/Tools';
import ConstText from '../../components/ConstText';
import SwipeListLeftRight from '../../components/SwipeListLeftRight';


class SetPool extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            showChip: true,
            showDialog: false, // 是否显示对话框
            userListNumber: 0, // 用户数量
            prizeList: [], // 奖品列表 [{level: "", number: "", description: ""}]
            levelText: "",
            levelTextError: "",
            prizeNumber: "",
            prizeNumberError: "",
            prizeDescription: "",
            prizeDescriptionError: ""
        }
    }
    componentDidMount () {
        Tools.SwipeListLeftRightWatcher();
        // 从本地获取数据
        this.setState({
            userListNumber: Tools.ResolveStorageData("userList").length,
            prizeList: Tools.ResolveStorageData("prizeList")
        });
    }
    getMaxNumber () {
        // 获取输入数量的最大值
        let {prizeList, userListNumber} = this.state;
        let used = 0;
        let unused = 0;

        for(let i of prizeList){
            used += Number.parseInt(i.number);
        }

        unused = userListNumber - used;

        return unused;
    }
    handleOpen () {
        this.setState({showDialog: true});
    }
    handleClose () {
        this.setState({showDialog: false});
    }
    handleInput (keyName, e) {
        let obj = {};
        obj[keyName] = e.target.value;
        this.setState(obj);
    }
    handleCheckInput () {
        // 检查输入项是否合法 并报错
        let {levelText, levelTextError, prizeNumber, prizeNumberError, prizeDescription, prizeDescriptionError, prizeList} = this.state;

        // 名称
        if($.trim(levelText).length == 0){
            levelTextError = ConstText.Classic.levelTextNull;
        } else if ($.trim(levelText).length > 6) {
            levelTextError = ConstText.Classic.levelTextLong;
        } else {
            // 去重
            let isRepeat = false;

            for(let i = 0; i < prizeList.length; i++){
                if(levelText == prizeList[i].level){
                    isRepeat = true;
                }
            }

            if(isRepeat == true) {
                // 姓名去重
                levelTextError = ConstText.Classic.levelTextRepeat;
            } else {
                levelTextError = "";
            }
        }

        let maxNumber = this.getMaxNumber();

        // 数量
        if(prizeNumber == 0){
            prizeNumberError = ConstText.Classic.prizeNumberNull;
        } else if (prizeNumber > maxNumber) {
            prizeNumberError = ConstText.Classic.prizeNumberLong;
        } else {
            prizeNumberError = "";
        }

        // 描述
        if($.trim(prizeDescription).length == 0){
            prizeDescriptionError = ConstText.Classic.prizeDescriptionNull;
        } else if ($.trim(prizeDescription).length > 10) {
            prizeDescriptionError = ConstText.Classic.prizeDescriptionLong;
        } else {
            prizeDescriptionError = "";
        }

        if(levelTextError.length > 0 || prizeNumberError.length > 0 || prizeDescriptionError.length > 0){
            // 有一个有错误
            this.setState({
                levelTextError: levelTextError,
                prizeNumberError: prizeNumberError,
                prizeDescriptionError: prizeDescriptionError
            });
            return ;
        }

        // 插入新数据
        prizeList = prizeList || [];
        prizeList.push({level: levelText, number: prizeNumber, description: prizeDescription});
        // 存入本地
        Tools.StorageData("prizeList", prizeList);
        this.setState({
            showDialog: false,
            prizeList: prizeList,
            levelText: "",
            levelTextError: levelTextError,
            prizeNumber: "",
            prizeNumberError: prizeNumberError,
            prizeDescription: "",
            prizeDescriptionError: prizeDescriptionError
        });
    }
    handleDeleteList (id) {
        // 删除列
        let obj = $("#swipe-list-" + id);
        let prizeList = this.state.prizeList;
        let this_ = this;

        obj.animate({left: "-100%"}, 200, function () {
            obj.animate({height: "0"}, 200, function () {
                prizeList.slice(id, 1);
                // 存入本地
                Tools.StorageData("prizeList", prizeList);
                this_.setState({prizeList: prizeList});
            });
        });
    }
    handleTopList (id) {
        // 置顶列
        let obj = $("#swipe-list-" + id);
        let firstList = $(".swipe-list-group li:eq(0)");
        let objCurrentTop = obj[0].offsetTop;
        let listTop = firstList[0].offsetTop;
        let dist = listTop - objCurrentTop - 50 + "px";
        let prizeList = this.state.prizeList;
        let this_ = this;

        // 动画开始 一共 .2 + .4 + .2 = .8s
        $(".swipe-list-group").addClass("moving");
        firstList.before("<div class='empty'></div>");
        obj.addClass("moving");
        obj.find(".container").animate({top: dist}, 400, function () {
            obj.addClass("done");
            obj.find(".top-btn").removeClass("up");
            obj.find(".prize-list").animate({left: '0'}, 200, function () {
                // 动画完成更新数据
                let movingData = prizeList[id];
                prizeList.splice(id, 1);
                prizeList.unshift(movingData);
                // 通知修改
                this_.setState({prizeList: prizeList});
                // 保存数据
                Tools.StorageData("prizeList", prizeList);
                // 删除蒙版
                $(".transparent-mask").remove();
                $(".empty").remove();
            });
        });
    }
    handleDeleteChip () {
        let this_ = this;
        $(".alert-chip").animate({height: 0}, 200, function () {
            this_.setState({showChip: false});
        });

    }
    getDialogDOM () {
        const {showDialog, levelText, levelTextError, prizeNumber, prizeNumberError, prizeDescription, prizeDescriptionError} = this.state;

        const actions = [
            <FlatButton
                label="取消"
                primary={true}
                onTouchTap={this.handleClose.bind(this)}
            />,
            <FlatButton
                label="确定"
                primary={true}
                onTouchTap={this.handleCheckInput.bind(this)}
            />
        ];

        const DialogDOM = <Dialog
            title="添加奖池"
            actions={actions}
            modal={true}
            open={showDialog}
            className="add-dialog"
            onRequestClose={this.handleClose.bind(this)}
        >
            <TextField className="add-level-input" fullWidth={true} hintText="奖项名称 6个字以内" value={levelText} errorText={levelTextError} onChange={this.handleInput.bind(this, "levelText")}/>
            <TextField className="add-level-input" fullWidth={true} hintText="奖项数量" type="number" value={prizeNumber} errorText={prizeNumberError} onChange={this.handleInput.bind(this, "prizeNumber")}/>
            <TextField className="add-level-input" fullWidth={true} hintText="奖品描述 10字以内" value={prizeDescription} errorText={prizeDescriptionError} onChange={this.handleInput.bind(this, "prizeDescription")}/>
        </Dialog>;

        return DialogDOM;
    }
    getListDOM () {
        let {prizeList} = this.state;
        let ListDOM = [];
        let this_ = this;

        if(prizeList.length == 0) {
            ListDOM.push(<p key="no-data" className="no-list">暂无数据</p>);
        }

        for(let i = 0; i < prizeList.length; i++){
            ListDOM.push(<SwipeListLeftRight
                key={`s-${i + "" + new Date().getTime()}`}
                id={i}
                leftText={prizeList[i].level}
                middleText={prizeList[i].number}
                rightText={prizeList[i].description}
                onDelete={this_.handleDeleteList.bind(this)}
                onTop={this_.handleTopList.bind(this)}
            />);
        }

        let number = this.getMaxNumber();
        if(number > 0){
            ListDOM.push(
                <div className="add-list" key="btn">
                    <RaisedButton label="添加奖项" primary={true} fullWidth={true} onTouchTap={this.handleOpen.bind(this)} />
                </div>
            );

            if(prizeList.length != 0) {
                ListDOM.push(
                    <div className="next" key="next-btn">
                        <RaisedButton label="开始抽奖" secondary={true} fullWidth={true} href="/classic/play" />
                    </div>
                );
            }
        }

        return ListDOM;

    }
    getChipDOM () {
        let chipDOM = [];
        let showChip = this.state.showChip;

        if(showChip == true){
            chipDOM.push(<Chip key="chip" className="alert-chip" onRequestDelete={this.handleDeleteChip.bind(this)}>当前人数4, 推荐一等奖1个二等奖1个</Chip>);
        }

        return chipDOM;
    }
    render () {
        const DialogDOM = this.getDialogDOM();
        const ListDOM = this.getListDOM();
        const ChipDOM = this.getChipDOM();

        return (
            <MuiThemeProvider muiTheme={getMuiTheme({})}>
                <div className="set-pool-box">
                    <Stepper activeStep={1}>
                        <Step>
                            <StepLabel>填写列表</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>设置奖池</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>开始抽奖</StepLabel>
                        </Step>
                    </Stepper>
                    {ChipDOM}
                    <p className="prize-pool">奖品池</p>
                    <ul className="swipe-list-group">
                        {ListDOM}
                    </ul>
                    {DialogDOM}
                </div>
            </MuiThemeProvider>
        )
    }
}

export default SetPool