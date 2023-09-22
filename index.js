
// const { clientId, guildId, token, publicKey } = require('./config.json');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config()
const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.DirectMessages,
  ],
});


const mikkel_in_pdx = true;
const happy_reaction = "🥳";
const sad_reaction = "😭";
const bot_user_id = "1154500783803478108";
const mikkel_user_id = "584557745039081485";

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


function sendResponse(msg) {
  
  msg.addReaction("💚");
  
  if (mikkel_in_pdx) {
    var random =  Math.floor((Math.random() * happy_content.length));
    var randomContent = happy_content[random];

    msg.addReaction(happy_reaction);
    msg.reply(randomContent + " " + happy_reaction);

  } else {
    msg.addReaction(sad_reaction);
    msg.reply("Mikkel is not in PDX today. " + sad_reaction);
  }
}

client.on("messageCreate", (msg) => {

  if (msg.author.bot) return; // Ignore messages from other bots

  // When a message is created
  var content = msg.content.toLowerCase();
  
  // Channel messages
  if (msg.guild) {
    if ( content.includes(bot_user_id) ||
        (mikkels.some((m) => content.includes(m)) && terms.some((t) => content.includes(t)))) {
        sendResponse(msg);
      }
  // DM
  } else {
    msg.reply("What's up?");
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return; // Ignore interactions that are not commands

  const { commandName } = interaction;

  if (commandName === 'mikkel') {
    // Respond to the "mikkel" command
    await sendResponse(interaction); // Replace with your desired response
  }
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    // Register the "mikkel" slash command globally
    const commands = [
      {
        name: 'mikkel',
        description: 'Where is Mikkel? Just ask!',
      },
    ];

    const commandData = await client.application.commands.set(commands);
    console.log('Registered slash commands:', commandData);
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }

});

client.login(TOKEN);

