
// const { clientId, guildId, token, publicKey } = require('./config.json');
const { Client, GatewayIntentBits, Partials, ActivityType, REST, Routes, userMention, ChannelType } = require('discord.js');
require('dotenv').config()

const express = require('express');
const port = process.env.PORT || 8999;

const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 

const app = express();

const rest = new REST().setToken(TOKEN);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});


var dm_datastore_channel = 0;
var mikkel_in_pdx = process.env.MIKKEL_IN_PDX === 'true';

const HAPPY_REACT = "🥳";
const SAD_REACT = "😭";
const MIKKEL_USER_ID = "584557745039081485";
const POOP_CHANNEL_ID = "863464428522438686";

const mikkels = [
  MIKKEL_USER_ID,
  "mikkel",
  "mikkel.green",
  "mikkel green"
];

const status_terms = [
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
  "Shockingly " + userMention(MIKKEL_USER_ID) + " is in Portland today.",
  "I am happy to report Mikkel Green is currently in PDX",
  "Believe it or not, " + userMention(MIKKEL_USER_ID) + " is in the Rose City",
  "He is in Portland... for now.",
  "Hey whaddayaknow! Mikkel is in PDX!",
  "Mr. Green is currently visiting Porland, Oregon.",
  "Based on my latest intel, " + userMention(MIKKEL_USER_ID) + " is in Portland today.",
  "He's in town. Must have a Hinge date scheduled."
];

const sad_content = [
  "Mikkel is not in Portland today.",
  "Nope " + userMention(MIKKEL_USER_ID) + " is not in Portland today.",
  "Mikkel isn't in Portland today. But maybe he's got a Hinge date for tomorrow?",
  "Mr. Green does not appear to be in Portland, Oregon today.",
  "The bad news: " + userMention(MIKKEL_USER_ID) + " is not in Portland today.\nThe good news: He probably forgot something and will be back for it.",
  "I don't know where he is. But it's not Portland!"
];


/////////////////////////////////////////////
// bot stuff

function sendToGeneral(msgContent) {
  const channel = client.channels.cache.get('689164244683456517');
  channel.send({content: msgContent});
}

async function setMikkelStatus(status, msg) {
  mikkel_in_pdx = status;
  if (dm_datastore_channel) {
    // clear all old messages
    const fetched = await dm_datastore_channel.messages.fetch({limit: 99}); 
    dm_datastore_channel.bulkDelete(fetched);

    // save the latest
    dm_datastore_channel.send("status:" + mikkel_in_pdx);
  }
  if (msg) replyWithStatus(msg);
}

function replyWithStatus(msg) {
  if (mikkel_in_pdx) {
    var random =  Math.floor((Math.random() * happy_content.length));
    var randomContent = happy_content[random];

    if (msg.react)
      msg.react(HAPPY_REACT);
    msg.reply(randomContent + " " + HAPPY_REACT);

  } else {
    var random =  Math.floor((Math.random() * sad_content.length));
    var randomContent = sad_content[random];

    if (msg.react)
      msg.react(SAD_REACT);

      msg.reply(randomContent + " " + SAD_REACT);
  }
}

function replyToMikkel(msg) {
  var content = msg.content.toLowerCase();

  if (['poop', '💩', 'gut'].some(s => content.includes(s)) || msg.channel.id === POOP_CHANNEL_ID) {
    if (msg.react) msg.react("💩");
  } else if (['forgot', 'forget', 'forgotten'].some(s => content.includes(s))) {
    msg.reply("Oh... did you forget something... again? 🙄");
    if (msg.react) msg.react("🙄");
  }  else if (['be late', 'running behind', 'going to be late'].some(s => content.includes(s))) {
    msg.reply("Nobody _really_ expected you to be on time, anyway. 🙄");
    if (msg.react) msg.react("🙄");
  } else {
    if (msg.react && Math.random() >= 0.75) msg.react("🧐");
  }
}

