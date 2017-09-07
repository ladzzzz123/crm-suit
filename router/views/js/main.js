function query() {
    requester.send("/crm-inner/plan-order/list", { token: _token }, content => {
        console.log("list:" + JSON.stringify(content));
        let list = document.querySelector(".list");
        list.innerHTML = "";
        let arr = content.ret;
        let li = {};
        if (Array.isArray(arr)) {
            list.addEventListener("click", e => {
                let item = e.target;
                switch (true) {
                    case Array.prototype.indexOf.call(item.classList, "accept") > -1:
                        if (JSON.parse(item.parentNode.dataset.acceptable)) {
                            acceptPlan(item.parentNode.dataset.planId);
                        } else {
                            alert("该任务无法接受！");
                        }
                        break;
                    default:
                        break;
                }
            });
            arr.forEach(item => {
                let acceptable = (item.m_status === "NEW");
                let statusStr = acceptable ? "等待接受" : item.m_opter ? `已被${item.m_opter}接受` : "等待接受";
                li = `
                    <br/>
                    <li data-plan-id=${item._id} data-acceptable=${acceptable}>
                        <span class="title">标题：${item.title}</span>
                        <span class="from">来自于：${item.m_from}</span>
                        <span class="date">创建时间：${new Date(item.m_date).toLocaleString()}</span>
                        <span class="status">当前状态：${statusStr}</span>
                        <div class="accept ${acceptable ? 'enable': 'disable'}">接受任务</div>
                    </li>
                    <br/>
                `;
                list.insertAdjacentHTML("beforeend", li);
            });
        }
    });
}

function acceptPlan(plan_id) {
    requester.send("/crm-inner/plan-order/accept", {
        plan_id: plan_id,
        token: _token
    }, content => {
        alert(content.msg);
        query();
    });
}