
// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config()
const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 


const axios = require('axios')
const express = require('express');
const bodyparser = require('body-parser')
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');


const app = express();
app.use(bodyparser.text());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name)
    if(interaction.data.name == 'yo'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Yo ${interaction.member.user.username}!`,
        },
      });
    }

    if(interaction.data.name == 'dm'){
      // https://discord.com/developers/docs/resources/user#create-dm
      let c = (await discord_api.post(`/users/@me/channels`,{
        recipient_id: interaction.member.user.id
      })).data
      try{
        // https://discord.com/developers/docs/resources/channel#create-message
        let res = await discord_api.post(`/channels/${c.id}/messages`,{
          content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
        })
        console.log(res.data)
      }catch(e){
        console.log(e)
      }

      return res.send({
        // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          content:'👍'
        }
      });
    }
  }

});

app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    {
      "name": "yo",
      "description": "replies with Yo!",
      "options": []
    },
    {
      "name": "dm",
      "description": "sends user a DM",
      "options": []
    }
  ]
  try
  {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    )
    console.log(discord_response.data)
    return res.send('commands have been registered')
  }catch(e){
    console.error(e.code)
    console.error(e.response?.data)
    return res.send(`${e.code} error from discord`)
  }
})


app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})

app.post('/post', async (request, response) => {
	const res = undefined
	try {
	res = await discord_api.post(`/channels/528723021670776832/messages`,{
          content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
        })
		response.send(res)
	} catch(e) {
	response.send(res)	
	}
})

app.post('/checkMember', async (req, res) => {
	let response = undefined
	
	try {
		response = await discord_api.get(`/guilds/${GUILD_ID}/members/${req.body}`)
		return res.send(response.data.user)
	} catch(e) {
		console.log(e)
	}	
})

app.post('/checkMemberV2', async (req, res) => {
	let response = undefined
	
	try {
		const requestBody = req.body;
		const [username] = requestBody.split(',');
		response = await discord_api.get(`/guilds/${GUILD_ID}/members/search?query=${username}`)
		return res.send(response.data)
	} catch(e) {
		console.log(e)
	}	
})

app.get('/getMembers', async (req, res) => {
let response = undefined
	
	try {
		response = await discord_api.get(`/guilds/${GUILD_ID}/members?limit=10`)
		console.log(response.data)
		return res.send(response.data)
	} catch(e) {
		console.log(e)
	}	
})	

app.listen(8999, () => {
	
})

