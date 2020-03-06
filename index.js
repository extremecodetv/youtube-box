require('dotenv').config()

const { Octokit } = require('@octokit/rest')
const Axios = require('axios')
const { stripIndents } = require('common-tags')

const {
  GIST_ID: gistId,
  GH_TOKEN: githubToken,
  YOUTUBE_API_KEY: youtubeApiKey,
  YOUTUBE_CHANNEL_ID: youtubeChannelId
} = process.env

const octokit = new Octokit({ auth: `token ${githubToken}` })

const getLastVideo = async => Axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeChannelId}&maxResults=1&order=date&type=video&key=${youtubeApiKey}`)

const updateGist = async ({ box }) => {
  let gist
  try {
    gist = await octokit.gists.get({ gist_id: gistId })
  } catch (error) {
    console.error(`Unable to get gist\n${error}`)
  }

  const filename = Object.keys(gist.data.files)[0]
  await octokit.gists.update({
    gist_id: gistId,
    files: {
      [filename]: {
        filename: '📺 Last Published On YouTube',
        content: box
      }
    }
  })
}

const main = async () => {
  const { data: respone } = await getLastVideo()
  const video = respone.items.shift()

  const box = stripIndents`
    link: https://youtu.be/${video.id.videoId}
    title: ${video.snippet.title}
    description: ${video.snippet.description}
  `

  await updateGist({ box })
}

(async () => {
  await main()
})()
