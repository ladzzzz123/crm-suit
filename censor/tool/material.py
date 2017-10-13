import requests
import datetime
import json
import sys
import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb

URL = 'http://bigdata-view.cootekservice.com:50091/arbiter/getdspmaterial'
SQL_QUERY = ''' INSERT INTO material (tu, dsp, m_date, ldp, material, pv)
VALUES (%s, %s, %s, %s, %s, %s) '''

def process(dateStr):
    params = {
        'date': dateStr
    }
    re = requests.get(URL, params)
    ret = json.loads(re.text)
    print('dateStr:%s' % dateStr)
    # print('ret:%s' % json.dumps(ret))
    if 'code' in ret and ret['code'] == 200 and 'data' in ret:
        data = ret['data']
        # print(json.dumps(data))
        data_list = list()
        for m in data:
            data_list.append((m['tu'], m['dsp'], dateStr, m['ldp'], m['material'], m['pv']))
        insertIntoDb(data_list)
    else:
        print('bad ret:%s' % json.dumps(ret))


def insertIntoDb(datas):
    conn = MySQLdb.connect(host="121.52.235.231",
        user="cootek", passwd="cootek", db="market_db",
        port=3306, charset="utf8")
    cur = conn.cursor()
    print(datas[2])
    try:
        cur.executemany(SQL_QUERY, datas)
    except Exception as e:
        print('insert error')
        print(e)
    finally:
        print('insert end')
    cur.close()
    conn.commit()
    conn.close()

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1]:
        process(sys.argv[1])
    else:
        now = datetime.datetime.now()
        yesterday = now - datetime.timedelta(days=1)
        process(yesterday.strftime('%Y%m%d'))
