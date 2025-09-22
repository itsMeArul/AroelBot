require('dotenv').config();
const { Events, MessageFlags, Collection } = require("discord.js");
const apiClient = require("../utils/apiClient");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      if (!interaction.client.cooldowns) {
        interaction.client.cooldowns = new Collection();
      }

      const { cooldowns } = interaction.client;

      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const defaultCooldownDuration = 3; // detik
      const cooldownAmount =
        (command.cooldown ?? defaultCooldownDuration) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1_000);
          return await interaction.reply({
            content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else if (interaction.isButton()) {
      try {
        // Defer the response immediately to prevent timeout
        if (!interaction.deferred && !interaction.replied) {
          await interaction.deferReply({ ephemeral: true });
        }

        if (interaction.customId === "getscript") {
          // First action: Call fetchKeyWithFallback to get user/key data
          console.log("[DEBUG] getscript button clicked for user:", interaction.user.id);

          try {
            const keyResult = await apiClient.fetchKeyWithFallback(interaction.user.id);
            console.log("[DEBUG] keyResult:", JSON.stringify(keyResult, null, 2));

            if (!keyResult.success || !keyResult.keyInfo) {
              console.log("[DEBUG] No key found, sending error message");
              return await interaction.editReply({
                content: "No license key found for you. Make sure you're whitelisted!",
              });
            }

            console.log("[DEBUG] Key found, extracting data");
            // Extract key from the keyInfo provided by fetchKeyWithFallback
            const keyData = keyResult.keyInfo;
            console.log("[DEBUG] keyData structure:", JSON.stringify(keyData, null, 2));

            // Handle both active key (value field) and generated key (id field) structures
            const keyValue = keyData.value || keyData.id || keyData.key;
            console.log("[DEBUG] Extracted keyValue:", keyValue);

            const script = `script_key = "${keyValue}"\nloadstring(game:HttpGet("https://pandadevelopment.net/virtual/file/698f4f0f8cfcf000"))()`;
            console.log("[DEBUG] Generated script:", script);

            console.log("[DEBUG] Attempting to send message...");
            try {
              await interaction.editReply({
                content: script,
              });
              console.log("[DEBUG] Message sent successfully!");
            } catch (sendError) {
              console.error("[DEBUG] Error sending message:", sendError);
              return await interaction.editReply({
                content: "Error sending script. Please try again.",
              });
            }
          } catch (error) {
            console.error("[DEBUG] Get script error:", error);
            return await interaction.editReply({
              content: "Error fetching your license key. Please try again.",
            });
          }
        } else if (interaction.customId === "resethwid") {
          try {
            // Use fetchKeyWithFallback to get user's key with fallback logic
            const keyResult = await apiClient.fetchKeyWithFallback(interaction.user.id);

            if (!keyResult.success || !keyResult.keyInfo) {
              return await interaction.editReply({
                content: "No license key found for you.",
              });
            }

            const keyInfo = keyResult.keyInfo;
            // Handle both active key (value field) and generated key (id field) structures
            const keyValue = keyInfo.value || keyInfo.id || keyInfo.key;

            // If user has a generated key (no HWID), HWID is already reset
            if (keyResult.endpoint === 'generated') {
              return await interaction.editReply({
                content: "Your HWID has already been reset! You can use the script on any device.",
              });
            }

            // User has an active key, attempt to reset HWID
            try {
              const result = await apiClient.resetHWID(keyValue);

              // Check if result contains cooldown error
              if (result && result.error && result.error.includes("Cooldown active")) {
                // Extract cooldown time from error message
                const cooldownMatch = result.error.match(/(\d+(?:\.\d+)?)\s+minutes/);
                if (cooldownMatch) {
                  const cooldownMinutes = parseFloat(cooldownMatch[1]);
                  const cooldownHours = Math.floor(cooldownMinutes / 60);
                  const remainingMinutes = Math.round(cooldownMinutes % 60);

                  let cooldownText = "";
                  if (cooldownHours > 0) {
                    cooldownText = `${cooldownHours}h ${remainingMinutes}m`;
                  } else {
                    cooldownText = `${remainingMinutes} minutes`;
                  }

                  return await interaction.editReply({
                    content: `HWID reset is on cooldown! You can reset again in ${cooldownText}.`,
                  });
                }
              }

              // Success response
              return await interaction.editReply({
                content: "HWID reset successfully! You can now use the script.",
              });

            } catch (resetError) {
              console.error('HWID reset error:', resetError);

              // Check for cooldown in the error message
              const errorMessage = resetError.message || resetError.toString();
              if (errorMessage.includes("Cooldown active")) {
                const cooldownMatch = errorMessage.match(/(\d+(?:\.\d+)?)\s+minutes/);
                if (cooldownMatch) {
                  const cooldownMinutes = parseFloat(cooldownMatch[1]);
                  const cooldownHours = Math.floor(cooldownMinutes / 60);
                  const remainingMinutes = Math.round(cooldownMinutes % 60);

                  let cooldownText = "";
                  if (cooldownHours > 0) {
                    cooldownText = `${cooldownHours}h ${remainingMinutes}m`;
                  } else {
                    cooldownText = `${remainingMinutes} minutes`;
                  }

                  return await interaction.editReply({
                    content: `HWID reset is on cooldown! You can reset again in ${cooldownText}.`,
                  });
                }
              }

              // Generic error response
              return await interaction.editReply({
                content: "Failed to reset HWID. Please contact an administrator for assistance.",
              });
            }
          } catch (error) {
            console.error('HWID reset system error:', error);
            return await interaction.editReply({
              content: "System error occurred. Please contact an administrator.",
            });
          }
        } else if (interaction.customId === "getstats") {
          try {
            // First action: Call fetchKeyWithFallback to get user/key data
            const keyResult = await apiClient.fetchKeyWithFallback(interaction.user.id);

            if (!keyResult.success || !keyResult.keyInfo) {
              return await interaction.editReply({
                content: "No license key found for you.",
              });
            }

            // Extract key info from the keyInfo provided by fetchKeyWithFallback
            const keyInfo = keyResult.keyInfo;

            if (!keyInfo) {
              return await interaction.editReply({
                content: "No key information found!",
              });
            }

            // Handle both active key and generated key structures
            const keyValue = keyInfo.value || keyInfo.id || keyInfo.key || "N/A";
            const keyNote = keyInfo.note || keyInfo.note || "N/A";
            const isPremium = keyInfo.isPremium || false;
            const expiresAt = keyInfo.expiresAt || keyInfo.expiresAt || "N/A";
            const hwid = keyInfo.hwid || "None";
            const noHwidValidation = keyInfo.noHwidValidation || false;

            const embedPayload = {
              embeds: [
                {
                  title: "Your License Stats",
                  color: 16777215,

                  fields: [
                    {
                      name: "Key Value",
                      value: keyValue,
                      inline: true,
                    },
                    {
                      name: "Note",
                      value: keyNote,
                      inline: true,
                    },
                    {
                      name: "Premium",
                      value: isPremium ? "Yes" : "No",
                      inline: true,
                    },
                    {
                      name: "Expires At",
                      value: expiresAt,
                      inline: true,
                    },
                    {
                      name: "HWID",
                      value: hwid,
                      inline: true,
                    },
                    {
                      name: "No HWID Validation",
                      value: noHwidValidation ? "Yes" : "No",
                      inline: true,
                    },
                  ],
                  timestamp: new Date().toISOString(),
                },
              ],
              allowed_mentions: { parse: [] },
            };

            return await interaction.editReply({
              embeds: embedPayload.embeds,
            });
          } catch (error) {
            console.error(error);
            return await interaction.editReply({
              content: "Error fetching your stats!",
            });
          }
        } else {
          return await interaction.editReply({
            content: "Unknown button interaction.",
          });
        }
      } catch (error) {
        console.error(error);

        // Try to send error response, but handle cases where interaction has expired
        try {
          await interaction.editReply({
            content: "There was an error handling this button!",
          });
        } catch (replyError) {
          console.error('Failed to send error response:', replyError);
          // Interaction has expired, nothing we can do
        }
      }
    }
  },
};