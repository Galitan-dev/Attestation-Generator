const http = require('http');
const moment = require('moment');
const generatePdf = require('./generatePDF');
const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {

    let parsedUrl = parse(req.url);

    switch (parsedUrl.pathname) {
        case "/attestation":
            
            let missedFields = ["firstname","lastname","birthday","birthplace","adress","zipcode","city","reasons"].filter(field => !parsedUrl.query[field]);
                if (missedFields[0]) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write("<p>Données insuffisantes, veuillez passer par le <a href=\"./\">générateur de lien</a></p>");
                    res.end();
                    return;
                }

            /** @type {import('./generatePDF').profil} */
            let profil = parsedUrl.query,
                now = moment();

            profil.date = now.format("DD[/]MM[/]YYYY");
            profil.hour = now.format("HH[:]mm");
            profil.reasons = profil.reasons.split(',')

            console.log(profil);

            res.writeHead(200, { 'Content-Type': 'application/pdf' });
            res.write(await generatePdf(profil));
            res.end();
            break;
            
        default:
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write("Soon");
            res.end();
            break;
    }

});

/**
 * @param {String} url 
 * @returns {{ pathname: String, query: Object }}
 */
function parse (url) {

    let urlSplit = url.split("?"),
        pathname = urlSplit[0],
        queryString = urlSplit[1];
        
    if (!queryString) return { pathname, query: {} };

    let querySplit = queryString.split("&"),
        query = {};

    querySplit.forEach(param => {
        let paramSplit = param.split("=");
        query[paramSplit[0]] = paramSplit[1].replace(/%20/g, ' ').replace(/%2f/g, '/');
    });

    return { pathname, query }

}

server.listen(PORT, () => console.log("Listening to " + PORT));