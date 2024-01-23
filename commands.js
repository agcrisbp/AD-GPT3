const cron = require('node-cron');
const fs = require('fs');

cron.schedule('0 0 * * *', () => {
    // Memeriksa file sebelum menghapus
    const logFilePath = 'gpt_3.log';
    if (fs.existsSync(logFilePath)) {
        fs.unlinkSync(logFilePath);
        console.log('gpt_3.log dihapus.');
    } else {
        console.log('gpt_3.log tidak ditemukan.');
    }
});

// Untuk membersihkan file log
function cleanLogFile(channel) {
    try {
        fs.truncateSync('gpt_3.log', 0);
        channel.send('> [***GPT-3.5***] **Berhasil menghapus log!**');
    } catch (error) {
        console.error(`Gagal menghapus log: ${error.message}`);
        channel.send('> [***GPT-3.5***] **Terjadi kesalahan saat membersihkan file log.**');
    }
}

// Untuk menghindari batas karakter Discord saat mengirim isi file log ke pemilik bot
function sendLogFileToOwner(owner, channel) {
    try {
        const logContent = fs.readFileSync('gpt_3.log', 'utf8');
        const chunks = logContent.match(/[\s\S]{1,1990}/g) || [];

        owner.send("**Log GPT-3.5:**");

        for (const chunk of chunks) {
            owner.send(`\`\`\`\n${chunk}\n\`\`\``);
        }

        // Mengirim pesan konfirmasi ke channel
        channel.send('> **Log GPT-3.5 berhasil dikirim ke DM!**');
    } catch (error) {
        console.error(`Error mengirim file log: ${error.message}`);
        owner.send('Terjadi kesalahan saat mengirim file log.');
    }
}

// Fungsi untuk memotong pesan agar menghindari batas karakter Discord
async function sendMessageInChunks(channel, content) {
    const chunks = content.match(/[\s\S]{1,1990}/g) || [];

    for (const chunk of chunks) {
        await channel.send({ content: chunk, allowedMentions: { repliedUser: true } });
    }
}

function isBotOwner(userId) {
    const owners = process.env.OWNER.split(',').map(id => id.trim());
    return owners.includes(userId.toString());
}

module.exports = {
    cleanLogFile,
    sendLogFileToOwner,
    sendMessageInChunks,
    isBotOwner,
};
