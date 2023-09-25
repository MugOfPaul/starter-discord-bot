
// const { clientId, guildId, token, publicKey } = require('./config.json');
const { Client, GatewayIntentBits, ActivityType, REST, Routes, userMention } = require('discord.js');
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
});


const mikkel_in_pdx = process.env.MIKKEL_IN_PDX === 'true';
const happy_reaction = "🥳";
const sad_reaction = "😭";
const mikkel_user_id = "584557745039081485";

const mikkels = [
  mikkel_user_id,
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
  "Shockingly " + userMention(mikkel_user_id) + " is in Portland today.",
  "I am happy to report Mikkel Green is currently in PDX",
  "Believe it or not, " + userMention(mikkel_user_id) + " is in the Rose City",
  "He is in Portland... for now.",
  "Hey whaddayaknow! Mikkel is in PDX!",
  "Mr. Green is currently visiting Porland, Oregon.",
  "Based on my latest intel, " + userMention(mikkel_user_id) + " is in Portland today.",
  "He's in town. Must have a tinder date scheduled."
];


/////////////////////////////////////////////
// bot stuff
function sendStatusResponse(msg) {
  
  if (msg.react) 
    msg.react("💚");
  
  if (mikkel_in_pdx) {
    var random =  Math.floor((Math.random() * happy_content.length));
    var randomContent = happy_content[random];

    if (msg.react)
      msg.react(happy_reaction);
    msg.reply(randomContent + " " + happy_reaction);

  } else {
      if (msg.react)
        msg.react(sad_reaction);

      msg.reply("Mikkel is not in PDX today. " + sad_reaction);
  }
}

client.on("messageCreate", (msg) => {

   if (msg.author.bot) return; // Ignore messages from bots
   console.log('messageCreate...');

  // When a message is created
  var content = msg.content.toLowerCase();
  
  // Channel messages
 
  // if our bot is mentioned
  if (msg.mentions.has(client.user.id)) {
    sendStatusResponse(msg);
  }
   // mikkel mentioned or tagged
  if (mikkels.some((m) => content.includes(m))) {
    //console.log('This is a Mikkel message...');

    // status type keywords
    if ( status_terms.some((t) => content.includes(t))) {
      //console.log('sendingStatusResponse...');
      sendStatusResponse(msg);

    // forget keywords
    } else if (content.includes('forgot') || content.includes('forget') || content.includes('forgotten')) {
      //console.log('sending forgetful quip...');
      msg.reply("Oh... did  " + userMention(mikkel_user_id) + " forget something... again? 🙄");
      if (msg.react) msg.react("🙄")

    // late keywords
    } else if (content.includes('late')) {
      //console.log('sending late quip...');
      msg.reply("You didn't think  " + userMention(mikkel_user_id) + " would be on time, did you? 🙄");
      if (msg.react) msg.react("🙄");
    } else {
      //console.log('No interesting keywords... ' + content);
    }

  } else {
    //console.log('Does not appear to be a Mikkel message. ' + content);
  }
  
});

client.on('interactionCreate', async (interaction) => {
  console.log('interactionCreate...\n' + interaction);
  if (!interaction.isCommand()) return; // Ignore interactions that are not commands

  const { commandName } = interaction;

  if (commandName === 'mikkel') {
    // Respond to the "mikkel" command
    sendStatusResponse(interaction); // Replace with your desired response
  } else {
    interaction.reply("I don't know what to do with this");
  }
});

client.once('ready', async () => {
  console.log('ready...\n');
  console.log(`Logged in as ${client.user.tag}...`);

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

  try {
    client.user.setPresence({ activities: [{ name: 'the game of \"Where is Mikkel Green\"' }], status: 'online' });
  } catch(error) {
    console.error('Error setting presence');
  }

  console.log("Bot ready.");
});


//////////////////////////////////////////////////////////////
// Web Server
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Where is Mikkel Green today? ' + mikkel_in_pdx + '<br/>Discord client status:' + client.isReady());
});

app.get('/clean-commands', (req, res) => {

    // for guild-based commands
    rest.put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), { body: [] })
    .then(() => res.send('Successfully deleted all guild commands.<br/>'))
    .catch(console.error);

    // for global commands
    rest.put(Routes.applicationCommands(APPLICATION_ID), { body: [] })
    .then(() => res.send('Successfully deleted all application commands.<br/>'))
    .catch(console.error);

});

app.get('/custom', (req, res) => {
  var msgContent = "I'm back, baby! Here to keep y'all updated on " + userMention(mikkel_user_id) + " and where he _might_ be.";
  const channel = client.channels.cache.get('689164244683456517');
  channel.send({content: msgContent})
});

app.listen(port, () => {
  client.login(TOKEN);
})



