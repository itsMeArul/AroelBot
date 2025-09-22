require('dotenv').config();
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Show the customer control panel in a specific channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the panel to")
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.DISCORD_OWNER_ID) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    const targetChannel = interaction.options.getChannel("channel");

    if (!targetChannel || !targetChannel.isTextBased()) {
      return interaction.reply({
        content: "Selected channel is invalid or not text-based.",
        ephemeral: true,
      });
    }

    const embedJson = {
      embeds: [
        {
          title: "Customer Control Panel",
          description:
            "This panel is for customers. Use the buttons below to redeem your key, copy the script, or reset your HWID.",
          timestamp: new Date().toISOString(),
          color: 16777215,
          footer: {
            text: "© Aroel",
            icon_url:
              "https://yt3.googleusercontent.com/oKQxVI010a-oqeC-sdjYnhMf8DXqyhybw-iDc4HyxKzqKKV3SIRr2wqPGbvnhHrV-Iu3MzrdWg=s1920-c-k-c0x00ffffff-no-rj",
          },
          image: {
            url: "https://i.imgur.com/DuHRxNx.png",
          },
          thumbnail: {
            url: "",
          },
          author: {
            name: "Aroel — Service & Purchase",
          },
          fields: [],
        },
      ],
      attachments: [],
      allowed_mentions: { parse: [] },
      components: [],
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("getscript")
        .setLabel("Copy Script")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("resethwid")
        .setLabel("Reset HWID")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("getstats")
        .setLabel("Get Stats")
        .setStyle(ButtonStyle.Primary)
    );

    embedJson.components.push(row);

    await targetChannel.send(embedJson);

    await interaction.reply({
      content: `Panel successfully sent to ${targetChannel}`,
      ephemeral: true,
    });
  },
};