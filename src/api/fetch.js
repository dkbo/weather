import axios from 'axios'

/**
 * Ajax 打包
 * @param {string} url API位址
 * @param {object} params API 參數
 * @param {object} JWT JWT state
 * @param {Object} options ajax 選項
 * @param {Number} num 重試次數
 * @param {Number} timeOut 間隔秒數重試
 */
//
export const handleAjax = async (url, params = {}) => {
  const data = await axios.get(url, {params})
    .then(({data}) => data)
    .catch(err => console.error(err))
  return data
}