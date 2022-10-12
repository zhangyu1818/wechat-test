require('dotenv').config({ path: '.env.local' })

import dayjs from 'dayjs'
import zh_CN from 'dayjs/locale/zh-cn'

import {
  getCarLimit,
  getLivingIndex,
  getWeather,
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

const sendWeatherInfo = async (limitNumber: string) => {
  const [carLimit, livingIndex, weather] = await Promise.all(
    [getCarLimit, getLivingIndex, getWeather].map((fn) => fn('285195'))
  )
  const {
    data: { condition },
  } = weather

  const {
    data: { limit },
  } = carLimit
  const today = dayjs().format('YYYY-MM-DD')
  const isTodayLimit = limit.some(
    (item) => item.date === today && item.prompt.includes(limitNumber)
  )

  const {
    data: { liveIndex },
  } = livingIndex
  const currentLivingIndex = liveIndex[today]

  const makeupDesc = currentLivingIndex.find(
    (item) => item.name === '化妆指数'
  )?.desc
  const dressingDesc = currentLivingIndex.find(
    (item) => item.name === '穿衣指数'
  )?.desc

  const templateData = {
    ...condition,
    carLimit: isTodayLimit ? '限号' : '不限号',
    makeupDesc,
    dressingDesc,
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

sendWeatherInfo('9')
