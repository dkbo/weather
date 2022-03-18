const ApiFn = path => `https://opendata.cwb.gov.tw/api/v1/rest/datastore/${path}?Authorization=CWB-839E91C6-2394-4ADF-BCC1-59A32A79D274`

export const API = {
  /** 局屬氣象站-現在天氣觀測報告*/
  a: ApiFn('O-A0003-001'),
  /** 天氣預報 */
  b: ApiFn('F-C0032-001'),
  /** 日出日沒時刻-全臺各縣市年度逐日日出日沒時刻資料 */
  c: ApiFn('A-B0062-001'),
}

// CWB-839E91C6-2394-4ADF-BCC1-59A32A79D274