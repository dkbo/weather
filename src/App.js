import React, { useState, useEffect } from 'react'
import { handleAjax } from './api/fetch'
import { API } from './api/index'
import './App.css'
import icons from './icons'
import iconKeys from './iconKeys'
import { Table, Card, Button, Tooltip, Modal, Row, Col } from 'antd'
// import { VList } from 'virtual-table-ant-design'
import { ExportOutlined, ReloadOutlined, ProfileOutlined } from '@ant-design/icons'

function App() {
  const columns = [
    {
      title: '縣市',
      dataIndex: 'city',
      onFilter: (value, record) => record.city === value,
    },
    {
      title: '地區',
      dataIndex: 'area',
    },
    {
      title: '觀測時間',
      dataIndex: 'date',
      sorter: (a, b) => +new Date(a.date) - +new Date(b.date),
    },
    {
      title: '天氣',
      dataIndex: 'weather',
    },
    {
      title: '溫度',
      dataIndex: 'temp',
      sorter: (a, b) => +a.temp - +b.temp,
    },
    {
      title: '風速',
      dataIndex: 'wdsd',
    },
    {
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: data => (
        <Tooltip placement="top" title={'更多資訊'}>
          <ProfileOutlined onClick={() => openDetail(data)} style={{ color: '#349CCA', fontSize: '24px' }} />
        </Tooltip>
      ),
    },
  ]

  const detailColumns = [
    {
      title: '時段',
      dataIndex: 'time',
    },
    {
      title: '天氣狀況',
      dataIndex: 'Wx',
    },
    {
      title: '降雨機率',
      dataIndex: 'PoP',
      align: 'center',
      render: v => <span>{v}%</span>,
    },
    {
      title: '最低溫',
      align: 'center',
      dataIndex: 'MinT',
    },
    {
      title: '最高溫',
      align: 'center',
      dataIndex: 'MaxT',
    },
    {
      title: '天氣描述',
      dataIndex: 'CI',
    },
  ]
  const [selectedRowKeys, setRowKeys] = useState([])
  const [detailData, setDetailData] = useState({})
  const [dataList, setDataList] = useState([])
  const [detailDataList, setDetailDataList] = useState([])
  const [tableColumns, setTableColumns] = useState(columns)
  const [visible, setVisible] = useState(false)
  // 初始 api
  useEffect(() => {
    fetchA()
  }, [])

  function fetchA() {
    // 局屬氣象站-現在天氣觀測報告
    handleAjax(API.a).then(data => {
      const {
        records: { location },
      } = data
      const arr = []
      const cityObj = {}
      let i = 0
      location.forEach(({ parameter, time: { obsTime }, weatherElement }) => {
        if (+weatherElement[20].elementValue === -99) {
          return
        }
        const obj = {
          key: i++,
          city: parameter[0].parameterValue,
          area: parameter[2].parameterValue,
          date: obsTime,
          weather: weatherElement[20].elementValue,
          temp: weatherElement[3].elementValue,
          wdsd: `${weatherElement[2].elementValue}/h`,
        }
        cityObj[obj.city] = true
        arr.push(obj)
      })

      const cityArr = Object.keys(cityObj).map(city => ({ text: city, value: city }))
      setTableColumns(columns => {
        columns[0].filters = cityArr
        return columns
      })
      setDataList(arr)
    })
  }
  function fetchB(locationName) {
    // 局屬氣象站-天氣預報
    handleAjax(API.b, { locationName }).then(data => {
      const fetchData = data.records.location[0].weatherElement
      // const time = fetchData[0].time
      const obj = {}
      const arr = [{}, {}, {}]

      fetchData.forEach(({ elementName, time }) => (obj[elementName] = time))
      detailColumns.forEach(({ dataIndex }) => {
        if (obj[dataIndex]) {
          obj[dataIndex].forEach(({ startTime, parameter: { parameterName } }, i) => {
            arr[i][dataIndex] = parameterName
            arr[i].time = startTime
          })
        }
      })
      // 處理時間
      const today = arr[0].time.split(' ')[0]
      arr.forEach((arr) => {
        arr.key = arr.time
        const [date, time] = arr.time.split(' ')
        let dateStr, timeStr
        if (date === today) {
          dateStr = '今天'
        } else {
          dateStr = '明天'
        }

        if (['12:00:00', '06:00:00'].includes(time)) {
          timeStr = '白天'
        } else {
          timeStr = '晚上'
        }

        arr.time = dateStr + timeStr
      })
      setDetailDataList(arr)
      // startTime: "2022-03-18 12:00:00"
      // endTime: "2022-03-18 18:00:00"
    })
  }

  // function fetchC(locationName) {
  //   // 全臺各縣市每天的日出、日沒及太陽過中天等時刻資料-含有日出日沒時
  //   handleAjax(API.c, { locationName }).then(data => {
  //     const {
  //       records: { location },
  //     } = data
  //     console.log(321, data)
  //   })
  // }
  // 取得是否為晚上
  function getIsNight() {
    return detailDataList[0]?.time.includes('晚上')
  }
  // 紀錄選取的 key 值
  function onSelectChange(selectedRowKeys) {
    console.log(selectedRowKeys);
    setRowKeys(selectedRowKeys)
  }
  // 詳情
  function openDetail(data) {
    setDetailData(data)
    fetchB(data.city)
    // fetchC(data.city)
    setVisible(true)
  }
  // 匯出 csv
  function exportCSV() {
    if (selectedRowKeys.length) {
      const fileName = 'download.csv'
      const csvData = `${tableColumns
        .filter(({ title }) => title)
        .map(({ title }) => title)
        .join(',')}\r\n${selectedRowKeys
        .map(keys => dataList[+keys])
        .map(
          ({ city, area, date, weather, temp, wdsd } = {}) => `${city},${area},${date},${weather},${temp},${wdsd}`
        )
        .join('\r\n')}`
      const blob = new Blob(['\ufeff' + csvData], {
        type: 'application/csv;charset=utf-8;',
      })

      if (window.navigator.msSaveBlob) {
        // FOR IE BROWSER
        navigator.msSaveBlob(blob, fileName)
      } else {
        // FOR OTHER BROWSERS
        const link = document.createElement('a')
        const csvUrl = URL.createObjectURL(blob)
        link.href = csvUrl
        link.style = 'visibility:hidden'
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }
  const extra = (
    <div>
      <Button
        type="primary"
        onClick={exportCSV}
        style={{ background: '#67C6F0', border: 'none', marginRight: '16px' }}
        shape="round"
        icon={<ExportOutlined />}
        size="middle"
      >
        Export
      </Button>
      <Button
        type="primary"
        onClick={fetchA}
        style={{ background: '#67C6F0', border: 'none' }}
        shape="round"
        icon={<ReloadOutlined />}
        size="middle"
      >
        Refresh
      </Button>
    </div>
  )

  return (
    <div className="container">
      <Card bodyStyle={{ padding: 0 }} className="card" title="即時天氣" extra={extra}>
        <Table
          className="listTable"
          pagination={false}
          rowSelection={rowSelection}
          columns={tableColumns}
          dataSource={dataList}
          // scroll={{ y: '80vh', x: true }}
          // components={VList({
          //   height: '80vh',
          // })}
        />
      </Card>
      <Modal
        // title="Modal 820px width"
        centered
        visible={visible}
        onCancel={() => setVisible(false)}
        width={820}
        footer={null}
      >
        <Row>
          <Col span={12} className="modal-left">
            <div className="modal-title">
              {detailData.city} {detailData.area}
            </div>
            <div className="modal-wheather">{detailData.weather}</div>
            <Row>
              <Col span={12}>
                <div className="modal-temp">{~~detailData.temp}</div>
              </Col>
              <Col span={12} className="modal-leftbottom">
                <div>
                  <div>
                    <img src={icons.airFlowSVG} alt="" />
                    <span>{detailData.wdsd}</span>
                  </div>
                  <div>
                    <img src={icons.rainSVG} alt="" />
                    <span>{detailDataList[0]?.PoP}%</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
          <Col span={12} className="modal-right">
            <img src={icons[`${getIsNight() ? 'night' : 'day'}${iconKeys[detailData.weather]}SVG`]} alt="" />
          </Col>
        </Row>
        <Table
          className="detailTable"
          pagination={false}
          columns={detailColumns}
          dataSource={detailDataList}
          // scroll={{ y: '80vh', x: true }}
          // components={VList({
          //   height: '80vh',
          // })}
        />
      </Modal>
    </div>
  )
}

export default App
