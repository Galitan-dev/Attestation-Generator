const fs = require('fs');
const moment = require('moment');
const generatePdf = require("./generatePDF");

async function start () {

    const now = moment();

    /** @type {import('./generatePDF').profil} */
    let profil = {
        firstname: "Ethan",
        lastname: "Weinachter",
        birthday: "18/11/07",
        birthplace: "Bordeaux",
        adress: "5 rue des Cols Verts",
        city: "Pessac",
        zipcode: "33600",
        reasons: [ "sport_animaux", "sante", "convocation" ],
        date: now.format("DD[/]MM[/]YYYY"),
        hour: now.format("HH[:]mm")
    };

    try {
        var pdf = await generatePdf(profil);
    } catch (err) {
        console.log(err);
    }

    fs.writeFile('./test.pdf', pdf, {}, () => console.log('done'))
}

start();