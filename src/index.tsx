import { Client, GatewayIntentBits, VoiceBasedChannel } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, StreamType, VoiceReceiver, EndBehaviorType } from '@discordjs/voice';
import * as dotenv from 'dotenv';
import * as prism from 'prism-media';
import { Porcupine } from '@picovoice/porcupine-node';
import AudioDecoder from './AudioDecoder'; // Adjust path as necessary, assuming this is the function you're referring to for hotword detection

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates, // Necessary for voice state updates
    ]
});

client.on('ready', () => {
    console.log('The bot is ready');
});

client.on('messageCreate', async message => {
    if (message.content === '!join') {
        if (message.member?.voice.channel) {
            const channel = message.member.voice.channel as VoiceBasedChannel;
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            // Set up the audio receiver
            const receiver = connection.receiver;
            const audioPlayer = createAudioPlayer();
            connection.subscribe(audioPlayer);

            receiver.speaking.on('start', (userId: string) => {
                console.log(`User ${userId} started speaking`);
                const audioStream = receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.AfterSilence,
                        duration: 100,
                    },
                });

                // Use prism to convert audio to the format Porcupine needs
                const opusDecoder = new prism.opus.Decoder({ rate: 16000, channels: 1, frameSize: 960 });
                const audioStreamPCM = audioStream.pipe(opusDecoder);

                // Now, create a recognition stream that listens for the hotword
                AudioDecoder(audioStreamPCM, userId, new Porcupine())
                    .then((audio: Buffer) => {
                        // Hotword detected, handle accordingly
                        console.log('Hotword detected, handle command here.');
                    })
                    .catch(console.error);
            });

            message.reply("I've joined the voice channel!");
        } else {
            message.reply("You need to be in a voice channel for me to join!");
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN as string);
