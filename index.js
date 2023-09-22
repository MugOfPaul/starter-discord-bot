
// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config()
const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 


const axios = require('axios')
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');


const mikkel_in_pdx = true;
const happy_reaction = "🥳";
const sad_reaction = "😭";

const mikkels = [
  mikkel_user_id,
  "mikkel",
  "mikkel.green"
];

const terms = [
  "where",
  "whereabouts",
  "when",
  "pdx",
  "portland",
  "rose city",
  "travel",
  "traveling",
  "flight",
  "visiting",
  "visit"
];

const happy_content = [
  "Mikkel *IS IN PDX TODAY*",
  "Shockingly @" + mikkel_user_id + " is in Portland today.",
  "I am happy to report Mikkel Green is currently in PDX",
  "Believe it or not, @" + mikkel_user_id + " is in the Rose City",
  "He is in Portland... for now.",
  "Hey whaddayaknow! Mikkel is in PDX!",
  "Mr. Green is currently visiting Porland, Oregon.",
  "Based on my latest intel, @" + mikkel_user_id + " is in Portland today."
];


function buildContent() {
  
  //msg.addReaction("💚");
  if (mikkel_in_pdx) {
    var random =  Math.floor((Math.random() * happy_content.length));
    return happy_content[random];

  } else {
    var random =  Math.floor((Math.random() * sad_content.length));
    return sad_content[random];
  }
}


const app = express();
// app.use(bodyParser.json());

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
          content: buildContent(),
        },
      });
    }

    // if(interaction.data.name == 'dm'){
    //   // https://discord.com/developers/docs/resources/user#create-dm
    //   let c = (await discord_api.post(`/users/@me/channels`,{
    //     recipient_id: interaction.member.user.id
    //   })).data
    //   try{
    //     // https://discord.com/developers/docs/resources/channel#create-message
    //     let res = await discord_api.post(`/channels/${c.id}/messages`,{
    //       content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
    //     })
    //     console.log(res.data)
    //   }catch(e){
    //     console.log(e)
    //   }

    //   return res.send({
    //     // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
    //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    //     data:{
    //       content:'👍'
    //     }
    //   });
    // }
  }

});



app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    {
      "name": "mikkel",
      "description": "Is Mikkel in PDX? Let's find out",
      "options": []
    },
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


app.listen(8999, () => {

})