function replyToChannel(msg) {

  if (msg.author.bot) return; // Ignore messages from bots

  var content = msg.content.toLowerCase();

  // if our bot is mentioned
  if (msg.mentions.has(client.user.id)) {
    // and it's from Mikkel
    if (msg.author.id == MIKKEL_USER_ID) {
      if (content.includes("leaving PDX")) {
        setMikkelStatus(false, msg);
      } else if (content.includes("in PDX")) {
        setMikkelStatus(true, msg);
      } else {
        replyWithStatus(msg);
      }
    } else {
      replyWithStatus(msg);
    }
  }
  // mikkel is the author
  else if (msg.author.id == MIKKEL_USER_ID) {
    replyToMikkel(msg);
  }
   // mikkel mentioned or tagged
  else if (msg.author.id == MIKKEL_USER_ID || mikkels.some((m) => content.includes(m))) {
    
    // status in PDX keywords
    if ( status_terms.some((t) => content.includes(t))) {
      replyWithStatus(msg);

    // forget keywords
    } else if (['forgot', 'forget', 'forgotten'].some(s => content.includes(s))) {
      msg.reply("Typical " + userMention(MIKKEL_USER_ID) + " 🙄");
      if (msg.react) msg.react("🙄");

    // late keywords
    } else if (['late'].some(s => content.includes(s))) {
      //console.log('sending late quip...');
      msg.reply("You didn't think  " + userMention(MIKKEL_USER_ID) + " would be on time, did you? 🙄");
      if (msg.react) msg.react("🙄");

    // no special keywords
    } else {
      //console.log('No interesting keywords... ' + content);
      if (msg.react && Math.random() >= 0.5) msg.react("💚");
    }
  }
}

async function setUpDMDataStore() {

  console.log("Setting up DataStore in DMs...");
  
  const user = await client.users.fetch("611959441193041951").catch(() => null);
  const msg = await user.send("🫦");
  dm_datastore_channel = await client.channels.fetch(msg.channel.id);
 
  if (dm_datastore_channel) {
    console.log("Got DM Datastore channel. Reading data...");

    var savedStatus = false;
    
    const fetched = await dm_datastore_channel.messages.fetch({limit: 99}); 
    fetched.forEach(msg => {
      console.log(msg.id + ":" + msg.content);
      if (msg.content.includes("status:")) {
        savedStatus = ['in', 'true'].some(s => msg.content.toLowerCase().includes(s));
      }
    });

    console.log("Saving Mikkel status...");
    setMikkelStatus(savedStatus);
    
  } else {
    console.log("Did not get DataStore channel");
  }

}

function setUpPresence() {
  try {
    client.user.setPresence({ activities: [{ name: 'the game of \"Where is Mikkel Green\"' }], status: 'online' });
  } catch(error) {
    console.error('Error setting presence');
  }
}

async function setUpCommands() {
  try {
    // Register the "mikkel" slash command globally
    const commands = [
      {
        name: 'mikkel',
        description: 'Where is Mikkel? I will find out',
      },
    ];

    client.application.commands.set([]);

    const commandData = await client.application.commands.set(commands);
    console.log('Registered slash commands');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
}

client.on("messageCreate", (msg) => {
   
  // DMs
  if (msg.author.id != client.user.id && (msg.channel.type == ChannelType.DM || msg.channel.type == ChannelType.GroupDM)) {
    var content = msg.content.toLowerCase();

    if (content.startsWith('status:')) {
      setMikkelStatus(['in', 'true'].some(s => content.includes(s)), msg);
    } else if (content.startsWith('general:')) {
      sendToGeneral(content.replace('general:',''));      
    } 
  }

  // Channel messages
  replyToChannel(msg);

});

client.on('interactionCreate', async (interaction) => {
  
  if (!interaction.isCommand()) return; // Ignore interactions that are not commands

  const { commandName } = interaction;

  if (commandName === 'mikkel') {
    // Respond to the "mikkel" command
    replyWithStatus(interaction); // Replace with your desired response
  } 
});

client.once('ready', async () => {
  console.log('ready...\n');
  console.log(`Logged in as ${client.user.tag}...`);

  await setUpCommands();
  setUpPresence();
  await setUpDMDataStore();

  console.log("Bot ready.");
});

function cleanCommands(res)
{
  // for guild-based commands
  rest.put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), { body: [] })
  .then(() => console.log("Deleted guild commands"))
  .catch(console.error);

  // for global commands
  rest.put(Routes.applicationCommands(APPLICATION_ID), { body: [] })
  .then(() => console.log("Deleted global commands"))
  .catch(console.error);

  res.send('Successfully deleted all commands.<br/>')
}


//////////////////////////////////////////////////////////////
// Web Server
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Where is Mikkel Green today? ' + mikkel_in_pdx + '<br/>Discord client status:' + client.isReady());
});

app.get('/clean-commands', (req, res) => {
  cleanCommands(res);
});

app.get('/custom', (req, res) => {
  var msgContent = "I'm back, baby! Here to keep y'all updated on " + userMention(MIKKEL_USER_ID) + " and where he _might_ be.";
  sendToGeneral(msgContent);
  res.send('Done.');
});

app.listen(port, () => {
  client.login(TOKEN);
})



