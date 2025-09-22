require('dotenv').config();
const { SlashCommandBuilder } = require("discord.js");
const { PelindaJS } = require("pelindajs");
const apiClient = require("../../utils/apiClient");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Whitelist a user and generate a license key")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to whitelist")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("plan")
        .setDescription("Plan type: weekly or monthly")
        .addChoices(
          { name: "weekly", value: "weekly" },
          { name: "monthly", value: "monthly" }
        )
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Custom duration in days (if no plan selected)")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.DISCORD_OWNER_ID) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    let plan = interaction.options.getString("plan");
    let duration = interaction.options.getInteger("duration");

    let durationText;

    if (plan === "weekly") {
      duration = 7;
      durationText = "7 days (Weekly Plan)";
    } else if (plan === "monthly") {
      duration = 30;
      durationText = "30 days (Monthly Plan)";
    } else if (duration) {
      durationText = `${duration} days (Manual)`;
    } else {
      return interaction.reply({
        content:
          "You must specify a plan (weekly/monthly) or a custom duration.",
        ephemeral: true,
      });
    }

    // Reply immediately to prevent timeout
    await interaction.reply({
      content: "Processing your whitelist request...",
      ephemeral: true,
    });

    const now = new Date();
    const expireDate = new Date(now);
    expireDate.setDate(expireDate.getDate() + duration);

    const dd = String(expireDate.getDate()).padStart(2, "0");
    const mm = String(expireDate.getMonth() + 1).padStart(2, "0");
    const yyyy = expireDate.getFullYear();
    const expireStringDisplay = `${dd}-${mm}-${yyyy}`;
    const expireStringISO = `${yyyy}-${mm}-${dd}`;

    const planNote = plan ? plan : durationText;

    async function generateLicenseKey() {
      const pelinda = await PelindaJS.new(process.env.API_KEY);

      const result = await pelinda.generateKey({
        expire: expireStringISO,
        note: `${user.id}`,
        count: 1,
        isPremium: true,
        expiresByDaysKey: true,
        daysKeys: duration,
      });

      if (result.success) return result.generatedKeys[0].value;
      else throw new Error(result.message);
    }

    try {

      // Step 1: Check if user already has a key using fetchKeyWithFallback
      const existingKeyResult = await apiClient.fetchKeyWithFallback(user.id);

      if (existingKeyResult.success && existingKeyResult.keyInfo) {
        return await interaction.reply({
          content: `${user} already has a license key! Key found: ${existingKeyResult.keyInfo.value}`,
          ephemeral: true,
        });
      }

      // Step 2: Generate license key
      const key = await generateLicenseKey();

      const member = await interaction.guild.members.fetch(user.id);

      try {
        await member.roles.add(process.env.DISCORD_CUSTOMER_ROLE_ID);
      } catch (roleError) {
        console.error('Failed to add role:', roleError);
        // Continue with key generation even if role assignment fails
      }

      const embedPayload = {
        embeds: [
          {
            title: "You have been whitelisted",
            description:
              "Success! Your AroelHub license has been activated and your role has been assigned.",
            timestamp: new Date().toISOString(),
            color: 16777215,
            footer: {
              text: "© Aroel",
              icon_url:
                "https://yt3.googleusercontent.com/oKQxVI010a-oqeC-sdjYnhMf8DXqyhybw-iDc4HyxKzqKKV3SIRr2wqPGbvnhHrV-Iu3MzrdWg=s1920-c-k-c0x00ffffff-no-rj",
            },
            image: { url: "https://i.imgur.com/DuHRxNx.png" },
            author: { name: "Aroel — Service & Purchase" },
            fields: [
              { name: "— LICENSE KEY (press to copy)", value: `${key}` },
              { name: "— PLAN", value: `${planNote}`, inline: false },
              { name: "— DURATION", value: `${durationText}`, inline: false },
              {
                name: "— EXPIRE DATE",
                value: expireStringDisplay,
                inline: false,
              },
              {
                name: "— GUIDE",
                value:
                  "1. Go to https://discord.com/channels/1395998086152847483/1406620239168536598\n2. Click the **Get Script** button to copy the script\n3. Enter the script into the executor and run it",
                inline: false,
              },
              {
                name: "\u200b",
                value:
                  "If you have any issues or encounter bugs, report them at https://discord.com/channels/1395998086152847483/1404077897366638652",
              },
            ],
          },
        ],
        allowed_mentions: { parse: [] },
      };

      await user.send(embedPayload);

      await interaction.reply({
        content: `${user} has been whitelisted for **${durationText}** (expires on **${expireStringDisplay}**).`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `Failed to generate key: ${error.message}`,
        ephemeral: true,
      });
    }
  },
};