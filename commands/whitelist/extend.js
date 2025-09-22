require('dotenv').config();
const { SlashCommandBuilder } = require("discord.js");
const fetch = require('node-fetch');
const apiClient = require("../../utils/apiClient");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Extend a user's license key duration")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to extend license for")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("days")
        .setDescription("Additional days to add")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(365)
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.DISCORD_OWNER_ID) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const additionalDays = interaction.options.getInteger("days");

    // Defer the response to prevent timeout
    await interaction.deferReply();

    try {

      // Step 1: Check if user has an existing key using fetchKeyWithFallback
      const existingKeyResult = await apiClient.fetchKeyWithFallback(user.id);

      if (!existingKeyResult.success || !existingKeyResult.keyInfo) {
        return await interaction.editReply({
          content: `${user} does not have a license key to extend. Use /whitelist to create one first.`,
        });
      }

      const keyInfo = existingKeyResult.keyInfo;
      const keyValue = keyInfo.value;

      // Step 2: Parse current expiration date
      let currentExpireDate;
      if (keyInfo.expiresAt) {
        currentExpireDate = new Date(keyInfo.expiresAt);
      } else {
        // If no expiresAt, create from current date + existing days
        currentExpireDate = new Date();
        if (keyInfo.daysKey) {
          currentExpireDate.setDate(currentExpireDate.getDate() + keyInfo.daysKey);
        }
      }

      // Step 3: Calculate new expiration date
      const newExpireDate = new Date(currentExpireDate);
      newExpireDate.setDate(newExpireDate.getDate() + additionalDays);

      // Format dates for display and API
      const formatDisplayDate = (date) => {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      };

      const formatAPIDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const currentExpireDisplay = formatDisplayDate(currentExpireDate);
      const newExpireDisplay = formatDisplayDate(newExpireDate);
      const newExpireAPI = formatAPIDate(newExpireDate);

      // Step 4: Calculate total days for the API
      const totalDays = keyInfo.daysKey ? keyInfo.daysKey + additionalDays : additionalDays;

      // Let's try a simpler approach - only update the daysKey and see if expiresAt updates automatically
      // Some APIs calculate expiresAt based on daysKey when expiresByDaysKey is true
      const newExpireFromCurrent = new Date();
      newExpireFromCurrent.setDate(newExpireFromCurrent.getDate() + totalDays);
      newExpireFromCurrent.setHours(0, 0, 0, 0);

      // Step 5: Update the key using direct API calls - try minimal update first
      const apiKey = process.env.API_KEY;

      // Determine which endpoint to use based on key type
      let updateUrl, updateBody;

      if (existingKeyResult.endpoint === 'generated') {
        // Use generated-key/edit for generated keys
        updateUrl = 'https://pandadevelopment.net/api/generated-key/edit';
        updateBody = {
          apiKey: apiKey,
          keyValue: keyValue,
          expiresByDaysKey: true,
          daysKey: totalDays,
          // Try without expire field first to see if API calculates it automatically
          note: keyInfo.note || user.id,
          isPremium: keyInfo.isPremium !== undefined ? keyInfo.isPremium : true,
          noHwidValidation: keyInfo.noHwidValidation !== undefined ? keyInfo.noHwidValidation : false
        };
      } else {
        // Use key/edit for active keys
        updateUrl = 'https://pandadevelopment.net/api/key/edit';
        updateBody = {
          apiKey: apiKey,
          keyValue: keyValue,
          expiresByDaysKey: true,
          daysKey: totalDays,
          // Try without expire field first to see if API calculates it automatically
          note: keyInfo.note || user.id,
          isPremium: keyInfo.isPremium !== undefined ? keyInfo.isPremium : true,
          noHwidValidation: keyInfo.noHwidValidation !== undefined ? keyInfo.noHwidValidation : false
        };
      }

      console.log('[DEBUG] Testing minimal update approach:');
      console.log('[DEBUG] - Only updating daysKey:', totalDays);
      console.log('[DEBUG] - expiresByDaysKey:', true);
      console.log('[DEBUG] - Expected expiresAt calculation: current date +', totalDays, 'days');

      console.log('[DEBUG] Expected result if API calculates automatically:');
      console.log('[DEBUG] - Expected expiresAt:', newExpireFromCurrent.toISOString());

      console.log('[DEBUG] Updating key with URL:', updateUrl);
      console.log('[DEBUG] Update body:', JSON.stringify(updateBody, null, 2));

      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateBody),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('[DEBUG] Update failed:', updateResponse.status, errorText);
        throw new Error(`Failed to update key: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      const updateResult = await updateResponse.json();
      console.log('[DEBUG] Update successful:', JSON.stringify(updateResult, null, 2));

      // Step 6: Send confirmation message
      const embedPayload = {
        embeds: [
          {
            title: "License Extended Successfully",
            description: `Successfully extended ${user.tag}'s license key.`,
            color: 16777215,
            footer: {
              text: "© Aroel",
              icon_url: "https://yt3.googleusercontent.com/oKQxVI010a-oqeC-sdjYnhMf8DXqyhybw-iDc4HyxKzqKKV3SIRr2wqPGbvnhHrV-Iu3MzrdWg=s1920-c-k-c0x00ffffff-no-rj",
            },
            fields: [
              { name: "— USER", value: `${user.tag} (${user.id})`, inline: false },
              { name: "— LICENSE KEY", value: keyValue, inline: false },
              { name: "— PREVIOUS EXPIRATION", value: currentExpireDisplay, inline: true },
              { name: "— NEW EXPIRATION", value: newExpireDisplay, inline: true },
              { name: "— DAYS ADDED", value: `${additionalDays} days`, inline: true },
              { name: "— TOTAL DURATION", value: `${totalDays} days`, inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
        allowed_mentions: { parse: [] },
      };

      await user.send(embedPayload);

      await interaction.editReply({
        content: `Successfully extended ${user}'s license by ${additionalDays} days. New expiration: ${newExpireDisplay}`,
      });

    } catch (error) {
      console.error('Extend command error:', error);
      await interaction.editReply({
        content: `Failed to extend license: ${error.message}`,
      });
    }
  },
};