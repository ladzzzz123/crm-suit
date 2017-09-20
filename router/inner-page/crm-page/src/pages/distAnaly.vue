
<template>
    <div class="container" v-if="logged">
        <form onsubmit="false">
            <textarea class="input-data" 
            rows="10" cols="50" v-model="input_data" required></textarea>
            <br/>
            <button type="submit" class="btn bnt-success" @click="calc">计算</button>
            <br/>
            <br/>
            <div class="row">
                <div class="panel panel-default col-lg-5">
                    <div class="panel-heading">城市数据</div>
                    <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>城市</th>
                            <th>数量</th>
                            <th>占比</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="data in parsedData" v-bind:key="data.city">
                            <td>{{ data.city }}</td>
                            <td>{{ data.value }}</td>
                            <td>{{ data.percent }}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <div class="split col-lg-1"></div> 
                <div class="col-lg-5">
                    <div class="panel panel-default">
                        <div class="panel-heading">按城市等级分布</div>
                        <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>分布</th>
                                <th>数量</th>
                                <th>占比</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in cityLevelData" v-bind:key="data.level">
                                <td>
                                    <abbr :title="data.citys">{{ data.level }}</abbr>
                                </td>
                                <td>{{ data.value }}</td>
                                <td>{{ data.percent }}</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">按地区分布</div>
                        <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>地区</th>
                                <th>数量</th>
                                <th>占比</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in distData" v-bind:key="data.level">
                                <td>{{ data.dist }}</td>
                                <td>{{ data.value }}</td>
                                <td>{{ data.percent }}</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>    
        </form>
    </div>
    <div class="container" v-else>
        您尚未登录，请点击<a @click="gotoLogin">此处</a>登录
    </div>
</template>

<script>
import city_level from "../data/city-level";
import dist from "../data/dist";

export default {
    data: () => {
        return {
            input_data: "",
            parsedData: {},
            cityLevelData: {},
            distData: {},
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
            // console.log("parseData:" + this.parseData);
            let tempData = JSON.parse(this.parseData);
            let sumData = Object.values(tempData).reduce((sum, val) => {
                return sum += val;
            });
            let tempCitysInfo = {};
            let tempDistInfo = {};
            city_level.forEach(item => {
                tempCitysInfo[item.key] = 0;
            });
            dist.forEach(item => {
                tempDistInfo[item.key] = 0;
            });
            this.parsedData = Object.entries(tempData).map(item => {
                city_level.forEach(citysInfo => {
                    if(citysInfo.citys.find(city => city.indexOf(item[0]) > -1)) {
                        tempCitysInfo[citysInfo.key] += parseInt(item[1]);
                    }
                });
                dist.forEach(distInfo => {
                    if(distInfo.citys.find(city => city.indexOf(item[0]) > -1)) {
                        tempDistInfo[distInfo.key] += parseInt(item[1]);
                    }
                });
                return {
                    city: item[0],
                    value: item[1],
                    percent: (item[1] / sumData * 100).toFixed(2) + "%"
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
                    percent: (item[1] / sumData * 100).toFixed(2) + "%",
                    citys: JSON.stringify(citys)
                };
            });

            this.distData = Object.entries(tempDistInfo).map(item => {
                return {
                    dist: item[0],
                    value: item[1],
                    percent: (item[1] / sumData * 100).toFixed(2) + "%"
                };
            });
            // console.log("cityLevelData:" + JSON.stringify(this.cityLevelData));
            // this.cityLevelData.sort((a,b) =>{
            //     return b.value - a.value;
            // });

            return false;
        }
    }
}
</script>



<style>
    th {
        text-align: center;
    }
    .city {
        max-width: 3rem;
        overflow-x: scroll;
        text-align: center;
    }

</style>
