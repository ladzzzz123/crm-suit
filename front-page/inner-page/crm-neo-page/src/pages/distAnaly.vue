<template>
    <div class="container" v-if="logged">
        <textarea class="input-data" 
        rows="10" cols="50" v-model="input_data" placeholder="
        请在此输入城市用户数据信息,
        例如:
            北京 	515064
            广州 	381292
            杭州 	319511
            深圳 	280290
            上海 	254171
            成都 	216908
        "  required></textarea>
        <br/>
        <Button @click="calc">计算</Button>
        <br/>
        <br/>
        <Row>
            <Col span="10">
                <Table border :columns="colParsed" :data="parsedData"></Table>
                <br/>
                <Table border :columns="colCity" :data="cityLevelData"></Table>
            </Col>
            <Col span="10" offset="2">
                <Table border :columns="colDist" :data="distData"></Table>
                <br/>
                <Table border :columns="colProv" :data="provData"></Table>
            </Col>
        </Row>
    </div>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
</template>

<script>
import city_level from "../data/city-level";
import dist from "../data/dist";
import province from "../data/province";
import func from "../main";

export default {
    data: () => {
        return {
            input_data: "",
            parsedData: [],
            cityLevelData: [],
            distData: [],
            provData: [],
            colParsed: [
                {
                    title: "城市",
                    key: "city"
                },
                {
                    title: "数量",
                    key: "value"
                },
                {
                    title: "占比",
                    key: "percent"
                }
            ],
            colCity: [
                {
                    title: "分布",
                    key: "level"
                },
                {
                    title: "数量",
                    key: "value"
                },
                {
                    title: "占比",
                    key: "percent"
                }
            ],
            colDist: [
                {
                    title: "地区",
                    key: "dist"
                },
                {
                    title: "数量",
                    key: "value"
                },
                {
                    title: "占比",
                    key: "percent"
                }
            ],
            colProv: [
                {
                    title: "省市",
                    key: "province"
                },
                {
                    title: "数量",
                    key: "value"
                },
                {
                    title: "占比",
                    key: "percent"
                }
            ],
        };
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
        logged() {
            return this.$store.state.logged;
        },
        token() {
            return this.$store.state.userInfo.token;
        },
        parseData() {
            return `{"${this.input_data.replace(/\ /gi,"")
                .replace(/(\d+)/gi, "\":$1,\"")
                .replace(/(\n|\t|\	)/gi,"")
                .replace(/\"$/, "")
                .replace(/\,$/, "")}}`;
        }
    },
    methods: {
        gotoLogin: function() {
            this.$router.push("/login");
        },
        calc: function() {
            let tempData ={};
            try{
                tempData = JSON.parse(this.parseData);
            } catch(e) {
                func.showTips("alert-danger", "数据格式不符合规范！");
                return;
            }
            let sumData = Object.values(tempData).reduce((sum, val) => {
                return sum += val;
            });
            let tempCitysInfo = {};
            let tempDistInfo = {};
            let tempProvInfo = {};
            city_level.forEach(item => {
                tempCitysInfo[item.key] = 0;
            });
            dist.forEach(item => {
                tempDistInfo[item.key] = 0;
            });
            province.forEach(item => {
                tempProvInfo[item.key] = 0;
            });
            this.parsedData = Object.entries(tempData).map(item => {
                city_level.forEach(citysInfo => {
                    if(item[0] && citysInfo.citys.find(city => city.indexOf(item[0]) > -1)) {
                        tempCitysInfo[citysInfo.key] += parseInt(item[1]);
                    }
                });
                dist.forEach(distInfo => {
                    if(item[0] && distInfo.citys.find(city => city.indexOf(item[0]) > -1)) {
                        tempDistInfo[distInfo.key] += parseInt(item[1]);
                    }
                });
                province.forEach(provInfo => {
                    if (item[0] && provInfo.citys.find(city => city.indexOf(item[0]) > -1)) {
                        tempProvInfo[provInfo.key] += parseInt(item[1]);
                    }
                });
                return {
                    city: item[0],
                    value: item[1],
                    percent: (item[1] / sumData * 100).toFixed(4) + "%"
                };
            });
            this.parsedData.sort((a,b) =>{
                return b.value - a.value;
            });

            this.cityLevelData = Object.entries(tempCitysInfo).map(item => {
                let citys = [];
                city_level.forEach(info => {
                    if (info.key === item[0]) Object.assign(citys,info.citys);
                });
                return {
                    level: item[0],
                    value: item[1],
                    percent: (item[1] / sumData * 100).toFixed(4) + "%",
                    citys: JSON.stringify(citys)
                };
            });

            this.distData = Object.entries(tempDistInfo).map(item => {
                return {
                    dist: item[0],
                    value: item[1],
                    percent: (item[1] / sumData * 100).toFixed(4) + "%"
                };
            });
            this.distData.sort((a,b) =>{
                return b.value - a.value;
            });

            this.provData = Object.entries(tempProvInfo).map(item => {
                return {
                    province: item[0],
                    value: item[1],
                    percent: (item[1] / sumData * 100).toFixed(4) + "%"
                };
            });
            this.provData.sort((a,b) =>{
                return b.value - a.value;
            });

            return false;
        }
    }
}
</script>



<style>
    th {
        text-align: center;
    }

</style>
