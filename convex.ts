import Discord = require("discord.js");
import fs = require("fs");

const locTrigger = '!';
const locBotChannelId = '405810591593398284';
const locBotTestingId = '405780986228637696';

class Convex
{
    myClient: Discord.Client;

    constructor()
    {
        this.myClient = new Discord.Client();
    }

    Setup = ():void =>
    {
        this.myClient.on('ready', this.OnReady);
        this.myClient.on('message', this.OnMessage);
    }

    Start = ():void =>
    {
        fs.readFile("bot.token", "utf8", (aErr, aData) => 
        {
            if (aErr)
            {
                console.error(aErr + " Error reading token file.");
                return;
            }

            if (!aData)
            {
                console.error("Token file empty or invalid");
                return;
            }

            this.myClient.login(aData);

            return;
        });
    }

    OnReady = ():void =>
    {
        console.log(`Logged in as ${this.myClient.user.tag}`);
    }

    OnMessage = (aMessage: Discord.Message):void =>
    {
        this.LogMessage(aMessage);

        if (!aMessage.content.startsWith(locTrigger))
        {
            return;
        }

        if (aMessage.channel.id === locBotChannelId)
        {
            this.BotChannel(aMessage);
            return;
        }

        if (aMessage.channel.id === locBotTestingId)
        {
            this.BotTesting(aMessage);
            return;
        }

        if (aMessage.content.startsWith(locTrigger + 'links'))
        {
            this.Links(aMessage);
            return;
        }
    }

    BotChannel = (aMessage: Discord.Message): void =>
    {
        if (aMessage.content.startsWith(locTrigger + 'help'))
        {
            this.Help(aMessage);
            return;
        }
        
        if (aMessage.content.startsWith(locTrigger + 'source'))
        {
            this.Source(aMessage);
            return;
        }
        
        if (aMessage.content.startsWith(locTrigger + 'role'))
        {
            this.Role(aMessage.author, aMessage.guild, aMessage);
            return;
        }
    }

    BotTesting = (aMessage: Discord.Message): void =>
    {
        if (aMessage.content.startsWith(locTrigger + 'alive'))
        {
            aMessage.reply("I am alive. Meow");
            return;
        }   
    }

    Source = (aMessage: Discord.Message): void =>
    {
        aMessage.reply(`
You interested in programming? Cool, my source code is located at: <https://github.com/olafurw/convex/tree/master>`);
    }

    Links = (aMessage: Discord.Message): void =>
    {
        fs.readFile("links/" + aMessage.channel.id, "utf8", (aErr, aData) => 
        {
            if (aErr)
            {
                console.error(aMessage.channel.id + ' Channel Link Error: ' + aErr);
                return;
            }

            aMessage.reply({embed: {
                color: 3447003,
                fields: [
                    {
                        name: "Links",
                        value: aData
                    }
                ]
            }});

            return;
        });
    }

    Help = (aMessage: Discord.Message): void =>
    {
        aMessage.reply(`
Hi, I'm Convex! Meow!

I have the following actions:
\`!help\` To see this listing
\`!source\` Wanna see my source code?
\`!role-add <channel-name>\`
\`!role-delete <channel-name>\`

For example \`!role-add the-division\` will add the division role and color to your account.
Note that you can only have 1 color active!`);
    }

    Role = (aUser: Discord.User, aGuild: Discord.Guild, aMessage: Discord.Message): void =>
    {
        const messageSplit = aMessage.content.split(' ');
        if(messageSplit.length < 2)
        {
            console.error(`${aMessage.content} too short`);
            return;
        }

        const roleString = messageSplit[1];
        const action = messageSplit[0];

        if (action !== '!role-add'
            && action !== '!role-delete')
        {
            console.error(`Role action not found, ${action}`);
            return;
        }

        const role = aGuild.roles.find("name", roleString);
        if(!role)
        {
            console.error(`Role ${roleString} not found`);
            return;
        }

        const member = aGuild.member(aUser);
        if (!member)
        {
            console.error(`User ${aUser.toString()} not found in guild`);
            return;
        }

        if (action === '!role-add'
            && !member.roles.has(role.id))
        {
            member.addRole(role).then(
            () => 
            {
                aMessage.reply(`Adding ${roleString} role`);
            }
            ).catch(console.error);
            return;
        }

        if (action === '!role-delete'
            && member.roles.has(role.id))
        {
            member.removeRole(role).then(
            () => 
            {
                aMessage.reply(`Removing ${roleString} role`);
            }
            ).catch(console.error);
            return;
        }
    }

    LogMessage = (aMessage: Discord.Message):void =>
    {
        // @ts-ignore
        console.log(`${aMessage.createdTimestamp.toString()} ${aMessage.channel.id} - ${aMessage.author.toString()} - ${aMessage.content}`);
    }
}

var convex = new Convex();
convex.Setup();
convex.Start();
