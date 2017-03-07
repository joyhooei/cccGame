/**
 * Created by root on 1/4/17.
 */

require("../core/Core");
require("../gameData/CAccountData");
require("../gameData/CUserData");
var CBaseHttp = require("./CBaseHttp");
var consts = require('../consts/consts');
var Token = require('../util/token');
var secret = require('../../config/session').secret;
var encode = require('../util/encode');

Class({
    ClassName:"Game.HttpServer.Login",
    Base:"Game.HttpServer.BaseHttp",
    Port:require("../../config/servers").http.login,
    checkFuncs:{
        "/token":"getToken",
        "/nUser":"createUser"
    },
    getToken:function(reqInfo,resback)
    {
        var ses = reqInfo.ses;
        var type = reqInfo.type;
        if(type == 0)
        {
            if(ses == null)
            {
                var acc = Game.Data.CAccountData.NextAccount;
                this.register(acc,acc,resback);
                return;
            }
            var ay = ses.split("|");
            if(ay.length == 2)
            {
                var acc = ay[0],pwd = encode.md5(ay[1]);
                Game.Data.CAccountData.CreateByMysql(acc,function(err,accData)
                {
                    if(!err && accData.password === pwd)
                    {
                        Game.Data.CUserData.CreateByMysql(acc,function(err,userData)
                        {
                            if(!err)
                            {
                                resback({token:Token.create(userData.uid,secret)});
                            }
                            else
                            {
                                resback({rtoken:Token.create(acc,secret)});
                            }
                        });
                    }
                    else
                    {
                        resback({code: consts.LOGIN.LOGIN_FAIL});
                    }
                })
                return;
            }
        }
        resback({code: consts.LOGIN.REGIEST_FAIL});
    },

    createUser:function(reqInfo,resback)
    {

        var rtoken = reqInfo.rtoken,nickName = reqInfo.name;
        var info = Token.parse(rtoken,secret);
        if(info)
        {
            var acc = info.userid;
            Game.Data.CUserData.CreateByMysql(acc,nickName,function(err,userData)
            {
                if(!err)
                {
                    resback({token:Token.create(userData.uid,secret)});
                }
                else
                {
                    resback({code: consts.LOGIN.CREATE_USER_ERROR});
                }
            });
            return;
        }
        resback({code: consts.LOGIN.CREATE_USER_ERROR});
    },
    register:function(acc,pwd,resback)
    {
        Game.Data.CAccountData.CreateData(acc,pwd,function(err,accData)
        {
            if(!err )
            {
                resback({acc: accData.account});
            }
            else
            {
                resback({code: consts.LOGIN.LOGIN_TOKEN_ERR});
            }
        })
    },

    //login:function(reqInfo,resback)
    //{
    //    var token = reqInfo.token;
    //    var info = Token.parse(token,secret);
    //    if(info)
    //    {
    //
    //    }
    //    resback({code: consts.LOGIN.LOGIN_FAIL});
    //},
}).Static({
    Instance:Core.Instance
})