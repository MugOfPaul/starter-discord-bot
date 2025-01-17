
// const { clientId, guildId, token, publicKey } = require('./config.json');
const { Client, GatewayIntentBits, Partials, ActivityType, REST, Routes, userMention, ChannelType } = require('discord.js');
require('dotenv').config()

const express = require('express');

const PORT = process.env.PORT || 8999;
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
const OWNER_USER_ID = "611959441193041951";
const MIKKEL_USER_ID = "584557745039081485";
const POOP_CHANNEL_ID = "863464428522438686";

const mikkels = [
  MIKKEL_USER_ID,
  "mr green",
  "mr. green",
  "mister green",
  "mikkel",
  "mikkel.green",
  "mikkel green"
];

const status_terms = [
  "where is",
  "where are you",
  "whereabouts",
  "when are you",
  "pdx",
  "in portland",
  "rose city",
  "flying",
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
  "I don't know where he is. But I know it's not Portland!"
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
    // const fetched = await dm_datastore_channel.messages.fetch({limit: 99}); 
    // dm_datastore_channel.bulkDelete(fetched);

    // save the latest
    dm_datastore_channel.send("status:" + mikkel_in_pdx);
  }
  if (msg) replyWithStatus(msg);
}

function replyWithStatus(msg) {
  if (mikkel_in_pdx) {

    var random =  Math.floor((Math.random() * happy_content.length));
    var randomContent = happy_content[random];

    if (msg.react) msg.react(HAPPY_REACT);
    msg.reply(randomContent + " " + HAPPY_REACT);

  } else {

    var random =  Math.floor((Math.random() * sad_content.length));
    var randomContent = sad_content[random];

    if (msg.react) msg.react(SAD_REACT);
    msg.reply(randomContent + " " + SAD_REACT);

  }
}

function replyToMikkel(msg) {
  var content = msg.content.toLowerCase();

  // Mikkel is mentioning Ricardo...
  if (msg.mentions.has(client.user.id)) {
    if (content.includes("status: out") || content.includes("status:out") || content.includes("leaving PDX")) {
        setMikkelStatus(false, msg);
    } else if (content.includes("status: in") || content.includes("status:in")  || content.includes("in PDX")) {
        setMikkelStatus(true, msg);
    } else {
      msg.reply("You can update your status by telling me \"status: in\", \"status: out\", \"leaving PDX\", \"in PDX\"");
      if (msg.react) msg.react("❓");
    }
    return; 
  }

  // forgetful Mikkel
  if (['forgot', 'forget', 'forgotten'].some(s => content.includes(s))) {

    if (Math.random() >= 0.5)
      msg.reply("Oh... did you forget something... again? 🙄");
    else
      msg.reply("Typical " + userMention(MIKKEL_USER_ID) + " 🙄");

    if (msg.react) msg.react("🙄");

  // late Mikkel
  } else if (['be late', 'running behind', 'there later'].some(s => content.includes(s))) {
    if (Math.random() >= 0.5)
      msg.reply("Nobody _really_ expected you to be on time, anyway. 🙄");
    else
      msg.reply("You didn't think  " + userMention(MIKKEL_USER_ID) + " would be on time, did you? 🙄");

    if (msg.react) msg.react("🙄");
  
  // poop Mikkel
  } else if (['poop', '💩', 'gut', 'biome'].some(s => content.includes(s)) || msg.channel.id === POOP_CHANNEL_ID) {
    if (msg.react) {
      if (msg.channel.id === POOP_CHANNEL_ID) {
        if (Math.random() > 0.6)  msg.react("💩");
      } else {
        msg.react("🚽");
      }
    } 
    // generic Mikkel
  } else {
    if (msg.react && Math.random() > 0.6) {
      var emoji = ['🕵🏾‍♂️', '🧐', '👀', '📝', '🤨']
      var random =  Math.floor((Math.random() * emoji.length));
      msg.react(emoji[random]);
    }
  }
}

function replyToChannel(msg) {

  if (msg.author.bot) return; // Ignore messages from bots

  var content = msg.content.toLowerCase();

  // mikkel is the author
  if (msg.author.id == MIKKEL_USER_ID) {
    replyToMikkel(msg);
    return;
  }

  // mikkel mentioned or tagged
  if (mikkels.some(m => content.includes(m))) {
    // status in PDX keywords (or if somebody tags Ricardo too)
    if ( status_terms.some(t => content.includes(t)) ) {
      replyWithStatus(msg);
    // no special keywords
    } else {
      console.log('No interesting keywords... ' + content);
      if (msg.react && (Math.random() >= 0.5)) msg.react("💚");
    }
  } else if (msg.mentions.has(client.user.id)) {
    if (msg.react) {
      var emoji = ['🕵🏾‍♂️', '💚', '🟢', '🟩', '🦠']
      var random =  Math.floor((Math.random() * emoji.length));
      msg.react(emoji[random]);
    }
  }
}

async function setUpDMDataStore() {

  console.log("Setting up DataStore in DMs...");
  
  const user = await client.users.fetch(OWNER_USER_ID).catch(() => null);
  const msg = await user.send("🕵🏾‍♂️");
  dm_datastore_channel = await client.channels.fetch(msg.channel.id);
 
  if (dm_datastore_channel) {
    console.log("Got DM Datastore channel. Reading data...");

    var savedStatus = false;
    var statusData = null;

    const fetched = await dm_datastore_channel.messages.fetch({limit: 99}); 

    fetched.forEach(msg => {
      // only care about bot sent messages in the DM channel
      if (!statusData && msg.author.id === client.user.id && msg.content.includes("status:")) {
        console.log(msg.id + ":" + msg.content);
        statusData = msg.content.toLowerCase();
      }
    });

    savedStatus = ['in', 'true'].some(s => statusData.includes(s));
    console.log("Saving Mikkel status... " + savedStatus);
    setMikkelStatus(savedStatus);
    
  } else {
    console.log("Did not get DataStore channel");
  }

}

function setUpPresence() {
  try {
    client.user.setPresence({ activities: [{ name: '/mikkel' }], status: 'online' });
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

// primary message processing here
client.on("messageCreate", (msg) => {
  //console.log("messageCreate: " + msg);

  // Special Owner DMs
  if (msg.author.id === OWNER_USER_ID && (msg.channel.type == ChannelType.DM || msg.channel.type == ChannelType.GroupDM)) {
    var content = msg.content.toLowerCase();

    if (content.startsWith('status:')) {
      setMikkelStatus(['in', 'true'].some(s => content.includes(s)), msg);
    } else if (content.startsWith('general:')) {
      sendToGeneral(content.replace('general:',''));      
    } 
  }

  // any other general messages
  replyToChannel(msg);

});

// this is pretty much just for slash commands
client.on('interactionCreate', async (interaction) => {
  
  //console.log("interactionCreate ");
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

app.listen(PORT, () => {
  client.login(TOKEN);
})



