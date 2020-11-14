const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const QRCode = require('qrcode')

const reasonYs = {
  travail: 486,
  achats: 415,
  sante: 345,
  famille: 324,
  handicap: 290,
  sport_animaux: 268,
  convocation: 198,
  missions: 177,
  enfants: 156,
}

/**
 * @typedef reason
 * @type {"travail"|"achats"|"sante"|"famille"|"handicap"|"sport_animaux"|"convocation"|"missions"|"enfants"} 
 */

/**
 * @typedef profil
 * @type {{ firstname: String, lastname: String, birthday: String, birthplace: String, adress: String, zipcode: String, city: String, reasons: reason[], date: String, hour: String }}
 */

/**
 * @param {profil} profil 
 */
async function generatePdf (profil) {

  const pdfBuffer = await fs.readFileSync('./Resources/base.pdf'),
    pdfDoc = await PDFDocument.load(pdfBuffer),
    page1 = pdfDoc.getPage(0);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  function drawText (text, x, y) {
    page1.drawText(text, { x, y, size: 11, font: font });
  }

  var { firstname, lastname, birthday, birthplace, adress, zipcode, city, reasons, date, hour } = profil;

  drawText(`${firstname} ${lastname}`, 109, 657);
  drawText(birthday, 108, 627);
  drawText(birthplace, 239, 627);
  drawText(`${adress} ${zipcode} ${city}`, 124, 597);

  const checkMarkBuffer = await fs.readFileSync('./Resources/check-mark-icon.png');
  const checkMarkJPG = await pdfDoc.embedPng(checkMarkBuffer);

  reasons.forEach(reason => page1.drawImage(checkMarkJPG,  { x: 57, y: reasonYs[reason], width: 10, height: 10 }));

  drawText(city, 95, 123);
  drawText(date, 78, 93);
  drawText(hour, 248, 93);

  const data = [
    `Cree le: ${date} a ${hour}`,
    `Nom: ${lastname}`,
    `Prenom: ${firstname}`,
    `Naissance: ${birthday} a ${birthplace}`,
    `Adresse: ${adress} ${zipcode} ${city}`,
    `Sortie: ${date} a ${hour}`,
    `Motifs: ${reasons.join(',')}`
  ].join(';\n') + ";";

  const generatedQR = await generateQR(data);
  const qrImage = await pdfDoc.embedPng(generatedQR);

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 156,
    y: 25,
    width: 92,
    height: 92,
  });

  pdfDoc.addPage()

  const page2 = pdfDoc.getPage(1)

  page2.drawImage(qrImage, {
    x: 50,
    y: 400,
    width: 400,
    height: 400
  })

  const pdfBytes = await pdfDoc.save(),
    pdfBufferArray = pdfBytes.buffer,
    pdfOutput = Buffer.from(pdfBufferArray);

  return pdfOutput;
}

function generateQR (text) {
  const opts = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
  }
  return QRCode.toDataURL(text, opts)
}


module.exports = generatePdf;