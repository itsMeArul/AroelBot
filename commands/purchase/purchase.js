require('dotenv').config();
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("payment")
    .setDescription("Show payment info and instructions"),
  async execute(interaction) {
    const embed1 = {
      title: "— PURCHASE",
      description:
        "Tips: Don't forget to check **prices** and **stock** at https://discord.com/channels/1395998086152847483/1403983937516343417 and **discounts** at https://discord.com/channels/1395998086152847483/1403984284930543676",
      timestamp: new Date().toISOString(),
      color: 16777215,
      footer: {
        text: "© Aroel",
        icon_url:
          "https://yt3.googleusercontent.com/oKQxVI010a-oqeC-sdjYnhMf8DXqyhybw-iDc4HyxKzqKKV3SIRr2wqPGbvnhHrV-Iu3MzrdWg=s1920-c-k-c0x00ffffff-no-rj",
      },
      image: {
        url: "https://i.imgur.com/mgPdfjp.png",
      },
      author: {
        name: "Aroel — Service & Purchase",
      },
      fields: [
        {
          name: "— PAYMENT METHODS",
          value:
            "> QRIS (Scan the QR code below)\n > DANA \n > BANK JAGO \n > PayPal \n\nFor payment methods other than QRIS, please tag the admin.",
        },
      ],
    };

    const embed2 = {
      author: {
        name: "Aroel — Service & Purchase",
      },
      color: 16777215,
      title: "— PURCHASE",
      fields: [
        {
          name: "",
          value:
            "EN:\nIf you have made the payment, please send the transfer receipt here.\n\nID:\nJika Anda telah melakukan pembayaran, silakan kirimkan bukti transfer ke sini.",
        },
      ],
      image: {
        url: "https://i.imgur.com/DuHRxNx.png",
      },
      footer: {
        text: "© Aroel",
        icon_url:
          "https://yt3.googleusercontent.com/oKQxVI010a-oqeC-sdjYnhMf8DXqyhybw-iDc4HyxKzqKKV3SIRr2wqPGbvnhHrV-Iu3MzrdWg=s1920-c-k-c0x00ffffff-no-rj",
      },
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({
      embeds: [embed1, embed2],
      ephemeral: false,
    });
  },
};