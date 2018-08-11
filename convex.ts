import Discord = require("discord.js");
import fs = require("fs");

const locTrigger = '!';
const locBotChannelId = '405810591593398284';
const locBotTestingId = '405780986228637696';
const locLogChatId = '440176099608100865';
const locServerInviteUrl = 'https://discord.gg/ngon';
const locMessageLimitSec = 60;

class Convex
{
    myClient: Discord.Client;
    myLogChannel: Discord.TextChannel;
    myLastInviteMessage: number;
    myLastNgonMessage: number;

    constructor()
    {
        this.myClient = new Discord.Client();
        this.myLastInviteMessage = 0;
        this.myLastNgonMessage = 0;
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
        this.myLogChannel = this.myClient.channels.get(locLogChatId) as Discord.TextChannel;

        console.log(`Logged in as ${this.myClient.user.tag}`);
    }

    OnMessage = (aMessage: Discord.Message):void =>
    {
        this.LogMessage(aMessage);

        const startsWithTrigger:boolean = aMessage.content.startsWith(locTrigger);

        if (startsWithTrigger
            && aMessage.content.startsWith(locTrigger + 'invite'))
        {
            this.ShowInvite(aMessage);
            return;
        }

        if (startsWithTrigger
            && aMessage.content.startsWith(locTrigger + 'ngon'))
        {
            this.ShowNgon(aMessage);
            return;
        }

        if (startsWithTrigger
            && aMessage.channel.id === locBotChannelId)
        {
            this.BotChannel(aMessage);
            return;
        }

        if (startsWithTrigger
            && aMessage.channel.id === locBotTestingId)
        {
            this.BotTesting(aMessage);
            return;
        }

        if (startsWithTrigger
            && aMessage.content.startsWith(locTrigger + 'links'))
        {
            this.Links(aMessage);
            return;
        }

        this.FilterUnwantedContent(aMessage);
    }

    ShowInvite = (aMessage: Discord.Message): void =>
    {
        const nowTimestamp:number = Date.now() / 1000;
        if (nowTimestamp < this.myLastInviteMessage + locMessageLimitSec)
        {
            return;
        }

        this.myLastInviteMessage = nowTimestamp;
        aMessage.reply(locServerInviteUrl);
        return;
    }

    ShowNgon = (aMessage: Discord.Message): void =>
    {
        const nowTimestamp:number = Date.now() / 1000;
        if (nowTimestamp < this.myLastNgonMessage + locMessageLimitSec)
        {
            return;
        }

        this.myLastNgonMessage = nowTimestamp;
        aMessage.reply({embed: {
            color: 3447003,
            fields: [
                {
                    name: "NGON - On The Internet",
                    value: `
- [Twitter](https://twitter.com/NGONGaming/)
- [Twitch](https://www.twitch.tv/ngon/)
- [YouTube](https://www.youtube.com/channel/UCkrJcaCnr5G7SInfjK-PFDg)
- [SoundCloud](https://soundcloud.com/ngongaming)`
                }
            ]
        }});
        return;
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

    FilterUnwantedContent = (aMessage: Discord.Message): void =>
    {
        if (aMessage.channel.id === locLogChatId
            || aMessage.author.id == this.myClient.user.id)
        {
            return;
        }

        if (aMessage.content.includes("discord.gg/"))
        {
            aMessage.delete();
            return;
        }

        if (aMessage.content.includes("discordapp.com/invite"))
        {
            aMessage.delete();
            return;
        }
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
        if (aMessage.channel.id === locLogChatId
            || !this.myLogChannel)
        {
            return;
        }

        if (this.myLogChannel.members.has(aMessage.author.id))
        {
            this.myLogChannel.send(`${aMessage.channel} - ${aMessage.author.username} - ${aMessage.content}`);
        }
        else
        {
            this.myLogChannel.send(`${aMessage.channel} - ${aMessage.author} - ${aMessage.content}`);
        }
    }
}

var convex = new Convex();
convex.Setup();
convex.Start();
