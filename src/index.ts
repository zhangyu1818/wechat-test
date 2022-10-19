require('dotenv').config({ path: '.env.local' })

import dayjs from 'dayjs'
import zh_CN from 'dayjs/locale/zh-cn'

import {
  getWeather,
  getWordFromGithubRepo,
  requestWechatAccessToken,
  sentWechatTemplateMsg,
} from './service'

dayjs.locale(zh_CN)

const getAccessToken = () => {
  const appID = process.env.APPID
  const appSecret = process.env.APPSECRET
  if (!appID || !appSecret) return
  return requestWechatAccessToken(appID, appSecret)
}

const sendMessage = async () => {
  const [weather, englishWord] = await Promise.all([
    getWeather('285195'),
    getWordFromGithubRepo(),
  ])
  const {
    data: { condition },
  } = weather

  const templateData = {
    ...condition,
    ...englishWord,
  }

  Object.keys(templateData).forEach((key) => {
    const value = templateData[key]
    if (!value) delete templateData[key]
    templateData[key] = {
      value: templateData[key],
      color: '#000000',
    }
  })

  const accessToken = await getAccessToken()
  sentWechatTemplateMsg(accessToken, {
    touser: process.env.TO_USER_ID,
    template_id: process.env.TEMPLATE_ID,
    data: templateData,
  })
}

sendMessage()
