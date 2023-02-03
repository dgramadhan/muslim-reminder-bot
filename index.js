const { Telegraf } = require('telegraf')
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id,
        'Selamat datang di Bot Muslim Reminder \n\n' +
        'Silahkan mengetik `jadwal shalat` untuk mengetahui jadwal shalat hari ini \n\n' +
        'Silahkan mengetik `surat (nomor surat)` untuk menampilkan surat tersebut', {
    })
})


const newDate = new Date().toISOString().split('T')[0];
var jadwalShalat;
var params = newDate;

axios.get(`https://api.banghasan.com/sholat/format/json/jadwal/kota/703/tanggal/${params}`)
    .then(function (response) {
        let obj = response.data.jadwal.data;
        jadwalShalat = JSON.stringify(obj);
        console.log(jadwalShalat)
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

bot.hears('jadwal shalat', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, "**JADWAL SHALAT HARI INI**" + "\n\n" + jadwalShalat
        .replaceAll('"', "")
        .replaceAll('{', "")
        .replaceAll('}', "")
        .replaceAll(':', " : ")
        .replaceAll(',', "\n\n"), {
    })
})

var ayat;
var arr = [];
bot.hears(/surat (.+)/i, async ctx => {
    let params_ayat = ctx.message.text.trim();
    var objNamaSuratAr;
    var objNamaSuratIn;
    console.log(ctx.from)

    try {
        params_ayat = params_ayat.split("").slice(("surat ").split("").length).join("");
    } catch (err) {
        console.log(err)
    }

    console.log(params_ayat)

    await axios.get(`https://equran.id/api/surat/${params_ayat}`)
        .then(function (response) {
            let jumlahAyat = (response.data.ayat).length;
            objNamaSuratAr = response.data.nama
            objNamaSuratIn = response.data.nama_latin
            for (i = 0; i < jumlahAyat; i++) {
                let objAyat = response.data.ayat[i].ar
                let objArti = response.data.ayat[i].tr
                let objIdn = response.data.ayat[i].idn
                arr[i] = { objAyat, objArti, objIdn }
            }
            ayat = JSON.stringify(arr);
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
        });
    await bot.telegram.sendMessage(ctx.chat.id, objNamaSuratAr + " - " + objNamaSuratIn + "\n\n" + ayat
        .replaceAll('[', "")
        .replaceAll(']', "")
        .replaceAll('{', "")
        .replaceAll('}', "")
        .replaceAll('objAyat', "")
        .replaceAll('objArti', "")
        .replaceAll('objIdn', "")
        .replaceAll(':', "")
        .replaceAll('"', "")
        .replaceAll(',', "\n\n"), {
    })
})

bot.hears('daftar hadist', async ctx => {
    let daftarHadist
    await axios.get(`https://api.hadith.gading.dev/books`)
        .then(function (response) {
            let Arr = []
            let jumlahHadist = (response.data.data).length
            for (x=0; x < jumlahHadist; x++ ) {
                let objNama = response.data.data[x].name
                let objTersedia = response.data.data[x].available
                Arr[x] = { objNama, objTersedia}
            }       
           
            daftarHadist = JSON.stringify(Arr)
            console.log(daftarHadist)
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
        });

    console.log(ctx.from)
    await bot.telegram.sendMessage(ctx.chat.id, "**DAFTAR BUKU HADIST**" + "\n\n" + daftarHadist  .replaceAll('[', "")
    .replaceAll('},', "\n")
    .replaceAll(']', "")
    .replaceAll('{', "")
    .replaceAll('}', "")
    .replaceAll('objNama', "")
    .replaceAll('objTersedia', "")
    .replaceAll(':', "")
    .replaceAll('"', "")
    .replaceAll(","," ")
  )
})

bot.launch();