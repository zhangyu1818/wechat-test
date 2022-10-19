import axios from 'axios'
import dayjs from 'dayjs'
import { Octokit } from 'octokit'

const octokit = new Octokit({ auth: process.env.GITHUB_API_KEY })
const request = axios.create()

const mojiRequest = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Authorization: `APPCODE ${process.env.APPCODE}`,
  },
})

export const requestWechatAccessToken = (appid: string, secret: string) =>
  request
    .get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid,
        secret,
      },
    })
    .then(({ data }) => data.access_token)

export const sentWechatTemplateMsg = (accessToken: string, data: unknown) =>
  request.post(
    'https://api.weixin.qq.com/cgi-bin/message/template/send',
    data,
    {
      params: {
        access_token: accessToken,
      },
    }
  )

export const getCarLimit = (cityId: string) =>
  mojiRequest
    .post('http://aliv18.data.moji.com/whapi/json/alicityweather/limit', {
      cityId,
      token: '27200005b3475f8b0e26428f9bfb13e9',
    })
    .then((res) => res.data)

export const getLivingIndex = (cityId: string) =>
  mojiRequest
    .post('http://aliv18.data.moji.com/whapi/json/alicityweather/index', {
      cityId,
      token: '5944a84ec4a071359cc4f6928b797f91',
    })
    .then((res) => res.data)

export const getWeather = (cityId: string) =>
  mojiRequest
    .post('http://aliv18.data.moji.com/whapi/json/alicityweather/condition', {
      cityId,
      token: '50b53ff8dd7d9fa320d3d3ca32cf8ed1',
    })
    .then((res) => res.data)

const requestGithubContent = (path: string) =>
  octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: 'Wei-Xia',
    repo: 'most-frequent-technology-english-words',
    path,
  })

export const getWordFromGithubRepo = async () => {
  try {
    const startDay = dayjs('2022-10-20')
    const { data: mdFiles } = await requestGithubContent('_posts')

    const index = dayjs().diff(startDay, 'd')
    const currentMDFile = mdFiles[index]
    const { path } = currentMDFile
    const { data } = await requestGithubContent(path)

    return Buffer.from((data as any).content, 'base64')
      .toString('utf8')
      .replaceAll('-', '')
      .trim()
      .split('\n')
      .reduce((map, currentValue) => {
        const [key, value] = currentValue.split(/:\s*/)
        map[key] = value || '无'
        return map
      }, {})
  } catch {
    return { word: '粗错了' }
  }
}
