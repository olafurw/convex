import Discord = require("discord.js");

const locTrigger = '!';
const locBotChannelId = '<add your bot channel id here>';
const locToken = '<add your bot token here>';

class Convex
{
    myToken: string;
    myClient: Discord.Client;

    constructor(aToken: string)
    {
        this.myToken = aToken;
        this.myClient = new Discord.Client();
    }

    Setup = ():void =>
    {
        this.myClient.on('ready', this.OnReady);
        this.myClient.on('message', this.OnMessage);
    }

    Start = ():void =>
    {
        this.myClient.login(this.myToken);
    }

    OnReady = ():void =>
    {
        console.log(`Logged in as ${this.myClient.user.tag}`);
    }

    OnMessage = (aMessage: Discord.Message):void =>
    {
        this.LogMessage(aMessage);

        if (aMessage.channel.id !== locBotChannelId)
        {
            return;
        }

        if (!aMessage.content.startsWith(locTrigger))
        {
            return;
        }

        if (aMessage.content.startsWith(locTrigger + 'help'))
        {
            this.HandleHelp(aMessage);
            return;
        }

        if (aMessage.content.startsWith(locTrigger + 'source'))
        {
            this.HandleSource(aMessage);
            return;
        }

        if (aMessage.content.startsWith(locTrigger + 'role'))
        {
            this.HandleRole(aMessage.author, aMessage.guild, aMessage);
            return;
        }
    }

    HandleSource = (aMessage: Discord.Message): void =>
    {
        aMessage.reply(`
You interested in programming? Cool, my source code is located at: https://github.com/olafurw/convex/tree/master`);
    }

    HandleHelp = (aMessage: Discord.Message): void =>
    {
        aMessage.reply(`
Hi, I'm Convex!
I have the following actions
!help (To see this listing)
!source (Wanna see my source code?)
!role-add <channel-name>
!role-delete <channel-name>
For example !role-add the-division will add the division role and color to your account
Note that you can only have 1 color active`);
    }

    HandleRole = (aUser: Discord.User, aGuild: Discord.Guild, aMessage: Discord.Message): void =>
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
        console.log(`${aMessage.createdTimestamp.toString()} ${aMessage.channel.name} - ${aMessage.author.toString()} - ${aMessage.content}`);
    }
}

var convex = new Convex(locToken);
convex.Setup();
convex.Start();
